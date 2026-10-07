'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/primitives';
import { ContentList, ReportLocked, ReportScreen } from '@/components/ui/report';
import { MIN_RECORDS_FOR_REPORT, pickContent, useWeeklyReport } from '@/hooks/useWeeklyReport';

export default function ReportGrowthPage() {
  const router = useRouter();
  const r = useWeeklyReport();
  const c = r.report?.content;

  return (
    <ReportScreen
      eyebrow="GROWTH"
      title="성장 지표와 핵심 발견"
      sub="지난주와 비교해 무엇이 달라졌는지"
      footer={<Button onClick={() => router.push('/report/sentence')}>나의 문장 보기</Button>}
    >
      <div className="rounded-3xl bg-primary px-5 pt-5 pb-5">
        <p className="text-[13px] text-white/75">현재 메타인지 정확도</p>
        <p className="text-[40px] font-bold text-white leading-none mt-3">{r.accuracy}%</p>
        <p className="text-[12px] text-white/70 mt-3">기록이 쌓일수록 주차별 추이가 여기에 그려져요</p>
      </div>
      {r.report ? (
        <ContentList title="이번 주 핵심 발견" items={pickContent(c, ['findings', 'key_findings', 'insights', 'growth'])} />
      ) : (
        !r.loading && (
          <ReportLocked recordCount={r.recordCount} min={MIN_RECORDS_FOR_REPORT} canGenerate={r.canGenerate} generating={r.generating} onGenerate={r.generate} error={r.error} />
        )
      )}
    </ReportScreen>
  );
}
