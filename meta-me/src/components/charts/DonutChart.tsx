interface DonutSegment {
  label: string;
  value: number;
}

const FIXED_COLORS = ['#8287FF', '#e87ba4', '#2a78d6', '#eb6834'];

const SIZE = 120;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function DonutChart({ segments }: { segments: DonutSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const fractions = segments.map((s) => s.value / total);
  const cumulativeStarts = fractions.reduce<{ list: number[]; sum: number }>(
    (acc, f) => ({ list: [...acc.list, acc.sum], sum: acc.sum + f }),
    { list: [], sum: 0 },
  ).list;

  const arcs = segments.map((s, i) => {
    const fraction = fractions[i];
    const dashArray = `${fraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
    const dashOffset = -cumulativeStarts[i] * CIRCUMFERENCE;
    return { ...s, color: FIXED_COLORS[i % FIXED_COLORS.length], dashArray, dashOffset, fraction };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0 -rotate-90">
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
      <div className="flex flex-col gap-2">
        {arcs.map((a) => (
          <div key={a.label} className="flex items-center gap-2 text-[12px]">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
            <span className="text-gray-600">{a.label}</span>
            <span className="font-semibold text-gray-900 tabular-nums">
              {Math.round(a.fraction * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
