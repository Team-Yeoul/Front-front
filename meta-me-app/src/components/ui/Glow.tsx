import { useId, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * 웹의 `radial-gradient(W% H% at X% Y%, …)` 한 겹.
 * w·h는 타원 반지름(영역 너비·높이 대비 %), x·y는 중심(%). stops는 [위치(0~1), 진하기(0~1)].
 */
export type GlowLayer = { w: number; h: number; x: number; y: number; rgb: string; stops: [number, number][] };

/** 웹 온보딩 슬라이드의 blob(): 중심 → 45% 지점(spread 비율) → 85%에서 사라진다. */
export const blob = (w: number, h: number, x: number, y: number, rgb: string, a: number, spread = 0.3): GlowLayer => ({
  w,
  h,
  x,
  y,
  rgb,
  stops: [
    [0, a],
    [0.45, a * spread],
    [0.85, 0],
  ],
});

/** 웹 GradientBg의 한 겹: 중심에서 70% 지점까지 사라진다. */
export const fade = (w: number, h: number, x: number, y: number, rgb: string, a: number): GlowLayer => ({
  w,
  h,
  x,
  y,
  rgb,
  stops: [
    [0, a],
    [0.7, 0],
  ],
});

/**
 * 빛 번짐(radial-gradient 여러 겹) 배경. RN에는 radial-gradient가 없어 SVG 타원 그라데이션으로 그린다.
 * 크기를 알아야 타원 반지름을 정할 수 있어 onLayout으로 잰 뒤에 그린다.
 */
export function Glow({ layers, bg }: { layers: GlowLayer[]; bg?: string }) {
  const id = useId().replace(/:/g, '');
  const [size, setSize] = useState<{ w: number; h: number }>();
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!size || size.w !== width || size.h !== height) setSize({ w: width, h: height });
  };

  return (
    <View style={[StyleSheet.absoluteFill, bg ? { backgroundColor: bg } : null]} onLayout={onLayout} pointerEvents="none">
      {size && (
        <Svg width={size.w} height={size.h}>
          <Defs>
            {layers.map((l, i) => (
              <RadialGradient
                key={i}
                id={`${id}-${i}`}
                gradientUnits="userSpaceOnUse"
                cx={(l.x / 100) * size.w}
                cy={(l.y / 100) * size.h}
                fx={(l.x / 100) * size.w}
                fy={(l.y / 100) * size.h}
                rx={(l.w / 100) * size.w}
                ry={(l.h / 100) * size.h}
              >
                {[...l.stops, [1, 0] as [number, number]].map(([offset, a]) => (
                  <Stop key={offset} offset={offset} stopColor={`rgb(${l.rgb})`} stopOpacity={Math.min(1, a)} />
                ))}
              </RadialGradient>
            ))}
          </Defs>
          {/* CSS는 첫 겹이 맨 위에 오므로, 뒤에 그린 것이 위에 오는 SVG에서는 거꾸로 그린다. */}
          {layers.map((_, i) => layers.length - 1 - i).map((i) => (
            <Rect key={i} x={0} y={0} width={size.w} height={size.h} fill={`url(#${id}-${i})`} />
          ))}
        </Svg>
      )}
    </View>
  );
}
