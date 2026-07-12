import type { DateTag } from '@/types';

const VARIANT_CLASSES = {
  neutral: 'bg-gray-100 text-gray-500',
  primary: 'bg-[#8287FF]/10 text-[#8287FF]',
  secondary: 'bg-[#e87ba4]/15 text-[#c94f80]',
} as const;

export function Chip({
  tag,
  variant = 'neutral',
}: {
  tag: DateTag;
  variant?: keyof typeof VARIANT_CLASSES;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full mr-1.5 mb-1.5 ${VARIANT_CLASSES[variant]}`}
    >
      <span className="font-medium">{tag.date}</span>
      <span>{tag.label}</span>
    </span>
  );
}
