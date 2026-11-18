import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button, CogniImg, goBack } from '@/components/ui/primitives';
import { ChevronLeft } from '@/components/ui/icons';
import { Text } from '@/components/ui/Text';
import { SensitiveGate } from '@/components/SensitiveGate';
import { useCollection } from '@/hooks/useCollection';

/** 첫 코그니 발견 (도감 저장 직후). */
export default function NewCogniScreen() {
  return (
    <SensitiveGate>
      <NewCogni />
    </SensitiveGate>
  );
}

function NewCogni() {
  const cogni = useCollection()[0];
  if (!cogni) return null;
  return (
    <Screen
      footer={
        <>
          <Button
            variant="dark"
            onPress={() => router.push({ pathname: '/dogam/[id]/moments', params: { id: cogni.id } })}
          >
            잡은 순간 확인하기
          </Button>
          <Text className="text-center text-[13px] text-sub mt-3 mb-1">도감에 저장했어요</Text>
        </>
      }
    >
      <View className="flex-row items-center justify-center h-14 px-5">
        <Pressable onPress={() => goBack('/main')} className="absolute left-5" accessibilityRole="button" accessibilityLabel="뒤로가기" hitSlop={8}>
          <ChevronLeft size={20} />
        </Pressable>
        <Text className="text-[15px] font-semibold text-ink">코그니 발견</Text>
      </View>
      <View className="items-center pt-[70px] px-5">
        <View className="h-8 px-4 rounded-full bg-primary-soft justify-center">
          <Text className="font-mono text-[13px] font-bold text-primary">No.01 첫 코그니</Text>
        </View>
        <Text className="text-[20px] text-ink mt-8">당신 안에서 발견된 첫 코그니</Text>
        <View className="mt-14">
          <CogniImg src={cogni.image} size={200} />
        </View>
        <View className="mt-14 h-9 px-4 rounded-full bg-surface-2 flex-row items-center gap-2">
          <Text className="text-[10px] text-[#48484F]">▶</Text>
          <Text className="text-[13px] text-[#48484F]">{cogni.category}</Text>
        </View>
        <Text className="text-[28px] font-bold text-ink mt-4">{cogni.name}</Text>
        <Text className="text-[14px] text-[#48484F] text-center leading-[24px] mt-2">{cogni.desc}</Text>
      </View>
    </Screen>
  );
}
