interface DonutSegment {
  label: string;
  value: number;
  /** Overrides the auto-computed arc-fraction percentage shown in the legend. */
  displayValue?: string;
}

const FIXED_COLORS = ['#8287FF', '#e87ba4', '#2a78d6', '#eb6834'];

export function DonutChart({
  segments,
  centerTopLabel,
  centerLabel,
  centerSubLabel,
  colors = FIXED_COLORS,
  total: totalProp,
  size = 120,
  stroke = 16,
  legendPosition = 'side',
}: {
  segments: DonutSegment[];
  centerTopLabel?: string;
  centerLabel?: string;
  centerSubLabel?: string;
  colors?: string[];
  /** Denominator for the arc fractions. Defaults to the sum of segment values (full pie). Pass an explicit total (e.g. 100) to leave the remainder as an empty gray gap. */
  total?: number;
  size?: number;
  stroke?: number;
  /** 'side' (default): legend to the right of the ring. 'below': centered underneath, laid out horizontally. */
  legendPosition?: 'side' | 'below';
}) {
  const SIZE = size;
  const STROKE = stroke;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const total = totalProp ?? (segments.reduce((sum, s) => sum + s.value, 0) || 1);
  const fractions = segments.map((s) => s.value / total);
  const cumulativeStarts = fractions.reduce<{ list: number[]; sum: number }>(
    (acc, f) => ({ list: [...acc.list, acc.sum], sum: acc.sum + f }),
    { list: [], sum: 0 },
  ).list;

  const arcs = segments.map((s, i) => {
    const fraction = fractions[i];
    const dashArray = `${fraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
    const dashOffset = -cumulativeStarts[i] * CIRCUMFERENCE;
    return { ...s, color: colors[i % colors.length], dashArray, dashOffset, fraction };
  });

  const legend = (
    <div className={legendPosition === 'below' ? 'flex items-center justify-center gap-5' : 'flex flex-col gap-2'}>
      {arcs.map((a) => (
        <div key={a.label} className="flex items-center gap-2 text-[12px]">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
          <span className="text-gray-600">{a.label}</span>
          <span className="font-semibold text-gray-900 tabular-nums">
            {a.displayValue ?? `${Math.round(a.fraction * 100)}%`}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className={legendPosition === 'below' ? 'flex flex-col items-center gap-4' : 'flex items-center gap-6'}>
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#e1e0d9" strokeWidth={STROKE} />
          {arcs.map((a) => (
            <circle
              key={a.label}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={a.color}
              strokeWidth={STROKE}
              strokeDasharray={a.dashArray}
              strokeDashoffset={a.dashOffset}
              strokeLinecap={arcs.length > 1 ? 'butt' : 'round'}
            />
          ))}
        </svg>
        {(centerTopLabel || centerLabel || centerSubLabel) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerTopLabel && <span className="text-[12px] text-gray-400 mb-1">{centerTopLabel}</span>}
            {centerLabel && <span className="text-[26px] font-bold text-gray-900 leading-tight">{centerLabel}</span>}
            {centerSubLabel && <span className="text-[12px] font-medium text-gray-400 mt-1">{centerSubLabel}</span>}
          </div>
        )}
      </div>
      {legend}
    </div>
  );
}
