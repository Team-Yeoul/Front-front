import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AskFriendSheet, GradientBg } from '@/components/ui/flows';
import { goBack } from '@/components/ui/primitives';
import { ChevronLeft } from '@/components/ui/icons';
import { Text } from '@/components/ui/Text';
import { SensitiveGate } from '@/components/SensitiveGate';
import { useCollection } from '@/hooks/useCollection';

/** 내 유형 카드 + "친구는 나를 어떤 유형으로 볼지" 시트 (타인 평가 진입). */
export default function MirrorIntroScreen() {
  return (
    <SensitiveGate>
      <MirrorIntro />
    </SensitiveGate>
  );
}

function MirrorIntro() {
  const myType = useCollection()[0]?.name ?? '아직 없음';
  // 시트는 RN Modal이라 다음 화면으로 넘어가도 위에 남는다. 이 화면이 보일 때만 연다.
  const [focused, setFocused] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  return (
    <Screen
      background={<GradientBg variant="a" />}
      bg="#E6E6FF"
      overlay={
        <AskFriendSheet
          open={focused}
          onClose={() => goBack('/main')}
          myType={myType}
          onAsk={() => router.push('/mirror/invite')}
        />
      }
    >
      <View className="flex-row items-center justify-between px-5 h-14">
        <Pressable
          onPress={() => goBack('/main')}
          className="w-10 h-10 rounded-full bg-white/80 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
        >
          <ChevronLeft />
        </Pressable>
      </View>
      <View className="items-center mt-6 px-5">
        <Text className="text-[16px] text-[#48484F]">당신은</Text>
        <Text className="text-[26px] font-bold text-ink mt-2 text-center">{myType}</Text>
      </View>
    </Screen>
  );
}
