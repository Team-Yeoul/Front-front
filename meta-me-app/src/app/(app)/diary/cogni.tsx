import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { SensitiveGate } from '@/components/SensitiveGate';
import { AskFriendSheet, CogniHero, FeatureIcons } from '@/components/ui/flows';
import { goBack } from '@/components/ui/primitives';
import { readLastWrite } from '@/lib/lastWrite';
import { useMe } from '@/hooks/useMe';
import { CATEGORY_LABEL, monsterName } from '@/lib/onboardingCogni';

/** 객관화 미러가 새로 감지한 코그니(unlocked_monsters)를 보여주고 도감에 넣는다. */
function DiaryCogni() {
  const me = useMe();
  const [askOpen, setAskOpen] = useState(false);
  // 웹은 sessionStorage라 effect에서 읽었다. 앱은 메모리에 있어 처음 렌더에서 바로 읽는다.
  const [found] = useState(() => readLastWrite()?.unlocked[0] ?? null);

  useEffect(() => {
    if (!found) router.replace('/diary/streak');
  }, [found]);

  if (!found) return null;

  const m = found.monster;
  const name = monsterName(m);
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
      onBack={() => goBack('/diary')}
      askFriend={() => setAskOpen(true)}
      overlay={
        <AskFriendSheet
          open={askOpen}
          onClose={() => setAskOpen(false)}
          myType={name}
          onAsk={() => {
            setAskOpen(false);
            router.push('/mirror/invite');
          }}
        />
      }
    />
  );
}

export default function DiaryCogniScreen() {
  return (
    <SensitiveGate>
      <DiaryCogni />
    </SensitiveGate>
  );
}
