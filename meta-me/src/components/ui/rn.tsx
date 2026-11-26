'use client';

/*
 * ── 앱(React Native) → 웹 옮기기용 기본 블록 ─────────────────────────────
 * 앱 화면(meta-me-app)을 거의 그대로 옮길 수 있게 RN 기본 컴포넌트를 DOM으로 흉내 낸다.
 *
 *   View        → <div class="rn-view">  : RN처럼 세로 flex · position relative가 기본. className(Tailwind)은 그대로.
 *   Pressable   → <div role="button">    : onPress(클릭·Enter·Space), disabled, onLongPress, accessibility* 그대로.
 *                 (<button> 대신 div라 Pressable 안에 Pressable·Link를 넣어도 HTML 규칙에 걸리지 않는다)
 *   ScrollView  → 스크롤 div. contentContainerClassName / contentContainerStyle / horizontal 지원.
 *   Img         → <img>. 앱 require('@/assets/images/<경로>')는 src="/images/<경로>" (아래 asset 규칙).
 *   LinearGradient → CSS linear-gradient (expo-linear-gradient와 같은 props)
 *   Portal      → 폰 화면(#phone-screen) 위에 그린다. RN Modal 자리.
 *   useSafeAreaInsets → 늘 0. 웹 Screen 본문은 이미 상태바·홈 인디케이터 사이에 놓인다.
 *                 폰 화면 전체를 덮는 것(시트·팝업)은 CSS 변수 var(--safe-top) / var(--safe-bottom)을 쓴다.
 *
 * 이벤트 규칙: 이 폴더의 모든 컴포넌트는 앱과 같이 onPress를 받는다(onClick 아님).
 * 맨 DOM 요소(<button>, <a>, <input>)를 직접 쓸 때만 onClick / onChange를 쓴다.
 *
 * 그림 경로 규칙(asset):
 *   앱 require('@/assets/images/v2/star.png') · require('@/../assets/images/diary/mood-1.png')
 *   → 웹 '/images/v2/star.png' · '/images/diary/mood-1.png'  (public/images/ 아래에 앱 assets/images/를 그대로 복사해 두었다)
 *   SVG(require('…/onboarding/heart.svg'))도 같은 규칙으로 <Img src="/images/onboarding/heart.svg" />.
 *   기기에 저장된 예전 경로 '/v2/xxx.png'(DEFAULT_COGNI_IMAGE 등)는 public/v2/에 남아 있어 그대로 열린다.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
  type UIEvent,
} from 'react';
import { createPortal } from 'react-dom';

/** 앱 require('@/assets/images/<path>')에 해당하는 웹 주소 */
export const asset = (path: string) => `/images/${path.replace(/^\/+/, '')}`;

/* ── 접근성 props (RN 이름 → aria) ───────────────────── */

export type AccessibilityRole =
  | 'button'
  | 'link'
  | 'header'
  | 'text'
  | 'image'
  | 'alert'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'tab'
  | 'tablist'
  | 'progressbar'
  | 'adjustable'
  | 'summary'
  | 'none'
  | 'list'
  | 'menu'
  | 'menuitem'
  | 'search'
  | 'timer'
  | 'togglebutton';

export interface AccessibilityState {
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  busy?: boolean;
  expanded?: boolean;
}

export interface A11yProps {
  accessible?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
  accessibilityValue?: { min?: number; max?: number; now?: number; text?: string };
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

const ROLE: Partial<Record<AccessibilityRole, string>> = {
  header: 'heading',
  image: 'img',
  adjustable: 'slider',
  text: undefined,
  none: 'presentation',
  togglebutton: 'button',
  summary: 'region',
};

/** RN 접근성 props를 aria 속성으로 바꾸고 나머지 props를 돌려준다. */
export function splitA11y<T extends A11yProps>(props: T) {
  const {
    accessible: _accessible,
    accessibilityRole: role,
    accessibilityLabel,
    accessibilityHint,
    accessibilityState: st,
    accessibilityValue: val,
    accessibilityLiveRegion,
    accessibilityElementsHidden,
    importantForAccessibility,
    ...rest
  } = props;
  void _accessible;
  const aria: Record<string, unknown> = {};
  if (role) aria.role = role in ROLE ? ROLE[role] : role;
  if (role === 'header') aria['aria-level'] = 2;
  if (accessibilityLabel) aria['aria-label'] = accessibilityLabel;
  if (accessibilityHint) aria['aria-description'] = accessibilityHint;
  if (st?.disabled !== undefined) aria['aria-disabled'] = st.disabled;
  if (st?.selected !== undefined) aria[role === 'tab' ? 'aria-selected' : 'aria-pressed'] = st.selected;
  if (st?.checked !== undefined) aria['aria-checked'] = st.checked;
  if (st?.busy !== undefined) aria['aria-busy'] = st.busy;
  if (st?.expanded !== undefined) aria['aria-expanded'] = st.expanded;
  if (val) {
    if (val.min !== undefined) aria['aria-valuemin'] = val.min;
    if (val.max !== undefined) aria['aria-valuemax'] = val.max;
    if (val.now !== undefined) aria['aria-valuenow'] = val.now;
    if (val.text) aria['aria-valuetext'] = val.text;
  }
  if (accessibilityLiveRegion && accessibilityLiveRegion !== 'none') aria['aria-live'] = accessibilityLiveRegion;
  if (accessibilityElementsHidden || importantForAccessibility === 'no-hide-descendants') aria['aria-hidden'] = true;
  return { aria, rest };
}

/** RN pointerEvents → 클래스. box-none은 자신은 통과시키고 자식은 눌리게 한다. */
const POINTER: Record<string, string> = {
  none: 'pointer-events-none',
  'box-none': 'pointer-events-none *:pointer-events-auto',
  'box-only': '*:pointer-events-none',
  auto: '',
};

export type PointerEvents = 'none' | 'box-none' | 'box-only' | 'auto';

/* ── View ─────────────────────────────────────────── */

export type ViewProps = HTMLAttributes<HTMLDivElement> &
  A11yProps & {
    ref?: Ref<HTMLDivElement>;
    className?: string;
    style?: CSSProperties;
    pointerEvents?: PointerEvents;
    /** RN 전용(무시) */
    collapsable?: boolean;
  };

export function View({ className = '', pointerEvents, collapsable: _c, ref, ...props }: ViewProps) {
  void _c;
  const { aria, rest } = splitA11y(props);
  return <div ref={ref} {...rest} {...aria} className={`rn-view ${pointerEvents ? POINTER[pointerEvents] : ''} ${className}`} />;
}

/* ── Pressable ────────────────────────────────────── */

export type PressableProps = Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'children'> &
  A11yProps & {
    ref?: Ref<HTMLDivElement>;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
    onPress?: (e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
    onLongPress?: () => void;
    disabled?: boolean;
    pointerEvents?: PointerEvents;
    /** RN 전용(무시). 웹은 누르는 영역을 넓히지 않는다. */
    hitSlop?: number | object;
  };

/** 누를 수 있는 View. onPress는 클릭·Enter·Space에서 불린다. */
export function Pressable({
  className = '',
  onPress,
  onLongPress,
  disabled = false,
  pointerEvents,
  hitSlop: _h,
  ref,
  onKeyDown,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  ...props
}: PressableProps) {
  void _h;
  const { aria, rest } = splitA11y({ accessibilityRole: 'button' as AccessibilityRole, ...props });
  const longTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longFired = useRef(false);
  const clearLong = () => {
    if (longTimer.current) clearTimeout(longTimer.current);
    longTimer.current = null;
  };
  useEffect(() => clearLong, []);
  return (
    <div
      ref={ref}
      tabIndex={disabled ? -1 : 0}
      {...rest}
      {...aria}
      aria-disabled={disabled || (aria['aria-disabled'] as boolean | undefined) || undefined}
      className={`rn-view rn-press ${pointerEvents ? POINTER[pointerEvents] : ''} ${className}`}
      onClick={(e) => {
        if (disabled) return;
        if (longFired.current) {
          longFired.current = false;
          return;
        }
        onPress?.(e);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (disabled || e.defaultPrevented || e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPress?.(e);
        }
      }}
      onPointerDown={(e) => {
        onPointerDown?.(e);
        if (!onLongPress || disabled) return;
        longFired.current = false;
        clearLong();
        longTimer.current = setTimeout(() => {
          longFired.current = true;
          onLongPress();
        }, 500);
      }}
      onPointerUp={(e) => {
        onPointerUp?.(e);
        clearLong();
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        clearLong();
      }}
    />
  );
}

/* ── ScrollView ───────────────────────────────────── */

export type ScrollViewProps = Omit<ViewProps, 'onScroll'> & {
  horizontal?: boolean;
  contentContainerClassName?: string;
  contentContainerStyle?: CSSProperties;
  onScroll?: (e: UIEvent<HTMLDivElement>) => void;
  /** RN 전용(무시) */
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  keyboardShouldPersistTaps?: string;
  nestedScrollEnabled?: boolean;
  scrollEventThrottle?: number;
};

/**
 * 스크롤 영역. 스크롤 막대는 앱처럼 숨긴다.
 * 끝까지 내리기: `ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })` (또는 scrollToEnd(ref.current))
 */
export function ScrollView({
  horizontal = false,
  contentContainerClassName = '',
  contentContainerStyle,
  className = '',
  children,
  showsVerticalScrollIndicator: _v,
  showsHorizontalScrollIndicator: _hz,
  keyboardShouldPersistTaps: _k,
  nestedScrollEnabled: _n,
  scrollEventThrottle: _t,
  ...props
}: ScrollViewProps) {
  void [_v, _hz, _k, _n, _t];
  return (
    <View
      {...props}
      className={`no-scrollbar ${horizontal ? 'overflow-x-auto overflow-y-hidden flex-row' : 'overflow-y-auto overflow-x-hidden'} ${className}`}
    >
      <div
        className={`rn-view ${horizontal ? 'flex-row self-start' : 'shrink-0'} ${contentContainerClassName}`}
        style={contentContainerStyle}
      >
        {children}
      </div>
    </View>
  );
}

export const scrollToEnd = (el: HTMLElement | null | undefined, smooth = true) =>
  el?.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });

/* ── 그림 ─────────────────────────────────────────── */

/**
 * expo-image 자리. size를 주면 정사각, 아니면 width·height.
 * tintColor를 주면 그림 모양만 남기고 한 색으로 칠한다(CSS mask).
 */
export function Img({
  src,
  size,
  width,
  height,
  contentFit = 'contain',
  tintColor,
  alt = '',
  className = '',
  style,
  onError,
}: {
  src: string;
  size?: number;
  width?: number | string;
  height?: number | string;
  contentFit?: 'contain' | 'cover' | 'fill';
  tintColor?: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  onError?: () => void;
}) {
  const w = size ?? width;
  const h = size ?? height;
  if (tintColor) {
    return (
      <span
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className={`block shrink-0 ${className}`}
        style={{
          width: w,
          height: h,
          backgroundColor: tintColor,
          WebkitMaskImage: `url("${src}")`,
          maskImage: `url("${src}")`,
          WebkitMaskSize: contentFit === 'fill' ? '100% 100%' : contentFit,
          maskSize: contentFit === 'fill' ? '100% 100%' : contentFit,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          ...style,
        }}
      />
    );
  }
  return (
    // 정적 그림이라 next/image 최적화가 필요 없다.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      draggable={false}
      onError={onError}
      className={`block shrink-0 ${className}`}
      style={{ width: w, height: h, objectFit: contentFit, ...style }}
    />
  );
}

/* ── 그라데이션 ───────────────────────────────────── */

type Point = { x: number; y: number };

const CORNER: Record<string, string> = {
  '0,0>1,1': 'to bottom right',
  '1,0>0,1': 'to bottom left',
  '0,1>1,0': 'to top right',
  '1,1>0,0': 'to top left',
};

/** expo-linear-gradient의 start/end(0~1)를 CSS 방향으로 */
function direction(start: Point = { x: 0.5, y: 0 }, end: Point = { x: 0.5, y: 1 }) {
  const corner = CORNER[`${start.x},${start.y}>${end.x},${end.y}`];
  if (corner) return corner;
  const deg = (Math.atan2(end.x - start.x, -(end.y - start.y)) * 180) / Math.PI;
  return `${Math.round(deg * 100) / 100}deg`;
}

export function linearGradient(colors: readonly string[], locations?: readonly number[], start?: Point, end?: Point) {
  const stops = colors.map((c, i) => (locations?.[i] !== undefined ? `${c} ${locations[i] * 100}%` : c));
  return `linear-gradient(${direction(start, end)}, ${stops.join(', ')})`;
}

/** expo-linear-gradient 자리 */
export function LinearGradient({
  colors,
  locations,
  start,
  end,
  style,
  ...props
}: ViewProps & { colors: readonly string[]; locations?: readonly number[]; start?: Point; end?: Point }) {
  return <View {...props} style={{ backgroundImage: linearGradient(colors, locations, start, end), ...style }} />;
}

/** RN StyleSheet.absoluteFill */
export const absoluteFill: CSSProperties = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 };

/* ── 폰 화면 위에 그리기 (RN Modal 자리) ───────────── */

/**
 * 폰 화면(#phone-screen, PhoneFrame) 안에 포털로 그린다. 데스크톱 미리보기에서도 시트·팝업이 폰 안에만 뜬다.
 * 폰 화면을 찾지 못하면 body에 그린다.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setTarget(document.getElementById('phone-screen') ?? document.body), []);
  return target ? createPortal(children, target) : null;
}

/** react-native-safe-area-context 자리. 웹 Screen 본문은 이미 안전 영역 안이라 0을 돌려준다. */
export function useSafeAreaInsets() {
  return { top: 0, bottom: 0, left: 0, right: 0 };
}

/* ── 입력칸 (RN TextInput 자리) ───────────────────── */

type KeyboardType = 'default' | 'email-address' | 'number-pad' | 'numeric' | 'decimal-pad' | 'phone-pad' | 'url';
const INPUT_MODE: Record<KeyboardType, HTMLAttributes<HTMLInputElement>['inputMode']> = {
  default: 'text',
  'email-address': 'email',
  'number-pad': 'numeric',
  numeric: 'numeric',
  'decimal-pad': 'decimal',
  'phone-pad': 'tel',
  url: 'url',
};

export type TextInputProps = A11yProps & {
  ref?: Ref<HTMLInputElement & HTMLTextAreaElement>;
  value?: string;
  defaultValue?: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  /** 자리 글자색 (CSS 변수로 넘긴다) */
  placeholderTextColor?: string;
  /** true면 <textarea>. 글이 늘면 높이도 늘어난다(max-h-*로 막는다). */
  multiline?: boolean;
  maxLength?: number;
  editable?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardType;
  /** Enter(여러 줄이면 Enter만, Shift+Enter는 줄바꿈)로 불린다. 한글 조합 중에는 부르지 않는다. */
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send' | 'default';
  autoFocus?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoComplete?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyPress?: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  className?: string;
  style?: CSSProperties;
  selectionColor?: string;
  cursorColor?: string;
  id?: string;
  name?: string;
  /** RN 전용(무시) */
  textContentType?: string;
  submitBehavior?: string;
  textAlignVertical?: string;
  scrollEnabled?: boolean;
  blurOnSubmit?: boolean;
  numberOfLines?: number;
};

export function TextInput({
  ref,
  value,
  defaultValue,
  onChangeText,
  placeholder,
  placeholderTextColor,
  multiline = false,
  maxLength,
  editable = true,
  secureTextEntry,
  keyboardType = 'default',
  onSubmitEditing,
  returnKeyType,
  autoFocus,
  autoCapitalize,
  autoCorrect,
  autoComplete,
  onFocus,
  onBlur,
  onKeyPress,
  className = '',
  style,
  selectionColor,
  cursorColor,
  id,
  name,
  textContentType: _tc,
  submitBehavior: _sb,
  textAlignVertical: _tav,
  scrollEnabled: _se,
  blurOnSubmit: _bos,
  numberOfLines: _nl,
  ...a11y
}: TextInputProps) {
  void [_tc, _sb, _tav, _se, _bos, _nl];
  const { aria } = splitA11y(a11y);
  const inner = useRef<HTMLTextAreaElement | null>(null);
  // 여러 줄 입력은 글에 맞춰 높이를 늘린다(RN multiline).
  useEffect(() => {
    const el = inner.current;
    if (!multiline || !el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [multiline, value]);
  const common = {
    id,
    name,
    value,
    defaultValue,
    placeholder,
    maxLength,
    readOnly: !editable,
    autoFocus,
    autoCapitalize,
    autoCorrect: autoCorrect === undefined ? undefined : autoCorrect ? 'on' : 'off',
    autoComplete,
    inputMode: INPUT_MODE[keyboardType],
    enterKeyHint: returnKeyType && returnKeyType !== 'default' ? returnKeyType : undefined,
    onFocus,
    onBlur,
    className: `rn-input ${className}`,
    style: {
      ...(placeholderTextColor ? { ['--rn-placeholder' as string]: placeholderTextColor } : null),
      caretColor: cursorColor ?? selectionColor,
      ...style,
    } as CSSProperties,
    onKeyDown: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onKeyPress?.(e);
      if (e.key !== 'Enter' || e.nativeEvent.isComposing || !onSubmitEditing) return;
      if (multiline && e.shiftKey) return;
      e.preventDefault();
      onSubmitEditing();
    },
    ...aria,
  };
  if (multiline) {
    return (
      <textarea
        {...common}
        rows={1}
        ref={(el) => {
          inner.current = el;
          if (typeof ref === 'function') ref(el as HTMLInputElement & HTMLTextAreaElement);
          else if (ref) (ref as { current: unknown }).current = el;
        }}
        onChange={(e) => onChangeText?.(e.target.value)}
        style={{ ...common.style, resize: 'none' }}
      />
    );
  }
  return (
    <input
      {...common}
      ref={ref}
      type={secureTextEntry ? 'password' : keyboardType === 'email-address' ? 'email' : 'text'}
      onChange={(e) => onChangeText?.(e.target.value)}
    />
  );
}
