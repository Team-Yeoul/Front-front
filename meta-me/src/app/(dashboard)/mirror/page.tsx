'use client';

import { router } from '@/lib/router';
import { Pressable, View } from '@/components/ui/rn';
import { Screen } from '@/components/ui/Screen';
import { AskFriendSheet, GradientBg } from '@/components/ui/flows';
import { goBack } from '@/components/ui/primitives';
import { ChevronLeft } from '@/components/ui/icons';
import { Text } from '@/components/ui/Text';
import { useCollection } from '@/hooks/useCollection';
import { withSensitiveGate } from '@/components/SensitiveGate';

/** 내 유형 카드 + "친구는 나를 어떤 유형으로 볼지" 시트 (타인 평가 진입). */
function MirrorIntroScreen() {
  const myType = useCollection()[0]?.name ?? '아직 없음';
  // 앱은 시트(RN Modal)가 다음 화면 위에 남지 않게 이 화면이 보일 때만 연다.
  // 웹은 다른 화면으로 가면 이 화면이 내려가 시트도 함께 닫히므로 늘 열어 둔다.

  return (
    <Screen
      background={<GradientBg variant="a" />}
      bg="#E6E6FF"
      overlay={<AskFriendSheet open onClose={() => goBack('/main')} myType={myType} onAsk={() => router.push('/mirror/invite')} />}
    >
      <View className="flex-row items-center justify-between px-5 h-14">
        <Pressable
          onPress={() => goBack('/main')}
          className="w-11 h-11 shrink-0 rounded-full bg-page/80 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
        >
          <ChevronLeft />
        </Pressable>
      </View>
      <View className="items-center mt-6 px-5">
        <Text className="text-[16px] text-body">당신은</Text>
        <Text className="text-[24px] font-bold text-ink mt-2 text-center">{myType}</Text>
      </View>
    </Screen>
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(MirrorIntroScreen);
