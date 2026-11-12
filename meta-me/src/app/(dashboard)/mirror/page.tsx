'use client';

import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { GradientBg } from '@/components/ui/overlays';
import { AskFriendSheet } from '@/components/ui/flows';
import { useCollection } from '@/hooks/useCollection';

/** 내 유형 카드 + "친구는 나를 어떤 유형으로 볼지" 시트 (타인 평가 진입). */
export default function MirrorIntroPage() {
  const router = useRouter();
  const myType = useCollection()[0]?.name ?? '아직 없음';
  return (
    <Screen
      statusBg="#E6E6FF"
      background={<GradientBg variant="a" />}
      overlay={<AskFriendSheet open onClose={() => router.back()} myType={myType} onAsk={() => router.push('/mirror/invite')} />}
    >
      <div className="flex items-center justify-between px-5 h-14">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center" aria-label="뒤로가기">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 5l-7 7 7 7" stroke="#1A1A1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="text-center mt-6">
        <p className="text-[16px] text-[#48484F]">당신은</p>
        <h1 className="text-[26px] font-bold text-ink mt-2">{myType}</h1>
      </div>
    </Screen>
  );
}
