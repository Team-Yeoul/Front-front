import { View } from 'react-native';
import { SensitiveGate } from '@/components/SensitiveGate';
import { Card, ContentList, ReportLocked, ReportScreen, RingDonut } from '@/components/ui/report';
import { Text } from '@/components/ui/Text';
import { MIN_RECORDS_FOR_REPORT, pickContent, useWeeklyReport } from '@/hooks/useWeeklyReport';

function ReportSummary() {
  const r = useWeeklyReport();
  const summary = pickContent(r.report?.content, ['summary', 'ai_summary', 'overview', 'analysis']);

  // 웹은 이 화면에 하단 탭(nav)을 띄웠지만, 앱에서는 탭 밖의 상세 화면이라 nav를 주지 않는다.
  return (
    <ReportScreen eyebrow={`REPORT ME · ${r.week.label}`} title="이번 주 요약" sub={`이번 주 기록 ${r.recordCount}개`}>
      <Card className="items-center py-8">
        <RingDonut size={184} stroke={32} value={r.accuracy}>
          <Text className="text-[13px] text-sub">문장 정확도</Text>
          <Text className="text-[36px] font-bold text-ink leading-[45px]">{r.accuracy}%</Text>
        </RingDonut>
      </Card>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Card>
            <Text className="text-[26px] font-bold text-ink">{r.recordCount}</Text>
            <Text className="text-[13px] text-sub mt-1">이번 주 기록</Text>
          </Card>
        </View>
        <View className="flex-1">
          <Card>
            <Text className="text-[26px] font-bold text-ink">{r.streak}</Text>
            <Text className="text-[13px] text-sub mt-1">연속 기록일</Text>
          </Card>
        </View>
      </View>
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

export default function ReportSummaryScreen() {
  return (
    <SensitiveGate>
      <ReportSummary />
    </SensitiveGate>
  );
}
