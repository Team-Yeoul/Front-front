import { SensitiveGate } from '@/components/SensitiveGate';
import { ContentList, ReportLocked, ReportScreen } from '@/components/ui/report';
import { MIN_RECORDS_FOR_REPORT, pickContent, useWeeklyReport } from '@/hooks/useWeeklyReport';

function ReportKeywords() {
  const r = useWeeklyReport();
  const c = r.report?.content;
  return (
    <ReportScreen eyebrow="KEYWORD & ENERGY" title="키워드와 에너지" sub="관심이 몰린 주제와 기분을 움직인 것들">
      {r.report ? (
        <>
          <ContentList title="자주 관심을 보인 주제" items={pickContent(c, ['interests', 'keywords', 'interest_keywords'])} />
          <ContentList title="흥미가 낮게 나타난 주제" items={pickContent(c, ['disinterests', 'low_interest_keywords'])} />
          <ContentList title="에너지 패턴" items={pickContent(c, ['energy', 'energy_patterns'])} />
        </>
      ) : (
        !r.loading && (
          <ReportLocked recordCount={r.recordCount} min={MIN_RECORDS_FOR_REPORT} canGenerate={r.canGenerate} generating={r.generating} onGenerate={r.generate} error={r.error} />
        )
      )}
    </ReportScreen>
  );
}

export default function ReportKeywordsScreen() {
  return (
    <SensitiveGate>
      <ReportKeywords />
    </SensitiveGate>
  );
}
