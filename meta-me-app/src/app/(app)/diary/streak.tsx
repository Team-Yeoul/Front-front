import { View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useAuthStore } from '@/store';
import { useListDailyRecords } from '@/entities/diary';
import { SensitiveGate } from '@/components/SensitiveGate';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, Img3D } from '@/components/ui/primitives';
import { CheckIcon } from '@/components/ui/icons';
import { Text } from '@/components/ui/Text';
import { countStreak } from '@/lib/streak';
import { toDateKey } from '@/lib/date';

const WEEK = ['월', '화', '수', '목', '금', '토', '일'];

function Streak() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data } = useListDailyRecords({ size: 100 }, !!accessToken);

  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);

  let streak = 0;
  let doneIdx = new Set<number>();
  if (data) {
    const days = new Set(data.records.map((r) => r.recorded_date));
    streak = countStreak(days, today);
    doneIdx = new Set(
      WEEK.map((_, i) => {
        const x = new Date(monday);
        x.setDate(monday.getDate() + i);
        return days.has(toDateKey(x)) ? i : -1;
      }).filter((i) => i >= 0),
    );
  }
  const todayIdx = mondayOffset;

  return (
    // 웹은 /main으로 push했다. 앱은 기록 흐름 화면을 스택에 남기지 않도록 홈 탭까지 되돌아간다.
    <Screen footer={<Button onPress={() => router.dismissTo('/main')}>돌아가기</Button>}>
      <View className="px-5 pt-2 flex-row">
        <BackButton href="/diary" />
      </View>
      <View className="items-center pt-16">
        <Img3D name="fire" size={96} />
        <Text className="text-[64px] font-bold text-ink leading-[64px] mt-4">{streak}</Text>
        <Text className="text-[16px] font-semibold text-[#48484F] mt-5">꾸준히 나를 기록하고 있어요</Text>
        <View className="flex-row gap-2.5 mt-8">
          {WEEK.map((w, i) => {
            const done = doneIdx.has(i);
            return (
              <View key={w} className="items-center gap-2">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    done ? (i === todayIdx ? 'bg-primary-line' : 'bg-primary') : 'bg-surface-2'
                  }`}
                >
                  {done && <CheckIcon size={15} />}
                </View>
                <Text className={`text-[12px] ${done ? 'font-bold text-ink' : 'text-mute'}`}>{w}</Text>
              </View>
            );
          })}
        </View>
      </View>
      <View className="flex-row items-end gap-3 px-5 mt-[150px] pb-4">
        <View className="w-14 h-14 rounded-full bg-surface-2 items-center justify-center shrink-0">
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6L10 3ZM17.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" fill="#6367FF" />
          </Svg>
        </View>
        <View className="flex-1 rounded-2xl bg-surface-2 px-4 py-4">
          <Text className="text-[14px] text-[#48484F] leading-[23px]">{streak}일째예요. 오늘 쓴 문장은 어제보다 조금 더 정확해졌어요.</Text>
        </View>
      </View>
    </Screen>
  );
}

export default function DiaryStreakScreen() {
  return (
    <SensitiveGate>
      <Streak />
    </SensitiveGate>
  );
}
