import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { router, type Href } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { SensitiveGate } from '@/components/SensitiveGate';
import { Screen } from '@/components/ui/Screen';
import { ChatFab } from '@/components/ui/primitives';
import { ChevronRight, LockIcon } from '@/components/ui/icons';
import { Text } from '@/components/ui/Text';
import { AskSheet } from '@/components/ui/AskSheet';
import { ReportLocked, RingDonut } from '@/components/ui/report';
import { MIN_RECORDS_FOR_REPORT, useWeeklyReport } from '@/hooks/useWeeklyReport';

const icon = (d: ReactNode) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#6367FF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </Svg>
);

const ROWS: { href: Href; title: string; sub: string; icon: ReactNode }[] = [
  { href: '/report/summary', title: '이번 주 요약', sub: 'AI가 정리한 한 주', icon: icon(<Path d="M6 19v-6M12 19V6M18 19v-9" />) },
  { href: '/report/strengths', title: '강점 / 약점', sub: '기록에서 발견된 모습', icon: icon(<Path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />) },
  { href: '/report/keywords', title: '키워드 · 에너지 패턴', sub: '자주 쓴 말과 몰입한 시간', icon: icon(<Path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" />) },
  {
    href: '/report/compare',
    title: '남이 보는 나 vs 내가 보는 나',
    sub: '친구들의 답과 비교',
    icon: icon(
      <>
        <Circle cx="9" cy="9" r="3" />
        <Circle cx="16" cy="9" r="3" />
        <Path d="M3.5 19c.6-2.8 2.8-4.5 5.5-4.5s4.9 1.7 5.5 4.5M13 14.8c.9-.2 1.9-.3 3-.3 2.7 0 4.9 1.7 5.5 4.5" />
      </>,
    ),
  },
  { href: '/report/growth', title: '성장 지표 · 핵심 발견', sub: '지난주보다 달라진 점', icon: icon(<Path d="M4 16l5-5 4 4 7-7M15 8h5v5" />) },
];

function ReportHub() {
  const r = useWeeklyReport();
  const [ask, setAsk] = useState(false);
  const accuracy = r.accuracy;

  return (
    <Screen
      inTabs
      overlay={
        <>
          {/* 웹은 하단 탭 위로 띄웠다. 앱은 화면이 탭 바 위에서 끝나므로 화면 아래에서 띄운다. */}
          <View className="absolute right-5 bottom-6 z-20">
            <ChatFab onPress={() => setAsk(true)} />
          </View>
          <AskSheet open={ask} onClose={() => setAsk(false)} context="이번 주 리포트" />
        </>
      }
    >
      <View className="px-5 pt-5">
        <Text className="font-mono text-[12px] tracking-[1.4px] text-sub">REPORT ME</Text>
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-[26px] font-bold text-ink">리포트</Text>
          {/* 주 선택은 아직 지원하지 않아 이번 주 라벨만 보여준다. */}
          <View className="h-9 px-3.5 rounded-full bg-surface-2 justify-center">
            <Text className="text-[14px] font-semibold text-ink">{r.week.label}</Text>
          </View>
        </View>
      </View>

      <View className="px-4 mt-4">
        <View className="rounded-3xl bg-surface px-5 py-5 flex-row items-center gap-5">
          <RingDonut size={100} stroke={14} value={accuracy}>
            <Text className="text-[22px] font-bold text-ink">{accuracy}%</Text>
          </RingDonut>
          <View>
            <Text className="text-[13px] text-sub">이번 주 문장 정확도</Text>
            <View className="flex-row gap-5 mt-2">
              <View>
                <Text className="text-[20px] font-bold text-ink">{r.recordCount}</Text>
                <Text className="text-[12px] text-sub">기록</Text>
              </View>
              <View>
                <Text className="text-[20px] font-bold text-ink">{r.streak}</Text>
                <Text className="text-[12px] text-sub">연속 기록일</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="px-4 mt-6 pb-24">
        {!r.loading && !r.report && (
          <View className="mb-5">
            <ReportLocked
              recordCount={r.recordCount}
              min={MIN_RECORDS_FOR_REPORT}
              canGenerate={r.canGenerate}
              generating={r.generating}
              onGenerate={r.generate}
              error={r.error}
            />
          </View>
        )}
        <Text className="text-[13px] font-semibold text-[#48484F] px-1">이번 주 리포트 {ROWS.length}개</Text>
        <View className="gap-3 mt-3">
          {ROWS.map((row) => {
            // 남 vs 나는 친구 답으로 만들어져 주간 리포트와 별개로 열 수 있다.
            const locked = !r.report && row.href !== '/report/compare';
            return (
              <Pressable
                key={row.title}
                disabled={locked}
                onPress={() => router.push(row.href)}
                accessibilityRole="button"
                accessibilityState={{ disabled: locked }}
                className={`flex-row items-center gap-3.5 rounded-2xl bg-surface px-4 py-4 ${locked ? 'opacity-60' : 'active:opacity-80'}`}
              >
                <View className="w-10 h-10 rounded-xl bg-primary-soft items-center justify-center">{row.icon}</View>
                <View className="flex-1 min-w-0">
                  <Text className="text-[16px] font-bold text-ink">{row.title}</Text>
                  <Text className="text-[13px] text-sub mt-0.5">{locked ? '리포트가 만들어지면 열려요' : row.sub}</Text>
                </View>
                {locked ? <LockIcon size={16} color="#B4B4BB" /> : <ChevronRight size={18} color="#8E8E95" />}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

export default function ReportTab() {
  return (
    <SensitiveGate inTabs>
      <ReportHub />
    </SensitiveGate>
  );
}
