'use client';

/**
 * CSS `radial-gradient(W% H% at X% Y%, …)` 한 겹.
 * w·h는 타원 반지름(영역 너비·높이 대비 %), x·y는 중심(%). stops는 [위치(0~1), 진하기(0~1)].
 */
export type GlowLayer = { w: number; h: number; x: number; y: number; rgb: string; stops: [number, number][] };

/** 온보딩 슬라이드의 blob(): 중심 → 45% 지점(spread 비율) → 85%에서 사라진다. */
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

/** GradientBg의 한 겹: 중심에서 70% 지점까지 사라진다. */
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

const layerCss = (l: GlowLayer) =>
  `radial-gradient(${l.w}% ${l.h}% at ${l.x}% ${l.y}%, ${[...l.stops, [1, 0] as [number, number]]
    .map(([p, a]) => `rgba(${l.rgb},${Math.min(1, a)}) ${p * 100}%`)
    .join(', ')})`;

/** 빛 번짐(radial-gradient 여러 겹) 배경. 부모를 꽉 채운다(absolute inset-0). 앞의 겹이 위에 온다. */
export function Glow({ layers, bg }: { layers: GlowLayer[]; bg?: string }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{ backgroundColor: bg, backgroundImage: layers.map(layerCss).join(', ') }}
    />
  );
}
