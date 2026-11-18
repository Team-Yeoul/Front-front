import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { Easing, ReduceMotion, useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { Screen } from './Screen';
import { Button, CogniImg, Img3D, TextButton, TopBar, type Asset3D } from './primitives';
import { CheckIcon, ChevronLeft, ChevronRight, CloseIcon, DownloadIcon } from './icons';
import { Sheet } from './overlays';
import { Glow, fade, type GlowLayer } from './Glow';
import { Text } from './Text';

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

export function GradientBg({ variant = 'a' }: { variant?: 'a' | 'b' | 'c' }) {
  return <Glow layers={GRADIENT_BG[variant]} bg="#FBFBFF" />;
}

/* ── 분석 중 화면 (온보딩 · 객관화 공통) ─────────────────── */

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const R = 70;
const C = 2 * Math.PI * R;

/** 지금 진행 중인 단계 옆에서 도는 고리. */
function Spinner() {
  const deg = useSharedValue(0);
  useEffect(() => {
    deg.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear, reduceMotion: ReduceMotion.System }), -1);
  }, [deg]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${deg.value}deg` }] }));
  return (
    <Animated.View
      style={style}
      className="w-[30px] h-[30px] rounded-full border-[3px] border-[#E6E6EE] border-t-primary border-r-primary"
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

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(Math.min(1, (done + 0.6) / steps.length), { duration: 700, reduceMotion: ReduceMotion.System });
  }, [done, steps.length, progress]);
  const ringProps = useAnimatedProps(() => ({ strokeDasharray: [progress.value * C, C] }));

  return (
    <Screen>
      <View className="flex-row justify-end px-5 h-14 items-center">
        {onClose && (
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="닫기" hitSlop={8}>
            <CloseIcon size={24} />
          </Pressable>
        )}
      </View>
      <View className="items-center pt-[100px]">
        <View className="w-[150px] h-[150px] items-center justify-center">
          <Svg width={150} height={150} viewBox="0 0 150 150" style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
            <Circle cx={75} cy={75} r={R} fill="none" stroke="#E6E6EE" strokeWidth={4} />
            <AnimatedCircle cx={75} cy={75} r={R} fill="none" stroke="#6367FF" strokeWidth={4} strokeLinecap="round" animatedProps={ringProps} />
          </Svg>
          <Img3D name="star" size={100} />
        </View>
        <Text className="text-[16px] text-[#48484F] mt-12">잠시만 기다려주세요...</Text>
        <Text className="text-[22px] font-bold text-ink text-center leading-[32px] mt-2">{title}</Text>
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
                <View className="w-[30px] h-[30px] rounded-full border-[3px] border-[#E6E6EE]" />
              )}
              <Text className={`text-[17px] ${i <= done ? 'text-ink' : 'text-mute'}`}>{s}</Text>
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
  character = 'mascot-glasses',
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
  /** 이미지 저장 버튼. 저장 동작(캡처·사진첩 저장)은 화면에서 구현해 넘긴다. 없으면 버튼을 숨긴다. */
  onSave?: () => void;
  askFriend?: () => void;
  onBack?: () => void;
  topRight?: ReactNode;
  overlay?: ReactNode;
}) {
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
              className="w-10 h-10 rounded-full bg-white/80 items-center justify-center"
            >
              <ChevronLeft />
            </Pressable>
          ) : (
            <View className="w-10 h-10" />
          )}
          {topRight}
        </View>
        {/* 이름과 캐릭터를 한 덩어리로 남는 공간 가운데에 둔다. */}
        <View className="flex-1 justify-center pb-6 min-h-[230px]">
          {(eyebrow || name) && (
            <View className="items-center">
              {!!eyebrow && <Text className="text-[15px] text-[#48484F]">{eyebrow}</Text>}
              {!!name && <Text className="text-[26px] font-bold text-ink leading-[35px] mt-1.5 text-center">{name}</Text>}
            </View>
          )}
          <View className="items-center mt-12">
            {imageSrc ? <CogniImg src={imageSrc} size={180} /> : <Img3D name={character} size={character === 'cogni-headphone' ? 190 : 180} />}
            <View className="mt-3 h-7 px-3 rounded-full bg-white/90 justify-center">
              <Text className="text-[12px] font-semibold text-primary">{category}</Text>
            </View>
          </View>
        </View>
        <View className="px-4 pb-4 gap-2.5">
          <View className="bg-white/85 rounded-3xl px-4 py-4 gap-3.5">
            {features.map((f) => (
              <View key={f.text} className="flex-row items-center gap-3">
                <View className="w-7 h-7 rounded-lg bg-primary-soft items-center justify-center">{f.icon}</View>
                <Text className="flex-1 text-[15px] text-ink">{f.text}</Text>
              </View>
            ))}
          </View>
          <View className="bg-white/85 rounded-2xl px-5 h-12 flex-row items-center justify-between">
            <Text className="text-[14px] text-[#48484F]">{counterLabel}</Text>
            <Text className="font-mono text-[15px] font-bold text-primary">{counter}</Text>
          </View>
          <View className="flex-row gap-2.5">
            {/* 저장 기능이 연결된 화면에서만 버튼을 보여준다. */}
            {onSave && (
              <Pressable
                onPress={onSave}
                accessibilityRole="button"
                className="flex-1 h-[63px] rounded-2xl bg-white flex-row items-center justify-center gap-2 active:opacity-80"
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
const ICON = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none' } as const;
const STROKE = { stroke: '#6367FF', strokeWidth: 2 } as const;

export const FeatureIcons = {
  target: (
    <Svg {...ICON}>
      <Circle cx={12} cy={12} r={8} {...STROKE} />
      <Circle cx={12} cy={12} r={3.5} {...STROKE} />
    </Svg>
  ),
  clock: (
    <Svg {...ICON}>
      <Circle cx={12} cy={12} r={8} {...STROKE} />
      <Path d="M12 8v4l2.5 2" {...STROKE} strokeLinecap="round" />
    </Svg>
  ),
  bolt: (
    <Svg {...ICON}>
      <Path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" {...STROKE} strokeLinejoin="round" />
    </Svg>
  ),
  search: (
    <Svg {...ICON}>
      <Circle cx={11} cy={11} r={6} {...STROKE} />
      <Path d="M16 16l3.5 3.5" {...STROKE} strokeLinecap="round" />
    </Svg>
  ),
  cloud: (
    <Svg {...ICON}>
      <Path d="M7 18h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7 9.5 4.25 4.25 0 0 0 7 18Z" {...STROKE} strokeLinejoin="round" />
    </Svg>
  ),
  eye: (
    <Svg {...ICON}>
      <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...STROKE} />
      <Circle cx={12} cy={12} r={2.5} {...STROKE} />
    </Svg>
  ),
  sparkle: (
    <Svg {...ICON}>
      <Path d="M12 3v5M12 16v5M3 12h5M16 12h5" {...STROKE} strokeLinecap="round" />
    </Svg>
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
              <Text className="text-[30px] font-bold text-primary">m</Text>
              <View className="absolute right-3 bottom-3 h-6 px-2 rounded-full bg-primary justify-center">
                <Text className="text-[11px] font-semibold text-white">나</Text>
              </View>
            </View>
            <Text className="text-[15px] font-semibold text-ink mt-3 text-center">{myType}</Text>
            <Text className="text-[12px] text-mute mt-1">내가 고른 나</Text>
          </View>
          <View className="flex-1 items-center">
            <View className="w-full h-[120px] rounded-2xl bg-yellow-soft items-center justify-center">
              <Text className="text-[30px] font-bold text-[#E5B92E]">?</Text>
            </View>
            <Text className="text-[15px] font-semibold text-ink mt-3">아직 비어 있음</Text>
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
      {!!eyebrow && <Text className="font-mono text-[12px] tracking-[1.4px] text-sub uppercase">{eyebrow}</Text>}
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
