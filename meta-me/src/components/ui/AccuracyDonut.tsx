/**
 * "나의 문장 정확도" gauge from the v2 completion screen: thick donut where the solid arc is
 * the current accuracy and the lighter arc just before it is today's gain.
 */
export function AccuracyDonut({ percent, delta, size = 220 }: { percent: number; delta: number; size?: number }) {
  const stroke = size * 0.2;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const base = Math.max(0, percent - delta);
  const seg = (from: number, to: number) => ({
    strokeDasharray: `${(Math.max(0, to - from) / 100) * c} ${c}`,
    strokeDashoffset: -(from / 100) * c,
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E6E6F0" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#6367FF" strokeWidth={stroke} {...seg(0, base)} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#A9ABFF" strokeWidth={stroke} {...seg(base, percent)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[12px] text-sub">나의 문장 정확도</p>
        <p className="text-ink leading-none mt-1.5">
          <span className="text-[40px] font-bold">{percent}</span>
          <span className="text-[18px] font-medium text-sub align-top">%</span>
        </p>
        {delta > 0 && <p className="text-[13px] font-semibold text-primary mt-1.5">▲ {delta}%</p>}
      </div>
    </div>
  );
}
