'use client';

import { router } from '@/lib/router';
import { Pressable, View } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';
import type { InboxItem, InboxKind } from '@/hooks/useInbox';
import { timeLabel } from '@/lib/inboxTime';
import { useTheme } from '@/lib/theme';

/** 알림 종류별 아이콘 (10n): 검은 스퀘어클 타일 위 색 아이콘 */
const KIND_ICON: Record<InboxKind, { color: string; d: string }> = {
  friend: {
    color: '#9CCBF5',
    d: 'M6.8 20.6l-3 .9a1 1 0 0 1-1.3-1.2l.9-3A10 10 0 1 1 12 22a10 10 0 0 1-5.2-1.4ZM8.5 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
  },
  cogni: { color: '#EF5A6F', d: 'M12 20.5s-8-4.6-8-10.4A4.6 4.6 0 0 1 12 7.4a4.6 4.6 0 0 1 8 2.7c0 5.8-8 10.4-8 10.4Z' },
  report: { color: '#4CC46A', d: 'M5 4h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm9 0h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM5 13h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1Zm9 0h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1Z' },
  record: { color: '#F2C53D', d: 'M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z' },
};

export function InboxRow({ item, now }: { item: InboxItem; now: Date }) {
  const { isDark } = useTheme();
  const icon = KIND_ICON[item.kind];
  const body = (
    <>
      <View className="w-[52px] h-[52px] shrink-0 rounded-[18px] bg-inverse items-center justify-center">
        <svg width={26} height={26} viewBox="0 0 24 24" aria-hidden>
          <path d={icon.d} fill={icon.color} />
        </svg>
      </View>
      <View className="flex-1 min-w-0 gap-1">
        <View className="flex-row items-center justify-between gap-2">
          <Text numberOfLines={1} className="flex-1 min-w-0 text-[16px] font-bold text-ink">
            {item.title}
          </Text>
          <Text className="shrink-0 text-[12px] text-mute tabular-nums">{timeLabel(item.at, now)}</Text>
        </View>
        {!!item.body && (
          <Text numberOfLines={2} className="text-[14px] leading-[21px] text-text-3">
            {item.body}
          </Text>
        )}
      </View>
      <View className={`w-2 h-2 shrink-0 rounded-full mt-1.5 ${item.unread ? 'bg-primary' : 'bg-transparent'}`} />
    </>
  );
  const cls = 'flex-row items-start gap-3.5 px-6 py-4';
  // 화면 읽기 프로그램이 제목만 읽지 않도록 내용과 시간도 함께 읽는다.
  const label = [`${item.unread ? '안 읽음, ' : ''}${item.title}`, item.body, timeLabel(item.at, now)].filter(Boolean).join(', ');
  const style = item.unread ? { backgroundColor: isDark ? '#22213A' : '#EAEBF8' } : undefined;
  return item.href ? (
    <Pressable onPress={() => router.push(item.href!)} accessibilityRole="button" accessibilityLabel={label} className={`${cls} active:opacity-80`} style={style}>
      {body}
    </Pressable>
  ) : (
    <View className={cls} style={style} accessible accessibilityLabel={label}>
      {body}
    </View>
  );
}

/** 혜택 탭 아이콘: 작은 폭죽 */
export function PartyIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <path d="M3 21l5-14 9 9-14 5Z" fill="#F47BD0" />
      <path d="M14 3v3M20 9h-3M18.5 4.5l-2 2" stroke="#3FB27F" strokeWidth={2} strokeLinecap="round" />
      <path d="M21 14l-2 .5" stroke="#F2A93B" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}
