'use client';

import { useEffect, useState } from 'react';
import { router } from '@/lib/router';
import { goBack } from '@/components/ui/primitives';
import { Screen } from '@/components/ui/Screen';
import { Pressable, ScrollView, View, useSafeAreaInsets } from '@/components/ui/rn';
import { BellOffIllust, EmptyView, GiftIllust, Skeleton, StatusView } from '@/components/ui/states';
import { Text } from '@/components/ui/Text';
import { HomeGearIcon } from '@/components/ui/icons';
import { InboxRow, PartyIcon } from '@/components/inbox/InboxRow';
import { INBOX_FILTERS, useInbox, type InboxItem, type InboxKind } from '@/hooks/useInbox';
import { sectionOf } from '@/lib/inboxTime';
import { useTheme } from '@/lib/theme';
import { useAuthStore, useLocalStore } from '@/store';

/** 알림 · 혜택 (10n). 홈의 종 아이콘에서 연다. */
export default function InboxScreen() {
  const insets = useSafeAreaInsets();
  const { fg } = useTheme();
  const inbox = useInbox();
  const [tab, setTab] = useState<'notice' | 'benefit'>('notice');
  const [filter, setFilter] = useState<InboxKind | 'all'>('all');
  const now = new Date();
  // 화면을 보고 나가면 지금까지 온 알림을 읽은 것으로 한다. (보는 동안은 안 읽음 표시를 그대로 둔다)
  const userId = useAuthStore((s) => s.userId);
  useEffect(
    () => () => {
      if (userId) useLocalStore.getState().update(userId, (u) => ({ ...u, inboxReadAt: new Date().toISOString() }));
    },
    [userId],
  );

  const shown = inbox.items.filter((i) => filter === 'all' || i.kind === filter);
  const sections: { title: string; items: InboxItem[] }[] = [];
  for (const it of shown) {
    const title = sectionOf(it.at, now);
    const last = sections[sections.length - 1];
    if (last?.title === title) last.items.push(it);
    else sections.push({ title, items: [it] });
  }

  return (
    <Screen scroll={false}>
      {/* 상단: 알림 · 혜택 탭 + 설정 · 닫기 */}
      <View className="shrink-0 flex-row items-end justify-between px-5 border-b border-line">
        <View className="flex-row gap-6" accessibilityRole="tablist">
          {(
            [
              ['notice', '알림'],
              ['benefit', '혜택'],
            ] as const
          ).map(([key, label]) => {
            const on = tab === key;
            return (
              <Pressable key={key} onPress={() => setTab(key)} accessibilityRole="tab" accessibilityState={{ selected: on }} className="pt-4 pb-3 flex-row items-center gap-1">
                <Text className={`text-[20px] font-bold ${on ? 'text-ink' : 'text-mute'}`}>{label}</Text>
                {key === 'benefit' && <PartyIcon />}
                {on && <View className="absolute left-0 right-0 bottom-0 h-[3px] rounded-full bg-ink" />}
              </Pressable>
            );
          })}
        </View>
        <View className="flex-row items-center gap-4 pb-3">
          <Pressable onPress={() => router.push('/settings')} accessibilityRole="button" accessibilityLabel="알림 설정" hitSlop={8}>
            <HomeGearIcon size={26} />
          </Pressable>
          <Pressable onPress={() => goBack('/main')} accessibilityRole="button" accessibilityLabel="닫기" hitSlop={8}>
            <svg width={26} height={26} viewBox="0 0 24 24" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" stroke={fg('#1A1A1E')} strokeWidth={1.8} strokeLinecap="round" />
            </svg>
          </Pressable>
        </View>
      </View>

      {tab === 'benefit' ? (
        <EmptyView illust={<GiftIllust />} text={'아직 받은 혜택이 없어요\n새로운 혜택이 생기면 알려드릴게요!'} className="flex-1 justify-center pb-24" />
      ) : (
        <>
          <View className="shrink-0 flex-row items-center">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-5 py-4" className="flex-1">
              {INBOX_FILTERS.map((f) => {
                const on = filter === f.key;
                return (
                  <Pressable
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    className={`h-10 shrink-0 px-4 rounded-full justify-center ${on ? 'bg-ink' : 'bg-page border border-border'}`}
                  >
                    <Text className={`text-[14px] whitespace-nowrap ${on ? 'font-semibold text-page' : 'text-ink'}`}>{f.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {inbox.failed ? (
            <StatusView kind="error" title="알림을 불러오지 못했어요" onRetry={inbox.retry} retrying={inbox.retrying} className="flex-1 justify-center pb-24" />
          ) : inbox.loading ? (
            <View className="px-6 gap-5 pt-2" accessibilityLabel="알림 불러오는 중">
              {[0, 1, 2].map((i) => (
                <View key={i} className="flex-row gap-3.5">
                  <Skeleton className="w-[52px] h-[52px] rounded-[18px]" />
                  <View className="flex-1 gap-2 pt-1">
                    <Skeleton className="w-2/3 h-4" />
                    <Skeleton className="w-full h-3.5" />
                  </View>
                </View>
              ))}
            </View>
          ) : shown.length === 0 ? (
            <EmptyView illust={<BellOffIllust />} text={'아직 받은 알림이 없어요\n새로운 알림이 도착하면 알려드릴게요!'} className="flex-1 justify-center pb-24" />
          ) : (
            <ScrollView className="flex-1 min-h-0" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
              {inbox.unreadCount > 0 && (
                <Pressable onPress={inbox.markAllRead} accessibilityRole="button" hitSlop={8} className="self-end px-6 -mt-1 mb-1">
                  <Text className="text-[14px] font-medium text-sub">모두 읽음</Text>
                </Pressable>
              )}
              {sections.map((s) => (
                <View key={s.title}>
                  <Text className="px-6 py-2 text-[12px] font-semibold text-sub">{s.title}</Text>
                  {s.items.map((it, i) => (
                    <View key={it.id}>
                      {i > 0 && <View className="h-px mx-6 bg-line" />}
                      <InboxRow item={it} now={now} />
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          )}
        </>
      )}
    </Screen>
  );
}
