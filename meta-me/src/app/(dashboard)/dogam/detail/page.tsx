'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { Button, TopBar } from '@/components/ui/primitives';
import { CogniHero, FeatureIcons } from '@/components/ui/flows';
import { useCollection } from '@/hooks/useCollection';
import { useMe } from '@/hooks/useMe';

const ICONS = [FeatureIcons.target, FeatureIcons.clock, FeatureIcons.bolt];

export default function CogniDetailPage() {
  return (
    <Suspense>
      <CogniDetail />
    </Suspense>
  );
}

function CogniDetail() {
  const id = useSearchParams().get('id') ?? '';
  const router = useRouter();
  const { nickname } = useMe();
  const collection = useCollection();
  const index = collection.findIndex((c) => c.id === id);
  const cogni = collection[index];

  if (!cogni) {
    return (
      <Screen footer={<Button onClick={() => router.push('/dogam')}>도감으로</Button>}>
        <TopBar backHref="/dogam" />
        <p className="text-center text-[14px] text-sub mt-24">아직 모으지 않은 코그니예요.</p>
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
      onPrimary={() => router.push(`/dogam/moments?id=${encodeURIComponent(cogni.id)}`)}
      onBack={() => router.back()}
    />
  );
}
