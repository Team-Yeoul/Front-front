'use client';

import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { Button, ChevronLeft, CogniImg } from '@/components/ui/primitives';
import { useCollection } from '@/hooks/useCollection';

/** 첫 코그니 발견 (도감 저장 직후). */
export default function NewCogniPage() {
  const router = useRouter();
  const cogni = useCollection()[0];
  if (!cogni) return null;
  return (
    <Screen
      footer={
        <>
          <Button variant="dark" onClick={() => router.push(`/dogam/${encodeURIComponent(cogni.id)}/moments`)}>
            잡은 순간 확인하기
          </Button>
          <p className="text-center text-[13px] text-sub mt-3 mb-1">도감에 저장했어요</p>
        </>
      }
    >
      <div className="relative flex items-center justify-center h-14 px-5">
        <button onClick={() => router.back()} className="absolute left-5" aria-label="뒤로가기">
          <ChevronLeft size={20} />
        </button>
        <span className="text-[15px] font-semibold text-ink">코그니 발견</span>
      </div>
      <div className="flex flex-col items-center pt-[70px]">
        <span className="h-8 px-4 rounded-full bg-primary-soft font-mono text-[13px] font-bold text-primary inline-flex items-center">No.01 첫 코그니</span>
        <p className="text-[20px] text-ink mt-8">당신 안에서 발견된 첫 코그니</p>
        <div className="mt-14">
          <CogniImg src={cogni.image} size={200} />
        </div>
        <span className="mt-14 h-9 px-4 rounded-full bg-surface-2 text-[13px] text-[#48484F] inline-flex items-center gap-2">
          <span className="text-[10px]">▶</span> {cogni.category}
        </span>
        <h1 className="text-[28px] font-bold text-ink mt-4">{cogni.name}</h1>
        <p className="text-[14px] text-[#48484F] text-center leading-[1.7] mt-2">{cogni.desc}</p>
      </div>
    </Screen>
  );
}
