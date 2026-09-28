interface RadarSeries {
  label: string;
  color: string;
  values: number[];
}

const SIZE = 170;
const CENTER = SIZE / 2;
const RADIUS = 46;
const LABEL_FRACTION = 1.32;
const RINGS = [1 / 3, 2 / 3, 1];

function pointOn(axisIndex: number, axisCount: number, fraction: number) {
  const angle = -Math.PI / 2 + (axisIndex * 2 * Math.PI) / axisCount;
  return {
    x: CENTER + Math.cos(angle) * RADIUS * fraction,
    y: CENTER + Math.sin(angle) * RADIUS * fraction,
  };
}

function polygonPoints(axisCount: number, fraction: number) {
  return Array.from({ length: axisCount }, (_, i) => pointOn(i, axisCount, fraction))
    .map((p) => `${p.x},${p.y}`)
    .join(' ');
}

function SingleRadar({ labels, series }: { labels: string[]; series: RadarSeries }) {
  const axisCount = labels.length;

  return (
    <div className="flex-1 flex flex-col items-center gap-3">
      <span className="flex items-center gap-1.5 text-[12px] text-gray-600">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: series.color }} />
        {series.label}
      </span>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {RINGS.map((r) => (
          <polygon key={r} points={polygonPoints(axisCount, r)} fill="none" stroke="#EDEDED" strokeWidth={1} />
        ))}
        {labels.map((_, i) => {
          const p = pointOn(i, axisCount, 1);
          return <line key={i} x1={CENTER} y1={CENTER} x2={p.x} y2={p.y} stroke="#EDEDED" strokeWidth={1} />;
        })}

        <polygon
          points={series.values
            .map((v, i) => pointOn(i, axisCount, Math.max(0, Math.min(100, v)) / 100))
            .map((p) => `${p.x},${p.y}`)
            .join(' ')}
          fill={series.color}
          fillOpacity={0.18}
          stroke={series.color}
          strokeWidth={2}
        />

        {labels.map((label, i) => {
          const p = pointOn(i, axisCount, LABEL_FRACTION);
          const anchor = Math.abs(p.x - CENTER) < 4 ? 'middle' : p.x > CENTER ? 'start' : 'end';
          return (
            <text key={label} x={p.x} y={p.y} fontSize="10" fill="#6B7280" textAnchor={anchor} dominantBaseline="middle">
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export function RadarChart({ labels, series }: { labels: string[]; series: [RadarSeries, RadarSeries] }) {
  return (
    <div className="flex items-start gap-2">
      {series.map((s) => (
        <SingleRadar key={s.label} labels={labels} series={s} />
      ))}
    </div>
  );
}
