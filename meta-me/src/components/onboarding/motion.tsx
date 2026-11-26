'use client';

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { View } from '@/components/ui/rn';

/*
 * 앱 Reanimated entering·withTiming 자리(웹 전용).
 * 키프레임을 전역 CSS에 두지 않고 Web Animations API로 돌린다. 기기에서 동작 줄이기를 켜면 움직이지 않는다(ReduceMotion.System).
 */

export const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** 붙을 때 한 번 keyframes를 돌린다. iterations에 Infinity를 주면 계속 돈다. */
export function Animate({
  keyframes,
  duration,
  easing = 'ease-out',
  iterations = 1,
  className = '',
  style,
  children,
  importantForAccessibility,
}: {
  keyframes: Keyframe[];
  duration: number;
  easing?: string;
  iterations?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  importantForAccessibility?: 'no-hide-descendants';
}) {
  const ref = useRef<HTMLDivElement>(null);
  // 붙을 때 한 번만 돌린다(앱 entering과 같다).
  const frames = useRef(keyframes);
  const opts = useRef({ duration, easing, iterations });
  // 그리기 전에 첫 프레임을 걸어 둬야 한 번 번쩍이지 않는다.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const a = el.animate(frames.current, { ...opts.current, fill: 'both' });
    return () => a.cancel();
  }, []);
  return (
    <View ref={ref} className={className} style={style} importantForAccessibility={importantForAccessibility}>
      {children}
    </View>
  );
}

/** Reanimated ZoomIn.duration(ms) */
export const ZOOM_IN: Keyframe[] = [
  { opacity: 0, transform: 'scale(0)' },
  { opacity: 1, transform: 'scale(1)' },
];

/** Reanimated FadeInDown.withInitialValues({ translateY }) */
export const fadeInDown = (y: number): Keyframe[] => [
  { opacity: 0, transform: `translateY(${y}px)` },
  { opacity: 1, transform: 'translateY(0)' },
];
