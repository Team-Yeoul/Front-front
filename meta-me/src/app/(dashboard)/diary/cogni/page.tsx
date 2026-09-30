'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AskFriendSheet, CogniHero, FeatureIcons } from '@/components/ui/flows';

export default function DiaryCogniPage() {
  const router = useRouter();
  const [askOpen, setAskOpen] = useState(false);

  return (
    <CogniHero
      eyebrow="오늘 발견한 코그니는"
      name={
        <>
          외부
          <br />
          귀인형
        </>
      }
      category="NEW · 사고 · 인지 패턴"
      features={[
        { icon: FeatureIcons.search, text: '원인을 바깥에서 먼저 찾아요' },
        { icon: FeatureIcons.cloud, text: '억울함이 먼저 올라와요' },
        { icon: FeatureIcons.eye, text: '이번 달 3번째 목격이에요' },
      ]}
      counterLabel="오늘 객관화 미러에서 발견"
      counter="05 / 24"
      primaryLabel="도감에 넣기"
      primaryVariant="primary"
      onPrimary={() => router.push('/diary/streak')}
      onBack={() => router.back()}
      askFriend={() => setAskOpen(true)}
      overlay={<AskFriendSheet open={askOpen} onClose={() => setAskOpen(false)} myType="설명 장인" onAsk={() => router.push('/mirror/invite')} />}
    />
  );
}
