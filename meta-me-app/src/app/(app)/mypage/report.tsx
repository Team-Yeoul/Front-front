import { useState } from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ChatFab, TopBar } from '@/components/ui/primitives';
import { MyTabs } from '@/components/ui/MyTabs';
import { AskSheet } from '@/components/ui/AskSheet';
import { ContentList, ReportLocked } from '@/components/ui/report';
import { Text } from '@/components/ui/Text';
import { SensitiveGate } from '@/components/SensitiveGate';
import { MIN_RECORDS_FOR_REPORT, pickContent, useWeeklyReport } from '@/hooks/useWeeklyReport';

export default function MyReportScreen() {
  return (
    <SensitiveGate>
      <MyReport />
    </SensitiveGate>
  );
}

function MyReport() {
  const [ask, setAsk] = useState(false);
  const r = useWeeklyReport();
  const c = r.report?.content;

  return (
    <Screen
      bg="#F2F2F7"
      overlay={
        <>
          <ChatFab className="absolute right-5 bottom-10 z-20" onPress={() => setAsk(true)} />
          <AskSheet open={ask} onClose={() => setAsk(false)} context="리포트 미" />
        </>
      }
    >
      <View className="bg-white">
        <TopBar title="리포트 미" backHref="/mypage" />
        <MyTabs active="report" />
      </View>
      <View className="px-4 pt-4 pb-24 gap-3">
        <View className="rounded-3xl bg-primary px-5 py-5">
          <Text className="text-[13px] text-white/75">현재 메타인지 정확도</Text>
          <Text className="text-[34px] font-bold text-white leading-[34px] mt-3">{r.accuracy}%</Text>
          <View className="flex-row gap-6 mt-4">
            <View>
              <Text className="text-[18px] font-bold text-white">{r.recordCount}</Text>
              <Text className="text-[12px] text-white/70">이번 주 기록</Text>
            </View>
            <View>
              <Text className="text-[18px] font-bold text-white">{r.streak}</Text>
              <Text className="text-[12px] text-white/70">연속 기록일</Text>
            </View>
          </View>
        </View>
        {r.report ? (
          <>
            <ContentList title="강점" items={pickContent(c, ['strengths', 'strength'])} />
            <ContentList title="약점" items={pickContent(c, ['weaknesses', 'weakness'])} />
            <ContentList title="키워드" items={pickContent(c, ['interests', 'keywords'])} />
          </>
        ) : (
          !r.loading && (
            <ReportLocked
              recordCount={r.recordCount}
              min={MIN_RECORDS_FOR_REPORT}
              canGenerate={r.canGenerate}
              generating={r.generating}
              onGenerate={r.generate}
              error={r.error}
            />
          )
        )}
      </View>
    </Screen>
  );
}
