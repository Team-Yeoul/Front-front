'use client';

import { useMemo, useState } from 'react';
import { StatusView } from '@/components/ui/states';
import { Pressable, ScrollView, View } from '@/components/ui/rn';
import { router } from '@/lib/router';
import { useAuthStore } from '@/store';
import { useListMirrorMonsters } from '@/entities/dictionary';
import { Screen } from '@/components/ui/Screen';
import { BackButton, CogniImg, DEFAULT_COGNI_IMAGE, ProgressBar, goBack } from '@/components/ui/primitives';
import { LockIcon } from '@/components/ui/icons';
import { Text } from '@/components/ui/Text';
import { useCollection } from '@/hooks/useCollection';
import { CATEGORY_LABEL, hasCogniImage, monsterName } from '@/lib/onboardingCogni';
import { StandaloneNav } from '@/components/layout/BottomNav';
import { useTheme } from '@/lib/theme';
import { withSensitiveGate } from '@/components/SensitiveGate';

const TABS = [
  { key: 'COGNITIVE', label: '사고/인지' },
  { key: 'EMOTIONAL', label: '감정 반응' },
  { key: 'BEHAVIORAL', label: '행동' },
  { key: 'RELATIONAL', label: '대인관계' },
  { key: 'GROWTH', label: '자기 인식/성장' },
  { key: 'SITUATIONAL', label: '상황별 트리거' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

// 기기에만 있는 코그니는 분류가 한글 라벨로 저장돼 있어 키로 되돌린다.
const LABEL_TO_KEY = Object.fromEntries(Object.entries(CATEGORY_LABEL).map(([k, v]) => [v, k])) as Record<string, TabKey>;

/** 도감 목록을 받기 전, 분류마다 미리 깔아 두는 잠긴 칸 수 */
const PLACEHOLDER_SLOTS = 6;

interface Slot {
  id: string;
  name: string;
  desc: string;
  image: string;
  owned: boolean;
}

/** 코그니 도감 (5b): 분류 탭 · 모은 것과 아직 못 만난 것(실루엣) */
function DogamScreen() {
  const { bg } = useTheme();
  const token = useAuthStore((s) => s.accessToken);
  const collection = useCollection();
  const { data: master, isError, refetch, isFetching } = useListMirrorMonsters({ size: 100 }, !!token);

  const byTab = useMemo(() => {
    const owned = new Map(collection.map((c) => [c.id, c]));
    const map = new Map<TabKey, Slot[]>(TABS.map((t) => [t.key, []]));
    for (const m of master?.monsters ?? []) {
      // 그림 없는 몬스터(아직 그림이 없는 종)는 도감 칸으로 두지 않는다. 서버도 이런 몬스터는 배정·포획하지 않는다.
      if (!hasCogniImage(m.icon_url)) {
        owned.delete(m.monster_id);
        continue;
      }
      const c = owned.get(m.monster_id);
      map.get(m.category as TabKey)?.push({
        id: m.monster_id,
        name: c?.name ?? monsterName(m),
        desc: c?.desc ?? m.monster_description,
        image: c?.image ?? m.icon_url,
        owned: !!c,
      });
      owned.delete(m.monster_id);
    }
    // 마스터 도감에 없는(기기에만 있는) 코그니도 빠뜨리지 않는다.
    for (const c of owned.values())
      map.get(LABEL_TO_KEY[c.category] ?? 'BEHAVIORAL')?.push({
        id: c.id,
        name: c.name,
        desc: c.desc,
        image: c.image,
        owned: true,
      });
    // 도감 목록을 아직 못 받았으면(불러오는 중·실패) 칸 틀은 잠긴 실루엣으로 채워 둔다.
    if (!master) {
      for (const [key, list] of map) {
        for (let i = list.length; i < PLACEHOLDER_SLOTS; i++)
          list.push({
            id: `${key}-locked-${i}`,
            name: '',
            desc: '',
            image: DEFAULT_COGNI_IMAGE,
            owned: false,
          });
      }
    }
    // 모은 것을 앞에
    for (const list of map.values()) list.sort((a, b) => Number(b.owned) - Number(a.owned));
    return map;
  }, [collection, master]);

  const firstOwnedTab = TABS.find((t) => byTab.get(t.key)?.some((s) => s.owned))?.key ?? 'COGNITIVE';
  const [picked, setPicked] = useState<TabKey | null>(null);
  const tab = picked ?? firstOwnedTab;
  const slots = byTab.get(tab) ?? [];
  const ownedHere = slots.filter((s) => s.owned).length;
  // 칸 수는 실제로 그리는 칸(마스터 도감 + 도감에 없는 내 코그니)을 센다. 도감을 못 받아 잠긴 자리 칸을 채웠을 때는 세지 않는다.
  // 모은 수도 실제로 그린 칸(그림 없는 몬스터를 뺀 것)에서 세어, 분자와 분모가 같은 기준이 되게 한다.
  const ownedTotal = [...byTab.values()].reduce((n, list) => n + list.filter((s) => s.owned).length, 0);
  const total = master ? [...byTab.values()].reduce((n, list) => n + list.length, 0) : 0; // 도감 목록을 받기 전에는 전체 칸 수를 모르므로 분모를 '-'로 둔다.

  return (
    <Screen inTabs overlay={<StandaloneNav active="mypage" />}>
      <View className="h-14 flex-row items-center justify-center px-5">
        <View className="absolute left-5">
          <BackButton onPress={() => goBack('/mypage')} />
        </View>
        <Text accessibilityRole="header" className="text-[20px] font-bold text-ink">
          코그니 도감
        </Text>
        <Text className="absolute right-5 tabular-nums text-[16px] font-semibold text-ink">
          {ownedTotal}/{total || '-'}
        </Text>
      </View>
      <View className="mt-2 border-b border-line">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-5 px-5" accessibilityRole="tablist">
          {TABS.map((t) => {
            const on = t.key === tab;
            return (
              <Pressable key={t.key} onPress={() => setPicked(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }} className="py-3 shrink-0">
                <Text className={`text-[16px] whitespace-nowrap ${on ? 'font-bold text-ink' : 'text-mute'}`}>{t.label}</Text>
                {on && <View className="absolute left-0 right-0 bottom-0 h-[2px] bg-ink" />}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 도감 목록을 못 받았으면 칸 대신 오류 안내(15b)를 보여 준다. 받는 동안은 잠긴 칸 틀을 깔아 둔다. */}
      {!master && isError ? (
        <StatusView kind="error" title="도감을 불러오지 못했어요" onRetry={() => refetch()} retrying={isFetching} className="pt-24" />
      ) : (
        <View className="px-4 pt-5 pb-8">
          <View className="rounded-[28px] bg-primary-soft/70 px-4 pt-5 pb-4">
            <View className="flex-row items-end justify-between px-1">
              <View>
                <View className="self-start h-6 px-2.5 rounded-full bg-primary justify-center">
                  <Text className="text-[12px] font-bold text-white">{TABS.find((t) => t.key === tab)?.label}</Text>
                </View>
                <Text className="text-[20px] font-bold text-ink mt-2">{ownedHere > 0 ? '만난 코그니' : '아직 만나지 못했어요'}</Text>
              </View>
              <View className="w-[72px] shrink-0 items-end">
                <Text className="text-[16px] font-bold text-ink tabular-nums">
                  <Text className="text-[16px] font-bold text-primary">{ownedHere}</Text>/{slots.length}
                </Text>
                <View className="w-full mt-1.5">
                  <ProgressBar value={slots.length ? (ownedHere / slots.length) * 100 : 0} height={5} track={bg('#FFFFFF')} />
                </View>
              </View>
            </View>
            <View className="flex-row flex-wrap mt-4" style={{ marginLeft: -5, marginRight: -5 }}>
              {slots.map((s) => (
                // 3열: 칸마다 좌우 5px씩 띄워 사이 간격 10px을 만든다.
                <View key={s.id} className="w-1/3 shrink-0 px-[5px] pb-2.5">
                  {s.owned ? (
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: '/dogam/[id]',
                          params: { id: s.id },
                        })
                      }
                      accessibilityRole="button"
                      accessibilityLabel={s.name}
                      className="rounded-[20px] bg-page items-center px-2 pt-3.5 pb-4 active:opacity-80"
                      style={{ boxShadow: '0 2px 8px rgba(30,30,60,0.05)' }}
                    >
                      <View className="w-[68px] h-[68px] shrink-0 rounded-full bg-primary-soft items-center justify-center overflow-hidden">
                        <CogniImg src={s.image} size={58} />
                      </View>
                      <Text className="text-[12px] font-bold text-ink mt-2.5 text-center leading-[15px]">{s.name}</Text>
                      <Text numberOfLines={3} className="text-[10px] text-sub leading-[14px] mt-1.5 text-center">
                        {s.desc}
                      </Text>
                    </Pressable>
                  ) : (
                    <View className="rounded-[20px] bg-page/70 items-center px-2 pt-3.5 pb-4" accessibilityLabel="아직 만나지 못한 코그니">
                      <View className="w-[68px] h-[68px] shrink-0 rounded-full bg-surface-2 items-center justify-center overflow-hidden">
                        {/* 아직 못 만난 코그니는 그림을 검은 실루엣으로만 보여준다. */}
                        <CogniImg src={s.image} size={52} silhouette />
                      </View>
                      <View className="flex-row items-center gap-1 mt-2.5">
                        <LockIcon size={12} />
                        <Text className="text-[12px] font-bold text-ink">???</Text>
                      </View>
                      <Text className="text-[10px] text-mute mt-1">기록하면 만나요</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
            {slots.length === 0 && <Text className="text-[12px] text-sub text-center py-8">이 분류의 코그니가 아직 없어요</Text>}
          </View>
        </View>
      )}
    </Screen>
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(DogamScreen);
