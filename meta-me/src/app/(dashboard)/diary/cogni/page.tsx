'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AskFriendSheet, CogniHero, FeatureIcons } from '@/components/ui/flows';
import { readLastWrite, type MonsterDetection } from '@/lib/lastWrite';
import { useMe } from '@/hooks/useMe';

const CATEGORY_LABEL: Record<string, string> = {
  COGNITIVE: '사고 · 인지 패턴',
  EMOTIONAL: '감정 반응 패턴',
  BEHAVIORAL: '행동 패턴',
  RELATIONAL: '대인관계 패턴',
  GROWTH: '성장 패턴',
  SITUATIONAL: '상황 패턴',
};

/** 객관화 미러가 새로 감지한 코그니(unlocked_monsters)를 보여주고 도감에 넣는다. */
export default function DiaryCogniPage() {
  const router = useRouter();
  const me = useMe();
  const [askOpen, setAskOpen] = useState(false);
  const [found, setFound] = useState<MonsterDetection | null | undefined>(undefined);

  useEffect(() => {
    const first = readLastWrite()?.unlocked[0] ?? null;
    setFound(first);
    if (!first) router.replace('/diary/streak');
  }, [router]);

  if (!found) return null;

  const m = found.monster;
  const name = m.stage_titles?.[0] || m.monster_code;
  const category = CATEGORY_LABEL[m.category] ?? '패턴';
  const image = m.icon_url || '/v2/mascot-glasses.png';
  const total = me.cognis.length + (me.cognis.some((c) => c.id === m.monster_id) ? 0 : 1);

  const collect = () => {
    me.addCogni({
      id: m.monster_id,
      name,
      desc: m.monster_description,
      category,
      image,
      foundAt: new Date().toISOString(),
      source: 'mirror',
    });
    router.push('/diary/streak');
  };

  return (
    <CogniHero
      eyebrow="오늘 발견한 코그니는"
      name={name}
      imageSrc={image}
      category={`NEW · ${category}`}
      features={[{ icon: FeatureIcons.search, text: m.monster_description }]}
      counterLabel="오늘 객관화 미러에서 발견"
      counter={`${String(total).padStart(2, '0')} / 24`}
      primaryLabel="도감에 넣기"
      primaryVariant="primary"
      onPrimary={collect}
      onBack={() => router.back()}
      askFriend={() => setAskOpen(true)}
      overlay={<AskFriendSheet open={askOpen} onClose={() => setAskOpen(false)} myType={name} onAsk={() => router.push('/mirror/invite')} />}
    />
  );
}
