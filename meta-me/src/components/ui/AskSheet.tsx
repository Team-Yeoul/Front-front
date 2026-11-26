'use client';

import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View, scrollToEnd } from './rn';
import { CounselingReplyFailed, counselingErrorText, useCounselingChat } from '@/hooks/useCounselingChat';
import { useMe } from '@/hooks/useMe';
import { analysisMessage, analysisQuestionMaxLength, analysisSessionTitle } from '@/lib/serverChats';
import type { SavedChat, SavedChatMessage } from '@/store';
import { Text } from './Text';
import { ChevronRight, CloseIcon } from './icons';
import { Sheet } from './overlays';
import { AiMessage, ChatBackdrop, GlassCircle, PillComposer, QuickChip, TypingMessage, UserMessage } from './chatV3';
import { COUNSELING_MESSAGE_MAX_LENGTH } from '@/lib/textLimits';

const FAQ = ['이 결과는 어떻게 나온 거예요?', '내 기록 중 어떤 부분이 반영됐어요?', '다음 주엔 뭘 해보면 좋을까요?'];

/** "분석 결과 물어보기" 시트. AI 상담 API로 답하고, 닫을 때 '분석 질문'으로 지난 대화에 저장한다. */
export function AskSheet({ open, onClose, context }: { open: boolean; onClose: () => void; context: string }) {
  const me = useMe();
  const counseling = useCounselingChat(null, analysisSessionTitle(context));
  const resetSession = counseling.reset;
  const [messages, setMessages] = useState<SavedChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  // 답변 생성만 실패했으면 같은 질문을 또 보내지 않고 '답 다시 받기'로 답만 다시 만든다.
  const [replyFailed, setReplyFailed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  // 시트를 열 때마다 올린다. 앞서 연 시트에서 보낸 질문의 답이 늦게 와도 새 대화에 붙지 않게 한다.
  const generation = useRef(0);
  // 답을 기다리는 중에 닫으면 그때까지의 대화를 시트를 연 회차(generation)별로 저장해 두고, 답이 오면 그 저장본에 이어 붙인다.
  // 회차별로 두어야 A를 닫고 B를 열었다 닫아도 A의 답이 A 저장본에 붙는다.
  const closedChats = useRef(new Map<number, SavedChat>());

  // 시트를 다시 열 때마다 새 대화로 시작한다. 상태는 렌더 중에 맞추고(effect 안 setState 금지 규칙),
  // 상담 세션 ref만 effect에서 비운다.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setMessages([]);
      setSessionId(null);
      setInput('');
      setTyping(false);
      setReplyFailed(false);
      setStartedAt(new Date().toISOString());
    }
  }
  useEffect(() => {
    if (!open) return;
    generation.current += 1;
    resetSession();
  }, [open, resetSession]);

  useEffect(() => {
    scrollToEnd(listRef.current);
  }, [messages, typing]);

  const ask = async (q: string) => {
    const t = q.trim();
    if (!t || typing) return;
    setMessages((m) => [...m, { role: 'user', text: t }]);
    setInput('');
    await receive(() => counseling.send(analysisMessage(context, t)), false);
  };

  const retryReply = () => {
    if (typing) return;
    // 실패 안내 말풍선은 새 답으로 바꾼다.
    setMessages((m) => (m[m.length - 1]?.role === 'ai' ? m.slice(0, -1) : m));
    void receive(counseling.retry, true);
  };

  /** isRetry: '답 다시 받기'로 부른 요청. 이 요청이 또 실패해도 다시 받을 답은 그대로라 버튼을 남긴다. */
  const receive = async (request: () => Promise<{ reply: string; sessionId: string }>, isRetry: boolean) => {
    const gen = generation.current;
    setTyping(true);
    setReplyFailed(false);
    let reply: string;
    let sid: string | null = null;
    let failedReply = false;
    try {
      const res = await request();
      sid = res.sessionId;
      reply = res.reply;
    } catch (err) {
      // 답변 생성만 실패했어도 세션은 생겼으니 저장할 때 쓰도록 남긴다.
      if (err instanceof CounselingReplyFailed) {
        sid = err.sessionId;
        failedReply = true;
      }
      // 다시 받기 요청 자체가 실패(네트워크·서버 오류)해도 훅은 실패한 답을 기억하고 있으니 다시 시도할 수 있게 둔다.
      if (isRetry) failedReply = true;
      reply = counselingErrorText(err);
    }
    // 답을 기다리는 사이에 시트를 닫았으면, 닫을 때 저장한 대화에 이 답을 이어 붙여 다시 저장한다.
    const closed = closedChats.current.get(gen);
    if (closed) {
      closedChats.current.delete(gen);
      me.saveChat({
        ...closed,
        sessionId: sid ?? closed.sessionId,
        endedAt: new Date().toISOString(),
        messages: [...closed.messages, { role: 'ai', text: reply }],
      });
    }
    // 그 사이 시트를 다시 열었으면 새 대화이므로 화면에는 붙이지 않는다.
    if (gen !== generation.current) return;
    if (sid) setSessionId(sid);
    setReplyFailed(failedReply);
    setTyping(false);
    setMessages((m) => [...m, { role: 'ai', text: reply }]);
  };

  const close = () => {
    if (messages.some((m) => m.role === 'user')) {
      const chat: SavedChat = {
        id: `ask-${startedAt}`,
        kind: 'analysis',
        context,
        sessionId,
        startedAt,
        endedAt: new Date().toISOString(),
        messages,
      };
      me.saveChat(chat);
      if (typing) closedChats.current.set(generation.current, chat);
    }
    onClose();
  };

  // 시트 배경은 기록 A와 같은 분홍~연보라 (14b)
  return (
    // 위로 232px만 비우고 시트를 띄운다(최소 420px).
    <Sheet open={open} onClose={close} height="max(420px, calc(100% - 232px))" background={<ChatBackdrop />}>
      <View className="flex-row items-start justify-between px-5 pt-3 shrink-0">
        <View className="flex-1">
          <Text accessibilityRole="header" className="text-[16px] font-bold text-ink">
            분석 결과 물어보기
          </Text>
          <View className="mt-1.5 self-start rounded-full bg-primary-soft px-2.5 py-1">
            <Text className="text-[12px] font-semibold text-primary-pressed">지금 보는 분석 · {context}</Text>
          </View>
        </View>
        <GlassCircle onPress={close} label="닫기">
          <CloseIcon size={20} />
        </GlassCircle>
      </View>
      <View className="flex-1 min-h-0">
        <ScrollView
          ref={listRef}
          className="flex-1 min-h-0"
          contentContainerClassName="px-4 pt-4 pb-3 gap-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AiMessage showName={false}>{`‘${context}’에 대해 궁금한 점을 물어보세요. 어느 부분을 더 설명해 드릴까요?`}</AiMessage>
          {messages.length === 0 ? (
            <View>
              <Text className="text-[12px] text-text-4 px-1">자주 묻는 질문</Text>
              <View className="gap-2.5 mt-2.5">
                {FAQ.map((q) => (
                  <Pressable
                    key={q}
                    onPress={() => ask(q)}
                    accessibilityRole="button"
                    className="h-[46px] flex-row items-center justify-between rounded-full bg-page px-5 active:opacity-70"
                    style={{ boxShadow: '0 6px 18px rgba(99,103,255,0.08)' }}
                  >
                    <Text className="text-[14px] font-semibold text-ink">{q}</Text>
                    <ChevronRight size={16} color="#6367FF" />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            messages.map((m, i) =>
              m.role === 'user' ? (
                <UserMessage key={i}>{m.text}</UserMessage>
              ) : (
                <AiMessage key={i} showName={false}>
                  {m.text}
                </AiMessage>
              ),
            )
          )}
          {typing && <TypingMessage />}
        </ScrollView>
        <View className="px-4 pb-4 pt-2 gap-2 shrink-0">
          {replyFailed && !typing && (
            <View className="flex-row">
              <QuickChip onPress={retryReply}>답 다시 받기</QuickChip>
            </View>
          )}
          <PillComposer
            value={input}
            onChange={setInput}
            onSend={() => ask(input)}
            placeholder={typing ? '메타미가 답을 쓰는 중이에요' : '이 분석에 대해 궁금한 걸 물어보세요'}
            disabled={typing}
            // 보낼 때 앞에 붙는 머리말만큼 덜 받아, 서버 상한(4000자)을 넘지 않게 한다.
            maxLength={analysisQuestionMaxLength(context, COUNSELING_MESSAGE_MAX_LENGTH)}
          />
        </View>
      </View>
    </Sheet>
  );
}
