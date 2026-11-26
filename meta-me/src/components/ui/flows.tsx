'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Screen } from './Screen';
import { Button, CogniImg, Img3D, TextButton, TopBar, type Asset3D } from './primitives';
import { CheckIcon, ChevronLeft, ChevronRight, CloseIcon, DownloadIcon } from './icons';
import { Sheet } from './overlays';
import { Glow, fade, type GlowLayer } from './Glow';
import { Text } from './Text';
import { Pressable, View } from './rn';
import { useTheme } from '@/lib/theme';
import { useSaveViewImage } from '@/hooks/useSaveViewImage';

/* ── 반투명 흰 카드 (bg-page/85 + backdrop-blur) ───────── */
function Frosted({ className = '', children }: { className?: string; children: ReactNode }) {
  return <View className={`overflow-hidden bg-page/85 backdrop-blur-[15px] ${className}`}>{children}</View>;
}

/* ── 빛 번짐 배경 (웹 GradientBg와 같은 색·위치) ──────────── */

const GRADIENT_BG: Record<'a' | 'b' | 'c', GlowLayer[]> = {
  a: [fade(60, 40, 15, 5, '160,164,255', 0.75), fade(55, 35, 95, 18, '255,226,140', 0.85), fade(70, 40, 70, 65, '190,193,255', 0.6)],
  b: [fade(55, 35, 5, 25, '150,155,255', 0.75), fade(50, 30, 90, 5, '255,226,140', 0.85), fade(60, 35, 85, 65, '190,193,255', 0.65)],
  c: [
    fade(60, 45, 5, 10, '255,226,140', 0.9),
    fade(50, 35, 100, 28, '150,155,255', 0.7),
    fade(60, 40, 40, 75, '255,236,170', 0.6),
    fade(60, 30, 90, 100, '190,193,255', 0.6),
  ],
};

/** 다크에서는 어두운 바탕 위에 빛 번짐이 너무 밝지 않게 진하기를 낮춘다. */
const dimLayers = (layers: GlowLayer[]) => layers.map((l) => ({ ...l, stops: l.stops.map(([p, a]) => [p, a * 0.35] as [number, number]) }));

export function GradientBg({ variant = 'a' }: { variant?: 'a' | 'b' | 'c' }) {
  const { isDark, bg } = useTheme();
  return <Glow layers={isDark ? dimLayers(GRADIENT_BG[variant]) : GRADIENT_BG[variant]} bg={bg('#FBFBFF')} />;
}

/* ── 분석 중 화면 (온보딩 · 객관화 공통) ─────────────────── */

const R = 70;
const C = 2 * Math.PI * R;

/** 지금 진행 중인 단계 옆에서 도는 고리. */
function Spinner() {
  return (
    <View
      className="w-[30px] h-[30px] rounded-full border-[3px] border-[#E6E6EE] dark:border-track border-t-primary border-r-primary"
      style={{ animation: 'spin-linear 900ms linear infinite' }}
    />
  );
}

export function AnalyzingScreen({
  title,
  steps,
  onDone,
  onClose,
  stepMs = 1100,
}: {
  title: string;
  steps: string[];
  onDone: () => void;
  onClose?: () => void;
  stepMs?: number;
}) {
  const [done, setDone] = useState(0);
  // 부모가 매 렌더마다 새 onDone을 넘겨도 단계 타이머가 처음부터 다시 돌지 않게 ref로 붙잡아 둔다.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (done >= steps.length) {
      const t = setTimeout(() => onDoneRef.current(), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone((d) => d + 1), stepMs);
    return () => clearTimeout(t);
  }, [done, steps.length, stepMs]);

  // 처음 그릴 때는 0에서 시작해 다음 프레임부터 늘어나게 한다(앱 withTiming).
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setStarted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const progress = started ? Math.min(1, (done + 0.6) / steps.length) : 0;
  const { isDark } = useTheme();

  return (
    <Screen>
      <View className="flex-row justify-end px-5 h-14 items-center">
        {onClose && (
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="닫기">
            <CloseIcon size={24} />
          </Pressable>
        )}
      </View>
      <View className="items-center pt-[100px]">
        <View className="w-[150px] h-[150px] items-center justify-center">
          <svg width={150} height={150} viewBox="0 0 150 150" className="absolute" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={75} cy={75} r={R} fill="none" stroke={isDark ? '#3A3946' : '#E6E6EE'} strokeWidth={4} />
            <circle
              cx={75}
              cy={75}
              r={R}
              fill="none"
              stroke="#6367FF"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`${progress * C} ${C}`}
              style={{ transition: 'stroke-dasharray 700ms ease-in-out' }}
            />
          </svg>
          <Img3D name="star" size={100} />
        </View>
        <Text className="text-[16px] text-body mt-12">잠시만 기다려주세요...</Text>
        <Text className="text-[24px] font-bold text-ink text-center leading-[32px] mt-2">{title}</Text>
        <View className="mt-12 gap-5">
          {steps.map((s, i) => (
            <View key={s} className="flex-row items-center gap-3">
              {i < done ? (
                <View className="w-[30px] h-[30px] rounded-full bg-primary items-center justify-center">
                  <CheckIcon size={15} />
                </View>
              ) : i === done ? (
                <Spinner />
              ) : (
                <View className="w-[30px] h-[30px] rounded-full border-[3px] border-[#E6E6EE] dark:border-track" />
              )}
              <Text className={`text-[16px] ${i <= done ? 'text-ink' : 'text-mute'}`}>{s}</Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

/* ── 코그니 발견 히어로 (그라데이션 배경 + 특징 카드) ──────── */

export interface CogniFeature {
  icon: ReactNode;
  text: string;
}

export function CogniHero({
  eyebrow,
  name,
  character = 'cogni-default',
  imageSrc,
  category,
  features,
  counterLabel,
  counter,
  primaryLabel,
  primaryVariant = 'dark',
  onPrimary,
  onSave,
  askFriend,
  onBack,
  topRight,
  overlay,
}: {
  eyebrow?: string;
  name?: string;
  character?: Asset3D;
  /** 로컬 에셋 경로 또는 서버 icon_url. 있으면 character보다 우선한다. */
  imageSrc?: string;
  category: string;
  features: CogniFeature[];
  counterLabel: string;
  counter: string;
  primaryLabel: string;
  primaryVariant?: 'dark' | 'primary';
  onPrimary: () => void;
  /** 이미지 저장 버튼. 기본은 이름·캐릭터·특징 카드를 PNG로 찍어 사진첩에 저장한다. false면 버튼을 숨긴다. */
  onSave?: (() => void) | false;
  askFriend?: () => void;
  onBack?: () => void;
  topRight?: ReactNode;
  overlay?: ReactNode;
}) {
  const { ref: snapshotRef, capturing, saving, save } = useSaveViewImage();
  const handleSave = onSave === false ? undefined : (onSave ?? save);
  return (
    <Screen background={<GradientBg variant="a" />} bg="#FBFBFF" contentClassName="flex-grow" overlay={overlay}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-5 h-14">
          {/* onBack을 안 주면 뒤로가기 버튼을 숨긴다(자리는 남겨 제목 위치 유지). */}
          {onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="뒤로가기"
              className="w-10 h-10 rounded-full bg-page/80 items-center justify-center"
            >
              <ChevronLeft />
            </Pressable>
          ) : (
            <View className="w-10 h-10" />
          )}
          {topRight}
        </View>
        {/* 이미지 저장 때 찍는 영역(이름·캐릭터·특징·카운터). 화면 배경은 이 영역 밖에 있어 찍는 동안만 같은 배경을 깔아 준다. */}
        <View ref={snapshotRef} className="flex-1">
          {capturing && <GradientBg variant="a" />}
          {/* 이름과 캐릭터를 한 덩어리로 남는 공간 가운데에 둔다. */}
          <View className="flex-1 justify-center pb-6 min-h-[230px]">
            {(eyebrow || name) && (
              <View className="items-center">
                {!!eyebrow && <Text className="text-[16px] text-body">{eyebrow}</Text>}
                {!!name && <Text className="text-[24px] font-bold text-ink leading-[35px] mt-1.5 text-center">{name}</Text>}
              </View>
            )}
            <View className="items-center mt-12">
              {imageSrc ? <CogniImg src={imageSrc} size={180} /> : <Img3D name={character} size={character === 'cogni-headphone' ? 190 : 180} />}
              <View className="mt-3 h-7 px-3 rounded-full bg-page/90 justify-center">
                <Text className="text-[12px] font-semibold text-primary">{category}</Text>
              </View>
            </View>
          </View>
          <View className="px-4 pb-2.5 gap-2.5">
            <Frosted className="rounded-3xl px-4 py-4 gap-3.5">
              {features.map((f) => (
                <View key={f.text} className="flex-row items-center gap-3">
                  <View className="w-7 h-7 rounded-lg bg-primary-soft items-center justify-center">{f.icon}</View>
                  <Text className="flex-1 text-[16px] text-ink">{f.text}</Text>
                </View>
              ))}
            </Frosted>
            <Frosted className="rounded-2xl px-5 h-12 flex-row items-center justify-between">
              <Text className="text-[14px] text-body">{counterLabel}</Text>
              <Text className="tabular-nums text-[16px] font-bold text-primary">{counter}</Text>
            </Frosted>
          </View>
        </View>
        <View className="px-4 pb-4 gap-2.5">
          <View className="flex-row gap-2.5">
            {handleSave && (
              <Pressable
                onPress={handleSave}
                disabled={saving}
                accessibilityRole="button"
                accessibilityState={{ busy: saving }}
                className={`flex-1 h-[63px] rounded-2xl bg-page flex-row items-center justify-center gap-2 active:opacity-80 ${saving ? 'opacity-60' : ''}`}
              >
                <DownloadIcon />
                <Text className="text-[16px] font-semibold text-ink">이미지 저장</Text>
              </Pressable>
            )}
            <Button variant={primaryVariant} className="flex-1" onPress={onPrimary}>
              {primaryLabel}
            </Button>
          </View>
          {askFriend && (
            <Pressable onPress={askFriend} accessibilityRole="button" className="h-10 flex-row items-center justify-center gap-1">
              <Text className="text-[14px] font-semibold text-primary">친구는 나를 어떻게 볼까? 물어보기</Text>
              <ChevronRight size={14} color="#6367FF" />
            </Pressable>
          )}
        </View>
      </View>
    </Screen>
  );
}

/** 코그니 특징 목록에 쓰는 작은 선 아이콘. */
const ICON = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', className: 'shrink-0' } as const;
const STROKE = { stroke: '#6367FF', strokeWidth: 2 } as const;

export const FeatureIcons = {
  target: (
    <svg {...ICON}>
      <circle cx={12} cy={12} r={8} {...STROKE} />
      <circle cx={12} cy={12} r={3.5} {...STROKE} />
    </svg>
  ),
  clock: (
    <svg {...ICON}>
      <circle cx={12} cy={12} r={8} {...STROKE} />
      <path d="M12 8v4l2.5 2" {...STROKE} strokeLinecap="round" />
    </svg>
  ),
  bolt: (
    <svg {...ICON}>
      <path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" {...STROKE} strokeLinejoin="round" />
    </svg>
  ),
  search: (
    <svg {...ICON}>
      <circle cx={11} cy={11} r={6} {...STROKE} />
      <path d="M16 16l3.5 3.5" {...STROKE} strokeLinecap="round" />
    </svg>
  ),
  cloud: (
    <svg {...ICON}>
      <path d="M7 18h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7 9.5 4.25 4.25 0 0 0 7 18Z" {...STROKE} strokeLinejoin="round" />
    </svg>
  ),
  eye: (
    <svg {...ICON}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...STROKE} />
      <circle cx={12} cy={12} r={2.5} {...STROKE} />
    </svg>
  ),
  sparkle: (
    <svg {...ICON}>
      <path d="M12 3v5M12 16v5M3 12h5M16 12h5" {...STROKE} strokeLinecap="round" />
    </svg>
  ),
};

/* ── "친구는 나를 어떤 유형으로 볼지" 비교 시트 ───────────── */

export function AskFriendSheet({
  open,
  onClose,
  myType,
  onAsk,
}: {
  open: boolean;
  onClose: () => void;
  myType: string;
  onAsk: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose}>
      <View className="px-5 pt-4 pb-4">
        <Text className="text-[20px] font-bold text-ink leading-[29px]">{'친구는 나를 어떤 유형으로\n볼지 물어보세요'}</Text>
        <Text className="text-[14px] text-sub mt-2">총 9가지 유형이 있어요.</Text>
        <View className="flex-row items-center gap-3 my-5">
          <View className="flex-1 h-px bg-line" />
          <View className="h-6 px-3 rounded-full bg-surface-2 justify-center">
            <Text className="text-[12px] text-sub">비교</Text>
          </View>
          <View className="flex-1 h-px bg-line" />
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1 items-center">
            <View className="w-full h-[120px] rounded-2xl bg-surface-2 items-center justify-center">
              <Text className="text-[24px] font-bold text-primary">m</Text>
              <View className="absolute right-3 bottom-3 h-6 px-2 rounded-full bg-primary justify-center">
                <Text className="text-[10px] font-semibold text-white">나</Text>
              </View>
            </View>
            <Text className="text-[16px] font-semibold text-ink mt-3 text-center">{myType}</Text>
            <Text className="text-[12px] text-mute mt-1">내가 고른 나</Text>
          </View>
          <View className="flex-1 items-center">
            <View className="w-full h-[120px] rounded-2xl bg-yellow-soft items-center justify-center">
              <Text className="text-[24px] font-bold text-[#E5B92E]">?</Text>
            </View>
            <Text className="text-[16px] font-semibold text-ink mt-3">아직 비어 있음</Text>
            <Text className="text-[12px] text-mute mt-1">친구가 고른 나</Text>
          </View>
        </View>
        <Button variant="dark" className="mt-6" onPress={onAsk}>
          친구에게 물어보기
        </Button>
        <TextButton className="mt-1" onPress={onClose}>
          다음에
        </TextButton>
      </View>
    </Sheet>
  );
}

/* ── 기본 상단바 + 제목/설명 블록 ────────────────────────── */

export function PageHeading({ eyebrow, title, sub }: { eyebrow?: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <View className="px-5">
      {!!eyebrow && <Text className="tabular-nums text-[12px] tracking-[1.4px] text-sub uppercase">{eyebrow}</Text>}
      {typeof title === 'string' ? (
        <Text className={`text-[24px] font-bold text-ink leading-[33px] ${eyebrow ? 'mt-1.5' : ''}`}>{title}</Text>
      ) : (
        <View className={eyebrow ? 'mt-1.5' : ''}>{title}</View>
      )}
      {typeof sub === 'string' ? <Text className="text-[14px] text-sub mt-1.5 leading-[23px]">{sub}</Text> : sub ? <View className="mt-1.5">{sub}</View> : null}
    </View>
  );
}

export { TopBar };
