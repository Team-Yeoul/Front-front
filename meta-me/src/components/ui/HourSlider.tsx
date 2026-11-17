'use client';

import { useRef } from 'react';

/** Track + pill thumb (‹ ›) slider used for alarm time and "혼자 있는 시간". */
export function HourSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pct = ((value - min) / (max - min)) * 100;

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + ratio * (max - min);
    onChange(Math.round(raw / step) * step);
  };

  return (
    <div
      ref={trackRef}
      className="relative h-11 flex items-center touch-none cursor-pointer select-none"
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons) setFromClientX(e.clientX);
      }}
    >
      <div className="absolute inset-x-0 h-2 rounded-full bg-[#E9EAF0]" />
      <div className="absolute left-0 h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      <span className="absolute left-1 w-1 h-1 rounded-full bg-white/80" />
      <div
        className="absolute -translate-x-1/2 w-16 h-11 rounded-full bg-white border border-[#E4E4EC] shadow-[0_4px_12px_rgba(30,30,60,0.12)] flex items-center justify-center gap-2.5"
        style={{ left: `${pct}%` }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M15 5l-7 7 7 7" stroke="#6367FF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 5l7 7-7 7" stroke="#6367FF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
