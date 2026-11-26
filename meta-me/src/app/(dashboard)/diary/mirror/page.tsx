'use client';

import { useEffect, useState } from 'react';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, ChatFab } from '@/components/ui/primitives';
import { AskSheet } from '@/components/ui/AskSheet';
import { Pressable, View, useSafeAreaInsets } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';
import { readLastWrite, type LastWrite } from '@/lib/lastWrite';
import { router } from '@/lib/router';
import { monsterName } from '@/lib/onboardingCogni';
import { withSensitiveGate } from '@/components/SensitiveGate';

// 작성 흐름 화면을 기록에 남기지 않도록 다이어리 탭으로 바꿔 간다.
const toDiary = () => router.dismissTo('/diary');
const PATTERN_TONE = [
  ['bg-primary', 'text-white'],
  // 다크(12c-dk)는 노란 칩을 서피스 칩으로 바꾼다.
  ['bg-[#FFD966] dark:bg-surface', 'text-ink'],
] as const;

function Header() {
  return (
    <View className="h-11 mt-2 flex-row items-center justify-center px-5">
      <View className="absolute left-5">
        <BackButton onPress={toDiary} />
      </View>
      <Text accessibilityRole="header" className="text-[16px] font-semibold text-ink">
        객관화 미러
      </Text>
    </View>
  );
}

/** 객관화 미러 — 변환 결과 (12c) */
function DiaryMirrorScreen() {
  const insets = useSafeAreaInsets();
  // 마지막 결과는 클라이언트 메모리에 있어 서버 렌더에서는 읽지 못한다. 붙은 뒤 한 번 읽는다(undefined = 아직 안 읽음).
  const [result, setResult] = useState<LastWrite | null | undefined>(undefined);
  useEffect(() => setResult(readLastWrite()), []);
  const [tab, setTab] = useState<'objective' | 'original'>('objective');
  const [ask, setAsk] = useState(false);

  if (result === undefined) return null;

  if (!result) {
    return (
      <Screen footer={<Button onPress={toDiary}>다이어리로</Button>}>
        <Header />
        <Text className="text-center text-[14px] text-sub mt-24">표시할 객관화 결과가 없어요.</Text>
      </Screen>
    );
  }

  const patterns = result.unlocked;
  const hasCogni = patterns.length > 0;

  return (
    <Screen
      footer={
        <Button onPress={() => router.push(hasCogni ? '/diary/cogni' : '/diary/streak')}>{hasCogni ? '발견된 코그니 보기' : '기록 마치기'}</Button>
      }
      overlay={
        <>
          {/* 하단 버튼(64px + 여백) 바로 위에 띄운다. */}
          <View pointerEvents="box-none" className="absolute right-5 z-20" style={{ bottom: insets.bottom + 96 }}>
            <ChatFab onPress={() => setAsk(true)} />
          </View>
          <AskSheet open={ask} onClose={() => setAsk(false)} context="객관화 미러" />
        </>
      }
    >
      <Header />
      <View className="px-6 pt-5 pb-6">
        <View className="flex-row p-1 rounded-[14px] bg-surface-2" accessibilityRole="tablist">
          {(
            [
              ['objective', '객관화'],
              ['original', '내가 쓴 원문'],
            ] as const
          ).map(([v, label]) => {
            const on = tab === v;
            return (
              <Pressable
                key={v}
                onPress={() => setTab(v)}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                className={`flex-1 h-10 rounded-[11px] items-center justify-center ${on ? 'bg-page' : ''}`}
                style={on ? { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } : undefined}
              >
                <Text className={`text-[14px] ${on ? 'font-semibold text-ink' : 'text-sub'}`}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-4 rounded-[20px] bg-surface px-[22px] py-5">
          <Text className="text-[16px] leading-[27px] text-ink">
            {tab === 'original' ? result.original : result.objective || '객관화 결과를 받아오지 못했어요. 기록은 다이어리에 저장됐어요.'}
          </Text>
        </View>

        {(result.scene || result.emotions.length > 0) && (
          <View className="mt-6">
            <Text accessibilityRole="header" className="text-[16px] font-bold text-ink">
              사실과 감정 분리
            </Text>
            <View className="mt-3 flex-row gap-2.5">
              <View className="flex-1 rounded-2xl bg-primary-soft px-4 py-4">
                <Text className="text-[12px] font-bold text-primary">사실</Text>
                <Text numberOfLines={4} className="mt-1.5 text-[14px] leading-[22px] text-text-2">
                  {result.scene || '오늘 남긴 장면이 없어요'}
                </Text>
              </View>
              <View className="flex-1 rounded-2xl bg-yellow-soft px-4 py-4">
                <Text className="text-[12px] font-bold text-gold">감정</Text>
                <Text className="mt-1.5 text-[14px] leading-[22px] text-text-2">{result.emotions.length ? result.emotions.join(', ') : '고른 감정이 없어요'}</Text>
              </View>
            </View>
          </View>
        )}

        {hasCogni && (
          <View className="mt-4 rounded-[20px] bg-surface px-[18px] py-4">
            <View className="flex-row items-center justify-between">
              <Text accessibilityRole="header" className="text-[16px] font-bold text-ink">
                감지된 패턴
              </Text>
              <Text className="text-[12px] text-mute tabular-nums">{patterns.length}</Text>
            </View>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {patterns.map((p, i) => (
                <View key={p.monster.monster_id} className={`h-8 px-3.5 rounded-full justify-center ${PATTERN_TONE[i % 2][0]}`}>
                  <Text className={`text-[12px] font-semibold ${PATTERN_TONE[i % 2][1]}`}>{monsterName(p.monster)}</Text>
                </View>
              ))}
            </View>
            {patterns[0].monster.monster_description ? (
              <Text className="mt-3 text-[12px] leading-[19px] text-text-4">{patterns[0].monster.monster_description}</Text>
            ) : null}
          </View>
        )}
      </View>
    </Screen>
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(DiaryMirrorScreen);
