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

  return (
    <div className="w-full">
      <div className="flex items-end gap-3 h-[110px]">
        {data.map((d, i) => (
          <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
            {showValues && <span className={`text-[12px] font-semibold tabular-nums ${valueColor}`}>{d.value}%</span>}
            <div
              className="w-full rounded-t-lg"
              style={{ height: `${(d.value / max) * 100}%`, backgroundColor: barColor(i) }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-2">
        {data.map((d) => (
          <span key={d.label} className={`flex-1 text-[11px] text-center ${axisColor}`}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
