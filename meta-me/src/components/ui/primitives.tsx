'use client';

/*
 * 앱 meta-me-app/src/components/ui/primitives.tsx의 웹판. 이름·props·모양을 앱과 맞춘다.
 * - 누르는 컴포넌트는 앱과 같이 onPress를 받는다(onClick 아님). 기본 블록은 ./rn (View · Pressable · Img …).
 * - 그림: 앱 require('@/assets/images/<경로>') → 웹 '/images/<경로>' (자세한 규칙은 ./rn 맨 위).
 * - 이동: href는 문자열(또는 { pathname, params }). goBack은 @/lib/router.
 */

import { Children, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useTheme } from '@/lib/theme';
import { goBack, type Href } from '@/lib/router';
import { Img, Pressable, View, asset, type PressableProps } from './rn';
import { Text } from './Text';
import { ChatBubbleIcon, CheckIcon, ChevronLeft } from './icons';

export { goBack };

/* ── 3D assets cropped from the v2 design ─────────────── */

const ASSET_NAMES = [
  'alarm',
  'bars',
  'bulb',
  'chat',
  'check',
  'clock',
  'cogni-headphone',
  'cogni-default',
  'envelope',
  'fire',
  'flower',
  'gem',
  'lock3d',
  'magnifier',
  'megaphone',
  'mug',
  'pen',
  'spring',
  'spy',
  'star',
  'star-pink',
] as const;

export type Asset3D = (typeof ASSET_NAMES)[number];

const isAsset3D = (v: string): v is Asset3D => (ASSET_NAMES as readonly string[]).includes(v);

/** 3D 그림의 웹 주소 (앱 ASSETS[name]) */
export const asset3D = (name: Asset3D) => asset(`v2/${name}.png`);

/** 앱은 정사각 영역에 contain으로 맞춘다. */
export function Img3D({ name, size }: { name: Asset3D; size: number }) {
  return <Img src={asset3D(name)} size={size} />;
}

/**
 * 서버 icon_url(…/monsters/png/<코드>/<단계>.png)은 70px 남짓이라 크게 띄우면 흐려진다.
 * 같은 경로에 벡터 SVG(…/monsters/svg/<코드>/<단계>.svg)가 있어 그것을 쓴다. 다른 주소는 그대로 둔다.
 */
const vectorOf = (src: string) => src.replace(/\/monsters\/png\/(.+)\.png(\?.*)?$/, '/monsters/svg/$1.svg$2');

/** 코그니 그림이 없을 때 쓰는 기본 그림 경로 (기기에 저장되는 값이라 앱과 같은 '/v2/…'를 쓴다) */
export const DEFAULT_COGNI_IMAGE = '/v2/cogni-default.png';

/**
 * 로컬 에셋 경로('/v2/xxx.png')를 지금 에셋 주소로 바꾼다.
 * 예전에는 그림 없는 코그니에 안경 쓴 고래('/v2/mascot-glasses.png')를 넣어 기기에 저장했으므로, 그 값도 기본 그림으로 보여 준다.
 */
const localAsset = (src: string) => {
  const m = src.match(/^\/v2\/(.+)\.png$/);
  if (m?.[1] === 'mascot-glasses') return asset3D('cogni-default');
  return m && isAsset3D(m[1]) ? asset3D(m[1]) : null;
};

/** 코그니 캐릭터 이미지 (로컬 에셋 경로 또는 서버 icon_url). SVG가 없으면 원래 PNG로 돌아간다. */
export function CogniImg({
  src,
  size,
  silhouette = false,
}: {
  src: string;
  size: number;
  /** 아직 못 만난 코그니: 그림을 검은 실루엣으로만 */
  silhouette?: boolean;
}) {
  const { isDark } = useTheme();
  const local = localAsset(src);
  const vector = silhouette ? src : vectorOf(src);
  const [failedFor, setFailedFor] = useState<string | null>(null);
  const uri = local ?? (failedFor === src ? src : vector);
  return (
    <Img
      key={src}
      src={uri}
      size={size}
      tintColor={silhouette ? (isDark ? '#55546A' : '#000000') : undefined}
      style={silhouette ? { opacity: 0.75 } : undefined}
      onError={() => vector !== src && setFailedFor(src)}
    />
  );
}

/* ── 움직임 공통 ───────────────────────────────────────── */

/** 들어올 때는 Ease out(빠르게 시작해 부드럽게 멈춤), 나갈 때는 Ease in(천천히 시작해 빠르게 사라짐) — CSS timing function */
export const EASE_OUT = 'cubic-bezier(0.33, 1, 0.68, 1)';
export const EASE_IN = 'cubic-bezier(0.32, 0, 0.67, 0)';

/**
 * 열림·닫힘 애니메이션용. open이 false가 돼도 나가는 애니메이션(ms)이 끝날 때까지 mounted를 유지한다.
 * 앱의 progress(0→1 SharedValue) 대신 active(붙은 다음 프레임에 true, 닫기 시작하면 false)와
 * CSS transition 문자열을 돌려준다. 예:
 *   const { mounted, active, transition } = usePresence(open, 280);
 *   style={{ opacity: active ? 1 : 0, transform: `translateY(${active ? 0 : 100}%)`, transition }}
 */
export function usePresence(open: boolean, ms = 240): { mounted: boolean; active: boolean; transition: string } {
  const [mounted, setMounted] = useState(open);
  const [active, setActive] = useState(false);
  // 열릴 때는 그리는 중에 바로 붙인다(한 프레임 늦게 뜨지 않게).
  if (open && !mounted) setMounted(true);
  useEffect(() => {
    if (open) {
      // 닫힌 모양으로 한 번 그린 뒤에 열린 모양으로 바꿔야 transition이 돈다.
      let id = requestAnimationFrame(() => {
        id = requestAnimationFrame(() => setActive(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setActive(false);
    const t = setTimeout(() => setMounted(false), ms);
    return () => clearTimeout(t);
  }, [open, ms]);
  const ease = open ? EASE_OUT : EASE_IN;
  return { mounted, active: open && active, transition: `opacity ${ms}ms ${ease}, transform ${ms}ms ${ease}` };
}

/** 로딩 표시: 일정한 속도(Linear)로 계속 도는 원 */
export function Spinner({ size = 20, color = '#FFFFFF', label = '불러오는 중' }: { size?: number; color?: string; label?: string }) {
  const stroke = Math.max(2, size / 9);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span
      role="progressbar"
      aria-label={label}
      className="block shrink-0"
      style={{ width: size, height: size, animation: 'spin-linear 800ms linear infinite' }}
    >
      <svg width={size} height={size} className="block">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeOpacity={0.25} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c * 0.28} ${c}`}
        />
      </svg>
    </span>
  );
}

/* ── Buttons ───────────────────────────────────────────── */

type Variant = 'primary' | 'dark' | 'gray' | 'white' | 'danger' | 'dangerSolid';

const VARIANT: Record<Variant, { box: string; text: string }> = {
  primary: { box: 'bg-primary', text: 'text-white' },
  dark: { box: 'bg-inverse', text: 'text-white' },
  gray: { box: 'bg-surface', text: 'text-ink' },
  white: { box: 'bg-page', text: 'text-ink' },
  danger: { box: 'bg-danger-soft', text: 'text-danger' },
  dangerSolid: { box: 'bg-danger', text: 'text-white' },
};

const CTA_SHADOW: CSSProperties = { boxShadow: '0 8px 20px rgba(99,103,255,0.28)' };

type ButtonSize = 'lg' | 'sm' | 'pair';

const SIZE: Record<ButtonSize, { box: string; text: string; spinner: number }> = {
  lg: { box: 'w-full h-16 rounded-2xl', text: 'text-[16px]', spinner: 22 },
  sm: { box: 'w-full h-10 rounded-xl', text: 'text-[14px]', spinner: 18 },
  // 팝업 안에 두 개 나란히 놓는 버튼(취소 · 확인): 163×56으로 통일. 좁은 화면에서는 함께 줄어든다.
  pair: { box: 'w-[163px] shrink h-14 rounded-2xl', text: 'text-[16px]', spinner: 20 },
};

type ButtonProps = Omit<PressableProps, 'children'> & {
  variant?: Variant;
  /** lg: 메인 버튼 382×64 · r16 / sm: 보조 버튼 높이 40 · r12 / pair: 팝업 두 버튼 163×56 */
  size?: ButtonSize;
  /** 요청 중: 글자 대신 도는 로딩 표시를 보이고 누를 수 없게 한다. */
  loading?: boolean;
  className?: string;
  textClassName?: string;
  children: ReactNode;
};

const isTextNode = (c: unknown): c is string | number => typeof c === 'string' || typeof c === 'number';

/**
 * 글자·숫자는 버튼 색에 맞는 글자로 감싼다.
 * ['기록 ', 3, '개']처럼 글자만 섞인 배열은 한 줄로 묶고, 아이콘이 섞이면 글자 부분만 따로 감싼다.
 */
const label = (children: ReactNode, cls: string) => {
  if (isTextNode(children)) return <Text className={cls}>{children}</Text>;
  if (!Array.isArray(children)) return children;
  const parts = Children.toArray(children);
  if (parts.every(isTextNode)) return <Text className={cls}>{parts.join('')}</Text>;
  return parts.map((c, i) =>
    isTextNode(c) ? (
      <Text key={`t${i}`} className={cls}>
        {c}
      </Text>
    ) : (
      c
    ),
  );
};

/** 버튼 이름(스크린리더용). 로딩 중에는 글자가 스피너로 바뀌어 이름이 사라지므로 글자 children에서 이름을 뽑아 둔다. */
const textOf = (children: ReactNode): string | undefined => {
  const text = Children.toArray(children).filter(isTextNode).join('').trim();
  return text || undefined;
};

/** 버튼 글자색과 같은 색의 로딩 표시 */
function useSpinnerColor(variant: Variant) {
  const { fg } = useTheme();
  if (variant === 'gray' || variant === 'white') return fg('#1A1A1E');
  if (variant === 'danger') return '#E5484D';
  return '#FFFFFF';
}

/** 디자인 시스템 v2 버튼. 메인(primary)은 비활성일 때 흐리게 하지 않고 회색(#C7C7D1)으로 채운다. */
export function Button({
  variant = 'primary',
  size = 'lg',
  loading = false,
  className = '',
  textClassName = '',
  disabled,
  children,
  style,
  ...rest
}: ButtonProps) {
  const v = VARIANT[variant];
  const sz = SIZE[size];
  const spinnerColor = useSpinnerColor(variant);
  const off = !!disabled || loading;
  // 요청 중인 버튼은 비활성처럼 흐리거나 회색으로 바꾸지 않고 원래 색 그대로 로딩만 돈다.
  const primaryOff = variant === 'primary' && !!disabled && !loading;
  const shadow = variant === 'primary' && size === 'lg' && !primaryOff ? CTA_SHADOW : undefined;
  return (
    <Pressable
      {...rest}
      disabled={off}
      accessibilityLabel={rest.accessibilityLabel ?? (loading ? textOf(children) : undefined)}
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: loading }}
      className={`flex-row items-center justify-center gap-2 ${sz.box} ${primaryOff ? 'bg-disabled' : v.box} ${
        loading ? '' : disabled ? (primaryOff ? '' : 'opacity-40') : 'active:opacity-80'
      } ${className}`}
      style={{ ...shadow, ...style }}
    >
      {loading ? <Spinner size={sz.spinner} color={spinnerColor} /> : label(children, `${sz.text} font-semibold ${v.text} ${textClassName}`)}
    </Pressable>
  );
}

export function TextButton({ children, className = '', textClassName = '', disabled, loading = false, ...rest }: Omit<ButtonProps, 'variant'>) {
  const { fg } = useTheme();
  return (
    <Pressable
      {...rest}
      disabled={disabled || loading}
      accessibilityLabel={rest.accessibilityLabel ?? (loading ? textOf(children) : undefined)}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || loading, busy: loading }}
      className={`w-full h-11 items-center justify-center ${className}`}
    >
      {loading ? (
        <Spinner size={18} color={fg('#1A1A1E')} />
      ) : (
        label(children, `text-[14px] font-semibold ${disabled ? 'text-mute' : 'text-ink'} ${textClassName}`)
      )}
    </Pressable>
  );
}

/** 팝업 안 두 버튼(취소 · 확인)을 가운데 나란히 놓는다. 안에는 size="pair" 버튼을 넣는다. */
export function ButtonPair({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <View className={`flex-row justify-center gap-2 ${className}`}>{children}</View>;
}

export function BackButton({ onPress, href, className = '' }: { onPress?: () => void; href?: Href; className?: string }) {
  return (
    <Pressable
      onPress={onPress ?? (() => goBack(href))}
      accessibilityRole="button"
      accessibilityLabel="뒤로가기"
      // 원형 아이콘 버튼 44×44 · 흰 배경 + shadow-sm
      className={`w-11 h-11 shrink-0 rounded-full bg-page items-center justify-center ${className}`}
      style={{ boxShadow: '0 2px 10px rgba(30,30,60,0.10), 0 0 0 0.5px rgba(30,30,60,0.06)' }}
    >
      <ChevronLeft />
    </Pressable>
  );
}

/** 44px round back button · centered title · optional right slot. */
export function TopBar({
  title,
  right,
  onBack,
  backHref,
  noBack = false,
}: {
  /** 글자 일부만 다른 글꼴로 쓰려면 <Span>으로 감싸 넘긴다(바깥 Text 안에 들어가 크기·색을 물려받는다). */
  title?: ReactNode;
  right?: ReactNode;
  onBack?: () => void;
  backHref?: Href;
  noBack?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between h-14 px-5 shrink-0">
      {noBack ? <View className="w-11" /> : <BackButton onPress={onBack} href={backHref} />}
      {!!title && (
        <View pointerEvents="none" className="absolute left-0 right-0 items-center">
          <Text className="text-[16px] font-semibold text-ink" numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}
      <View className="min-w-10 flex-row justify-end">{right}</View>
    </View>
  );
}

/* ── Selection controls ────────────────────────────────── */

export function CheckBox({ checked, round = false }: { checked: boolean; round?: boolean }) {
  const { fg } = useTheme();
  return (
    <View
      className={`w-[22px] h-[22px] shrink-0 items-center justify-center ${round ? 'rounded-full' : 'rounded-[6px]'} ${
        checked ? 'bg-primary' : 'bg-page border-[1.5px]'
      }`}
      style={checked ? undefined : { borderColor: fg('#D5D5DC') }}
    >
      {checked && <CheckIcon size={13} />}
    </View>
  );
}

/** 체크박스 + 글자(+ 설명) 한 줄 선택지. 고르면 테두리가 보라색이 된다. */
export function OptionRow({
  label,
  description,
  selected,
  onPress,
  round = false,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  round?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={round ? 'radio' : 'checkbox'}
      accessibilityState={{ checked: selected }}
      className={`w-full flex-row items-start gap-3 rounded-2xl px-4 bg-surface border ${description ? 'py-3.5' : 'py-4'} ${
        selected ? 'border-primary' : 'border-transparent'
      }`}
    >
      <View className={description ? 'mt-0.5' : ''}>
        <CheckBox checked={selected} round={round} />
      </View>
      <View className="flex-1 min-w-0">
        <Text className={`text-[16px] ${selected ? 'font-semibold text-ink' : 'text-body'}`}>{label}</Text>
        {!!description && <Text className={`text-[12px] mt-1 ${selected ? 'text-primary' : 'text-sub'}`}>{description}</Text>}
      </View>
    </Pressable>
  );
}

/** 슬라이드 위치 표시. bar는 지금 장만 길게 늘인다. */
export function Dots({ count, index, variant = 'dot' }: { count: number; index: number; variant?: 'dot' | 'bar' }) {
  const { fg } = useTheme();
  return (
    <View className="flex-row items-center gap-1.5">
      {Array.from({ length: count }, (_, i) =>
        variant === 'bar' ? (
          <View
            key={i}
            className={`h-1.5 rounded-full ${i === index ? 'w-6 bg-ink' : 'w-1.5'}`}
            style={i === index ? undefined : { backgroundColor: fg('#D0D0D6') }}
          />
        ) : (
          <View
            key={i}
            className={`rounded-full ${i === index ? 'bg-primary w-2 h-2' : `w-1.5 h-1.5 ${i < index ? 'bg-primary-line' : ''}`}`}
            style={i === index || i < index ? undefined : { backgroundColor: fg('#D8D8DE') }}
          />
        ),
      )}
    </View>
  );
}

export function ProgressBar({
  value,
  className = '',
  track = '#E9EAF0',
  fill = '#6367FF',
  height = 6,
}: {
  value: number;
  className?: string;
  track?: string;
  fill?: string;
  height?: number;
}) {
  const { bg } = useTheme();
  const pct = Math.max(0, Math.min(100, value));
  // 라이트 색을 넘기면 다크에서 짝이 되는 색으로 바뀐다(진한 색은 그대로).
  return (
    <View className={`w-full rounded-full overflow-hidden ${className}`} style={{ backgroundColor: bg(track), height }}>
      <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: bg(fill) }} />
    </View>
  );
}

/** label: 화면 낭독기가 읽을 이름. 옆 줄의 글자는 스위치의 이름이 되지 않으므로 무엇을 켜고 끄는지 넘긴다. */
export function Toggle({ on, onChange, disabled, label }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: string }) {
  return (
    <Pressable
      onPress={() => onChange(!on)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: on, disabled }}
      className={`w-[44px] h-[26px] shrink-0 rounded-full transition-colors ${on ? 'bg-primary' : 'bg-[#DADAE0] dark:bg-track'} ${disabled ? 'opacity-50' : ''}`}
    >
      <View className={`absolute top-[3px] w-5 h-5 rounded-full bg-white transition-[left] ${on ? 'left-[21px]' : 'left-[3px]'}`} />
    </Pressable>
  );
}

/** 2~3칸 알약 모양 선택 (텍스트 | 태그, 1년 미만 | 1-3년 …). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View className="flex-row p-1 bg-surface-2 rounded-2xl">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            className={`flex-1 h-10 rounded-xl items-center justify-center ${on ? 'bg-page dark:bg-track' : ''}`}
            style={on ? { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } : undefined}
          >
            <Text className={`text-[14px] ${on ? 'font-semibold text-ink' : 'text-sub'}`}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** 고를 수 있는 칩 (감정 태그, 키워드). */
export function ChoiceChip({
  label: content,
  selected,
  onPress,
  size = 'md',
}: {
  label: ReactNode;
  selected: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      // 칩: 12/600 · 기본 #F4F5F8/#52525B · 선택 #EEF0FF/#4A4ED9
      className={`rounded-full items-center justify-center ${size === 'sm' ? 'h-8 px-3' : 'h-9 px-3.5'} ${selected ? 'bg-primary-soft' : 'bg-surface'}`}
    >
      {label(content, `text-[12px] font-semibold ${selected ? 'text-primary-pressed' : 'text-text-3'}`)}
    </Pressable>
  );
}

const TAG_TONE = {
  primary: { box: 'bg-primary-soft', text: 'text-primary' },
  // 노란 면은 다크에서도 그대로라 글자를 진하게 고정한다.
  yellow: { box: 'bg-yellow', text: 'text-[#1A1A1E]' },
  gray: { box: 'bg-surface-2', text: 'text-sub' },
  solid: { box: 'bg-primary', text: 'text-white' },
} as const;

/** 작은 고정 태그 (패턴 / 키워드 라벨). 글자 길이만큼만 차지한다. */
export function Tag({ children, tone = 'primary' }: { children: ReactNode; tone?: keyof typeof TAG_TONE }) {
  const t = TAG_TONE[tone];
  return <View className={`self-start flex-row items-center h-6 px-2.5 rounded-full ${t.box}`}>{label(children, `text-[12px] font-semibold ${t.text}`)}</View>;
}

const BADGE_TONE = {
  gray: { box: 'bg-surface-2', text: 'text-body' },
  primary: { box: 'bg-primary-soft', text: 'text-primary' },
  yellow: { box: 'bg-[#FDEFB2] dark:bg-yellow-soft', text: 'text-gold' },
} as const;

/** 질문 위에 붙는 작은 배지 (성장 맥락, 객관식 …). */
export function Badge({ children, tone = 'gray', icon }: { children: ReactNode; tone?: keyof typeof BADGE_TONE; icon?: ReactNode }) {
  const t = BADGE_TONE[tone];
  return (
    <View className={`self-start flex-row items-center gap-1 h-7 px-2.5 rounded-full ${t.box}`}>
      {icon}
      {label(children, `text-[12px] font-semibold ${t.text}`)}
    </View>
  );
}

/** 떠 있는 "분석 결과 물어보기" 채팅 버튼. 위치는 className(absolute …)으로 정한다. */
export function ChatFab({ onPress, className = '' }: { onPress?: () => void; className?: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="분석 결과 물어보기"
      className={`w-[52px] h-[52px] rounded-full bg-primary items-center justify-center active:opacity-80 ${className}`}
      style={{ boxShadow: '0 8px 20px rgba(99,103,255,0.35)' }}
    >
      <ChatBubbleIcon />
    </Pressable>
  );
}

/**
 * 잠깐 뜨는 확인 알림(토스트). 제자리에서 Fade로 나타났다 사라진다. 화면 맨 바깥(Screen overlay 자리)에 둔다.
 * 앱은 조건부로 그렸다 지울 때 나가는 Fade까지 보여 준다. 웹은 붙을 때 Fade in만 한다.
 */
export function Toast({ message }: { message: string }) {
  return (
    <View
      pointerEvents="none"
      className="absolute left-0 right-0 bottom-28 z-40 items-center"
      style={{ animation: `fade-in 220ms ${EASE_OUT} both` }}
    >
      <View className="flex-row items-center gap-2 h-10 px-4 rounded-xl bg-[#3A3A40] dark:bg-track">
        <View className="w-[18px] h-[18px] rounded-full bg-primary items-center justify-center">
          <CheckIcon size={11} />
        </View>
        <Text className="text-[14px] text-white" numberOfLines={1}>
          {message}
        </Text>
      </View>
    </View>
  );
}

/**
 * 스낵바: 화면 아래에서 올라오는 안내(오류·정보). 들어올 때 Ease out, 나갈 때 Ease in으로 미끄러진다.
 * message가 빈 문자열이 되면 내려가며 사라진다. 나가는 동안은 마지막 문구를 그대로 보여 준다.
 */
export function Snackbar({ message, action }: { message: string; action?: { label: string; onPress: () => void } }) {
  const open = !!message;
  const { mounted, active, transition } = usePresence(open, 260);
  const [shown, setShown] = useState(message);
  if (message && message !== shown) setShown(message);
  if (!mounted) return null;
  return (
    <View
      pointerEvents={open ? 'box-none' : 'none'}
      className="absolute left-4 right-4 bottom-6 z-40"
      style={{ opacity: active ? 1 : 0, transform: `translateY(${active ? 0 : 96}px)`, transition }}
      accessibilityLiveRegion="polite"
    >
      <View
        className="flex-row items-center gap-3 min-h-[52px] px-4 py-3 rounded-2xl bg-[#3A3A40] dark:bg-track"
        style={{ boxShadow: '0 8px 24px rgba(17,17,30,0.18)' }}
      >
        <Text className="flex-1 text-[14px] leading-[20px] text-white">{shown}</Text>
        {action && (
          <Pressable onPress={action.onPress} accessibilityRole="button">
            <Text className="text-[14px] font-semibold text-[#9EA1FF]">{action.label}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
