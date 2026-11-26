'use client';

import { Pressable } from '@/components/ui/rn';
import { Spinner } from '@/components/ui/primitives';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';

/** 아직 안 받은 이전 기록을 더 받는 상태 (다이어리 목록·검색 공통) */
export type LoadMoreState = { load: () => void; loading: boolean; failed: boolean };

/** 이전 기록 더 보기 버튼 (목록·검색 공통) */
export function LoadMore({ more }: { more: LoadMoreState }) {
  const { fg } = useTheme();
  return (
    <Pressable
      onPress={more.load}
      disabled={more.loading}
      accessibilityRole="button"
      accessibilityState={{ busy: more.loading }}
      className="mt-4 h-12 shrink-0 rounded-2xl bg-surface items-center justify-center active:opacity-70"
    >
      {more.loading ? (
        <Spinner size={20} color={fg('#52525B')} />
      ) : (
        <Text className={`text-[14px] font-semibold ${more.failed ? 'text-danger' : 'text-text-3'}`}>{more.failed ? '불러오지 못했어요 · 다시 시도' : '이전 기록 더 보기'}</Text>
      )}
    </Pressable>
  );
}
