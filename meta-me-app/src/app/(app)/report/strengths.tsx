import { SensitiveGate } from '@/components/SensitiveGate';
import { ContentList, ReportLocked, ReportScreen } from '@/components/ui/report';
import { MIN_RECORDS_FOR_REPORT, pickContent, useWeeklyReport } from '@/hooks/useWeeklyReport';

function ReportStrengths() {
  const r = useWeeklyReport();
  const c = r.report?.content;
  return (
    <ReportScreen eyebrow="FINDING" title="발견된 강점 / 약점" sub="이번 주 기록에서 찾은 모습이에요">
      {r.report ? (
        <>
          <ContentList title="강점" items={pickContent(c, ['strengths', 'strength'])} />
          <ContentList title="주의할 패턴" items={pickContent(c, ['weaknesses', 'weakness', 'cautions', 'risks'])} />
        </>
      ) : (
        !r.loading && (
          <ReportLocked recordCount={r.recordCount} min={MIN_RECORDS_FOR_REPORT} canGenerate={r.canGenerate} generating={r.generating} onGenerate={r.generate} error={r.error} />
        )
      )}
    </ReportScreen>
  );
}

export default function ReportStrengthsScreen() {
  return (
    <SensitiveGate>
      <ReportStrengths />
    </SensitiveGate>
  );
}
