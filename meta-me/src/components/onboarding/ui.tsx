'use client';

import { useRef, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { Glow, type GlowLayer } from '@/components/ui/Glow';
import { CheckIcon } from '@/components/ui/icons';
import { Pressable, TextInput, View, absoluteFill, LinearGradient } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';
import { useTextCheck } from '@/lib/textQuality';
import { useTheme } from '@/lib/theme';

/* ── 배경 ───────────────────────────────────────────────── */

/** 아래쪽 노을 한 겹 (웹 radial-gradient(80% spread% at 50% 104%, …)) */
const sunset = (spread: number, a: number, rgb = '255,168,128', w = 80): GlowLayer => ({ w, h: spread, x: 50, y: 104, rgb, stops: [[0, a]] });

type Bg = { colors: string[]; locations: number[]; glow: GlowLayer[] };

/** 질문이 진행될수록 아래쪽 노을이 짙어진다 (v3 시안 7f → 13h). 앱 ui.tsx의 BG와 같은 값. */
const BG: Bg[] = [
  { colors: ['#110F30', '#191650', '#221D62', '#2C2370'], locations: [0, 0.4, 0.7, 1], glow: [] },
  { colors: ['#15133B', '#1F1B5C', '#2C2475', '#3F2F82', '#5A3A88'], locations: [0, 0.4, 0.66, 0.86, 1], glow: [sunset(16, 0.22)] },
  { colors: ['#17153F', '#221E62', '#312780', '#523A8F', '#85508F'], locations: [0, 0.38, 0.64, 0.84, 1], glow: [sunset(24, 0.55)] },
  { colors: ['#17153F', '#221E62', '#33287E', '#5E3F93', '#A0608F'], locations: [0, 0.38, 0.64, 0.84, 1], glow: [sunset(28, 0.75)] },
  { colors: ['#17153F', '#231F64', '#372A82', '#6A4494', '#B86890'], locations: [0, 0.36, 0.6, 0.82, 1], glow: [sunset(36, 0.9)] },
  { colors: ['#1E1744', '#2A1D5A', '#4A2A72', '#8A4683', '#C7637D'], locations: [0, 0.35, 0.6, 0.82, 1], glow: [sunset(30, 0.85, '255,150,110', 90)] },
];
/** 질문 순서(0~9) → 배경. 시안에서 4~6번, 8~10번은 같은 배경을 쓴다. */
const STEP_TO_BG = [0, 1, 2, 3, 3, 3, 4, 5, 5, 5];

function Fill({ bg }: { bg: Bg }) {
  return (
    <View style={absoluteFill}>
      <LinearGradient style={absoluteFill} colors={bg.colors} locations={bg.locations} />
      {bg.glow.length > 0 && <Glow layers={bg.glow} />}
    </View>
  );
}

/** 보일 때·사라질 때 0.7초 동안 흐려지며 바뀐다(Ease out). */
function FadeLayer({ visible, children }: { visible: boolean; children: ReactNode }) {
  return (
    <View pointerEvents="none" style={{ ...absoluteFill, opacity: visible ? 1 : 0, transition: 'opacity 700ms ease-out' }}>
      {children}
    </View>
  );
}

/** 배경을 모두 겹쳐 두고 지금 단계 것만 보이게 해서, 넘어갈 때 색이 부드럽게 바뀐다. */
export function QuestionBackdrop({ index }: { index: number }) {
  const current = STEP_TO_BG[Math.min(index, STEP_TO_BG.length - 1)];
  return (
    <View pointerEvents="none" style={{ ...absoluteFill, backgroundColor: '#110F30' }}>
      {BG.map((bg, i) => (
        <FadeLayer key={i} visible={i === current}>
          <Fill bg={bg} />
        </FadeLayer>
      ))}
    </View>
  );
}

/** 질문 다 끝난 뒤 해가 뜨는 화면 배경 (13h1) */
export function SunriseBackdrop() {
  return (
    <Fill
      bg={{
        colors: ['#4A3A8C', '#6A4592', '#A65A97', '#DC8C9A', '#F9C9A6'],
        locations: [0, 0.36, 0.6, 0.8, 1],
        glow: [
          { w: 40, h: 30, x: 50, y: 102, rgb: '255,244,226', stops: [[0, 0.9]] },
          { w: 90, h: 62, x: 50, y: 104, rgb: '255,186,140', stops: [[0, 0.95]] },
        ],
      }}
    />
  );
}

/** 분석 중 · 첫 코그니 화면 배경 (13h2 · 13i): 연보라 위, 노랑 왼쪽 아래, 분홍 오른쪽 아래가 번진다. */
const SOFT_LAYERS: GlowLayer[] = [
  { w: 95, h: 48, x: 15, y: 0, rgb: '150,156,255', stops: [[0, 0.95], [0.72, 0]] },
  { w: 80, h: 45, x: 95, y: 10, rgb: '190,198,255', stops: [[0, 0.9], [0.74, 0]] },
  { w: 95, h: 52, x: 10, y: 100, rgb: '255,214,110', stops: [[0, 0.9], [0.74, 0]] },
  { w: 85, h: 48, x: 98, y: 92, rgb: '222,186,255', stops: [[0, 0.95], [0.74, 0]] },
];
/** 다크에서는 어두운 바탕 위로 빛 번짐을 옅게 깐다. */
const SOFT_LAYERS_DARK = SOFT_LAYERS.map((l) => ({ ...l, stops: l.stops.map(([p, a]) => [p, a * 0.3] as [number, number]) }));

export function SoftBackdrop({ base = '#F5F6FF' }: { base?: string }) {
  const { isDark, bg } = useTheme();
  return <Glow bg={bg(base)} layers={isDark ? SOFT_LAYERS_DARK : SOFT_LAYERS} />;
}

/* ── 머리 ───────────────────────────────────────────────── */

const Chevron = ({ color }: { color: string }) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Close = ({ color }: { color: string }) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </svg>
);

/** 반투명 흰 원 버튼 (어두운 배경은 뒤로가기, 밝은 배경은 light). close면 X 아이콘. */
export function GlassBack({ onPress, label = '뒤로가기', light = false, close = false }: { onPress: () => void; label?: string; light?: boolean; close?: boolean }) {
  const { fg } = useTheme();
  // light = 밝은 배경 위 버튼. 다크 모드에서는 그 배경이 어두워지므로 글자처럼 밝게 바뀐다.
  const color = light ? fg('#1A1A1E') : '#FFFFFF';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      className={`w-11 h-11 shrink-0 rounded-full items-center justify-center border ${light ? 'bg-white/45 border-white/60 dark:bg-surface dark:border-line' : 'bg-white/14 border-white/18'}`}
    >
      {close ? <Close color={color} /> : <Chevron color={color} />}
    </Pressable>
  );
}

/** 뒤로가기 + "3 / 10" + 진행 막대 + 형식 뱃지 + 질문 + 설명 */
export function QuestionHeader({ index, total, badge, title, caption, onBack }: { index: number; total: number; badge: string; title: string; caption?: string; onBack: () => void }) {
  const pct = ((index + 1) / total) * 100;
  return (
    <View className="gap-3 px-5">
      <View className="h-11 flex-row items-center justify-between">
        <GlassBack onPress={onBack} />
        <Text className="text-[12px] text-white/56 tabular-nums">
          {index + 1} / {total}
        </Text>
      </View>
      <View className="h-1 shrink-0 rounded-full bg-white/16 overflow-hidden" accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: total, now: index + 1 }}>
        <View className="h-full bg-primary" style={{ width: `${pct}%`, transition: 'width 500ms ease-out' }} />
      </View>
      <View className="mt-6 flex-row">
        <View className="px-2.5 py-[5px] rounded-full bg-white/10">
          <Text className="text-[12px] font-bold text-white/82">{badge}</Text>
        </View>
      </View>
      <View className="gap-1.5 mt-1">
        <Text className="text-[24px] font-bold leading-[34px] tracking-tight text-white">{title}</Text>
        {!!caption && <Text className="text-[12px] text-white/62">{caption}</Text>}
      </View>
    </View>
  );
}

/* ── 선택지 ─────────────────────────────────────────────── */

/** 고르면 보라로 채워지는 동그라미 */
function Radio({ on, size = 20 }: { on: boolean; size?: number }) {
  return (
    <View className={`shrink-0 rounded-full items-center justify-center ${on ? 'bg-primary' : 'border-[1.5px] border-white/42'}`} style={{ width: size, height: size }}>
      {on && <CheckIcon size={14} />}
    </View>
  );
}

const optionBox = (on: boolean) => `border-2 ${on ? 'bg-[#7C80FF]/30 border-primary' : 'bg-white/12 border-transparent'}`;

/** 체크 리스트 한 줄 (복수·단일 공용). 설명이 있으면 두 줄. */
export function OptionRow({ label, description, on, onPress }: { label: string; description?: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      className={`w-full flex-row items-center gap-3.5 rounded-[18px] px-5 py-4 ${description ? '' : 'min-h-17'} ${optionBox(on)}`}
    >
      <Radio on={on} />
      <View className="flex-1 min-w-0">
        <Text className={`text-[16px] leading-[22px] ${description || on ? 'font-semibold text-white' : 'text-white/86'}`}>{label}</Text>
        {!!description && <Text className="mt-1 text-[12px] leading-[18px] text-white/62">{description}</Text>}
      </View>
    </Pressable>
  );
}

/** 2×2 카드 한 칸. 고른 표시는 왼쪽 위, 글은 아래쪽에 붙는다. */
export function OptionCard({ label, description, on, onPress }: { label: string; description?: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: on }}
      className={`flex-1 basis-0 min-w-0 rounded-[20px] p-[18px] min-h-40 ${optionBox(on)} ${on ? '' : 'bg-white/10'}`}
    >
      <Radio on={on} size={24} />
      <View className="flex-1 justify-end pt-6">
        <Text className="text-[16px] font-bold leading-[22px] text-white">{label}</Text>
        {!!description && <Text className="mt-1.5 text-[12px] leading-[18px] text-white/62">{description}</Text>}
      </View>
    </Pressable>
  );
}

/** 선택지 아래 한 줄 안내 ("하나 더 고를 수 있어요") */
export function Note({ children }: { children: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="w-4 h-4 shrink-0 rounded-full bg-primary items-center justify-center">
        <Text className="text-[10px] font-bold text-white">!</Text>
      </View>
      <Text className="text-[12px] text-[#8A8DFF] flex-1">{children}</Text>
    </View>
  );
}

/* ── 한 문장 ─────────────────────────────────────────────── */

/**
 * 밑줄 입력칸. 한 줄로 시작해 글이 길어지면 늘어난다(multiline은 내용 높이만큼 자란다).
 * 알아볼 수 없는 글(ㅍ튵 · ㅋㅋㅋㅋ 등)이면 입력이 0.7초 멈췄을 때 안내를 보여 준다.
 */
export function SentenceInput({ value, onChange, placeholder, max, disabled }: { value: string; onChange: (v: string) => void; placeholder: string; max: number; disabled?: boolean }) {
  const { hint } = useTextCheck(value);
  return (
    <View className={`gap-2 ${disabled ? 'opacity-40' : ''}`}>
      <TextInput
        value={value}
        onChangeText={onChange}
        maxLength={max}
        multiline
        editable={!disabled}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.35)"
        selectionColor="#6367FF"
        accessibilityLabel="나를 한 문장으로"
        className="w-full text-[16px] font-medium text-white border-b border-white/30 pb-4"
        style={{ lineHeight: '24px', borderBottomStyle: 'solid' }}
      />
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-[12px] text-[#FF9AA0] flex-1">{hint ?? ''}</Text>
        <Text className="text-[12px] text-white/56 tabular-nums">
          {value.length} / {max}
        </Text>
      </View>
    </View>
  );
}

/** 노란 '잘 모르겠어요' 체크 칸 */
export function UnsureToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable
      onPress={() => onChange(!on)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      className="w-full h-14 rounded-xl bg-[#FFF9E0] flex-row items-center gap-3 px-4"
    >
      <View className={`w-5 h-5 shrink-0 rounded items-center justify-center ${on ? 'bg-[#E3C95A]' : 'border-[1.5px] border-[#E3C95A]'}`}>{on && <CheckIcon size={14} />}</View>
      <Text className="text-[16px] text-[#7A6B1F]">잘 모르겠어요</Text>
    </Pressable>
  );
}

/* ── 척도 슬라이더 ───────────────────────────────────────── */

const Arrow = ({ d }: { d: string }) => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d={d} stroke="#6367FF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** 단계 슬라이더 (0 ~ steps-1). 막대를 누르거나 손잡이를 끌어 고른다. 키보드 ←→로도 바꾼다(앱 increment·decrement 자리). */
export function StepSlider({ steps, value, onChange, label }: { steps: number; value: number; onChange: (v: number) => void; label: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pct = (value / (steps - 1)) * 100;
  const setFrom = (e: PointerEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect?.width) return;
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const next = Math.round(ratio * (steps - 1));
    if (next !== value) onChange(next);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(Math.min(steps - 1, value + 1));
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(Math.max(0, value - 1));
    else return;
    e.preventDefault();
  };
  return (
    <View
      ref={trackRef}
      tabIndex={0}
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: steps - 1, now: value }}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        setFrom(e);
      }}
      onPointerMove={(e) => dragging.current && setFrom(e)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      className="h-11 shrink-0 justify-center outline-none touch-none select-none cursor-pointer"
    >
      <View className="absolute left-0 right-0 h-2 rounded-full bg-white/16" />
      <View className="absolute left-0 h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      <View
        pointerEvents="none"
        className="absolute w-16 h-11 rounded-full bg-white border border-[#E4E4EC] flex-row items-center justify-center gap-2.5"
        style={{ left: `${pct}%`, marginLeft: -32 * (pct / 50), boxShadow: '0 4px 12px rgba(30,30,60,0.12)' }}
      >
        <Arrow d="M15 5l-7 7 7 7" />
        <Arrow d="M9 5l7 7-7 7" />
      </View>
    </View>
  );
}

/** 반투명 TIP 카드 */
export function TipCard({ title, body }: { title: string; body: string }) {
  return (
    <View className="rounded-2xl bg-white/10 px-5 py-[18px] flex-row gap-2.5">
      <Text className="text-[16px] font-bold text-primary">TIP</Text>
      <View className="flex-1">
        <Text className="text-[16px] font-bold text-white">{title}</Text>
        <Text className="text-[16px] leading-[25px] text-white/64 mt-1">{body}</Text>
      </View>
    </View>
  );
}

/* ── 인트로 말풍선 ───────────────────────────────────────── */

/** 흰 말풍선 + 아래 꼬리 (인트로의 밝은 화면에 놓여 다크 모드에서는 어두운 면이 된다) */
export function SpeechBubble({ children }: { children: string }) {
  return (
    <View className="items-center">
      {/* 보라 배경(인트로 7e) 위 흰 말풍선. 테마와 관계없이 같은 색이다. */}
      <View className="px-7 py-[18px] rounded-[28px] bg-white">
        <Text className="text-[16px] font-bold text-[#1A1A1E] text-center">{children}</Text>
      </View>
      <View className="w-4 h-4 shrink-0 -mt-2 bg-white rounded-[3px]" style={{ transform: 'rotate(45deg)' }} />
    </View>
  );
}
