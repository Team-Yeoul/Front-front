'use client';

import type { CSSProperties, ReactNode } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { useStatusBarTheme } from '@/hooks/useStatusBarTheme';

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
  background,
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
  /** Decorative layer rendered behind the content (e.g. <GradientBg />). */
  background?: ReactNode;
  className?: string;
  bodyRef?: React.Ref<HTMLDivElement>;
  /** Sheets / modals / toasts — rendered outside the scroll body so they cover the viewport. */
  overlay?: ReactNode;
}) {
  useStatusBarTheme(statusBg ?? bg, statusFg);
  const style: CSSProperties = { background: bg };

  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={style}>
      {background}
      <div ref={bodyRef} className={`relative flex-1 overflow-y-auto no-scrollbar ${className}`}>
        {children}
      </div>
      {footer && <div className="relative shrink-0 px-5 pt-2 pb-4">{footer}</div>}
      {nav && <BottomNav />}
      {overlay}
    </div>
  );
}
