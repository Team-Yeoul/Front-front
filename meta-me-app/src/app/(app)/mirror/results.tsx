import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button, TopBar } from '@/components/ui/primitives';
import { Text } from '@/components/ui/Text';
import { SensitiveGate } from '@/components/SensitiveGate';

/** 친구 응답 API가 생기면 여기에 모인 답을 보여준다. 지금은 응답이 없는 상태. */
export default function MirrorResultsScreen() {
  return (
    <SensitiveGate>
      <Screen footer={<Button onPress={() => router.push('/mirror/invite')}>친구에게 물어보기</Button>}>
        <TopBar title="친구들의 답" />
        <View className="px-5 pt-20 items-center">
          <Text className="text-[18px] font-bold text-ink">아직 모인 답이 없어요</Text>
          <Text className="text-[14px] text-sub leading-[23px] mt-2 text-center">{'친구 3명 이상이 답하면\n여기에서 결과를 볼 수 있어요'}</Text>
        </View>
      </Screen>
    </SensitiveGate>
  );
}
