'use client';

import { useAuthStore } from '@/store';
import { useListDailyRecords } from '@/entities/diary';
import { toDateKey } from '@/lib/date';
import { useAccountToday } from '@/hooks/useSaveTodayRecord';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, goBack } from '@/components/ui/primitives';
import { View } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';

const STEPS = [
  { title: '하루 한 번 출석하기', body: '오늘의 질문에 답하거나 AI와 대화하면 출석으로 인정돼요.' },
  { title: '데일리 다이어리 쓰기', body: '출석한 날 다이어리까지 쓰면 달력에 이어진 막대로 표시돼요.' },
  { title: '하루는 하루만', body: '같은 날 여러 번 기록해도 1일로 계산돼요. 자정에 초기화돼요.' },
];

/** 달성 보상: 그달 기록일이 day일을 넘으면 받는다. 마지막 칸은 그달 일수. */
const rewards = (goal: number) => [
  { day: 10, label: '새 코그니 1마리' },
  { day: 20, label: '주간 리포트 심화 분석' },
  { day: goal, label: '한 달 회고 리포트' },
];

/** 챌린지 내용 (10c2) */
export default function ChallengeInfoScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  // 기록 날짜(recorded_date)와 같은 계정 시간대 기준 오늘
  const { today: now } = useAccountToday();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const goal = monthEnd.getDate();
  const { data } = useListDailyRecords({ start_date: toDateKey(monthStart), end_date: toDateKey(monthEnd), size: 100 }, !!accessToken);
  const achieved = new Set((data?.records ?? []).map((r) => r.recorded_date)).size;
  const period = `${now.getFullYear()}.${now.getMonth() + 1}.1 - ${now.getMonth() + 1}.${goal}`;

  return (
    <Screen footer={<Button onPress={() => goBack('/challenge')}>확인</Button>}>
      <View className="h-11 shrink-0 flex-row items-center justify-center px-6 mt-2">
        <View className="absolute left-6">
          <BackButton href="/challenge" />
        </View>
        <Text className="text-[16px] font-bold tracking-tight text-ink">챌린지 내용</Text>
      </View>
      <View className="px-6 pt-5 pb-6">
        <View className="self-start rounded-full bg-primary-soft px-2.5 py-[5px]">
          <Text className="text-[12px] font-bold text-primary-pressed">진행 중</Text>
        </View>
        <Text className="mt-2.5 text-[24px] font-bold tracking-tight text-ink">{goal}일 기록 챌린지</Text>
        <Text className="mt-2 text-[16px] leading-6 text-text-3">한 달 동안 매일 짧게라도 기록을 남기면, 쌓인 기록으로 나를 더 정확하게 알 수 있어요.</Text>
        <Text className="mt-2.5 text-[12px] text-sub tabular-nums">{period} · 매일</Text>

        <Text className="mt-7 text-[12px] font-bold text-sub">참여 방법</Text>
        <View className="mt-3 gap-4">
          {STEPS.map((s, i) => (
            <View key={s.title} className="flex-row gap-3.5">
              <View className="w-7 h-7 shrink-0 rounded-full bg-primary-soft items-center justify-center">
                <Text className="text-[12px] font-semibold text-primary-pressed">{i + 1}</Text>
              </View>
              <View className="flex-1 pt-0.5">
                <Text className="text-[16px] font-semibold text-ink">{s.title}</Text>
                <Text className="mt-1 text-[14px] leading-[22px] text-text-4">{s.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text className="mt-7 text-[12px] font-bold text-sub">달성 보상</Text>
        <View className="mt-2.5 gap-2.5">
          {rewards(goal).map((r) => {
            const got = achieved >= r.day;
            return (
              <View key={r.day} className={`h-[46px] shrink-0 rounded-xl px-4 flex-row items-center gap-3.5 ${got ? 'bg-primary-soft' : 'bg-surface'}`}>
                <Text className={`w-[52px] shrink-0 text-[14px] font-bold ${got ? 'text-primary-pressed' : 'text-sub'}`}>{r.day}일</Text>
                <Text className={`flex-1 text-[16px] ${got ? 'text-ink' : 'text-text-3'}`}>{r.label}</Text>
                <Text className={`text-[12px] font-semibold ${got ? 'text-primary' : 'text-mute'}`}>{got ? '받음' : `${r.day - achieved}일 남음`}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}
