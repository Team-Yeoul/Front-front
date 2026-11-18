import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, View } from 'react-native';
import { counselingErrorText, useCounselingChat } from '@/hooks/useCounselingChat';
import { useMe } from '@/hooks/useMe';
import { analysisMessage, analysisSessionTitle } from '@/lib/serverChats';
import type { SavedChatMessage } from '@/store';
import { Text } from './Text';
import { ChevronRight } from './icons';
import { Sheet } from './overlays';
import { AiBubble, Composer, TypingBubble, UserBubble } from './chat';

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
  const listRef = useRef<ComponentRef<typeof ScrollView>>(null);

  // 시트를 다시 열 때마다 새 대화로 시작한다. 상태는 렌더 중에 맞추고(effect 안 setState 금지 규칙),
  // 상담 세션 ref만 effect에서 비운다.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setMessages([]);
      setSessionId(null);
      setInput('');
      setStartedAt(new Date().toISOString());
    }
  }
  useEffect(() => {
    if (open) resetSession();
  }, [open, resetSession]);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages, typing]);

  const ask = async (q: string) => {
    const t = q.trim();
    if (!t || typing) return;
    setMessages((m) => [...m, { role: 'user', text: t }]);
    setInput('');
    setTyping(true);
    let reply: string;
    try {
      const res = await counseling.send(analysisMessage(context, t));
      setSessionId(res.sessionId);
      reply = res.reply;
    } catch (err) {
      reply = counselingErrorText(err);
    }
    setTyping(false);
    setMessages((m) => [...m, { role: 'ai', text: reply }]);
  };

  const close = () => {
    if (messages.some((m) => m.role === 'user')) {
      me.saveChat({
        id: `ask-${startedAt}`,
        kind: 'analysis',
        context,
        sessionId,
        startedAt,
        endedAt: new Date().toISOString(),
        messages,
      });
    }
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={close}
      height="82%"
      closeButton
      title="분석 결과 물어보기"
      sub={
        <View className="self-start h-6 px-2.5 rounded-full bg-primary-soft justify-center">
          <Text className="text-[12px] font-semibold text-primary">지금 보는 분석 · {context}</Text>
        </View>
      }
    >
      {/* 키보드가 올라오면 입력창이 가려지지 않게 시트 안쪽을 줄인다. */}
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <ScrollView
          ref={listRef}
          className="flex-1"
          contentContainerClassName="px-4 pt-4 pb-3 gap-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AiBubble>{`‘${context}’에 대해 궁금한 점을 물어보세요.`}</AiBubble>
          {messages.length === 0 ? (
            <View>
              <Text className="text-[12px] font-semibold text-sub px-1">자주 묻는 질문</Text>
              <View className="gap-2.5 mt-2.5">
                {FAQ.map((q) => (
                  <Pressable
                    key={q}
                    onPress={() => ask(q)}
                    accessibilityRole="button"
                    className="flex-row items-center justify-between rounded-2xl bg-surface-2 px-4 h-12 active:opacity-70"
                  >
                    <Text className="text-[14px] text-ink">{q}</Text>
                    <ChevronRight size={16} color="#6367FF" />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            messages.map((m, i) => (m.role === 'user' ? <UserBubble key={i}>{m.text}</UserBubble> : <AiBubble key={i}>{m.text}</AiBubble>))
          )}
          {typing && <TypingBubble />}
        </ScrollView>
        <View className="px-4 pb-4 pt-2">
          <Composer
            value={input}
            onChange={setInput}
            onSend={() => ask(input)}
            placeholder="이 분석에 대해 궁금한 걸 물어보세요"
            disabled={typing}
            disabledLabel="metame가 답을 쓰는 중이에요"
          />
        </View>
      </KeyboardAvoidingView>
    </Sheet>
  );
}
