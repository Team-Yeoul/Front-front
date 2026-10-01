'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/primitives';
import { ReportScreen } from '@/components/ui/report';

/** 친구 응답 API가 아직 없어 응답이 모이기 전 상태만 보여준다. */
export default function ReportComparePage() {
  const router = useRouter();
  return (
    <ReportScreen eyebrow="MIRROR" title="남이 보는 나 vs 내가 보는 나">
      <div className="rounded-3xl bg-surface px-5 py-8 flex flex-col items-center text-center">
        <p className="text-[16px] font-bold text-ink">아직 친구의 답이 없어요</p>
        <p className="text-[13px] text-sub leading-relaxed mt-2">
          친구 3명 이상이 답하면
          <br />내가 보는 나와 나란히 비교해 드려요
        </p>
        <div className="flex items-center gap-3 w-full mt-5">
          <div className="flex-1 h-1.5 rounded-full bg-[#E4E4EA]" />
          <span className="font-mono text-[13px] font-semibold text-primary">0 / 3</span>
        </div>
        <Button className="mt-6" onClick={() => router.push('/mirror/invite')}>
          친구에게 물어보기
        </Button>
      </div>
    </ReportScreen>
  );
}
