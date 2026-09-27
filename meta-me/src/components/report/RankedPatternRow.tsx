export function RankedPatternRow({
  title,
  description,
  count,
  variant = 'primary',
}: {
  title: string;
  description: string;
  count: number;
  variant?: 'primary' | 'secondary';
}) {
  const color = variant === 'primary' ? 'text-[#8287FF]' : 'text-[#c94f80]';

  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-gray-50 last:border-b-0">
      <div className="min-w-0">
        <h4 className="text-[14px] font-semibold text-gray-900 truncate">{title}</h4>
        <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>
      <span className={`text-[12px] font-semibold shrink-0 ${color}`}>{count}회</span>
    </div>
  );
}
