'use client';

import { View } from './rn';
import { useQueries } from '@tanstack/react-query';
import { diaryApi, diaryKeys, type DailyRecord } from '@/entities/diary';
import { toDateKey } from '@/lib/date';
import { useAccountToday } from '@/hooks/useSaveTodayRecord';
import { Text } from './Text';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const CHART_H = 140;

/** 기록 하나의 글자 수: 서술(답 + 장면 + 나다움) / 태그(감정 태그) */
function measure(q?: { user_answer?: string; scene_description?: string; myself_moment_desc?: string; emotion_tag?: string }) {
  const narrative = [q?.user_answer, q?.scene_description, q?.myself_moment_desc].reduce((n, t) => n + (t?.trim().length ?? 0), 0);
  const tags = q?.emotion_tag?.replace(/[,\s]/g, '').length ?? 0;
  return { narrative, tags };
}

/**
 * 이번 주 요일별 기록 양 막대 (8a). 진한 보라 = 서술, 연보라 = 태그.
 * 서술 없이 태그만 남긴 날은 '태그만' 꼬리표를 붙인다. 오늘 요일은 굵게.
 */
export function WeekBars({ records, weekStart }: { records: DailyRecord[]; weekStart: string }) {
  const details = useQueries({
    queries: records.map((r) => ({
      queryKey: diaryKeys.record(r.record_id),
      queryFn: () => diaryApi.getDailyRecord(r.record_id),
      staleTime: 60_000,
    })),
  });

  const [y, m, d0] = weekStart.split('-').map(Number);
  const days = DAYS.map((label, i) => {
    const key = toDateKey(new Date(y, m - 1, d0 + i));
    const idx = records.findIndex((r) => r.recorded_date === key);
    const v = idx >= 0 ? measure(details[idx]?.data?.questions?.[0]) : { narrative: 0, tags: 0 };
    return { label, key, ...v, recorded: idx >= 0 };
  });

  const { todayKey } = useAccountToday();
  const maxRaw = Math.max(...days.map((d) => d.narrative + d.tags), 1);
  // 눈금은 100자 단위로 올림 (최소 100)
  const max = Math.max(100, Math.ceil(maxRaw / 100) * 100);

  return (
    <View className="mt-6" accessibilityLabel="이번 주 요일별 기록 양">
      <View className="flex-row gap-2">
        <View className="flex-1 flex-row gap-2 items-end" style={{ height: CHART_H }}>
          {days.map((d) => {
            const h = Math.max(((d.narrative + d.tags) / max) * CHART_H, 6);
            const tagH = Math.min((d.tags / max) * CHART_H, h);
            const tagOnly = d.recorded && d.narrative === 0;
            return (
              <View key={d.key} className="flex-1 h-full justify-end items-center">
                {tagOnly && (
                  <View className="absolute z-[1] rounded-lg border border-[#DCDDFF] dark:border-primary-line bg-page px-2 py-1" style={{ bottom: h + 8 }}>
                    <Text numberOfLines={1} className="text-[12px] font-semibold text-ink">
                      태그만
                    </Text>
                  </View>
                )}
                {d.recorded ? (
                  <View className="w-full overflow-hidden rounded-t-md" style={{ height: h }}>
                    <View className="bg-primary-line" style={{ height: tagOnly ? '100%' : tagH }} />
                    {!tagOnly && <View className="flex-1 bg-primary border-t-2 border-page" />}
                  </View>
                ) : (
                  <View className="w-full h-1 rounded-full bg-surface-2" />
                )}
              </View>
            );
          })}
        </View>
        <View className="w-9 justify-between items-end" style={{ height: CHART_H }}>
          <Text className="text-[12px] text-mute tabular-nums">{max}자</Text>
          <Text className="text-[12px] text-mute tabular-nums">{max / 2}자</Text>
          <Text className="text-[12px] text-mute tabular-nums">0</Text>
        </View>
      </View>
      <View className="flex-row gap-2 pr-11 mt-2">
        {days.map((d) => (
          <Text key={d.key} className={`flex-1 text-center text-[12px] ${d.key === todayKey ? 'font-bold text-ink' : 'text-sub'}`}>
            {d.label}
          </Text>
        ))}
      </View>
      <View className="mt-4 flex-row gap-4">
        <View className="flex-row items-center gap-1.5">
          <View className="w-2.5 h-2.5 rounded-full bg-primary" />
          <Text className="text-[12px] text-text-3">서술</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="w-2.5 h-2.5 rounded-full bg-primary-line" />
          <Text className="text-[12px] text-text-3">태그</Text>
        </View>
      </View>
    </View>
  );
}
