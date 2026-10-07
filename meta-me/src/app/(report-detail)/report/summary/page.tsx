'use client';

import { Card, ContentList, ReportLocked, ReportScreen, RingDonut } from '@/components/ui/report';
import { MIN_RECORDS_FOR_REPORT, pickContent, useWeeklyReport } from '@/hooks/useWeeklyReport';

export default function ReportSummaryPage() {
  const r = useWeeklyReport();
  const summary = pickContent(r.report?.content, ['summary', 'ai_summary', 'overview', 'analysis']);

  return (
    <ReportScreen nav eyebrow={`REPORT ME · ${r.week.label}`} title="이번 주 요약" sub={`이번 주 기록 ${r.recordCount}개`}>
      <Card className="flex flex-col items-center py-8">
        <RingDonut size={184} stroke={32} value={r.accuracy}>
          <span className="text-[13px] text-sub">문장 정확도</span>
          <span className="text-[36px] font-bold text-ink leading-tight">{r.accuracy}%</span>
        </RingDonut>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-[26px] font-bold text-ink">{r.recordCount}</p>
          <p className="text-[13px] text-sub mt-1">이번 주 기록</p>
        </Card>
        <Card>
          <p className="text-[26px] font-bold text-ink">{r.streak}</p>
          <p className="text-[13px] text-sub mt-1">연속 기록일</p>
        </Card>
      </div>
      {r.report ? (
        <ContentList title="AI 종합 분석" items={summary} />
      ) : (
        !r.loading && (
          <ReportLocked recordCount={r.recordCount} min={MIN_RECORDS_FOR_REPORT} canGenerate={r.canGenerate} generating={r.generating} onGenerate={r.generate} error={r.error} />
        )
      )}
    </ReportScreen>
  );
}
