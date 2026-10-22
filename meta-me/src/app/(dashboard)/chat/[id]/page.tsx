'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { Button, TopBar } from '@/components/ui/primitives';
import { AiBubble, UserBubble } from '@/components/ui/chat';
import { useChat } from '@/hooks/useChatHistory';
import { chatKindLabel, hhmm } from '@/lib/chatLabels';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

export default function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { chat, loading, failed, retry } = useChat(id);

  if (loading) {
    return (
      <Screen>
        <TopBar backHref="/chat/history" />
        <p className="text-center text-[14px] text-sub mt-24">대화를 불러오는 중이에요...</p>
      </Screen>
    );
  }

  if (!chat && failed) {
    return (
      <Screen footer={<Button onClick={() => retry()}>다시 시도</Button>}>
        <TopBar backHref="/chat/history" />
        <p className="text-center text-[14px] text-sub mt-24">대화를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>
      </Screen>
    );
  }

  if (!chat) {
    return (
      <Screen footer={<Button onClick={() => router.push('/chat/history')}>지난 대화로</Button>}>
        <TopBar backHref="/chat/history" />
        <p className="text-center text-[14px] text-sub mt-24">대화를 찾을 수 없어요.</p>
      </Screen>
    );
  }

  const d = new Date(chat.startedAt);
  return (
    <Screen
      footer={
        <Button onClick={() => router.push(chat.kind === 'free' ? `/chat?resume=${chat.id}` : '/report')}>
          {chat.kind === 'free' ? '이어서 대화하기' : '리포트로 가기'}
        </Button>
      }
    >
      <TopBar
        backHref="/chat/history"
        title={<span className="text-[17px] font-bold">{`${d.getMonth() + 1}월 ${d.getDate()}일 · ${WEEK[d.getDay()]}`}</span>}
        sub={`${hhmm(chat.startedAt)} · ${chatKindLabel(chat)}`}
      />
      <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
        {chat.messages.map((m, i) => (m.role === 'user' ? <UserBubble key={i}>{m.text}</UserBubble> : <AiBubble key={i}>{m.text}</AiBubble>))}
        <div className="flex justify-center">
          <span className="h-7 px-3 rounded-full bg-[#E6E6EC] text-[12px] text-[#48484F] inline-flex items-center">대화가 끝났어요</span>
        </div>
      </div>
    </Screen>
  );
}
