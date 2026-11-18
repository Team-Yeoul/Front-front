import { View } from 'react-native';
import { router } from 'expo-router';
import { SensitiveGate } from '@/components/SensitiveGate';
import { Button } from '@/components/ui/primitives';
import { ContentList, ReportLocked, ReportScreen } from '@/components/ui/report';
import { Text } from '@/components/ui/Text';
import { MIN_RECORDS_FOR_REPORT, pickContent, useWeeklyReport } from '@/hooks/useWeeklyReport';

function ReportGrowth() {
  const r = useWeeklyReport();
  const c = r.report?.content;

  return (
    <ReportScreen
      eyebrow="GROWTH"
      title="성장 지표와 핵심 발견"
      sub="지난주와 비교해 무엇이 달라졌는지"
      footer={<Button onPress={() => router.push('/report/sentence')}>나의 문장 보기</Button>}
    >
      <View className="rounded-3xl bg-primary px-5 pt-5 pb-5">
        <Text className="text-[13px] text-white/75">현재 메타인지 정확도</Text>
        <Text className="text-[40px] font-bold text-white leading-[44px] mt-3">{r.accuracy}%</Text>
        <Text className="text-[12px] text-white/70 mt-3">기록이 쌓일수록 주차별 추이가 여기에 그려져요</Text>
      </View>
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

export default function ReportGrowthScreen() {
  return (
    <SensitiveGate>
      <ReportGrowth />
    </SensitiveGate>
  );
}
