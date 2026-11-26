'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { useListDailyRecords } from '@/entities/diary';
import { toDateKey } from '@/lib/date';
import { useAccountToday } from '@/hooks/useSaveTodayRecord';
import { Screen } from '@/components/ui/Screen';
import { BackButton } from '@/components/ui/primitives';
import { ChevronLeft, ChevronRight } from '@/components/ui/icons';
import { Pressable, View } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';
import { StatusView } from '@/components/ui/states';
import { StandaloneNav } from '@/components/layout/BottomNav';
import { useTheme } from '@/lib/theme';
import { withSensitiveGate } from '@/components/SensitiveGate';

const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/** 기록 챌린지 달성 현황 (10c). 챌린지는 달마다 새로 시작하고, 그달 일수가 목표 일수다. */
function ChallengeScreen() {
  const { fg } = useTheme();
  const accessToken = useAuthStore((s) => s.accessToken);
  // 기록 날짜(recorded_date)와 같은 계정 시간대 기준 오늘
  const { today: now } = useAccountToday();
  const [cursor, setCursor] = useState<Date | null>(null);
  const shown = cursor ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const year = shown.getFullYear();
  const month = shown.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const goal = monthEnd.getDate();

  const { data, isError, refetch, isFetching } = useListDailyRecords({ start_date: toDateKey(monthStart), end_date: toDateKey(monthEnd), size: 100 }, !!accessToken);

  const written = useMemo(() => new Set((data?.records ?? []).map((r) => Number(r.recorded_date.slice(8, 10)))), [data]);
  // 출석(앱만 연 날) 기록은 아직 쓰지 않아 다이어리를 쓴 날만 표시한다.
  const attended = useMemo(() => new Set<number>(), []);

  const achieved = written.size + attended.size;
  const rate = Math.round((achieved / goal) * 100);
  const today = isCurrentMonth ? now.getDate() : -1;
  // 기록을 받기 전이거나 못 받았으면 0일·0%(=한 번도 안 씀)로 보이지 않게 '-'로 둔다.
  const ready = !!data;
  const failed = isError && !data;

  const cells: (number | null)[] = [...Array(monthStart.getDay()).fill(null), ...Array.from({ length: goal }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  return (
    <Screen inTabs overlay={<StandaloneNav active="main" />}>
      <View className="px-5 pt-2">
        <BackButton href="/main" />
      </View>
      <View className="px-6">
        <Text className="mt-1 text-[16px] font-bold text-ink">기록 챌린지</Text>
        <Link href="/challenge/info" className="mt-6 self-start h-9 flex flex-col justify-center rounded-[10px] bg-primary-soft px-3.5">
          <Text className="text-[14px] font-semibold text-primary-pressed">챌린지 내용 보기</Text>
        </Link>
        <View className="mt-4 flex-row items-end justify-between">
          <Text className="text-[16px] font-semibold text-primary-pressed tabular-nums">
            {ready ? achieved : '-'} / {goal} 일
          </Text>
          <View className="items-end">
            <Text className="text-[12px] text-mute">내 달성률</Text>
            <Text className="mt-0.5 text-[24px] font-bold tracking-tight text-ink tabular-nums">{ready ? `${rate}%` : '-'}</Text>
          </View>
        </View>
        <View
          className="mt-3.5 h-2.5 shrink-0 rounded-full bg-surface-2 overflow-hidden"
          accessibilityRole="progressbar"
          accessibilityValue={ready ? { min: 0, max: 100, now: rate } : undefined}
        >
          {ready && <View className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, rate)}%` }} />}
        </View>
        {failed && <StatusView kind="error" compact title="이번 달 기록을 불러오지 못했어요" onRetry={() => void refetch()} retrying={isFetching} className="py-6" />}
        <View className="mt-4 rounded-xl bg-surface px-4 py-3.5 gap-3">
          <View className="flex-row justify-between">
            <Text className="text-[14px] text-sub">진행 기간</Text>
            <Text className="text-[14px] text-ink tabular-nums">
              {year}.{month + 1}.1 - {month + 1}.{goal}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-[14px] text-sub">기록 주기</Text>
            <Text className="text-[14px] text-ink">매일</Text>
          </View>
        </View>
      </View>

      <View className="h-2 shrink-0 bg-surface mt-6" />

      <View className="px-6 pt-6 pb-4">
        <View className="flex-row items-center justify-center gap-5">
          <Pressable
            onPress={() => setCursor(new Date(year, month - 1, 1))}
            className="w-10 h-10 shrink-0 rounded-full bg-surface items-center justify-center"
            accessibilityLabel="이전 달"
          >
            <ChevronLeft size={18} />
          </Pressable>
          <Text className="w-[120px] text-center text-[16px] font-bold tracking-tight text-ink">
            {year}년 {month + 1}월
          </Text>
          <Pressable
            onPress={() => setCursor(new Date(year, month + 1, 1))}
            disabled={isCurrentMonth}
            className={`w-10 h-10 shrink-0 rounded-full bg-surface items-center justify-center ${isCurrentMonth ? 'opacity-50' : ''}`}
            accessibilityLabel="다음 달"
          >
            <ChevronRight size={18} color={fg(isCurrentMonth ? '#C4C4CC' : '#1A1A1E')} />
          </Pressable>
        </View>

        <View className="flex-row mt-4 pb-2 border-b border-surface-2">
          {WEEK_LABELS.map((w, i) => (
            <Text key={w} className={`flex-1 text-center text-[12px] font-medium ${i === 0 ? 'text-[#E05252]' : 'text-sub'}`}>
              {w}
            </Text>
          ))}
        </View>

        <View className="gap-1.5 mt-4">
          {weeks.map((week, wi) => (
            <View key={wi} className="flex-row h-10 shrink-0">
              {/* 연속으로 다이어리를 쓴 구간을 하나의 캡슐로 묶는다 */}
              {week.map((day, i) => {
                if (!day || !written.has(day) || day === today) return null;
                const prev = week[i - 1];
                if (prev && written.has(prev) && prev !== today) return null;
                let len = 1;
                while (i + len < 7 && week[i + len] && written.has(week[i + len]!) && week[i + len] !== today) len++;
                return (
                  <View key={`run-${day}`} className="absolute top-0 h-10 rounded-full bg-primary-soft" style={{ left: `${(i / 7) * 100}%`, width: `${(len / 7) * 100}%` }} />
                );
              })}
              {week.map((day, i) => {
                if (!day) return <View key={i} className="flex-1" />;
                const isToday = day === today;
                const future = isCurrentMonth && day > now.getDate();
                const isWritten = written.has(day);
                return (
                  <View
                    key={i}
                    className="flex-1 items-center justify-center"
                    accessible
                    // 기록한 날은 색으로만 구분되므로 화면 낭독기에는 날짜와 기록 여부를 함께 읽어 준다.
                    accessibilityLabel={`${month + 1}월 ${day}일${isToday ? ', 오늘' : ''}${ready && !future ? (isWritten ? ', 기록함' : ', 기록 없음') : ''}`}
                  >
                    {isToday ? (
                      <View className="w-8 h-8 shrink-0 rounded-full bg-primary items-center justify-center">
                        <Text className="text-[14px] font-bold text-white tabular-nums">{day}</Text>
                      </View>
                    ) : (
                      <Text
                        className={`text-[14px] tabular-nums ${
                          future ? 'text-disabled' : isWritten ? 'font-semibold text-primary-pressed' : i === 0 ? 'text-[#E05252]' : 'text-ink'
                        }`}
                      >
                        {day}
                      </Text>
                    )}
                    {!isWritten && attended.has(day) && <View className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />}
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <View className="flex-row items-center gap-3.5 mt-6">
          <View className="flex-row items-center gap-1.5">
            <View className="w-[18px] h-2.5 shrink-0 rounded-full bg-primary-soft" />
            <Text className="text-[12px] text-text-4">출석 + 다이어리</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-1 h-1 shrink-0 rounded-full bg-primary" />
            <Text className="text-[12px] text-text-4">출석만</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 shrink-0 rounded-full bg-primary" />
            <Text className="text-[12px] text-text-4">오늘</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(ChallengeScreen);
