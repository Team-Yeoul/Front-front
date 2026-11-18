import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button, goBack, TopBar } from '@/components/ui/primitives';
import { CogniHero, FeatureIcons } from '@/components/ui/flows';
import { Text } from '@/components/ui/Text';
import { SensitiveGate } from '@/components/SensitiveGate';
import { useCollection } from '@/hooks/useCollection';
import { useMe } from '@/hooks/useMe';

const ICONS = [FeatureIcons.target, FeatureIcons.clock, FeatureIcons.bolt];

export default function CogniDetailScreen() {
  return (
    <SensitiveGate>
      <CogniDetail />
    </SensitiveGate>
  );
}

function CogniDetail() {
  // 라우터가 경로 값을 디코딩해서 넘겨 주므로 웹처럼 decodeURIComponent를 다시 하지 않는다.
  const { id } = useLocalSearchParams<{ id: string }>();
  const { nickname } = useMe();
  const collection = useCollection();
  const index = collection.findIndex((c) => c.id === id);
  const cogni = collection[index];

  if (!cogni) {
    return (
      <Screen footer={<Button onPress={() => router.navigate('/dogam')}>도감으로</Button>}>
        <TopBar backHref={'/dogam'} />
        <View className="items-center mt-24">
          <Text className="text-center text-[14px] text-sub">아직 모으지 않은 코그니예요.</Text>
        </View>
      </Screen>
    );
  }

  const lines = cogni.features?.length ? cogni.features : [cogni.desc];
  return (
    <CogniHero
      eyebrow={`${nickname ? `${nickname}님` : '나'} 안에서 발견된`}
      name={cogni.name}
      imageSrc={cogni.image}
      category={cogni.category}
      features={lines.map((text, i) => ({ icon: ICONS[i % ICONS.length], text }))}
      counterLabel="도감에 저장했어요"
      counter={`${String(index + 1).padStart(2, '0')} / 24`}
      primaryLabel="잡은 순간 확인하기"
      onPrimary={() => router.push({ pathname: '/dogam/[id]/moments', params: { id: cogni.id } })}
      onBack={() => goBack('/dogam')}
    />
  );
}
