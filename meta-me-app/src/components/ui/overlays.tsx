import type { ReactNode } from 'react';
import { Modal as RNModal, Pressable, View, type DimensionValue } from 'react-native';
import Animated, { FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { CloseIcon } from './icons';

/** Bottom sheet over a dimmed backdrop. 안드로이드 뒤로가기도 닫기로 처리한다. */
export function Sheet({
  open,
  onClose,
  children,
  title,
  sub,
  closeButton = false,
  height,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  sub?: ReactNode;
  closeButton?: boolean;
  /** e.g. '82%' — omit to size to content. */
  height?: DimensionValue;
}) {
  const insets = useSafeAreaInsets();
  return (
    <RNModal visible={open} transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Animated.View entering={FadeIn.duration(200)} className="absolute inset-0 bg-black/40">
          <Pressable className="flex-1" onPress={onClose} accessibilityLabel="닫기" />
        </Animated.View>
        <Animated.View
          entering={SlideInDown.duration(280)}
          className="bg-white rounded-t-[28px]"
          style={{ height, paddingBottom: insets.bottom }}
        >
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-[#DADAE0]" />
          </View>
          {(title || closeButton) && (
            <View className="flex-row items-start justify-between px-5 pt-3">
              <View className="flex-1">
                {typeof title === 'string' ? <Text className="text-[18px] font-bold text-ink">{title}</Text> : title}
                {sub && <View className="mt-1">{sub}</View>}
              </View>
              {closeButton && (
                <Pressable onPress={onClose} className="w-9 h-9 -mr-1 items-center justify-center" accessibilityLabel="닫기">
                  <CloseIcon />
                </Pressable>
              )}
            </View>
          )}
          {children}
        </Animated.View>
      </View>
    </RNModal>
  );
}

/** Centered dialog card. */
export function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <RNModal visible={open} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center px-12">
        <Animated.View entering={FadeIn.duration(200)} className="absolute inset-0 bg-black/40">
          <Pressable className="flex-1" onPress={onClose} accessibilityLabel="닫기" />
        </Animated.View>
        <Animated.View entering={ZoomIn.duration(220)} className="w-full bg-white rounded-[28px] px-5 pt-6 pb-5">
          {children}
        </Animated.View>
      </View>
    </RNModal>
  );
}
