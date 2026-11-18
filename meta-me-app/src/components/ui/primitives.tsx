import { useState, type ReactNode } from 'react';
import { Image as ExpoImage } from 'expo-image';
import { Pressable, View, type PressableProps } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { router, type Href } from 'expo-router';
import { Text } from './Text';
import { ChatBubbleIcon, CheckIcon, ChevronLeft } from './icons';

/* ── 3D assets cropped from the v2 design ─────────────── */

const ASSETS = {
  alarm: require('@/assets/images/v2/alarm.png'),
  bars: require('@/assets/images/v2/bars.png'),
  bulb: require('@/assets/images/v2/bulb.png'),
  chat: require('@/assets/images/v2/chat.png'),
  check: require('@/assets/images/v2/check.png'),
  clock: require('@/assets/images/v2/clock.png'),
  'cogni-headphone': require('@/assets/images/v2/cogni-headphone.png'),
  envelope: require('@/assets/images/v2/envelope.png'),
  fire: require('@/assets/images/v2/fire.png'),
  flower: require('@/assets/images/v2/flower.png'),
  gem: require('@/assets/images/v2/gem.png'),
  lock3d: require('@/assets/images/v2/lock3d.png'),
  magnifier: require('@/assets/images/v2/magnifier.png'),
  'mascot-glasses': require('@/assets/images/v2/mascot-glasses.png'),
  megaphone: require('@/assets/images/v2/megaphone.png'),
  mug: require('@/assets/images/v2/mug.png'),
  pen: require('@/assets/images/v2/pen.png'),
  spring: require('@/assets/images/v2/spring.png'),
  spy: require('@/assets/images/v2/spy.png'),
  star: require('@/assets/images/v2/star.png'),
  'star-pink': require('@/assets/images/v2/star-pink.png'),
} as const;

export type Asset3D = keyof typeof ASSETS;

/** 웹은 너비만 주고 높이는 원본 비율을 따랐다. 앱은 정사각 영역에 contain으로 맞춘다. */
export function Img3D({ name, size }: { name: Asset3D; size: number }) {
  return <ExpoImage source={ASSETS[name]} style={{ width: size, height: size }} contentFit="contain" />;
}

/**
 * 서버 icon_url(…/monsters/png/<코드>/<단계>.png)은 70px 남짓이라 크게 띄우면 흐려진다.
 * 같은 경로에 벡터 SVG(…/monsters/svg/<코드>/<단계>.svg)가 있어 그것을 쓴다. 다른 주소는 그대로 둔다.
 */
const vectorOf = (src: string) => src.replace(/\/monsters\/png\/(.+)\.png(\?.*)?$/, '/monsters/svg/$1.svg$2');

/** 웹에서 쓰던 로컬 에셋 경로('/v2/xxx.png')를 앱 에셋으로 바꾼다. */
const localAsset = (src: string) => {
  const m = src.match(/^\/v2\/(.+)\.png$/);
  return m && m[1] in ASSETS ? ASSETS[m[1] as Asset3D] : null;
};

/** 코그니 캐릭터 이미지 (로컬 에셋 경로 또는 서버 icon_url). SVG가 없으면 원래 PNG로 돌아간다. */
export function CogniImg({ src, size }: { src: string; size: number }) {
  const local = localAsset(src);
  const vector = vectorOf(src);
  const [failedFor, setFailedFor] = useState<string | null>(null);
  const uri = failedFor === src ? src : vector;
  return (
    <ExpoImage
      key={src}
      source={local ?? { uri }}
      style={{ width: size, height: size }}
      contentFit="contain"
      onError={() => vector !== src && setFailedFor(src)}
    />
  );
}

/* ── Buttons ───────────────────────────────────────────── */

type Variant = 'primary' | 'dark' | 'gray' | 'white' | 'danger';

const VARIANT: Record<Variant, { box: string; text: string }> = {
  primary: { box: 'bg-primary', text: 'text-white' },
  dark: { box: 'bg-ink', text: 'text-white' },
  gray: { box: 'bg-surface-2', text: 'text-ink' },
  white: { box: 'bg-white', text: 'text-ink' },
  danger: { box: 'bg-danger-soft', text: 'text-danger' },
};

type ButtonProps = Omit<PressableProps, 'children'> & {
  variant?: Variant;
  className?: string;
  textClassName?: string;
  children: ReactNode;
};

/** 글자만 넘기면 버튼 색에 맞는 글자로 감싼다. 아이콘을 함께 넣을 때는 ReactNode를 그대로 넘긴다. */
const label = (children: ReactNode, cls: string) =>
  typeof children === 'string' ? <Text className={cls}>{children}</Text> : children;

export function Button({ variant = 'primary', className = '', textClassName = '', disabled, children, ...rest }: ButtonProps) {
  const v = VARIANT[variant];
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole="button"
      className={`w-full h-[63px] rounded-2xl flex-row items-center justify-center gap-2 ${v.box} ${disabled ? 'opacity-40' : 'active:opacity-80'} ${className}`}
    >
      {label(children, `text-[16px] font-semibold ${v.text} ${textClassName}`)}
    </Pressable>
  );
}

export function TextButton({ children, className = '', textClassName = '', disabled, ...rest }: Omit<ButtonProps, 'variant'>) {
  return (
    <Pressable {...rest} disabled={disabled} accessibilityRole="button" className={`w-full h-11 items-center justify-center ${className}`}>
      {label(children, `text-[14px] font-semibold ${disabled ? 'text-mute' : 'text-ink'} ${textClassName}`)}
    </Pressable>
  );
}

/** 뒤로 갈 화면이 없으면(앱을 이 화면에서 연 경우 등) href로 이동한다. */
export function goBack(fallback: Href = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}

export function BackButton({ onPress, href, className = '' }: { onPress?: () => void; href?: Href; className?: string }) {
  return (
    <Pressable
      onPress={onPress ?? (() => goBack(href))}
      accessibilityRole="button"
      accessibilityLabel="뒤로가기"
      hitSlop={8}
      className={`w-10 h-10 rounded-full bg-surface-2 items-center justify-center ${className}`}
    >
      <ChevronLeft />
    </Pressable>
  );
}

/** 40px round back button · centered title · optional right slot. */
export function TopBar({
  title,
  right,
  onBack,
  backHref,
  noBack = false,
}: {
  title?: string;
  right?: ReactNode;
  onBack?: () => void;
  backHref?: Href;
  noBack?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between h-14 px-5">
      {noBack ? <View className="w-10" /> : <BackButton onPress={onBack} href={backHref} />}
      {title && (
        <View pointerEvents="none" className="absolute left-0 right-0 items-center">
          <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
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
  return (
    <View
      className={`w-[22px] h-[22px] items-center justify-center ${round ? 'rounded-full' : 'rounded-[6px]'} ${
        checked ? 'bg-primary' : 'bg-white border-[1.5px] border-[#D5D5DC]'
      }`}
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
        <Text className={`text-[15px] ${selected ? 'font-semibold text-ink' : 'text-[#48484F]'}`}>{label}</Text>
        {!!description && <Text className={`text-[13px] mt-1 ${selected ? 'text-primary' : 'text-sub'}`}>{description}</Text>}
      </View>
    </Pressable>
  );
}

/** 슬라이드 위치 표시. bar는 지금 장만 길게 늘인다. */
export function Dots({ count, index, variant = 'dot' }: { count: number; index: number; variant?: 'dot' | 'bar' }) {
  return (
    <View className="flex-row items-center gap-1.5">
      {Array.from({ length: count }, (_, i) =>
        variant === 'bar' ? (
          <View key={i} className={`h-1.5 rounded-full ${i === index ? 'w-6 bg-ink' : 'w-1.5 bg-[#D0D0D6]'}`} />
        ) : (
          <View
            key={i}
            className={`rounded-full ${i === index ? 'bg-primary w-2 h-2' : `w-1.5 h-1.5 ${i < index ? 'bg-primary-line' : 'bg-[#D8D8DE]'}`}`}
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
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View className={`w-full rounded-full overflow-hidden ${className}`} style={{ backgroundColor: track, height }}>
      <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: fill }} />
    </View>
  );
}

export function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={() => onChange(!on)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: on, disabled }}
      className={`w-[44px] h-[26px] rounded-full ${on ? 'bg-primary' : 'bg-[#DADAE0]'} ${disabled ? 'opacity-50' : ''}`}
    >
      <View className={`absolute top-[3px] w-5 h-5 rounded-full bg-white ${on ? 'left-[21px]' : 'left-[3px]'}`} />
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
            className={`flex-1 h-10 rounded-xl items-center justify-center ${on ? 'bg-white' : ''}`}
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
      className={`rounded-full items-center justify-center ${size === 'sm' ? 'h-8 px-3.5' : 'h-9 px-4'} ${selected ? 'bg-primary' : 'bg-surface-2'}`}
    >
      {label(content, `${size === 'sm' ? 'text-[13px]' : 'text-[14px]'} ${selected ? 'font-semibold text-white' : 'font-medium text-[#48484F]'}`)}
    </Pressable>
  );
}

const TAG_TONE = {
  primary: { box: 'bg-primary-soft', text: 'text-primary' },
  yellow: { box: 'bg-yellow', text: 'text-ink' },
  gray: { box: 'bg-surface-2', text: 'text-sub' },
  solid: { box: 'bg-primary', text: 'text-white' },
} as const;

/** 작은 고정 태그 (패턴 / 키워드 라벨). 글자 길이만큼만 차지한다. */
export function Tag({ children, tone = 'primary' }: { children: ReactNode; tone?: keyof typeof TAG_TONE }) {
  const t = TAG_TONE[tone];
  return (
    <View className={`self-start flex-row items-center h-6 px-2.5 rounded-full ${t.box}`}>
      {label(children, `text-[12px] font-semibold ${t.text}`)}
    </View>
  );
}

const BADGE_TONE = {
  gray: { box: 'bg-surface-2', text: 'text-[#48484F]' },
  primary: { box: 'bg-primary-soft', text: 'text-primary' },
  yellow: { box: 'bg-[#FDEFB2]', text: 'text-gold' },
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

/** 화면 아래쪽에 잠깐 뜨는 알림. 화면 맨 바깥(overlay 자리)에 둔다. */
export function Toast({ message }: { message: string }) {
  return (
    <View pointerEvents="none" className="absolute left-0 right-0 bottom-28 z-40 items-center">
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} className="flex-row items-center gap-2 h-10 px-4 rounded-xl bg-[#3A3A40]">
        <View className="w-[18px] h-[18px] rounded-full bg-primary items-center justify-center">
          <CheckIcon size={11} />
        </View>
        <Text className="text-[14px] text-white" numberOfLines={1}>
          {message}
        </Text>
      </Animated.View>
    </View>
  );
}
