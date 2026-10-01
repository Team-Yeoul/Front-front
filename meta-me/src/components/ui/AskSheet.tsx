'use client';

import { useEffect, useRef, useState } from 'react';
import { counselingErrorText, useCounselingChat } from '@/hooks/useCounselingChat';
import { useMe } from '@/hooks/useMe';
import type { SavedChatMessage } from '@/store';
import { ChevronRight } from './primitives';
import { Sheet } from './overlays';
import { AiBubble, Composer, TypingBubble, UserBubble } from './chat';

const FAQ = ['이 결과는 어떻게 나온 거예요?', '내 기록 중 어떤 부분이 반영됐어요?', '다음 주엔 뭘 해보면 좋을까요?'];

/** "분석 결과 물어보기" 시트. AI 상담 API로 답하고, 닫을 때 '분석 질문'으로 지난 대화에 저장한다. */
export function AskSheet({ open, onClose, context }: { open: boolean; onClose: () => void; context: string }) {
  const me = useMe();
  const counseling = useCounselingChat(null, `${context} 분석 질문`);
  const resetSession = counseling.reset;
  const [messages, setMessages] = useState<SavedChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMessages([]);
      setSessionId(null);
      resetSession();
      setInput('');
      setStartedAt(new Date().toISOString());
    }
  }, [open, resetSession]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const ask = async (q: string) => {
    const t = q.trim();
    if (!t || typing) return;
    setMessages((m) => [...m, { role: 'user', text: t }]);
    setInput('');
    setTyping(true);
    let reply: string;
    try {
      const res = await counseling.send(`[${context} 분석에 대한 질문] ${t}`);
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
        <span className="inline-flex h-6 px-2.5 rounded-full bg-primary-soft text-[12px] font-semibold text-primary items-center">
          지금 보는 분석 · {context}
        </span>
      }
    >
      <div ref={listRef} className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-3 flex flex-col gap-4">
        <AiBubble>{`‘${context}’에 대해 궁금한 점을 물어보세요.`}</AiBubble>
        {messages.length === 0 ? (
          <div>
            <p className="text-[12px] font-semibold text-sub px-1">자주 묻는 질문</p>
            <div className="flex flex-col gap-2.5 mt-2.5">
              {FAQ.map((q) => (
                <button key={q} onClick={() => ask(q)} className="flex items-center justify-between rounded-2xl bg-surface-2 px-4 h-12 text-left">
                  <span className="text-[14px] text-ink">{q}</span>
                  <ChevronRight size={16} color="#6367FF" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (m.role === 'user' ? <UserBubble key={i}>{m.text}</UserBubble> : <AiBubble key={i}>{m.text}</AiBubble>))
        )}
        {typing && <TypingBubble />}
      </div>
      <div className="px-4 pb-4 pt-2">
        <Composer value={input} onChange={setInput} onSend={() => ask(input)} placeholder="이 분석에 대해 궁금한 걸 물어보세요" disabled={typing} disabledLabel="metame가 답을 쓰는 중이에요" />
      </div>
    </Sheet>
  );
}
