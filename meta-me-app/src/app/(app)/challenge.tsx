import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useAuthStore } from '@/store';
import { useListDailyRecords } from '@/entities/diary';
import { toDateKey } from '@/lib/date';
import { SensitiveGate } from '@/components/SensitiveGate';
import { Screen } from '@/components/ui/Screen';
import { BackButton, ProgressBar } from '@/components/ui/primitives';
import { ChevronLeft, ChevronRight } from '@/components/ui/icons';
import { Text } from '@/components/ui/Text';

const CHALLENGE_DAYS = 30;
const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function ChallengeScreen() {
  return (
    <SensitiveGate>
      <Challenge />
    </SensitiveGate>
  );
}

function Challenge() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const now = new Date();
  const [cursor, setCursor] = useState<Date | null>(null);
  const shown = cursor ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const year = shown.getFullYear();
  const month = shown.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const { data } = useListDailyRecords(
    { start_date: toDateKey(monthStart), end_date: toDateKey(monthEnd), size: 100 },
    !!accessToken,
  );

  const written = useMemo(() => {
    return new Set((data?.records ?? []).map((r) => Number(r.recorded_date.slice(8, 10))));
  }, [data]);
  // 출석(앱만 연 날) API가 없어 다이어리를 쓴 날만 표시한다.
  const attended = useMemo(() => new Set<number>(), []);

  const achieved = written.size + attended.size;
  const rate = Math.round((achieved / CHALLENGE_DAYS) * 100);
  const today = isCurrentMonth ? now.getDate() : -1;

  const cells: (number | null)[] = [
    ...Array<null>(monthStart.getDay()).fill(null),
    ...Array.from({ length: monthEnd.getDate() }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  return (
    <Screen>
      <View className="px-5 pt-2">
        <BackButton href="/main" />
        <Text className="text-[18px] font-bold text-ink mt-4">기록 챌린지</Text>
        {/* 웹에서도 아직 연결된 동작이 없는 버튼 */}
        <Pressable accessibilityRole="button" className="self-start mt-5 h-9 px-3.5 rounded-xl bg-primary-soft items-center justify-center">
          <Text className="text-[14px] font-semibold text-primary">챌린지 내용 보기</Text>
        </Pressable>
        <View className="flex-row items-end justify-between mt-4">
          <Text className="text-[16px] font-bold text-primary">
            {achieved} / {CHALLENGE_DAYS} 일
          </Text>
          <View className="items-end">
            <Text className="text-[11px] text-sub">내 달성률</Text>
            <Text className="text-[30px] font-bold text-ink leading-[30px] mt-1">{rate}%</Text>
          </View>
        </View>
        <ProgressBar value={rate} className="mt-3" height={9} />
        <View className="mt-4 rounded-2xl bg-surface px-4 py-3.5 gap-2.5">
          <View className="flex-row justify-between">
            <Text className="text-[14px] text-sub">진행 기간</Text>
            <Text className="font-mono text-[14px] text-ink">
              {year}.{month + 1}.1 - {month + 1}.{monthEnd.getDate()}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-[14px] text-sub">기록 주기</Text>
            <Text className="text-[14px] text-ink">매일</Text>
          </View>
        </View>
      </View>

      <View className="h-2 bg-surface-2 mt-6" />

      <View className="px-5 pt-6 pb-6">
        <View className="flex-row items-center justify-center gap-9">
          <Pressable
            onPress={() => setCursor(new Date(year, month - 1, 1))}
            accessibilityRole="button"
            accessibilityLabel="이전 달"
            className="w-10 h-10 rounded-full bg-surface-2 items-center justify-center"
          >
            <ChevronLeft size={16} />
          </Pressable>
          <Text className="text-[17px] font-bold text-ink">
            {year}년 {month + 1}월
          </Text>
          <Pressable
            onPress={() => setCursor(new Date(year, month + 1, 1))}
            disabled={isCurrentMonth}
            accessibilityRole="button"
            accessibilityLabel="다음 달"
            accessibilityState={{ disabled: isCurrentMonth }}
            className={`w-10 h-10 rounded-full bg-surface-2 items-center justify-center ${isCurrentMonth ? 'opacity-50' : ''}`}
          >
            <ChevronRight size={16} color={isCurrentMonth ? '#C4C4CC' : '#1A1A1E'} />
          </Pressable>
        </View>

        <View className="flex-row mt-6 pb-2 border-b border-line">
          {WEEK_LABELS.map((w, i) => (
            <Text key={w} className={`flex-1 text-center text-[14px] ${i === 0 ? 'text-danger' : 'text-sub'}`}>
              {w}
            </Text>
          ))}
        </View>

        <View className="gap-1.5 mt-3">
          {weeks.map((week, wi) => (
            <View key={wi} className="flex-row h-[40px]">
              {/* 연속으로 다이어리를 쓴 구간을 하나의 캡슐로 묶는다 */}
              {week.map((day, i) => {
                if (!day || !written.has(day) || day === today) return null;
                const prev = week[i - 1];
                if (prev && written.has(prev) && prev !== today) return null;
                let len = 1;
                while (i + len < 7 && week[i + len] && written.has(week[i + len]!) && week[i + len] !== today) len++;
                // 웹의 calc(…% ± 2px) 대신 퍼센트 칸 안에 좌우 2px 여백을 둔다.
                return (
                  <View
                    key={`run-${day}`}
                    pointerEvents="none"
                    className="absolute top-0 h-[40px] px-[2px]"
                    style={{ left: `${(i / 7) * 100}%`, width: `${(len / 7) * 100}%` }}
                  >
                    <View className="flex-1 rounded-full bg-primary-soft" />
                  </View>
                );
              })}
              {week.map((day, i) => {
                if (!day) return <View key={i} className="flex-1" />;
                const isToday = day === today;
                const future = isCurrentMonth && day > now.getDate();
                const isWritten = written.has(day);
                return (
                  <View key={i} className="flex-1 items-center justify-center">
                    {isToday ? (
                      <View className="w-[34px] h-[34px] rounded-full bg-primary items-center justify-center">
                        <Text className="text-white text-[15px] font-bold">{day}</Text>
                      </View>
                    ) : (
                      <Text
                        className={`text-[15px] ${
                          future ? 'text-[#C4C4CC]' : isWritten ? 'font-bold text-primary' : i === 0 ? 'text-danger' : 'text-ink'
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

        <View className="flex-row items-center gap-4 mt-6">
          <View className="flex-row items-center gap-1.5">
            <View className="w-5 h-2.5 rounded-full bg-primary-soft" />
            <Text className="text-[12px] text-sub">출석 + 다이어리</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-1 h-1 rounded-full bg-primary" />
            <Text className="text-[12px] text-sub">출석만</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-full bg-primary" />
            <Text className="text-[12px] text-sub">오늘</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}
