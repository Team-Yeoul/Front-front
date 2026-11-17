'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from './primitives';

/**
 * 폰 화면(#phone-screen) 전체에 띄운다. 데스크톱 미리보기의 상태바·홈 인디케이터까지 함께 덮어서
 * 어두운 배경이 상태바 아래에서 잘려 보이지 않게 한다. (#phone-screen이 없으면 제자리에 그린다)
 */
export function PhoneOverlay({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setTarget(document.getElementById('phone-screen')), []);
  return target ? createPortal(children, target) : <>{children}</>;
}

/** Bottom sheet over a dimmed backdrop. Positioned against the nearest `relative` Screen. */
export function Sheet({
  open,
  onClose,
  children,
  title,
  sub,
  closeButton = false,
  height,
  className = '',
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  sub?: ReactNode;
  closeButton?: boolean;
  /** e.g. '75%' — omit to size to content. */
  height?: string;
  className?: string;
}) {
  if (!open) return null;
  return (
    <PhoneOverlay>
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} aria-label="닫기" />
      <div
        // className에 배경·모서리가 있으면 기본값 대신 그것을 쓴다.
        className={`relative flex flex-col animate-sheet-up ${/\bbg-/.test(className) ? '' : 'bg-white'} ${/\brounded-t-/.test(className) ? '' : 'rounded-t-[28px]'} ${className}`}
        style={height ? { height } : undefined}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <span className="w-10 h-1 rounded-full bg-[#DCDCE4]" />
        </div>
        {(title || closeButton) && (
          <div className="flex items-start justify-between px-5 pt-3 shrink-0">
            <div>
              {title && <h2 className="text-[18px] font-bold text-ink leading-snug">{title}</h2>}
              {sub && <div className="mt-1">{sub}</div>}
            </div>
            {closeButton && (
              <button onClick={onClose} className="w-9 h-9 -mr-1 flex items-center justify-center" aria-label="닫기">
                <CloseIcon />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
    </PhoneOverlay>
  );
}

/** Centered dialog card. */
export function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-12">
      <button className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} aria-label="닫기" />
      <div className="relative w-full bg-white rounded-[28px] px-5 pt-6 pb-5 animate-pop-in">{children}</div>
    </div>
  );
}

/** Soft lavender/yellow blob background from the v2 intro/cogni screens. */
export function GradientBg({ variant = 'a' }: { variant?: 'a' | 'b' | 'c' }) {
  const layers = {
    a: [
      'radial-gradient(60% 40% at 15% 5%, rgba(160,164,255,0.75) 0%, rgba(160,164,255,0) 70%)',
      'radial-gradient(55% 35% at 95% 18%, rgba(255,226,140,0.85) 0%, rgba(255,226,140,0) 70%)',
      'radial-gradient(70% 40% at 70% 65%, rgba(190,193,255,0.6) 0%, rgba(190,193,255,0) 70%)',
    ],
    b: [
      'radial-gradient(55% 35% at 5% 25%, rgba(150,155,255,0.75) 0%, rgba(150,155,255,0) 70%)',
      'radial-gradient(50% 30% at 90% 5%, rgba(255,226,140,0.85) 0%, rgba(255,226,140,0) 70%)',
      'radial-gradient(60% 35% at 85% 65%, rgba(190,193,255,0.65) 0%, rgba(190,193,255,0) 70%)',
    ],
    c: [
      'radial-gradient(60% 45% at 5% 10%, rgba(255,226,140,0.9) 0%, rgba(255,226,140,0) 70%)',
      'radial-gradient(50% 35% at 100% 28%, rgba(150,155,255,0.7) 0%, rgba(150,155,255,0) 70%)',
      'radial-gradient(60% 40% at 40% 75%, rgba(255,236,170,0.6) 0%, rgba(255,236,170,0) 70%)',
      'radial-gradient(60% 30% at 90% 100%, rgba(190,193,255,0.6) 0%, rgba(190,193,255,0) 70%)',
    ],
  }[variant];
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ backgroundImage: layers.join(','), backgroundColor: '#FBFBFF' }}
    />
  );
}
