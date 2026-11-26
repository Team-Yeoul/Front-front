'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { StatusView } from '@/components/ui/states';
import { Pressable, ScrollView, View, scrollToEnd } from '@/components/ui/rn';
import { router } from '@/lib/router';
import { Screen } from '@/components/ui/Screen';
import { ChatIntro } from '@/components/chat/ChatIntro';
import { AiMessage, ChatBackdrop, PillComposer, QuickChip, TypingMessage, UserMessage } from '@/components/ui/chatV3';
import { Button } from '@/components/ui/primitives';
import { Span, Text } from '@/components/ui/Text';
import { useMe } from '@/hooks/useMe';
import { CounselingReplyFailed, counselingErrorText, useCounselingChat } from '@/hooks/useCounselingChat';
import { useChat } from '@/hooks/useChatHistory';
import { useTodayRecord } from '@/hooks/useSaveTodayRecord';
import { useLocalStore, type SavedChat, type SavedChatMessage } from '@/store';
import { withAskedQuestionWithin } from '@/lib/serverChats';
import { trackReply, useReplyPending } from '@/lib/pendingReplies';
import { withSensitiveGate } from '@/components/SensitiveGate';
import { COUNSELING_MESSAGE_MAX_LENGTH } from '@/lib/textLimits';

const OPENERS = [
  '요즘 가장 자주 떠오르는 사람이 있나요? 떠오르는 대로 편하게 이야기해 주세요.',
  '오늘 가장 오래 머문 감정은 뭐였나요?',
  '최근에 스스로 잘했다고 느낀 순간이 있었나요?',
  '요즘 마음을 가장 많이 쓰고 있는 일은 뭐예요?',
  '최근에 웃음이 났던 순간이 있었나요?',
  '요즘 나를 지치게 하는 건 뭔가요?',
  '누군가에게 하고 싶었지만 못 한 말이 있나요?',
  '요즘 기다려지는 일이 있나요?',
  '최근에 마음이 편안했던 순간은 언제였나요?',
  '요즘 나에게 가장 필요한 건 뭐라고 생각해요?',
  '최근에 생각이 바뀐 일이 있었나요?',
  '요즘 혼자 있을 때 주로 무슨 생각을 하나요?',
  '최근에 고마웠던 사람이 있나요?',
  '요즘 잘 안 풀려서 답답한 일이 있나요?',
  '지금 이 순간 기분을 한 단어로 말해 본다면요?',
];

/** 이번 대화에 아직 안 나온 질문 중에서 무작위로 고른다. 다 나왔으면 방금 질문만 빼고 다시 고른다. */
function pickOpener(messages: SavedChatMessage[]) {
  const asked = new Set(messages.filter((m) => m.role === 'ai').map((m) => m.text));
  let pool = OPENERS.filter((q) => !asked.has(q));
  if (pool.length === 0) {
    const last = [...messages].reverse().find((m) => m.role === 'ai' && OPENERS.includes(m.text))?.text;
    pool = OPENERS.filter((q) => q !== last);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/** 저장된 대화와 내용이 같은지(개수만이 아니라 말풍선마다 역할·글·다시 받기 대상까지) 비교한다. */
function sameMessages(a: SavedChatMessage[], b: SavedChatMessage[]) {
  return (
    a.length === b.length &&
    a.every((m, i) => m.role === b[i].role && m.text === b[i].text && m.retry?.branchId === b[i].retry?.branchId && m.retry?.sessionId === b[i].retry?.sessionId)
  );
}

/** 첫 화면(4c)에서 고른 시작: 칩 주제의 첫 질문, 또는 입력칸에 쓴 첫마디 */
type ChatStart = { opener?: string; text?: string };
// 입력칸에 먼저 말을 건 경우 메타미가 앞서 건넨 인사로 대화를 연다.
const GREETING = '오늘은 어땠어요? 편하게 이야기해 주세요.';

function ChatContent({
  resumed,
  start,
  onFinished,
  onOpened,
}: {
  resumed?: SavedChat;
  start?: ChatStart;
  onFinished: () => void;
  onOpened: () => void;
}) {
  const me = useMe();
  // 열렸음을 알린다. 열린 뒤에는 이 화면이 보낸 요청의 답을 기다리는 동안에도 화면을 그대로 둔다(ChatResume).
  useEffect(() => {
    onOpened();
    // 처음 열릴 때 한 번만 알린다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [chatId] = useState(() => resumed?.id ?? `chat-${Date.now()}`);
  const [startedAt] = useState(() => (resumed ? new Date(resumed.startedAt) : new Date()));
  const [messages, setMessages] = useState<SavedChatMessage[]>(
    () => resumed?.messages ?? [{ role: 'ai', text: start?.opener ?? (start?.text ? GREETING : OPENERS[0]) }],
  );
  const [sessionId, setSessionId] = useState<string | null>(resumed?.sessionId ?? null);
  const counseling = useCounselingChat(resumed?.sessionId ?? null, '자유 대화');
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  // 메타미가 기기에서 먼저 건넨 질문(첫 질문 · '다른 질문 받기')은 서버가 모른다.
  // 다음 답을 보낼 때 그 질문을 함께 보내, 짧은 답(예: '복잡해요')도 무엇에 대한 답인지 알 수 있게 한다.
  // 이어서 대화할 때는 저장할 때 답하지 않고 남아 있던 질문을 되살린다.
  const pendingQuestion = useRef<string | null>(resumed ? (resumed.pendingQuestion ?? null) : (start?.opener ?? (start?.text ? null : OPENERS[0])));
  // 오늘 이미 다이어리를 썼으면 기록하러 가라는 안내는 띄우지 않는다(확인 중일 때도 깜빡이지 않게 숨긴다).
  const todayRecord = useTodayRecord(!resumed);
  const listRef = useRef<HTMLDivElement>(null);

  // 화면에 그려진 마지막 대화. 탭을 떠난 뒤에 도착한 답도 여기에 이어 붙여 저장한다.
  const latest = useRef({ messages, sessionId });
  useEffect(() => {
    latest.current = { messages, sessionId };
  }, [messages, sessionId]);
  // 탭을 떠났는지. 웹은 탭을 떠나면 이 화면이 사라지므로 그 뒤의 setState는 화면에 닿지 않는다.
  const left = useRef(false);

  const persist = (msgs: SavedChatMessage[], sid: string | null) =>
    me.saveChat({
      id: chatId,
      kind: 'free',
      sessionId: sid,
      startedAt: startedAt.toISOString(),
      endedAt: new Date().toISOString(),
      messages: msgs,
      ...(pendingQuestion.current && { pendingQuestion: pendingQuestion.current }),
    });

  /**
   * 탭을 떠난 뒤 도착한 답을 저장된 대화에 쓴다. 떠날 때 저장된 대화를 그 사이 지난 대화에서 지웠으면
   * 다시 살려 내지 않는다(지운 대화가 늦게 온 답 때문에 되살아나지 않게).
   */
  const persistLate = (msgs: SavedChatMessage[], sid: string | null) => {
    const kept = !!me.userId && useLocalStore.getState().byUser[me.userId]?.chats.some((c) => c.id === chatId);
    if (kept) persist(msgs, sid);
  };

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    // 새로 말하면 앞서 실패한 답은 다시 받지 않는다(다시 받기 대상을 지운다).
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setMessages((m) => [...m.map(({ retry: _, ...x }) => x), { role: 'user', text: t }]);
    setInput('');
    const asked = pendingQuestion.current;
    pendingQuestion.current = null;
    // 되살린 질문을 저장하는 것까지 끝나야 같은 대화를 다시 열 수 있다(trackReply).
    await trackReply(chatId, async () => {
      const err = await receive(() => counseling.send(asked ? withAskedQuestionWithin(asked, t, COUNSELING_MESSAGE_MAX_LENGTH) : t));
      // 서버가 메시지를 받기 전에 실패했으면(세션 생성·네트워크 오류 등) 질문 맥락을 다음 답에 다시 붙인다.
      // 답변 생성만 실패한 경우(CounselingReplyFailed)는 질문과 답이 이미 저장됐으므로 다시 보내지 않는다.
      if (err && !(err instanceof CounselingReplyFailed) && pendingQuestion.current === null) {
        pendingQuestion.current = asked;
        // 답을 기다리는 사이 탭을 떠났다면, 되살린 질문까지 저장된 대화에 남긴다.
        if (left.current) persistLate(latest.current.messages, latest.current.sessionId);
      }
    });
  };

  // 메시지는 저장됐는데 답변만 못 만들었으면 그 안내 말풍선에 다시 받기 대상(retry)이 붙어 있다.
  // '답 다시 받기'는 그 말풍선만 새 답으로 바꾼다(그 뒤에 '다른 질문 받기'로 붙은 질문과 pendingQuestion은 그대로 둔다).
  const failedAt = messages.findIndex((m) => m.retry);
  const replyFailed = failedAt >= 0;

  /**
   * 답을 기다렸다가 붙인다. 답변 생성만 실패해도 세션은 생겼으므로 sessionId를 먼저 기억한다.
   * replaceAt을 주면(다시 받기) 새 말풍선을 붙이지 않고 그 자리의 실패 안내를 바꾼다.
   */
  const receive = async (
    request: () => Promise<{ reply: string; sessionId: string }>,
    replaceAt: number | null = null,
    prevTarget?: SavedChatMessage['retry'],
  ): Promise<unknown> => {
    let error: unknown = null;
    setTyping(true);
    let reply: string;
    let retry: SavedChatMessage['retry'];
    let sid = latest.current.sessionId;
    try {
      const res = await request();
      sid = res.sessionId;
      reply = res.reply;
    } catch (err) {
      error = err;
      if (err instanceof CounselingReplyFailed) {
        sid = err.sessionId;
        retry = { sessionId: err.sessionId, branchId: err.branchId };
      }
      // 다시 받기 요청 자체가 실패(네트워크·서버 오류)해도 서버에는 답할 메시지가 남아 있으니 같은 대상으로 다시 시도할 수 있게 둔다.
      retry ??= prevTarget;
      reply = counselingErrorText(err);
    }
    setTyping(false);
    const next: SavedChatMessage = retry ? { role: 'ai', text: reply, retry } : { role: 'ai', text: reply };
    const add = (m: SavedChatMessage[]) =>
      replaceAt !== null && m[replaceAt]?.role === 'ai' ? m.map((x, i) => (i === replaceAt ? next : x)) : [...m, next];
    setSessionId(sid);
    setMessages(add);
    if (left.current) {
      // 답을 기다리는 사이 탭을 떠났다: 이 화면은 이미 사라졌으니 도착한 답과 세션을 저장된 대화에 바로 쓴다.
      // (안 그러면 다시 이어갈 때 세션 없이 새 서버 세션이 만들어지고 답도 빠진다)
      latest.current = { messages: add(latest.current.messages), sessionId: sid };
      persistLate(latest.current.messages, sid);
    }
    return error;
  };

  const retryReply = () => {
    if (typing || failedAt < 0) return;
    const target = messages[failedAt].retry;
    void trackReply(chatId, () => receive(() => counseling.retry(target), failedAt, target));
  };

  // 첫 화면 입력칸에 쓴 첫마디는 대화가 열리자마자 한 번 보낸다.
  const firstSent = useRef(false);
  useEffect(() => {
    if (firstSent.current || resumed || !start?.text) return;
    firstSent.current = true;
    void Promise.resolve().then(() => send(start.text!));
    // 처음 한 번만 보낸다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const newQuestion = () => {
    if (typing) return;
    const q = pickOpener(messages);
    pendingQuestion.current = q;
    setMessages((m) => [...m, { role: 'ai', text: q }]);
  };

  // 탭을 떠나면(다른 탭·지난 대화 등) 나눈 대화를 지난 대화에 남긴다. 다음에 대화 탭에 오면 첫 화면(4c)부터 보인다.
  // (앱의 useFocusEffect 자리: 웹은 탭을 떠나면 화면이 사라지므로 사라질 때 저장한다)
  useEffect(() => {
    left.current = false;
    return () => {
      left.current = true;
      const { messages: msgs, sessionId: sid } = latest.current;
      if (!msgs.some((m) => m.role === 'user')) return;
      // 이어서 연 대화를 그대로 두고 떠났을 때만 건너뛴다. 개수가 같아도 '답 다시 받기'로 내용이 바뀌었을 수 있다.
      if (resumed && sameMessages(msgs, resumed.messages) && sid === resumed.sessionId) return;
      persist(msgs, sid);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 메시지가 바뀔 때마다 맨 아래로 부드럽게 내린다.
  useEffect(() => {
    scrollToEnd(listRef.current);
  }, [messages, typing]);

  // 내가 한 말이 있을 때만 대화를 저장하고 그 대화 화면으로 이동한다.
  const finish = () => {
    if (!messages.some((m) => m.role === 'user')) {
      router.push('/chat/history');
      return;
    }
    persist(messages, sessionId);
    // 다음에 대화 탭으로 오면 새 대화로 시작하게 비운다.
    onFinished();
    router.push(`/chat/${chatId}`);
  };

  const h = startedAt.getHours();
  const timeLabel = `${resumed ? '이어서 대화' : '오늘'} · ${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${String(startedAt.getMinutes()).padStart(2, '0')} · 횟수 제한 없음`;

  return (
    <Screen
      inTabs
      scroll={false}
      bg="#F1EFF8"
      background={<ChatBackdrop />}
      footerClassName="px-5 pt-2"
      footer={
        <View className="gap-3">
          {!typing && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5" contentContainerClassName="px-5 gap-2 py-1">
              {replyFailed && <QuickChip onPress={retryReply}>답 다시 받기</QuickChip>}
              <QuickChip onPress={newQuestion}>다른 질문 받기</QuickChip>
              <QuickChip onPress={finish}>대화 마치기</QuickChip>
            </ScrollView>
          )}
          <PillComposer
            value={input}
            onChange={setInput}
            onSend={() => send(input)}
            placeholder={typing ? '메타미가 답을 쓰는 중이에요' : '자유롭게 이야기해보세요'}
            disabled={typing}
            maxLength={COUNSELING_MESSAGE_MAX_LENGTH}
          />
        </View>
      }
    >
      {/* 웹의 sticky 헤더: 스크롤 영역 밖에 두어 위에 고정한다. */}
      <View className="h-[52px] shrink-0 flex-row items-center justify-between px-5">
        <Text accessibilityRole="header" className="text-[20px] font-bold text-ink">
          대화
        </Text>
        <Pressable onPress={() => router.push('/chat/history')} accessibilityRole="link" className="h-9 px-3.5 rounded-full bg-page/70 justify-center">
          <Text className="text-[14px] font-semibold text-primary">지난 대화</Text>
        </Pressable>
      </View>
      <ScrollView ref={listRef} className="flex-1 min-h-0" contentContainerClassName="px-5 pt-2 pb-4 gap-4" showsVerticalScrollIndicator={false}>
        {!resumed && !todayRecord.isLoading && !todayRecord.record && (
          <View className="rounded-2xl bg-page/60 px-4 py-3">
            <Text className="text-[12px] text-text-3 leading-[20px]">
              기록과 별개로 편하게 이야기하는 공간이에요. 여기 나눈 대화는 다이어리에 저장되지 않아요.{' '}
              {/* 줄바꿈 없이 붙어 있게 띄어쓰기를 줄바꿈 없는 공백으로 둔다. */}
              <Span className="font-semibold text-primary cursor-pointer" accessibilityRole="link" onPress={() => router.push('/diary/chat')}>
                {'오늘 기록하기 ›'}
              </Span>
            </Text>
          </View>
        )}
        <View className="self-center rounded-full bg-page/60 px-3 py-1">
          <Text className="text-[12px] text-text-4">{timeLabel}</Text>
        </View>
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <UserMessage key={i}>{m.text}</UserMessage>
          ) : (
            <AiMessage key={i} showName={false}>
              {m.text}
            </AiMessage>
          ),
        )}
        {typing && <TypingMessage />}
      </ScrollView>
    </Screen>
  );
}

/** ?resume=<id>: 이 기기에 저장한 대화, 없으면 서버 세션(다른 기기에서 나눈 대화)을 불러와 이어간다. */
function ChatResume() {
  const resume = useSearchParams().get('resume');
  const resumeId = resume || null;
  const { chat, loading, failed, retry } = useChat(resumeId);
  // 대화를 마칠 때마다 올려서 탭에 남아 있던 대화를 새 대화로 바꾼다.
  const [round, setRound] = useState(0);
  // 새 대화는 첫 화면(4c)에서 칩을 고르거나 첫마디를 보내야 시작한다. null이면 첫 화면을 보여 준다.
  const [start, setStart] = useState<ChatStart | null>(null);
  const me = useMe();
  // 탭을 떠난 뒤에도 이 대화의 답을 기다리는 중이면, 답이 저장된 뒤에 연다.
  // (먼저 열어 이어 쓰면, 늦게 온 답을 저장할 때 이어 쓴 말이 덮인다)
  // 단, 이미 열려 있는 대화가 스스로 보낸 요청이면 화면을 그대로 둔다(열린 대화의 key를 기억해 구분한다).
  const replyPending = useReplyPending(chat?.id);
  const contentKey = `${chat?.id ?? 'new'}-${round}`;
  const [openedKey, setOpenedKey] = useState<string | null>(null);
  const waitReply = replyPending && openedKey !== contentKey;

  // 이어갈 대화 지정을 지운다. (탭을 떠나면 웹은 이 화면이 사라지므로 앱처럼 따로 비울 것이 없다)
  const clearResume = () => router.replace('/chat');

  const onFinished = () => {
    // 바로 대화 화면으로 이동하므로 이동 없이 주소만 바꾼다(뒤로 오면 새 대화 첫 화면). Next는 history.replaceState를 useSearchParams에 반영한다.
    if (resumeId) window.history.replaceState(null, '', '/chat');
    setStart(null);
    setRound((r) => r + 1);
  };

  if (loading || waitReply) {
    return (
      <Screen inTabs>
        <Text className="text-center text-[14px] text-sub mt-24">{waitReply ? '메타미가 답을 쓰는 중이에요...' : '대화를 불러오는 중이에요...'}</Text>
      </Screen>
    );
  }
  // 이어갈 대화를 못 불러왔으면 새 대화로 넘어가지 않고 알린다(이어서 쓰려던 대화가 따로 갈라지지 않게).
  if (!chat && failed) {
    return (
      <Screen
        inTabs
        footer={
          <Button variant="gray" onPress={clearResume}>
            새 대화 시작
          </Button>
        }
      >
        <StatusView kind="error" title="이어갈 대화를 불러오지 못했어요" onRetry={() => retry()} className="pt-32" />
      </Screen>
    );
  }
  // 지정한 대화가 없거나(404) 내 것이 아니면(403) 새 대화로 몰래 넘어가지 않고, 새로 시작할지 고르게 한다.
  if (resumeId && !chat) {
    return (
      <Screen
        inTabs
        footer={
          <Button size="sm" onPress={clearResume}>
            새 대화 시작
          </Button>
        }
      >
        <Text className="text-center text-[14px] text-sub mt-24 px-5">이어갈 대화를 찾을 수 없어요. 지워졌거나 다른 계정의 대화일 수 있어요.</Text>
      </Screen>
    );
  }
  // 이어갈 대화가 없으면 첫 화면(4c)부터 보여 준다.
  if (!chat && !start) {
    return (
      <ChatIntro
        inTabs
        name={me.nickname}
        onBack={() => router.navigate('/main')}
        onMore={() => router.push('/chat/history')}
        onTopic={(t) => setStart({ opener: t.question })}
        onSend={(text) => setStart({ text })}
        maxLength={COUNSELING_MESSAGE_MAX_LENGTH}
      />
    );
  }
  // 지난 대화를 이어갈 때는 새 대화 첫 화면에서 고른 시작(start)을 넘기지 않는다(다른 대화에 섞이지 않게).
  return (
    <ChatContent
      key={contentKey}
      resumed={chat}
      start={chat ? undefined : (start ?? undefined)}
      onFinished={onFinished}
      onOpened={() => setOpenedKey(contentKey)}
    />
  );
}

function ChatTab() {
  // useSearchParams를 쓰는 화면은 Suspense 안에서 그린다(Next 규칙).
  return (
    <Suspense>
      <ChatResume />
    </Suspense>
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(ChatTab, { inTabs: true });
