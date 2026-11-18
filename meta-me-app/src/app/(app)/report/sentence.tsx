import { View } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store';
import { useGetMyProfile } from '@/entities/user';
import { SensitiveGate } from '@/components/SensitiveGate';
import { Screen } from '@/components/ui/Screen';
import { Button, ProgressBar, TextButton, TopBar } from '@/components/ui/primitives';
import { Text } from '@/components/ui/Text';
import { useMe } from '@/hooks/useMe';

function MySentence() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: profile } = useGetMyProfile(!!accessToken);
  const { mySentence } = useMe();
  const current = profile?.profile.ai_first_sentence || mySentence;
  const accuracy = profile?.latest_accuracy?.accuracy_percent ?? 0;

  return (
    <Screen
      footer={
        <>
          {/* 온보딩은 한 번만 제출할 수 있어(409) 여기서 다시 보내지 않는다. 문장은 기록이 쌓이며 갱신된다. */}
          {/* 탭 화면으로 갈 때는 쌓인 상세 화면을 걷어내고 기존 탭으로 돌아간다. */}
          <Button onPress={() => router.dismissTo('/main')}>홈으로</Button>
          <TextButton className="mt-1" onPress={() => router.dismissTo('/report')}>
            리포트 보기
          </TextButton>
        </>
      }
    >
      <TopBar title="나의 문장" />
      <View className="px-5 pt-3 pb-6">
        <View className="rounded-3xl bg-primary-soft px-5 py-5">
          <View className="flex-row justify-between">
            <Text className="text-[13px] font-semibold text-primary">현재 문장</Text>
            <Text className="text-[13px] font-semibold text-primary">정확도 {accuracy}%</Text>
          </View>
          <Text className={`text-[18px] font-bold leading-[28px] mt-3 ${current ? 'text-ink' : 'text-sub'}`}>{current || '아직 나의 문장이 없어요'}</Text>
          <ProgressBar value={accuracy} className="mt-5" track="#D9DBFF" height={6} />
        </View>
        <Text className="text-[14px] font-bold text-ink mt-7">문장이 바뀌어 온 기록</Text>
        <Text className="text-[13px] text-sub mt-3">기록이 쌓여 문장이 바뀌면 여기에 순서대로 남아요.</Text>
      </View>
    </Screen>
  );
}

export default function MySentenceScreen() {
  return (
    <SensitiveGate>
      <MySentence />
    </SensitiveGate>
  );
}
