'use client';

import { Children, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { Spinner, EASE_OUT } from './primitives';
import { useTheme } from '@/lib/theme';
import { Text } from './Text';
import { Pressable, View } from './rn';

/* ── 순서대로 나타나기 ─────────────────────────────────── */

/** 한 줄이 나타나는 간격(ms)과 길이 */
const STAGGER_STEP = 70;
const STAGGER_DURATION = 360;

/** 한 줄: 아래에서 8px 올라오며 나타난다(Ease out). */
function StaggerLine({ index, delay, children }: { index: number; delay: number; children: ReactNode }) {
  return (
    <View style={{ animation: `stagger-in ${STAGGER_DURATION}ms ${EASE_OUT} ${delay + index * STAGGER_STEP}ms both` }}>{children}</View>
  );
}

/**
 * 제목·설명을 한 줄씩 순서대로 보여 준다. 자식마다 아래에서 살짝 올라오며 나타난다.
 * delay로 시작을 늦추면 앞서 나온 다른 묶음 뒤에 이어 붙일 수 있다.
 */
export function Stagger({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <>
      {Children.toArray(children).map((child, i) => (
        <StaggerLine key={i} index={i} delay={delay}>
          {child}
        </StaggerLine>
      ))}
    </>
  );
}

/** 줄바꿈(\n)으로 나뉜 글을 줄마다 따로 순서대로 보여 준다. 화면 낭독기는 한 번에 읽도록 묶는다. */
export function StaggerText({
  text,
  className = '',
  style,
  delay = 0,
  header = false,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  header?: boolean;
}) {
  const lines = text.split('\n');
  return (
    // 가운데 정렬 글이면 줄마다 가운데에 놓는다.
    <View
      accessibilityRole={header ? 'header' : undefined}
      accessibilityLabel={text.replace(/\n/g, ' ')}
      className={className.includes('text-center') ? 'items-center' : ''}
    >
      {lines.map((line, i) => (
        <StaggerLine key={i} index={i} delay={delay}>
          <Text aria-hidden className={className} style={style}>
            {line}
          </Text>
        </StaggerLine>
      ))}
    </View>
  );
}

/** 로딩 자리 블록 (16a~16c): 은은하게 깜박이는 회색 블록. onSurface면 회색 카드 위에 놓는 흰 블록. */
export function Skeleton({ className = '', style, onSurface = false }: { className?: string; style?: CSSProperties; onSurface?: boolean }) {
  // 모서리를 따로 주면(rounded-full 등) 기본 모서리를 빼서 겹치지 않게 한다.
  const radius = /\brounded(-|\b)/.test(className) ? '' : 'rounded-lg';
  return (
    <View
      className={`${radius} ${onSurface ? 'bg-page dark:bg-line' : 'bg-[#EEEEF2] dark:bg-surface-2'} ${className}`}
      style={{ animation: 'skeleton-pulse 900ms ease-in-out infinite alternate', ...style }}
    />
  );
}

/** 지금 인터넷에 연결돼 있는지. 브라우저 online/offline 이벤트를 따른다. */
const subscribeOnline = (cb: () => void) => {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
};
export function useOnline() {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
}

/* ── 안내 그림 (회색 입체 톤) ─────────────────────────────── */

/** 오류: 공사 콘 */
export function ConeIllust({ size = 112 }: { size?: number }) {
  const { isDark } = useTheme();
  const [a, b, c] = isDark ? ['#6E6D82', '#4B4A5C', '#8A8A98'] : ['#D4D4DC', '#B4B4BE', '#F4F4F7'];
  return (
    <svg width={size} height={size} viewBox="0 0 112 112" className="shrink-0">
      <defs>
        <linearGradient id="cone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={b} />
          <stop offset="0.45" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <path d="M50 14c2.6-6 9.4-6 12 0l26 76H24L50 14Z" fill="url(#cone)" />
      <path d="M44.6 31h22.8l4.4 13H40.2l4.4-13Z M36.8 54h38.4l4.4 13H32.4l4.4-13Z" fill={c} opacity={0.85} />
      <path d="M16 90c0-3.3 2.7-6 6-6h68c3.3 0 6 2.7 6 6v4c0 2.2-1.8 4-4 4H20c-2.2 0-4-1.8-4-4v-4Z" fill="url(#base)" />
    </svg>
  );
}

/** 오프라인: 끊긴 와이파이 */
function OfflineIllust({ size = 112 }: { size?: number }) {
  const { isDark } = useTheme();
  const g = isDark ? '#6E6D82' : '#B4B4BE';
  return (
    <svg width={size} height={size} viewBox="0 0 112 112" fill="none" className="shrink-0">
      <path d="M18 46a54 54 0 0 1 76 0M30 60a37 37 0 0 1 52 0M42 74a20 20 0 0 1 28 0" stroke={g} strokeWidth={9} strokeLinecap="round" />
      <circle cx={56} cy={88} r={7} fill={g} />
      <path d="M24 24l64 64" stroke="#E5484D" strokeWidth={8} strokeLinecap="round" />
    </svg>
  );
}

/** 비어 있음(알림): 종 + 빨간 X */
export function BellOffIllust({ size = 96 }: { size?: number }) {
  const { isDark } = useTheme();
  const [a, b] = isDark ? ['#8A8A98', '#55546A'] : ['#C9CAD3', '#9A9BA8'];
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" className="shrink-0">
      <defs>
        <linearGradient id="bell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <circle cx={44} cy={14} r={5} fill={b} />
      <path d="M44 16c-15 0-24 11-24 26v16l-6 8c-1.5 2 0 4 2.5 4h55c2.5 0 4-2 2.5-4l-6-8V42c0-15-9-26-24-26Z" fill="url(#bell)" />
      <path d="M35 74h18a9 9 0 0 1-18 0Z" fill={b} />
      <circle cx={70} cy={20} r={13} fill="#F2555A" />
      <path d="M65 15l10 10M75 15 65 25" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

/** 비어 있음(혜택): 선물 상자 */
export function GiftIllust({ size = 96 }: { size?: number }) {
  const { isDark } = useTheme();
  const [a, b] = isDark ? ['#8A8A98', '#55546A'] : ['#C9CAD3', '#9A9BA8'];
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" className="shrink-0">
      <defs>
        <linearGradient id="gift" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <path d="M20 44h56v32a6 6 0 0 1-6 6H26a6 6 0 0 1-6-6V44Z" fill="url(#gift)" />
      <path d="M14 34a4 4 0 0 1 4-4h60a4 4 0 0 1 4 4v8a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2v-8Z" fill={a} />
      <path d="M43 30h10v52H43z" fill="#F2555A" opacity={0.9} />
      <path d="M48 30c-6-12-20-12-18-3 1 5 10 4 18 3Zm0 0c6-12 20-12 18-3-1 5-10 4-18 3Z" fill="#F2555A" />
    </svg>
  );
}

/** 비어 있음 안내: 그림 + 회색 두 줄 (알림·혜택 등) */
export function EmptyView({ illust, text, className = 'py-24' }: { illust: ReactNode; text: string; className?: string }) {
  return (
    <View className={`items-center px-8 ${className}`}>
      {illust}
      <View className="mt-4 items-center">
        <StaggerText text={text} delay={80} className="text-[16px] font-semibold text-text-4 text-center leading-[26px]" />
      </View>
    </View>
  );
}

/**
 * 오프라인 (15a) · 오류 (15b) 안내. 회색 그림 · 굵은 제목 · 회색 두 줄 설명 · 검은 알약 '다시 시도' 버튼.
 * 화면 전체를 대신할 때도, 카드 안 한 구역을 대신할 때도(compact) 같은 모양으로 쓴다.
 */
export function StatusView({
  kind,
  title,
  sub,
  onRetry,
  retrying = false,
  compact = false,
  className = 'py-24',
}: {
  kind: 'offline' | 'error';
  title?: string;
  sub?: string;
  onRetry?: () => void;
  retrying?: boolean;
  /** 카드 안처럼 좁은 자리: 그림을 작게 */
  compact?: boolean;
  className?: string;
}) {
  const offline = kind === 'offline';
  const size = compact ? 72 : 112;
  return (
    <View accessibilityRole="alert" className={`items-center px-8 ${className}`}>
      {offline ? <OfflineIllust size={size} /> : <ConeIllust size={size} />}
      {/* 제목 다음에 설명이 줄마다 이어서 나타난다. */}
      <View className="mt-5 items-center">
        <StaggerText
          header
          text={title ?? (offline ? '인터넷 연결이 끊겼어요' : '서비스 이용이 원활하지 않아요')}
          className={`${compact ? 'text-[16px]' : 'text-[20px]'} font-bold text-ink text-center`}
        />
      </View>
      <View className="mt-2 items-center">
        <StaggerText
          delay={STAGGER_STEP}
          text={sub ?? (offline ? '연결을 확인한 뒤\n다시 시도해 주세요.' : '불편을 드려 죄송해요.\n잠시 후에 다시 시도해 주세요.')}
          className={`${compact ? 'text-[14px] leading-[22px]' : 'text-[16px] leading-[26px]'} text-mute text-center`}
        />
      </View>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          disabled={retrying}
          accessibilityRole="button"
          accessibilityLabel={retrying ? '다시 불러오는 중' : '다시 시도'}
          className={`${compact ? 'mt-5 h-11 min-w-[112px] px-6' : 'mt-7 h-[52px] min-w-[136px] px-7'} rounded-full bg-ink items-center justify-center active:opacity-80`}
        >
          {retrying ? <RetrySpinner /> : <Text className="text-[16px] font-semibold text-page">다시 시도</Text>}
        </Pressable>
      )}
    </View>
  );
}

/** 다시 시도 중: 버튼 글자색(text-page)과 같은 색으로 일정한 속도로 도는 로딩 원 */
function RetrySpinner() {
  const { isDark } = useTheme();
  return <Spinner color={isDark ? '#1C1B24' : '#FFFFFF'} label="다시 불러오는 중" />;
}
