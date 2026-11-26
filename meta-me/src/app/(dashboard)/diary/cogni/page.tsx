'use client';

import { useEffect, useState } from 'react';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, CogniImg, DEFAULT_COGNI_IMAGE, goBack } from '@/components/ui/primitives';
import { AskFriendSheet } from '@/components/ui/flows';
import { Glow } from '@/components/ui/Glow';
import { Pressable, View } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';
import { readLastWrite } from '@/lib/lastWrite';
import { router } from '@/lib/router';
import { useMe } from '@/hooks/useMe';
import { useTheme } from '@/lib/theme';
import { CATEGORY_LABEL, hasCogniImage, monsterName } from '@/lib/onboardingCogni';
import { withSensitiveGate } from '@/components/SensitiveGate';

/** 코그니 발견 배경: 연보라 왼쪽 위, 노랑 오른쪽 위, 연보라 아래가 흐리게 번진다 (13c). */
function Backdrop() {
  const { isDark, bg } = useTheme();
  // 다크에서는 번지는 빛을 옅게 깔아 어두운 바탕에서 튀지 않게 한다.
  const a = isDark ? 0.3 : 1;
  return (
    <Glow
      bg={bg('#FBFBFF')}
      layers={[
        { w: 70, h: 35, x: 0, y: 0, rgb: '184,190,255', stops: [[0, 0.75 * a], [0.7, 0]] },
        { w: 60, h: 30, x: 100, y: 5, rgb: '255,231,160', stops: [[0, 0.7 * a], [0.72, 0]] },
        { w: 70, h: 40, x: 80, y: 70, rgb: '214,218,255', stops: [[0, 0.7 * a], [0.72, 0]] },
      ]}
    />
  );
}

/** 객관화 미러가 새로 감지한 코그니(unlocked_monsters)를 보여주고 도감에 넣는다. */
function DiaryCogniScreen() {
  const me = useMe();
  const { fg } = useTheme();
  const [askOpen, setAskOpen] = useState(false);
  // 그림 없는 몬스터는 보여 주지 않는다(서버가 고치기 전에 감지된 것). 그림 있는 첫 코그니만 보여 주고, 없으면 건너뛴다.
  // 마지막 결과는 클라이언트 저장소에 있어 서버 렌더에서는 읽지 못한다. 붙은 뒤 한 번 읽는다(undefined = 아직 안 읽음).
  const [found, setFound] = useState<ReturnType<typeof pick> | undefined>(undefined);

  useEffect(() => {
    const f = pick();
    setFound(f);
    if (!f) router.replace('/diary/streak');
  }, []);

  if (!found) return null;

  const m = found.monster;
  const name = monsterName(m);
  const category = CATEGORY_LABEL[m.category] ?? '패턴';
  const image = m.icon_url || DEFAULT_COGNI_IMAGE;
  const no = me.cognis.length + (me.cognis.some((c) => c.id === m.monster_id) ? 0 : 1);

  const collect = () => {
    me.addCogni({ id: m.monster_id, name, desc: m.monster_description, category, image, foundAt: new Date().toISOString(), source: 'mirror' });
    router.push('/diary/streak');
  };

  return (
    <Screen
      bg="#FBFBFF"
      background={<Backdrop />}
      footer={
        <>
          <Button onPress={collect}>도감에 넣기</Button>
          <Pressable onPress={() => setAskOpen(true)} accessibilityRole="button" className="mt-1 h-11 items-center justify-center">
            <Text className="text-[14px] font-semibold text-primary-pressed">친구는 나를 어떻게 볼까? 물어보기</Text>
          </Pressable>
        </>
      }
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
    >
      <View className="h-11 mt-2 flex-row items-center justify-center px-5">
        <View className="absolute left-5">
          <BackButton onPress={() => goBack('/diary')} />
        </View>
        <Text accessibilityRole="header" className="text-[16px] font-semibold text-ink">
          코그니 발견
        </Text>
      </View>
      <View className="items-center px-8 pt-8">
        <View className="px-3.5 py-1.5 rounded-full bg-page dark:bg-surface">
          <Text className="tabular-nums text-[12px] font-semibold text-primary-pressed">No.{String(no).padStart(2, '0')} 새 코그니</Text>
        </View>
        <Text className="mt-6 text-[20px] font-medium text-ink">오늘 발견한 코그니</Text>
        <View className="mt-8 shrink-0" style={{ animation: 'zoom-in 320ms ease-out' }}>
          <CogniImg src={image} size={220} />
        </View>
        <View className="mt-8 flex-row items-center gap-2 px-4 py-2 rounded-full bg-page/80 dark:bg-surface">
          <svg width={10} height={10} viewBox="0 0 24 24" aria-hidden>
            <path fill={fg('#8A8A96')} d="M7 4.5v15l12-7.5Z" />
          </svg>
          <Text className="text-[12px] font-medium text-text-3">{category}</Text>
        </View>
        <Text accessibilityRole="header" className="mt-4 text-[24px] font-bold tracking-[-0.5px] text-ink">
          {name}
        </Text>
        {m.monster_description ? <Text className="mt-3 text-center text-[16px] leading-[26px] text-text-3">{m.monster_description}</Text> : null}
      </View>
    </Screen>
  );
}

const pick = () => readLastWrite()?.unlocked.find((u) => hasCogniImage(u.monster.icon_url)) ?? null;

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(DiaryCogniScreen);
