'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { CogniHero, FeatureIcons } from '@/components/ui/flows';
import { MOCK_COGNIS, MOCK_NICKNAME } from '@/lib/mock';

export default function CogniDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const cogni = MOCK_COGNIS.find((c) => c.id === id) ?? MOCK_COGNIS[0];
  const [first, ...rest] = cogni.name.split(' ');

  return (
    <CogniHero
      eyebrow={`${MOCK_NICKNAME}님 안에서 발견된`}
      name={
        rest.length ? (
          <>
            {first}
            <br />
            {rest.join(' ')}
          </>
        ) : (
          cogni.name
        )
      }
      category={cogni.category.replace('/', ' · ')}
      features={[
        { icon: FeatureIcons.cloud, text: '컨디션이 좋지 않을 때 나타나요' },
        { icon: FeatureIcons.search, text: '분명 주변이 문제인 것 같아요' },
        { icon: FeatureIcons.sparkle, text: '처음 목격한 코그니예요' },
      ]}
      counterLabel="도감에 저장했어요"
      counter="06 / 24"
      primaryLabel="잡은 순간 확인하기"
      onPrimary={() => router.push(`/dogam/${cogni.id}/moments`)}
      onBack={() => router.back()}
    />
  );
}
