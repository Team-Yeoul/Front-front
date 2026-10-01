'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { AiBubble, Composer, OutlineChip, TypingBubble, UserBubble } from '@/components/ui/chat';
import { useMe } from '@/hooks/useMe';
import { counselingErrorText, useCounselingChat } from '@/hooks/useCounselingChat';
import type { SavedChatMessage } from '@/store';

const OPENERS = [
  '요즘 가장 자주 떠오르는 사람이 있나요? 떠오르는 대로 편하게 이야기해 주세요.',
  '오늘 가장 오래 머문 감정은 뭐였나요?',
  '최근에 스스로 잘했다고 느낀 순간이 있었나요?',
];

function ChatContent() {
  const router = useRouter();
  const params = useSearchParams();
  const me = useMe();
  const resumeId = params.get('resume');
  const resumed = resumeId ? me.chats.find((c) => c.id === resumeId) : undefined;

  const [chatId] = useState(() => resumed?.id ?? `chat-${Date.now()}`);
  const [startedAt] = useState(() => (resumed ? new Date(resumed.startedAt) : new Date()));
  const [opener, setOpener] = useState(0);
  const [messages, setMessages] = useState<SavedChatMessage[]>(() => resumed?.messages ?? [{ role: 'ai', text: OPENERS[0] }]);
  const [sessionId, setSessionId] = useState<string | null>(resumed?.sessionId ?? null);
  const counseling = useCounselingChat(resumed?.sessionId ?? null, '자유 대화');
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

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
    const next = (opener + 1) % OPENERS.length;
    setOpener(next);
    setMessages((m) => [...m, { role: 'ai', text: OPENERS[next] }]);
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
    router.push(`/chat/${chatId}`);
  };

  const h = startedAt.getHours();
  const timeLabel = `${resumed ? '이어서 대화' : '오늘'} · ${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${String(startedAt.getMinutes()).padStart(2, '0')} · 횟수 제한 없음`;

  return (
    <Screen
      nav
      bodyRef={listRef}
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
              <OutlineChip onClick={newQuestion}>다른 질문 받기</OutlineChip>
              <OutlineChip onClick={finish}>대화 마치기</OutlineChip>
            </>
          }
        />
      }
    >
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-5 h-14">
        <h1 className="text-[20px] font-bold text-ink">대화</h1>
        <Link href="/chat/history" className="text-[14px] font-semibold text-primary">
          지난 대화
        </Link>
      </div>
      <div className="px-4 pb-4 flex flex-col gap-4">
        {!resumed && (
          <div className="rounded-2xl bg-surface-2 px-4 py-3 text-[13px] text-[#48484F] leading-relaxed">
            기록과 별개로 편하게 이야기하는 공간이에요. 여기 나눈 대화는 다이어리에 저장되지 않아요.{' '}
            <Link href="/diary/chat" className="font-semibold text-primary whitespace-nowrap">
              오늘 기록하기 ›
            </Link>
          </div>
        )}
        <p className="text-center text-[12px] text-mute">{timeLabel}</p>
        {messages.map((m, i) => (m.role === 'user' ? <UserBubble key={i}>{m.text}</UserBubble> : <AiBubble key={i}>{m.text}</AiBubble>))}
        {typing && <TypingBubble />}
      </div>
    </Screen>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  );
}
