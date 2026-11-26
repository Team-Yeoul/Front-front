'use client';

import { router } from '@/lib/router';
import { useAuthStore } from '@/store';
import { useGetMyProfile } from '@/entities/user';
import { View } from '@/components/ui/rn';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, TextButton, goBack } from '@/components/ui/primitives';
import { Text } from '@/components/ui/Text';
import { useMe } from '@/hooks/useMe';
import { useTheme } from '@/lib/theme';
import { withSensitiveGate } from '@/components/SensitiveGate';

/** 나의 문장 — 현재 문장과 정확도, 문장이 바뀌어 온 기록 */
function MySentenceScreen() {
  const { isDark } = useTheme();
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
          <Button onPress={() => router.dismissTo('/report')}>리포트로 돌아가기</Button>
          <TextButton className="mt-1" onPress={() => router.dismissTo('/main')}>
            홈으로
          </TextButton>
        </>
      }
    >
      <View className="h-11 mt-2 flex-row items-center justify-center px-5">
        <View className="absolute left-5">
          <BackButton onPress={() => goBack('/report')} />
        </View>
        <Text accessibilityRole="header" className="text-[16px] font-semibold text-ink">
          나의 문장
        </Text>
      </View>
      <View className="px-5 pt-3 pb-6">
        <View className="rounded-[20px] bg-primary-soft px-[22px] py-6">
          <View className="flex-row justify-between">
            <Text className="text-[12px] font-semibold text-primary-pressed">현재 문장</Text>
            <Text className="text-[12px] font-semibold text-primary-pressed tabular-nums">정확도 {accuracy}%</Text>
          </View>
          <Text className={`text-[20px] font-bold leading-[30px] tracking-[-0.2px] mt-3 ${current ? 'text-ink' : 'text-sub'}`}>{current || '아직 나의 문장이 없어요'}</Text>
          <View
            className={`mt-5 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-primary-line' : 'bg-[#D9DBFF]'}`}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: accuracy }}
          >
            <View className="h-full rounded-full bg-primary" style={{ width: `${accuracy}%` }} />
          </View>
        </View>
        <Text accessibilityRole="header" className="text-[16px] font-bold text-ink mt-7">
          문장이 바뀌어 온 기록
        </Text>
        <View className="mt-3 rounded-[18px] bg-surface px-5 py-4">
          <Text className="text-[14px] leading-[22px] text-text-4">기록이 쌓여 문장이 바뀌면 여기에 주차별로 남아요.</Text>
        </View>
      </View>
    </Screen>
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(MySentenceScreen);
