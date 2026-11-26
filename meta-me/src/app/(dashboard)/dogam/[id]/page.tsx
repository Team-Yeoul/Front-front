'use client';

import { useParams } from 'next/navigation';
import { router } from '@/lib/router';
import { View } from '@/components/ui/rn';
import { Screen } from '@/components/ui/Screen';
import { Button, TopBar, goBack } from '@/components/ui/primitives';
import { FeatureIcons } from '@/components/ui/flows';
import { CogniReveal } from '@/components/ui/CogniReveal';
import { Text } from '@/components/ui/Text';
import { useCollection } from '@/hooks/useCollection';
import { useMe } from '@/hooks/useMe';
import { withSensitiveGate } from '@/components/SensitiveGate';

const ICONS = [FeatureIcons.clock, FeatureIcons.target, FeatureIcons.bolt];

/** 코그니 상세 (5b3) */
function CogniDetailScreen() {
  // Next useParams는 경로 값을 인코딩된 채로 줄 수 있어 한 번 디코딩한다(앱 라우터는 디코딩해서 넘긴다).
  const id = decodeURIComponent(useParams<{ id: string }>().id);
  const { nickname } = useMe();
  const collection = useCollection();
  const index = collection.findIndex((c) => c.id === id);
  const cogni = collection[index];

  if (!cogni) {
    return (
      <Screen footer={<Button onPress={() => router.navigate('/dogam')}>도감으로</Button>}>
        <TopBar backHref="/dogam" />
        <View className="items-center mt-24">
          <Text className="text-center text-[14px] text-sub">아직 모으지 않은 코그니예요.</Text>
        </View>
      </Screen>
    );
  }

  const lines = cogni.features?.length ? cogni.features.slice(0, 3) : [];
  return (
    <CogniReveal
      title="코그니 상세"
      no={index + 1}
      eyebrow={`${nickname ? `${nickname}님` : '나'} 안에서 발견된 코그니`}
      image={cogni.image}
      category={cogni.category}
      name={cogni.name}
      desc={cogni.desc}
      features={lines.map((text, i) => ({ icon: ICONS[i % ICONS.length], text }))}
      onBack={() => goBack('/dogam')}
      footer={<Button onPress={() => router.push({ pathname: '/dogam/[id]/moments', params: { id: cogni.id } })}>잡은 순간 확인하기</Button>}
    />
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(CogniDetailScreen);
