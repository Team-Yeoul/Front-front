import type { PersonaAxis } from '@/types';

export function PersonaSlider({ axis }: { axis: PersonaAxis }) {
  return (
    <div className="mb-5">
      <p className="text-[12px] font-medium text-gray-500 text-center mb-2">{axis.label}</p>
      <div className="relative h-1.5 rounded-full bg-gray-100">
        <div className="absolute inset-y-0 left-0 rounded-full bg-[#8287FF]" style={{ width: `${axis.value}%` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#8287FF]"
          style={{ left: `${axis.value}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[11px] text-gray-400">{axis.leftLabel}</span>
        <span className="text-[11px] text-gray-400">{axis.rightLabel}</span>
      </div>
    </div>
  );
}
