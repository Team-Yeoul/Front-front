'use client';

import { useRef, type KeyboardEvent, type PointerEvent } from 'react';

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

  const setFromX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect?.width) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const next = Math.round((min + ratio * (max - min)) / step) * step;
    if (next !== value) onChange(next);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(Math.min(max, value + step));
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(Math.max(min, value - step));
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      onKeyDown={onKey}
      // 끄는 동안 손가락·마우스를 놓치지 않게 포인터를 붙잡는다. 좌우로 끄는 동안 스크롤되지 않게 touch-action을 막는다.
      onPointerDown={(e: PointerEvent<HTMLDivElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setFromX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) setFromX(e.clientX);
      }}
      className="rn-view h-10 justify-center touch-none select-none cursor-pointer outline-none"
    >
      <div className="absolute left-0 right-0 h-2 rounded-full bg-[#E9EAF0] dark:bg-line" />
      <div className="absolute left-0 h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      <div
        className="absolute w-[62px] h-10 rounded-full bg-page dark:bg-track flex flex-row items-center justify-center gap-2.5 pointer-events-none"
        style={{ left: `${pct}%`, transform: 'translateX(-31px)', boxShadow: '0 2px 10px rgba(26,26,30,0.15)' }}
      >
        <svg width={10} height={10} viewBox="0 0 24 24" fill="none">
          <path d="M15 5l-7 7 7 7" stroke="#6367FF" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg width={10} height={10} viewBox="0 0 24 24" fill="none">
          <path d="M9 5l7 7-7 7" stroke="#6367FF" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
