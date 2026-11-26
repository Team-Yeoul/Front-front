'use client';

import type { ReactNode } from 'react';
import { useTheme } from '@/lib/theme';
import { Text } from './Text';
import { Spinner, usePresence } from './primitives';
import { useEscape } from './overlays';
import { Portal, Pressable, View } from './rn';

/** iOS 버튼 색은 앱 강조색(tint)을 따른다. 위험한 동작만 시스템 빨강. */
const TINT = '#6367FF';
const IOS_RED = '#FF3B30';
/** 시트 면 · 가는 선. 다크에서는 앱 다크 서피스(#23222C)와 구분선(#3A3946)을 쓴다. */
const iosColors = (isDark: boolean) =>
  isDark ? { HAIRLINE: '#3A3946', SURFACE: 'rgba(35,34,44,0.97)' } : { HAIRLINE: 'rgba(60,60,67,0.18)', SURFACE: 'rgba(249,249,251,0.97)' };

export interface IOSAction {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  /** 오른쪽 끝 아이콘 */
  icon?: ReactNode;
}

/**
 * iOS 액션 시트: 화면 아래 둥근 묶음(제목 + 동작들) + 떨어진 '취소' 칸.
 * 바깥을 누르거나 취소를 누르면 닫힌다. 폰 화면 위에 포털로 뜬다.
 */
export function IOSActionSheet({
  open,
  onClose,
  title,
  message,
  actions,
  cancelLabel = '취소',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actions: IOSAction[];
  cancelLabel?: string;
}) {
  const { HAIRLINE, SURFACE } = iosColors(useTheme().isDark);
  // 바텀시트: 아래에서 Slide in, 뒤 배경은 Fade로 어두워진다. 닫을 때는 반대로 움직인 뒤 내린다.
  const { mounted, active, transition } = usePresence(open, 260);
  useEscape(open, onClose);
  if (!mounted) return null;
  return (
    <Portal>
      <View role="dialog" aria-modal className="absolute inset-0 z-50 justify-end" pointerEvents={open ? 'auto' : 'none'}>
        <View className="absolute inset-0 bg-[#11111E]/40" style={{ opacity: active ? 1 : 0, transition }}>
          <Pressable className="flex-1" onPress={onClose} accessibilityLabel="닫기" tabIndex={-1} />
        </View>
        <View
          className="px-2"
          style={{ paddingBottom: 'max(var(--safe-bottom), 8px)', transform: `translateY(${active ? 0 : 100}%)`, transition }}
        >
          <View className="rounded-[14px] overflow-hidden backdrop-blur-xl" style={{ backgroundColor: SURFACE }}>
            {(title || message) && (
              <View className="px-4 py-3.5 items-center" style={{ borderBottom: `0.5px solid ${HAIRLINE}` }}>
                {title ? (
                  <Text numberOfLines={1} className="text-[12px] font-semibold text-[#8A8A8E] text-center">
                    {title}
                  </Text>
                ) : null}
                {message ? <Text className="text-[12px] text-[#8A8A8E] text-center mt-0.5">{message}</Text> : null}
              </View>
            )}
            {actions.map((a, i) => (
              <Pressable
                key={a.label}
                onPress={a.onPress}
                accessibilityRole="button"
                className="h-14 flex-row items-center justify-center px-5 active:bg-[#E5E5EA] dark:active:bg-line"
                style={i > 0 ? { borderTop: `0.5px solid ${HAIRLINE}` } : undefined}
              >
                <Text className="text-[18px]" style={{ color: a.destructive ? IOS_RED : TINT }}>
                  {a.label}
                </Text>
                {a.icon ? <View className="absolute right-5">{a.icon}</View> : null}
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            className="mt-2 h-14 rounded-[14px] items-center justify-center bg-page dark:bg-surface active:bg-[#E5E5EA] dark:active:bg-line"
          >
            <Text className="text-[18px] font-semibold" style={{ color: TINT }}>
              {cancelLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Portal>
  );
}

/**
 * iOS 알림창: 가운데 둥근 카드(제목 · 설명) + 아래 가는 선으로 나뉜 두 버튼.
 * 취소는 굵게, 위험한 동작은 빨강.
 */
export function IOSAlert({
  open,
  title,
  message,
  cancelLabel = '취소',
  confirmLabel,
  destructive = false,
  busy = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message?: string;
  cancelLabel?: string;
  confirmLabel: string;
  destructive?: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { HAIRLINE, SURFACE } = iosColors(useTheme().isDark);
  // 팝업: 살짝 커지며(Scale in · Ease out) 나타나고, 뒤 배경은 Fade로 어두워진다.
  const { mounted, active, transition } = usePresence(open, 220);
  useEscape(open, () => {
    if (!busy) onCancel();
  });
  if (!mounted) return null;
  return (
    <Portal>
      <View role="alertdialog" aria-modal className="absolute inset-0 z-50 items-center justify-center" pointerEvents={open ? 'auto' : 'none'}>
        <View className="absolute inset-0 bg-[#11111E]/40" style={{ opacity: active ? 1 : 0, transition }} />
        <View
          className="w-[270px] rounded-[14px] overflow-hidden backdrop-blur-xl"
          style={{ backgroundColor: SURFACE, opacity: active ? 1 : 0, transform: `scale(${active ? 1 : 0.92})`, transition }}
        >
          <View className="px-4 pt-5 pb-4 items-center">
            <Text className="text-[16px] font-semibold text-ink text-center">{title}</Text>
            {message ? <Text className="text-[12px] text-ink text-center mt-1 leading-[18px]">{message}</Text> : null}
          </View>
          <View className="flex-row" style={{ borderTop: `0.5px solid ${HAIRLINE}` }}>
            <Pressable
              onPress={onCancel}
              disabled={busy}
              accessibilityRole="button"
              className="flex-1 h-11 items-center justify-center active:bg-[#E5E5EA] dark:active:bg-line"
            >
              <Text className="text-[16px] font-semibold" style={{ color: TINT }}>
                {cancelLabel}
              </Text>
            </Pressable>
            <View style={{ width: 0.5, backgroundColor: HAIRLINE }} />
            <Pressable
              onPress={onConfirm}
              disabled={busy}
              accessibilityRole="button"
              className="flex-1 h-11 items-center justify-center active:bg-[#E5E5EA] dark:active:bg-line"
            >
              {busy ? (
                <Spinner size={20} color={destructive ? IOS_RED : TINT} />
              ) : (
                <Text className="text-[16px]" style={{ color: destructive ? IOS_RED : TINT }}>
                  {confirmLabel}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Portal>
  );
}
