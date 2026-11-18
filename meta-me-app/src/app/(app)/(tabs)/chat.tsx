import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SensitiveGate } from '@/components/SensitiveGate';
import { Screen } from '@/components/ui/Screen';
import { AiBubble, Composer, OutlineChip, TypingBubble, UserBubble } from '@/components/ui/chat';
import { Button } from '@/components/ui/primitives';
import { Span, Text } from '@/components/ui/Text';
import { useMe } from '@/hooks/useMe';
import { counselingErrorText, useCounselingChat } from '@/hooks/useCounselingChat';
import { useChat } from '@/hooks/useChatHistory';
import { useTodayRecord } from '@/hooks/useSaveTodayRecord';
import type { SavedChat, SavedChatMessage } from '@/store';

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

function ChatContent({ resumed, onFinished }: { resumed?: SavedChat; onFinished: () => void }) {
  const me = useMe();

  const [chatId] = useState(() => resumed?.id ?? `chat-${Date.now()}`);
  const [startedAt] = useState(() => (resumed ? new Date(resumed.startedAt) : new Date()));
  const [messages, setMessages] = useState<SavedChatMessage[]>(() => resumed?.messages ?? [{ role: 'ai', text: OPENERS[0] }]);
  const [sessionId, setSessionId] = useState<string | null>(resumed?.sessionId ?? null);
  const counseling = useCounselingChat(resumed?.sessionId ?? null, '자유 대화');
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  // 오늘 이미 다이어리를 썼으면 기록하러 가라는 안내는 띄우지 않는다(확인 중일 때도 깜빡이지 않게 숨긴다).
  const todayRecord = useTodayRecord(!resumed);
  const listRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    setMessages((m) => [...m, { role: 'user', text: t }]);
    setInput('');
    setTyping(true);
    let reply: string;
    try {
      const res = await counseling.send(t);
      setSessionId(res.sessionId);
      reply = res.reply;
    } catch (err) {
      reply = counselingErrorText(err);
    }
    setTyping(false);
    setMessages((m) => [...m, { role: 'ai', text: reply }]);
  };

  const newQuestion = () => {
    if (typing) return;
    setMessages((m) => [...m, { role: 'ai', text: pickOpener(m) }]);
  };

  // 내가 한 말이 있을 때만 대화를 저장하고 그 대화 화면으로 이동한다.
  const finish = () => {
    if (!messages.some((m) => m.role === 'user')) {
      router.push('/chat/history');
      return;
    }
    me.saveChat({
      id: chatId,
      kind: 'free',
      sessionId,
      startedAt: startedAt.toISOString(),
      endedAt: new Date().toISOString(),
      messages,
    });
    // 탭 화면은 떠나도 그대로 남아 있어서, 웹처럼 다음에 대화 탭으로 오면 새 대화로 시작하게 비운다.
    onFinished();
    router.push(`/chat/${chatId}`);
  };

  const h = startedAt.getHours();
  const timeLabel = `${resumed ? '이어서 대화' : '오늘'} · ${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${String(startedAt.getMinutes()).padStart(2, '0')} · 횟수 제한 없음`;

  return (
    <Screen
      inTabs
      scroll={false}
      footer={
        <Composer
          value={input}
          onChange={setInput}
          onSend={() => send(input)}
          placeholder="자유롭게 이야기해보세요"
          disabled={typing}
          disabledLabel="metame가 답을 쓰는 중이에요"
          chips={
            <>
              <OutlineChip onPress={newQuestion}>다른 질문 받기</OutlineChip>
              <OutlineChip onPress={finish}>대화 마치기</OutlineChip>
            </>
          }
        />
      }
    >
      {/* 웹의 sticky 헤더: 스크롤 영역 밖에 두어 위에 고정한다. */}
      <View className="bg-white flex-row items-center justify-between px-5 h-14">
        <Text className="text-[20px] font-bold text-ink">대화</Text>
        <Pressable onPress={() => router.push('/chat/history')} accessibilityRole="link" hitSlop={8}>
          <Text className="text-[14px] font-semibold text-primary">지난 대화</Text>
        </Pressable>
      </View>
      <ScrollView
        ref={listRef}
        className="flex-1"
        contentContainerClassName="px-4 pb-4 gap-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        // 웹은 메시지가 바뀔 때마다 맨 아래로 부드럽게 내렸다. 앱은 내용 높이가 바뀐 뒤에 내려야 끝까지 닿는다.
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      >
        {!resumed && !todayRecord.isLoading && !todayRecord.record && (
          <View className="rounded-2xl bg-surface-2 px-4 py-3">
            <Text className="text-[13px] text-[#48484F] leading-[21px]">
              기록과 별개로 편하게 이야기하는 공간이에요. 여기 나눈 대화는 다이어리에 저장되지 않아요.{' '}
              {/* 줄바꿈 없이 붙어 있게 띄어쓰기를 줄바꿈 없는 공백으로 둔다. */}
              <Span className="font-semibold text-primary" accessibilityRole="link" onPress={() => router.push('/diary/chat')}>
                {'오늘 기록하기 ›'}
              </Span>
            </Text>
          </View>
        )}
        <Text className="text-center text-[12px] text-mute">{timeLabel}</Text>
        {messages.map((m, i) => (m.role === 'user' ? <UserBubble key={i}>{m.text}</UserBubble> : <AiBubble key={i}>{m.text}</AiBubble>))}
        {typing && <TypingBubble />}
      </ScrollView>
    </Screen>
  );
}

/** ?resume=<id>: 이 기기에 저장한 대화, 없으면 서버 세션(다른 기기에서 나눈 대화)을 불러와 이어간다. */
function ChatResume() {
  const { resume } = useLocalSearchParams<{ resume?: string }>();
  const resumeId = resume || null;
  const { chat, loading, failed, retry } = useChat(resumeId);
  // 대화를 마칠 때마다 올려서 탭에 남아 있던 대화를 새 대화로 바꾼다.
  const [round, setRound] = useState(0);

  // 웹의 router.replace('/chat')처럼 이어갈 대화 지정을 지운다.
  const clearResume = () => router.setParams({ resume: undefined });

  const onFinished = () => {
    if (resumeId) clearResume();
    setRound((r) => r + 1);
  };

  if (loading) {
    return (
      <Screen inTabs>
        <Text className="text-center text-[14px] text-sub mt-24">대화를 불러오는 중이에요...</Text>
      </Screen>
    );
  }
  // 이어갈 대화를 못 불러왔으면 새 대화로 넘어가지 않고 알린다(이어서 쓰려던 대화가 따로 갈라지지 않게).
  if (!chat && failed) {
    return (
      <Screen
        inTabs
        footer={
          <View className="flex-row gap-2.5">
            <View className="flex-1">
              <Button variant="gray" onPress={clearResume}>
                새 대화 시작
              </Button>
            </View>
            <View className="flex-1">
              <Button onPress={() => retry()}>다시 시도</Button>
            </View>
          </View>
        }
      >
        <Text className="text-center text-[14px] text-sub mt-24 px-5">이어갈 대화를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</Text>
      </Screen>
    );
  }
  return <ChatContent key={`${chat?.id ?? 'new'}-${round}`} resumed={chat} onFinished={onFinished} />;
}

export default function ChatTab() {
  return (
    <SensitiveGate inTabs>
      <ChatResume />
    </SensitiveGate>
  );
}
