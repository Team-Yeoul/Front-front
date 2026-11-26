'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { router } from '@/lib/router';
import { View } from '@/components/ui/rn';
import { Button } from '@/components/ui/primitives';
import { ContentList, ContentSkeleton, REPORT_TABS, ReportLocked, ReportScreen, ReportSection, StatRetry, StatRow, weekRangeLabel, type ReportTab } from '@/components/ui/report';
import { WeekBars } from '@/components/ui/WeekBars';
import { Skeleton, StatusView } from '@/components/ui/states';
import { Text } from '@/components/ui/Text';
import { MIN_RECORDS_FOR_REPORT, pickContent, reportNarrative, useWeeklyReport } from '@/hooks/useWeeklyReport';
import { withSensitiveGate } from '@/components/SensitiveGate';

type Report = ReturnType<typeof useWeeklyReport>;

/**
 * 리포트가 아직 없을 때 각 탭 자리에 띄우는 안내. 불러오는 중이면 뼈대를 보여 준다.
 * 이번 주 기록 수를 모르는 동안(받는 중·실패)은 '기록이 부족해요' 안내를 띄우지 않는다.
 */
function Locked({ r }: { r: Report }) {
  if (r.loading || r.recordsPending) return <ContentSkeleton />;
  if (r.recordsFailed) {
    return <StatusView kind="error" title="이번 주 기록을 불러오지 못했어요" onRetry={r.retryRecords} retrying={r.recordsRetrying} className="py-8" />;
  }
  return (
    <ReportSection>
      <ReportLocked recordCount={r.recordCount} min={MIN_RECORDS_FOR_REPORT} canGenerate={r.canGenerate} generating={r.generating} onGenerate={r.generate} error={r.error} />
    </ReportSection>
  );
}

/** 리포트 로딩 (16b): 숫자 줄 · 요일 막대 · 분석 자리 */
function ReportSkeleton() {
  return (
    <View accessibilityLabel="리포트 불러오는 중">
      <View className="border-t-8 border-surface px-6 py-7">
        <Skeleton className="w-[110px] h-5" />
        <View className="flex-row gap-3 mt-5">
          {[0, 1, 2].map((i) => (
            <View key={i} className="flex-1">
              <Skeleton className="w-[70px] h-3" />
              <Skeleton className="w-[60px] h-6 mt-2" />
            </View>
          ))}
        </View>
        <View className="flex-row gap-2 items-end h-[140px] mt-6">
          {[62, 72, 22, 82, 66, 18, 8].map((h, i) => (
            <View key={i} className="flex-1" style={{ height: `${h}%` }}>
              <Skeleton className="h-full rounded-t-md" style={{ flex: 1 }} />
            </View>
          ))}
        </View>
      </View>
      <View className="border-t-8 border-surface px-6 py-7">
        <Skeleton className="w-[90px] h-5" />
        <Skeleton className="h-14 mt-5 rounded-2xl" />
        <Skeleton className="h-14 mt-3 rounded-2xl" />
      </View>
    </View>
  );
}

/** 요약 (8a) */
function Summary({ r }: { r: Report }) {
  if (r.loading) return <ReportSkeleton />;
  return (
    <>
      <ReportSection title="이번 주 요약">
        <StatRow
          items={[
            // 리포트 기간과 맞춰 잰 값이 아니라 가장 최근 측정값이라 '최근'으로 표시한다.
            { label: '최근 문장 정확도', value: r.accuracy === null ? '-' : `${r.accuracy}%` },
            { label: '기록', value: r.recordsFailed || r.recordsPending ? '-' : `${r.recordCount}개` },
            { label: '연속 기록일', value: r.streak === null ? '-' : `${r.streak}일` },
          ]}
        />
        <StatRetry failed={r.streakFailed} onRetry={r.retryStreak} label="연속 기록일 다시 불러오기" />
        {/* 기록 목록을 못 불러왔으면 빈 그래프(=기록 없음)로 보이지 않게 안내한다. */}
        {r.recordsFailed ? (
          <StatusView kind="error" title="이번 주 기록을 불러오지 못했어요" onRetry={r.retryRecords} retrying={r.recordsRetrying} className="py-8" />
        ) : r.recordsPending ? (
          <Skeleton className="h-[140px] mt-6 rounded-xl" />
        ) : (
          <WeekBars records={r.records} weekStart={r.week.start} />
        )}
      </ReportSection>
      {/* 기록을 못 불러왔으면 위에 다시 시도 안내가 있으니, 기록 수를 모르는 채로 '기록 부족' 안내를 또 띄우지 않는다. */}
      {r.report ? <ContentList title="AI 종합 분석" items={reportNarrative(r.report.content)} /> : r.recordsFailed ? null : <Locked r={r} />}
    </>
  );
}

/** 강점 · 약점 (8b) */
function Strengths({ r }: { r: Report }) {
  const c = r.report?.content;
  if (!r.report) return <Locked r={r} />;
  return (
    <>
      <ContentList title="이번 주 강점" label="강점" items={pickContent(c, ['strengths', 'strength'])} />
      <ContentList title="주의할 패턴" label="패턴" items={pickContent(c, ['weaknesses', 'weakness', 'cautions', 'risks'])} />
    </>
  );
}

/** 키워드 · 에너지 (8c) */
function Keywords({ r }: { r: Report }) {
  const c = r.report?.content;
  if (!r.report) return <Locked r={r} />;
  const interests = pickContent(c, ['interests', 'keywords', 'interest_keywords']);
  return (
    <>
      <ReportSection title="자주 관심을 보인 주제">
        {interests.length > 0 ? (
          <View className="mt-4 flex-row flex-wrap gap-2">
            {interests.map((k, i) => (
              <View key={`${i}-${k}`} className={`rounded-full px-4 py-2 ${i === 0 ? 'bg-primary' : 'bg-primary-soft'}`}>
                <Text className={`text-[16px] font-semibold ${i === 0 ? 'text-white' : 'text-primary-pressed'}`}>{k}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-[14px] text-sub mt-3">이번 리포트에는 이 항목이 없어요</Text>
        )}
      </ReportSection>
      <ContentList title="흥미가 낮게 나타난 주제" items={pickContent(c, ['disinterests', 'low_interest_keywords'])} />
      <ContentList title="에너지 패턴" label="패턴" items={pickContent(c, ['energy', 'energy_patterns'])} />
    </>
  );
}

/** 남 vs 나 (8d). 친구 응답이 모이기 전 상태를 보여준다. */
function Compare() {
  return (
    <ReportSection title="두 시선 비교">
      <View className="mt-4 rounded-[20px] bg-surface px-5 py-6 items-center">
        <Text className="text-[16px] font-bold text-ink text-center">아직 친구의 답이 없어요</Text>
        <Text className="text-[14px] text-text-4 leading-[22px] mt-2 text-center">{'친구 3명 이상이 답하면\n내가 보는 나와 나란히 비교해 드려요'}</Text>
        <View className="flex-row items-center gap-3 w-full mt-5">
          <View className="flex-1 h-2 rounded-full bg-track" />
          <Text className="text-[14px] font-semibold text-primary tabular-nums">0 / 3</Text>
        </View>
        <View className="w-full mt-6">
          <Button onPress={() => router.push('/mirror/invite')}>친구에게 물어보기</Button>
        </View>
      </View>
    </ReportSection>
  );
}

/** 성장 (8e). 정확도 기록은 현재 값만 있어 주차별 추이 그래프는 아직 그리지 않는다. */
function Growth({ r }: { r: Report }) {
  const c = r.report?.content;
  return (
    <>
      <ReportSection title="메타인지 정확도">
        <StatRow
          items={[
            { label: '최근 정확도', value: r.accuracy === null ? '-' : `${r.accuracy}%` },
            { label: '이번 주 기록', value: r.recordsFailed || r.recordsPending ? '-' : `${r.recordCount}개` },
            { label: '연속 기록일', value: r.streak === null ? '-' : `${r.streak}일` },
          ]}
        />
        <StatRetry failed={r.streakFailed} onRetry={r.retryStreak} label="연속 기록일 다시 불러오기" />
        {/* 아직 잰 정확도가 없으면 0%로 보이지 않게 막대를 그리지 않는다. */}
        {r.accuracy !== null && (
          <View
            className="mt-5 h-3 rounded-full bg-surface-2 overflow-hidden"
            accessibilityRole="progressbar"
            accessibilityLabel="최근 정확도"
            accessibilityValue={{ min: 0, max: 100, now: r.accuracy }}
          >
            <View className="h-full rounded-full bg-primary" style={{ width: `${r.accuracy}%` }} />
          </View>
        )}
        <View className="mt-5 rounded-2xl bg-surface px-5 py-4">
          <Text className="text-[16px] leading-[26px] text-text-2">
            기록이 쌓일수록 주차별 정확도 추이가 여기에 그려져요. 정확도가 80%가 되면 나에게 어울리는 칭호, 별명이 열려요.
          </Text>
        </View>
      </ReportSection>
      {r.report ? <ContentList title="이번 주 핵심 발견" label="발견" items={pickContent(c, ['findings', 'key_findings', 'insights', 'growth'])} /> : <Locked r={r} />}
    </>
  );
}

const isTab = (v?: string | null): v is ReportTab => REPORT_TABS.some((t) => t.key === v);

/** 리포트 탭 (8a~8e). ?tab=strengths 처럼 위 탭을 고를 수 있다. */
function ReportTabScreen() {
  const r = useWeeklyReport();
  const param = useSearchParams().get('tab');
  const tab: ReportTab = isTab(param) ? param : 'summary';

  return (
    <ReportScreen
      tab={tab}
      // 앱 router.setParams 자리: 같은 화면에서 주소의 tab만 바꾼다.
      onTabChange={(t) => router.replace({ pathname: '/report', params: { tab: t === 'summary' ? undefined : t } })}
      range={weekRangeLabel(r.week.start, r.week.end)}
      footer={tab === 'growth' ? <Button onPress={() => router.push('/report/sentence')}>나의 문장 보기</Button> : undefined}
    >
      {tab === 'summary' && <Summary r={r} />}
      {tab === 'strengths' && <Strengths r={r} />}
      {tab === 'keywords' && <Keywords r={r} />}
      {tab === 'compare' && <Compare />}
      {tab === 'growth' && <Growth r={r} />}
    </ReportScreen>
  );
}

// useSearchParams를 쓰는 화면은 Next 규칙대로 Suspense로 감싼다.
function ReportPage() {
  return (
    <Suspense>
      <ReportTabScreen />
    </Suspense>
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(ReportPage, { inTabs: true });
