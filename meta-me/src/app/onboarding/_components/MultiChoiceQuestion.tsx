'use client';

export interface MultiChoiceOption {
  id: string;
  label: string;
  special?: boolean;
}

export function MultiChoiceQuestion({
  options,
  max,
  selected,
  onChange,
}: {
  options: MultiChoiceOption[];
  max: number;
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const specialId = options.find((o) => o.special)?.id;

  const toggle = (id: string) => {
    const isSpecial = id === specialId;
    if (isSpecial) {
      onChange(selected.includes(id) ? [] : [id]);
      return;
    }
    const withoutSpecial = selected.filter((s) => s !== specialId);
    if (withoutSpecial.includes(id)) {
      onChange(withoutSpecial.filter((s) => s !== id));
      return;
    }
    if (withoutSpecial.length >= max) return;
    onChange([...withoutSpecial, id]);
  };

  const normalCount = selected.filter((s) => s !== specialId).length;

  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => {
        const checked = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => toggle(option.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-colors ${
              checked
                ? option.special
                  ? 'border-[#F5D949] bg-[#FFF8DE]'
                  : 'border-[#8287FF] bg-[#8287FF]/5'
                : 'border-gray-100 bg-gray-50'
            }`}
          >
            <span
              className={`w-[18px] h-[18px] rounded-md flex items-center justify-center shrink-0 border-2 ${
                checked ? 'bg-[#8287FF] border-[#8287FF]' : 'border-gray-300 bg-white'
              }`}
            >
              {checked && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="text-[14px] text-gray-800">{option.label}</span>
          </button>
        );
      })}

      {!selected.includes(specialId ?? '') && (
        <p className="text-[12px] text-gray-400 text-center mt-1">
          <span className="text-[#8287FF] font-semibold">{normalCount}</span> / {max} 하나 더 고를 수 있어요
        </p>
      )}
    </div>
  );
}
