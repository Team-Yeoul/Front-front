interface AccuracyPoint {
  label: string;
  value: number;
}

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
  const lineColor = variant === 'onPurple' ? 'rgba(255,255,255,0.55)' : '#B8BBF5';
  const dotFill = variant === 'onPurple' ? '#FFFFFF' : '#8287FF';

  const points = data.map((d, i) => ({
    x: ((i + 0.5) / data.length) * 100,
    y: 100 - (d.value / max) * 100,
    isLast: i === lastIndex,
  }));
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="w-full">
      <div className="relative">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polyline
            points={polylinePoints}
            fill="none"
            stroke={lineColor}
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={p.isLast ? 2.6 : 1.8}
              fill={p.isLast ? dotFill : lineColor}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <div className="relative flex items-end gap-3 h-[76px]">
          {data.map((d, i) => (
            <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
              {showValues && <span className={`text-[11px] font-semibold tabular-nums ${valueColor}`}>{d.value}%</span>}
              <div
                className="w-full max-w-[34px] rounded-full"
                style={{ height: `${(d.value / max) * 100}%`, backgroundColor: barColor(i) }}
              />
            </div>
          ))}
        </div>
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
