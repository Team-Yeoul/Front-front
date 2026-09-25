'use client';

export interface ScaleOption {
  label: string;
  description: string;
}

export function ScaleQuestion({
  options,
  selected,
  onChange,
}: {
  options: ScaleOption[];
  selected: number | null;
  onChange: (index: number) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 h-[2px] bg-gray-200 top-1/2 -translate-y-1/2" />
          {selected !== null && (
            <div
              className="absolute left-0 h-[2px] bg-[#8287FF] top-1/2 -translate-y-1/2 transition-all"
              style={{ width: `${(selected / (options.length - 1)) * 100}%` }}
            />
          )}
          {options.map((option, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => onChange(i)}
                className={`relative z-10 rounded-full transition-all ${
                  isSelected ? 'w-6 h-6 bg-[#8287FF]' : 'w-3.5 h-3.5 bg-white border-2 border-gray-300'
                }`}
                aria-label={option.label}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-3">
          {options.map((option, i) => (
            <span
              key={option.label}
              className={`text-[11px] text-center leading-snug w-[18%] ${
                selected === i ? 'text-[#8287FF] font-semibold' : 'text-gray-400'
              }`}
            >
              {option.label}
            </span>
          ))}
        </div>
      </div>

      {selected !== null && (
        <div className="bg-gray-50 rounded-2xl px-4 py-4">
          <p className="text-[12px] text-[#8287FF] font-semibold mb-1.5">지금 고른 답</p>
          <p className="text-[15px] font-bold text-gray-900 mb-1.5">{options[selected].label}</p>
          <p className="text-[13px] text-gray-500 leading-relaxed">{options[selected].description}</p>
        </div>
      )}
    </div>
  );
}
