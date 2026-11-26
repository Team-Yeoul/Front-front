'use client';

import { useEffect, type ReactNode } from 'react';
import { Text } from './Text';
import { CloseIcon } from './icons';
import { usePresence } from './primitives';
import { Portal, Pressable, View } from './rn';

/** Esc로 닫기 (앱의 안드로이드 뒤로가기 · onRequestClose 자리) */
export function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
}

/**
 * Bottom sheet over a dimmed backdrop. 폰 화면(#phone-screen) 위에 포털로 뜬다(RN Modal 자리). Esc로도 닫힌다.
 */
export function Sheet({
  open,
  onClose,
  children,
  title,
  sub,
  closeButton = false,
  height,
  background,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  sub?: ReactNode;
  closeButton?: boolean;
  /** e.g. '82%' 또는 px 숫자 — omit to size to content. */
  height?: number | string;
  /** 흰 바탕 대신 까는 배경 레이어(그라데이션 등) */
  background?: ReactNode;
}) {
  // 아래에서 Slide in으로 올라오고, 뒤 배경은 Fade로 어두워진다. 닫을 때도 같은 길로 내려가며 밝아진다.
  const { mounted, active, transition } = usePresence(open, 280);
  useEscape(open, onClose);
  if (!mounted) return null;
  return (
    <Portal>
      {/* 닫히는 애니메이션 동안에도 그려져 있으므로, 닫힌 뒤(open=false)에는 눌리지 않게 한다. */}
      <View role="dialog" aria-modal className="absolute inset-0 z-50 justify-end" pointerEvents={open ? 'auto' : 'none'}>
        <View className="absolute inset-0 bg-[#11111E]/62" style={{ opacity: active ? 1 : 0, transition }}>
          <Pressable className="flex-1" onPress={onClose} accessibilityRole="button" accessibilityLabel="닫기" tabIndex={-1} />
        </View>
        <View
          className="bg-page rounded-t-[28px] overflow-hidden max-h-full"
          style={{ height, paddingBottom: 'var(--safe-bottom)', transform: `translateY(${active ? 0 : 100}%)`, transition }}
        >
          {background}
          <View className="items-center pt-3 pb-1 shrink-0">
            <View className="w-10 h-1 rounded-full bg-[#DADAE0] dark:bg-track" />
          </View>
          {(title || closeButton) && (
            <View className="flex-row items-start justify-between px-5 pt-3 shrink-0">
              <View className="flex-1">
                {typeof title === 'string' ? <Text className="text-[20px] font-bold text-ink">{title}</Text> : title}
                {!!sub && <View className="mt-1">{typeof sub === 'string' ? <Text className="text-[14px] text-sub">{sub}</Text> : sub}</View>}
              </View>
              {closeButton && (
                <Pressable onPress={onClose} className="w-9 h-9 -mr-1 items-center justify-center" accessibilityRole="button" accessibilityLabel="닫기">
                  <CloseIcon />
                </Pressable>
              )}
            </View>
          )}
          {children}
        </View>
      </View>
    </Portal>
  );
}

/**
 * 가운데 확인창(팝업). 살짝 커지며(Scale in · Ease out) 나타나고 뒤 배경은 Fade로 어두워진다.
 * 두 버튼은 ButtonPair 안에 size="pair"(163×56)로 넣는다. 카드 폭은 두 버튼이 들어가는 374px까지 넓어진다.
 */
export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** 예전 옵션(지금은 모든 팝업이 같은 폭) */
  wide?: boolean;
}) {
  const { mounted, active, transition } = usePresence(open, 220);
  useEscape(open, onClose);
  if (!mounted) return null;
  return (
    <Portal>
      {/* 닫히는 애니메이션(220ms) 동안 취소한 팝업의 버튼(로그아웃 등)이 눌리지 않게 한다. */}
      <View role="dialog" aria-modal className="absolute inset-0 z-50 items-center justify-center px-4" pointerEvents={open ? 'auto' : 'none'}>
        <View className="absolute inset-0 bg-[#11111E]/62" style={{ opacity: active ? 1 : 0, transition }}>
          <Pressable className="flex-1" onPress={onClose} accessibilityRole="button" accessibilityLabel="닫기" tabIndex={-1} />
        </View>
        <View
          className="w-full max-w-[374px] bg-page rounded-[28px] px-5 pt-6 pb-5"
          style={{ opacity: active ? 1 : 0, transform: `scale(${active ? 1 : 0.92})`, transition }}
        >
          {children}
        </View>
      </View>
    </Portal>
  );
}
