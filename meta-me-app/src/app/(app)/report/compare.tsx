import { View } from 'react-native';
import { router } from 'expo-router';
import { SensitiveGate } from '@/components/SensitiveGate';
import { Button } from '@/components/ui/primitives';
import { ReportScreen } from '@/components/ui/report';
import { Text } from '@/components/ui/Text';

/** 친구 응답 API가 아직 없어 응답이 모이기 전 상태만 보여준다. */
function ReportCompare() {
  return (
    <ReportScreen eyebrow="MIRROR" title="남이 보는 나 vs 내가 보는 나">
      <View className="rounded-3xl bg-surface px-5 py-8 items-center">
        <Text className="text-[16px] font-bold text-ink text-center">아직 친구의 답이 없어요</Text>
        <Text className="text-[13px] text-sub leading-[21px] mt-2 text-center">{'친구 3명 이상이 답하면\n내가 보는 나와 나란히 비교해 드려요'}</Text>
        <View className="flex-row items-center gap-3 w-full mt-5">
          <View className="flex-1 h-1.5 rounded-full bg-[#E4E4EA]" />
          <Text className="font-mono text-[13px] font-semibold text-primary">0 / 3</Text>
        </View>
        <Button className="mt-6" onPress={() => router.push('/mirror/invite')}>
          친구에게 물어보기
        </Button>
      </View>
    </ReportScreen>
  );
}

export default function ReportCompareScreen() {
  return (
    <SensitiveGate>
      <ReportCompare />
    </SensitiveGate>
  );
}
