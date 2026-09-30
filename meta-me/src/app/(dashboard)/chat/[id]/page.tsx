'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useListAiCounselingMessages } from '@/entities/system';
import { Screen } from '@/components/ui/Screen';
import { Button, TopBar } from '@/components/ui/primitives';
import { AiBubble, UserBubble } from '@/components/ui/chat';
import { MOCK_CHAT_THREAD, MOCK_CHATS } from '@/lib/mock';

export default function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isMock = MOCK_CHATS.some((c) => c.id === id);
  const { data } = useListAiCounselingMessages(id, undefined, !!accessToken && !isMock);
  const summary = MOCK_CHATS.find((c) => c.id === id) ?? MOCK_CHATS[0];

  const thread =
    data?.messages?.map((m) => ({ role: m.sender_type === 'AI' ? ('ai' as const) : ('user' as const), text: m.content })) ?? MOCK_CHAT_THREAD;

  return (
    <Screen
      footer={
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="gray" onClick={() => router.push('/diary/write')}>
            다이어리로 옮기기
          </Button>
          <Button onClick={() => router.push('/chat')}>이어서 대화하기</Button>
        </div>
      }
    >
      <TopBar title={<span className="text-[17px] font-bold">8월 3일 · 일</span>} sub={`${summary.time} · ${summary.kind}`} />
      <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
        {thread.map((m, i) => (m.role === 'user' ? <UserBubble key={i}>{m.text}</UserBubble> : <AiBubble key={i}>{m.text}</AiBubble>))}
        <div className="flex justify-center">
          <span className="h-7 px-3 rounded-full bg-[#E6E6EC] text-[12px] text-[#48484F] inline-flex items-center">대화가 끝났어요</span>
        </div>
        <div className="rounded-3xl bg-surface px-5 py-5">
          <p className="text-[12px] font-semibold text-primary">이 대화에서 남은 것</p>
          <p className="text-[16px] text-ink leading-[1.6] mt-2">완성 전에는 보여주기를 미루는 경향 — 기록에서 3번째로 보인 패턴이에요.</p>
          <div className="flex gap-2 mt-3">
            {['망설임', '완벽주의'].map((t) => (
              <span key={t} className="h-7 px-2.5 rounded-full bg-primary-soft text-[12px] font-semibold text-primary inline-flex items-center">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  );
}
