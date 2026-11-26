'use client';

import { useAuthStore } from '@/store';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button } from '@/components/ui/primitives';
import { Glow } from '@/components/ui/Glow';
import { Img, View, asset } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';
import { Skeleton, StatusView } from '@/components/ui/states';
import { useStreak } from '@/lib/streak';
import { useAccountToday } from '@/hooks/useSaveTodayRecord';
import { toDateKey } from '@/lib/date';
import { router } from '@/lib/router';
import { withSensitiveGate } from '@/components/SensitiveGate';

const FLAME = asset('diary/flame.svg');
const WEEK = ['월', '화', '수', '목', '금', '토', '일'];

const Check = ({ color }: { color: string }) => (
  <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden>
    <path
      fill={color}
      d="M9.171 16.072L19.778 5.465c.409-.359 1.01-.404 1.414 0c.404.405.359 1.005 0 1.415L9.878 18.193c-.204.179-.429.293-.707.293s-.503-.114-.707-.293l-5.657-5.657c-.297-.339-.393-.8-.159-1.207c.34-.588 1.092-.629 1.574-.207Z"
    />
  </svg>
);

const back = () => (router.canGoBack() ? router.back() : router.dismissTo('/main'));

/** 기록 완료 — 연속 기록 (13m). 이번 주(월~일) 중 기록한 날을 이어진 막대로, 오늘은 진한 보라로 보여준다. */
function DiaryStreakScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  // 계정 시간대 기준 오늘. 연속 기록은 끊길 때까지 여러 페이지를 받아 센다.
  const { today } = useAccountToday();
  const { streak, recorded, loaded, failed, retry, retrying } = useStreak(today, !!accessToken);

  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);
  const week = WEEK.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label, date: d.getDate(), key: toDateKey(d) };
  });

  const done = week.map((d) => recorded.has(d.key));
  const todayIdx = mondayOffset;

  // 이어서 기록한 날(2일 이상)은 연보라 막대로 묶는다: [시작, 길이]
  const runs: [number, number][] = [];
  week.forEach((_, i) => {
    if (!done[i] || (i > 0 && done[i - 1])) return;
    let len = 1;
    while (i + len < 7 && done[i + len]) len++;
    if (len >= 2) runs.push([i, len]);
  });

  // 기록을 받지 못했으면 0일로 보여 주지 않고 다시 불러오게 한다.
  // 받기 전에는 0일로 보이지 않게 불러오는 화면을 보여 준다.
  if (!loaded) {
    return (
      <Screen>
        <View className="items-center pt-[200px]" accessibilityLabel="연속 기록 불러오는 중">
          <Skeleton className="w-[120px] h-[120px] rounded-full" />
          <Skeleton className="w-[100px] h-[60px] mt-5" />
        </View>
      </Screen>
    );
  }
  if (failed) {
    return (
      <Screen footer={<Button onPress={() => router.dismissTo('/main')}>돌아가기</Button>}>
        <View className="px-5 pt-2 flex-row">
          <BackButton onPress={back} />
        </View>
        <StatusView kind="error" title="연속 기록을 불러오지 못했어요" onRetry={retry} retrying={retrying} />
      </Screen>
    );
  }

  return (
    // 기록 흐름 화면을 기록에 남기지 않도록 홈 탭으로 바꿔 간다.
    <Screen footer={<Button onPress={() => router.dismissTo('/main')}>돌아가기</Button>}>
      <View className="px-5 pt-2 flex-row">
        <BackButton onPress={back} />
      </View>

      {/* 불꽃과 큰 숫자 */}
      <View className="items-center pt-[72px]">
        <Glow layers={[{ w: 50, h: 40, x: 50, y: 30, rgb: '99,103,255', stops: [[0, 0.07], [1, 0]] }]} />
        <View className="absolute left-[121px] top-[114px] w-2 h-3.5 rounded-full bg-[#8A8DFF] opacity-80" />
        <View className="absolute right-[131px] top-[166px] w-[7px] h-3 rounded-full bg-[#8A8DFF] opacity-80" />
        <Img src={FLAME} width={120} height={120} contentFit="contain" />
        {/* 시안 13m: 연속 일수는 96px 큰 숫자 (디자인 시스템 글자 크기 예외, 사용자 지정) */}
        <Text className="mt-5 font-bold text-primary tabular-nums" style={{ fontSize: 96, lineHeight: '100px', letterSpacing: -3.84 }}>
          {streak}
        </Text>
        <Text className="mt-1.5 text-[24px] font-bold tracking-[-0.5px] text-primary">일 연속 기록</Text>
      </View>

      {/* 이번 주 */}
      <View className="mx-6 mt-10 rounded-2xl bg-surface px-[18px] pt-5 pb-5">
        <View className="flex-row">
          {week.map((d, i) => (
            <Text key={d.label} className={`flex-1 text-center text-[12px] ${done[i] ? 'font-semibold text-ink' : 'font-medium text-sub'}`}>
              {d.label}
            </Text>
          ))}
        </View>
        <View className="mt-3 h-9 flex-row">
          {runs.map(([i, len]) => (
            <View key={`run-${i}`} className="absolute top-0 h-9 px-[3px]" style={{ left: `${(i / 7) * 100}%`, width: `${(len / 7) * 100}%` }}>
              <View className="flex-1 rounded-full bg-[#DCDDFF] dark:bg-primary-soft" />
            </View>
          ))}
          {week.map((d, i) => (
            <View key={d.key} className="flex-1 items-center justify-center">
              {done[i] ? (
                i === todayIdx ? (
                  <View className="w-9 h-9 shrink-0 rounded-full bg-primary items-center justify-center" style={{ boxShadow: '0 4px 12px rgba(99,103,255,0.4)' }}>
                    <Check color="#FFFFFF" />
                  </View>
                ) : (
                  <View className={`w-9 h-9 shrink-0 rounded-full items-center justify-center ${done[i - 1] || done[i + 1] ? '' : 'bg-[#DCDDFF] dark:bg-primary-soft'}`}>
                    <Check color="#6367FF" />
                  </View>
                )
              ) : (
                <View className="w-9 h-9 shrink-0 rounded-full bg-page items-center justify-center">
                  <Text className="text-[14px] font-medium text-text-4 tabular-nums">{d.date}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
        <View className="mt-3.5 h-px bg-track" />
        <Text className="mt-3.5 text-center text-[16px] leading-[26px] text-text-2">
          {streak > 0 ? `${streak}일째예요. 오늘 쓴 문장은\n어제보다 조금 더 정확해졌어요.` : '오늘부터 다시 한 칸씩 채워 봐요.'}
        </Text>
      </View>
    </Screen>
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(DiaryStreakScreen);
