import { useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { BackButton, CogniImg } from '@/components/ui/primitives';
import { LockIcon } from '@/components/ui/icons';
import { Text } from '@/components/ui/Text';
import { SensitiveGate } from '@/components/SensitiveGate';
import { useCollection } from '@/hooks/useCollection';
import { toDateKey } from '@/lib/date';
import type { CollectedCogni } from '@/store';

const TOTAL = 24;
const SLOTS_PER_TAB = 4;

const TABS = [
  { key: 'cognitive', label: '사고/인지 패턴', match: ['사고', '인지'] },
  { key: 'emotional', label: '감정 반응 패턴', match: ['감정'] },
  { key: 'behavioral', label: '행동 패턴', match: ['행동', '습관', '상황', '성장'] },
  { key: 'relational', label: '대인관계 패턴', match: ['대인'] },
] as const;

const tabOf = (c: CollectedCogni) => TABS.find((t) => t.match.some((m) => c.category.includes(m)))?.key ?? 'behavioral';
// 웹은 toLocaleDateString('sv-SE')로 YYYY-MM-DD를 만들었다. 앱은 Hermes 로케일 차이를 피해 toDateKey를 쓴다.
const shortDate = (iso: string) => (iso ? toDateKey(new Date(iso)).slice(2).replaceAll('-', '.') : '');

export default function DogamScreen() {
  return (
    <SensitiveGate>
      <Dogam />
    </SensitiveGate>
  );
}

function Dogam() {
  const collection = useCollection();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>(() => (collection[0] ? tabOf(collection[0]) : 'cognitive'));
  const items = collection.filter((c) => tabOf(c) === tab);
  const locked = Math.max(0, SLOTS_PER_TAB - items.length);
  // 2열 격자: 좌우 여백(20×2)과 칸 사이 간격(16)을 뺀 너비를 둘로 나눈다.
  const cell = (width - 40 - 16) / 2;

  return (
    <Screen>
      {/* 공용 TopBar 제목은 15px 글자만 받아, 웹처럼 18px 제목을 쓰려고 상단바를 직접 그린다. */}
      <View className="flex-row items-center justify-between h-14 px-5">
        <BackButton href="/mypage" />
        <View pointerEvents="none" className="absolute left-0 right-0 items-center">
          <Text className="text-[18px] font-bold text-ink">코그니 도감</Text>
        </View>
        <Text className="font-mono text-[16px] font-bold text-ink">
          {collection.length}/{TOTAL}
        </Text>
      </View>
      <View className="border-b border-line">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-5 px-5">
          {TABS.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: t.key === tab }}
              className="py-3"
            >
              <Text className={`text-[14px] ${t.key === tab ? 'font-bold text-ink' : 'text-sub'}`}>{t.label}</Text>
              {t.key === tab && <View className="absolute left-0 right-0 bottom-0 h-[2px] bg-ink" />}
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <View className="flex-row flex-wrap gap-4 px-5 pt-6 pb-8">
        {items.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => router.push({ pathname: '/dogam/[id]', params: { id: c.id } })}
            accessibilityRole="button"
            style={{ width: cell }}
            className="rounded-3xl bg-white border border-line items-center px-4 pt-4 pb-4 min-h-[214px] active:opacity-80"
          >
            <View className="w-[70px] h-[70px] rounded-full bg-surface-2 items-center justify-center overflow-hidden">
              <CogniImg src={c.image} size={60} />
            </View>
            <Text className="text-[15px] font-bold text-ink mt-3 text-center">{c.name}</Text>
            <Text className="text-[12px] text-sub leading-[19px] mt-1.5 text-center" numberOfLines={2}>
              {c.desc}
            </Text>
            {!!c.foundAt && (
              <View className="mt-auto h-7 px-2.5 rounded-lg bg-surface-2 justify-center">
                <Text className="text-[12px] text-[#48484F]">발견일 {shortDate(c.foundAt)}</Text>
              </View>
            )}
          </Pressable>
        ))}
        {Array.from({ length: locked }, (_, i) => (
          <View key={`lock-${i}`} style={{ width: cell }} className="rounded-3xl bg-[#EEEEF2] items-center justify-center px-4 py-6 min-h-[214px]">
            <LockIcon size={30} />
            <Text className="text-[16px] font-bold text-ink mt-5">???</Text>
            <Text className="text-[13px] text-sub mt-2">기록이 쌓이면 열려요</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
