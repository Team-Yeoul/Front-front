'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { AiBubble, Composer, OutlineChip, TypingBubble, UserBubble } from '@/components/ui/chat';
import { Button } from '@/components/ui/primitives';
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

function ChatContent({ resumed }: { resumed?: SavedChat }) {
  const router = useRouter();
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
        {!resumed && !todayRecord.isLoading && !todayRecord.record && (
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

/** ?resume=<id>: 이 기기에 저장한 대화, 없으면 서버 세션(다른 기기에서 나눈 대화)을 불러와 이어간다. */
function ChatResume() {
  const resumeId = useSearchParams().get('resume');
  const router = useRouter();
  const { chat, loading, failed, retry } = useChat(resumeId);
  if (loading) {
    return (
      <Screen nav>
        <p className="text-center text-[14px] text-sub mt-24">대화를 불러오는 중이에요...</p>
      </Screen>
    );
  }
  // 이어갈 대화를 못 불러왔으면 새 대화로 넘어가지 않고 알린다(이어서 쓰려던 대화가 따로 갈라지지 않게).
  if (!chat && failed) {
    return (
      <Screen
        nav
        footer={
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="gray" onClick={() => router.replace('/chat')}>
              새 대화 시작
            </Button>
            <Button onClick={() => retry()}>다시 시도</Button>
          </div>
        }
      >
        <p className="text-center text-[14px] text-sub mt-24">이어갈 대화를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>
      </Screen>
    );
  }
  return <ChatContent key={chat?.id ?? 'new'} resumed={chat} />;
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatResume />
    </Suspense>
  );
}
