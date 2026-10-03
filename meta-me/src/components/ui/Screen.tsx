'use client';

import type { CSSProperties, ReactNode } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { useStatusBarTheme } from '@/hooks/useStatusBarTheme';
import { PhoneBackdrop } from './PhoneBackdrop';

/**
 * Page shell: scrollable body, optional fixed footer (CTA) and optional bottom tab bar.
 * `statusBg` colors the desktop-preview status bar so it blends into the page top.
 */
export function Screen({
  children,
  footer,
  nav = false,
  bg = '#FFFFFF',
  statusBg,
  statusFg = 'dark',
  indicatorFg = 'dark',
  background,
  bleed = false,
  className = '',
  bodyRef,
  overlay,
}: {
  children: ReactNode;
  footer?: ReactNode;
  nav?: boolean;
  bg?: string;
  statusBg?: string;
  statusFg?: 'light' | 'dark';
  /** Home indicator color (desktop preview only). */
  indicatorFg?: 'light' | 'dark';
  /** Decorative layer rendered behind the content (e.g. <GradientBg />). */
  background?: ReactNode;
  /** true면 background를 상태바·홈 인디케이터 뒤까지 폰 화면 전체에 깐다. (상태바는 투명해진다) */
  bleed?: boolean;
  className?: string;
  bodyRef?: React.Ref<HTMLDivElement>;
  /** Sheets / modals / toasts — rendered outside the scroll body so they cover the viewport. */
  overlay?: ReactNode;
}) {
  useStatusBarTheme(bleed ? 'transparent' : (statusBg ?? bg), statusFg, indicatorFg);
  const style: CSSProperties = { background: bleed ? 'transparent' : bg };

  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={style}>
      {bleed ? <PhoneBackdrop>{background}</PhoneBackdrop> : background}
      <div ref={bodyRef} className={`relative flex-1 overflow-y-auto no-scrollbar ${className}`}>
        {children}
      </div>
      {footer && <div className="relative shrink-0 px-5 pt-2 pb-4">{footer}</div>}
      {nav && <BottomNav />}
      {overlay}
    </div>
  );
}
