'use client';

import { useEffect, useRef, useState } from 'react';

interface AccuracyPoint {
  label: string;
  value: number;
}

const HEIGHT = 76;

export function WeeklyAccuracyBars({
  data,
  variant = 'onWhite',
  showValues = true,
}: {
  data: AccuracyPoint[];
  variant?: 'onWhite' | 'onPurple';
  showValues?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const lastIndex = data.length - 1;

  const barColor = (i: number) => {
    if (i === lastIndex) return '#F5D949';
    return variant === 'onPurple' ? 'rgba(255,255,255,0.4)' : '#C9CBFF';
  };
  const valueColor = variant === 'onPurple' ? 'text-white' : 'text-gray-900';
  const axisColor = variant === 'onPurple' ? 'text-white/70' : 'text-gray-400';
  const lineColor = variant === 'onPurple' ? 'rgba(255,255,255,0.6)' : '#8287FF';
  const dotFill = variant === 'onPurple' ? '#FFFFFF' : '#8287FF';

  const containerRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [geometry, setGeometry] = useState<{ width: number; points: { x: number; y: number }[] }>({
    width: 0,
    points: [],
  });

  useEffect(() => {
    const measure = () => {
      const containerEl = containerRef.current;
      if (!containerEl) return;
      const containerRect = containerEl.getBoundingClientRect();
      const points = barRefs.current.map((el) => {
        if (!el) return { x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - containerRect.left, y: r.top - containerRect.top };
      });
      setGeometry({ width: containerRect.width, points });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [data, showValues]);

  const linePath = geometry.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <div className="w-full">
      <div ref={containerRef} className="relative flex items-end gap-3" style={{ height: HEIGHT }}>
        {geometry.width > 0 && (
          <svg
            className="absolute inset-0 pointer-events-none overflow-visible"
            width={geometry.width}
            height={HEIGHT}
          >
            <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {geometry.points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={i === lastIndex ? 4 : 3} fill={dotFill} />
            ))}
          </svg>
        )}
        {data.map((d, i) => (
          <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
            {showValues && <span className={`text-[11px] font-semibold tabular-nums ${valueColor}`}>{d.value}%</span>}
            <div
              ref={(el) => {
                barRefs.current[i] = el;
              }}
              className="w-full max-w-[34px] rounded-t-md"
              style={{ height: `${(d.value / max) * 100}%`, backgroundColor: barColor(i) }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-2">
        {data.map((d, i) => (
          <span
            key={d.label}
            className={`flex-1 text-[11px] text-center ${i === lastIndex ? (variant === 'onPurple' ? 'text-white font-semibold' : 'text-gray-900 font-semibold') : axisColor}`}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
