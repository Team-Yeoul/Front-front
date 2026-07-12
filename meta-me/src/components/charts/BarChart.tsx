'use client';

import { useState } from 'react';

interface BarDatum {
  label: string;
  count: number;
  category: 'interest' | 'disinterest';
}

const COLORS = {
  interest: '#8287FF',
  disinterest: '#e87ba4',
} as const;

export function BarChart({ data }: { data: BarDatum[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="w-full">
      <div className="flex items-end gap-2.5 h-[120px]">
        {data.map((d, i) => {
          const heightPct = (d.count / max) * 100;
          const isActive = activeIndex === i;
          return (
            <button
              key={d.label}
              type="button"
              onClick={() => setActiveIndex(isActive ? null : i)}
              className="flex-1 flex flex-col items-center justify-end h-full gap-1 focus:outline-none"
            >
              <span className="text-[11px] font-semibold text-gray-700 tabular-nums">{d.count}</span>
              <div
                className="w-full rounded-t-md transition-opacity"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: COLORS[d.category],
                  opacity: activeIndex === null || isActive ? 1 : 0.45,
                }}
              />
            </button>
          );
        })}
      </div>
      <div className="flex gap-2.5 mt-1.5">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-[10px] text-gray-400 text-center truncate">
            {d.label}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-3">
        <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.interest }} />
          흥미
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.disinterest }} />
          무흥미
        </span>
      </div>
    </div>
  );
}
