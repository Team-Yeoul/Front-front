'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useCreateAiCounselingMessage } from '@/entities/system';
import { Screen } from '@/components/ui/Screen';
import { AiBubble, Composer, OutlineChip, TypingBubble, UserBubble } from '@/components/ui/chat';
import { MOCK_CHAT_THREAD } from '@/lib/mock';

interface Msg {
  role: 'ai' | 'user';
  text: string;
  options?: string[];
}

const OPENERS = [
  '요즘 가장 자주 떠오르는 사람이 있나요? 떠오르는 대로 편하게 이야기해 주세요.',
  '오늘 가장 오래 머문 감정은 뭐였나요?',
  '최근에 스스로 잘했다고 느낀 순간이 있었나요?',
];

// 로그아웃 데모용 스크립트 답변 (시안의 대화 흐름)
const DEMO_REPLIES: Msg[] = [
  { role: 'ai', text: MOCK_CHAT_THREAD[2].text },
  { role: 'ai', text: '그 마음은 기록에서도 몇 번 보였어요. 이번엔 완성 전에 보여줬다면 어땠을지 같이 상상해볼까요?', options: ['좋아요', '다른 이야기 할래요'] },
  { role: 'ai', text: '좋아요. 떠오르는 장면부터 편하게 말해 주세요.' },
];

export default function ChatPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const sendMessage = useCreateAiCounselingMessage();
  const [opener, setOpener] = useState(0);
  const [messages, setMessages] = useState<Msg[]>([{ role: 'ai', text: OPENERS[0] }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState(0);
  const [startedAt] = useState(() => new Date());
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    setMessages((m) => [...m.map((x) => ({ ...x, options: undefined })), { role: 'user', text: t }]);
    setInput('');
    setTyping(true);
    let reply: Msg;
    if (accessToken) {
      try {
        const res = await sendMessage.mutateAsync({ session_id: sessionId, message: t });
        setSessionId(res.ai_message.session_id);
        reply = { role: 'ai', text: res.ai_message.content };
      } catch {
        reply = { role: 'ai', text: '지금은 답을 가져오지 못했어요. 잠시 후 다시 이야기해 주세요.' };
      }
    } else {
      await new Promise((r) => setTimeout(r, 900));
      reply = DEMO_REPLIES[Math.min(demoStep, DEMO_REPLIES.length - 1)];
      setDemoStep((s) => s + 1);
    }
    setTyping(false);
    setMessages((m) => [...m, reply]);
  };

  const newQuestion = () => {
    const next = (opener + 1) % OPENERS.length;
    setOpener(next);
    setMessages((m) => [...m, { role: 'ai', text: OPENERS[next] }]);
  };

  const h = startedAt.getHours();
  const timeLabel = `오늘 · ${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${String(startedAt.getMinutes()).padStart(2, '0')} · 횟수 제한 없음`;

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
              <OutlineChip onClick={() => router.push(sessionId ? '/chat/history' : '/chat/t1')}>대화 마치기</OutlineChip>
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
        <p className="text-center text-[12px] text-mute">{timeLabel}</p>
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <UserBubble key={i}>{m.text}</UserBubble>
          ) : (
            <AiBubble
              key={i}
              footer={
                m.options && (
                  <div className="flex gap-2 mt-3">
                    {m.options.map((o) => (
                      <button key={o} onClick={() => send(o)} className="h-9 px-3 rounded-xl text-[14px] text-[#48484F] hover:bg-surface-2">
                        {o}
                      </button>
                    ))}
                  </div>
                )
              }
            >
              {m.text}
            </AiBubble>
          ),
        )}
        {typing && <TypingBubble />}
      </div>
    </Screen>
  );
}
