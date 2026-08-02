'use client';

import { useState } from 'react';

interface LineChartProps {
  data: { label: string; value: number }[];
  color?: string;
}

const WIDTH = 320;
const HEIGHT = 140;
const PAD_X = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

export function LineChart({ data, color = '#8287FF' }: LineChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return <div className="w-full h-[140px]" />;
  }

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const plotWidth = WIDTH - PAD_X * 2;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const points = data.map((d, i) => {
    const x = PAD_X + (plotWidth * i) / (data.length - 1 || 1);
    const y = PAD_TOP + plotHeight - ((d.value - min) / range) * plotHeight;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${PAD_TOP + plotHeight} L${points[0].x},${PAD_TOP + plotHeight} Z`;

  const handleMove = (clientX: number, rect: DOMRect) => {
    const relativeX = ((clientX - rect.left) / rect.width) * WIDTH;
    let closest = 0;
    let closestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relativeX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  };

  const active = activeIndex !== null ? points[activeIndex] : null;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto touch-none"
        onMouseMove={(e) => handleMove(e.clientX, e.currentTarget.getBoundingClientRect())}
        onMouseLeave={() => setActiveIndex(null)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
        onTouchEnd={() => setActiveIndex(null)}
      >
        <defs>
          <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        <line
          x1={PAD_X}
          y1={PAD_TOP + plotHeight}
          x2={WIDTH - PAD_X}
          y2={PAD_TOP + plotHeight}
          stroke="#e1e0d9"
        />

        <path d={areaPath} fill="url(#lineArea)" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={activeIndex === i ? 5 : 3}
            fill="white"
            stroke={color}
            strokeWidth="2"
          />
        ))}

        {activeIndex !== null && (
          <line
            x1={points[activeIndex].x}
            y1={PAD_TOP}
            x2={points[activeIndex].x}
            y2={PAD_TOP + plotHeight}
            stroke={color}
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.5"
          />
        )}

        {points.map((p, i) => (
          <text key={i} x={p.x} y={HEIGHT - 6} fontSize="9" fill="#898781" textAnchor="middle">
            {p.label}
          </text>
        ))}
      </svg>

      {active && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full bg-gray-900 text-white text-[11px] font-medium px-2 py-1 rounded-md pointer-events-none whitespace-nowrap"
          style={{ left: `${(active.x / WIDTH) * 100}%`, top: `${(active.y / HEIGHT) * 100 - 4}%` }}
        >
          {active.label} · {active.value}
        </div>
      )}
    </div>
  );
}
