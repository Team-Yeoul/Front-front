'use client';

export interface ListChoiceOption {
  id: string;
  label: string;
  description: string;
}

export function ListChoiceQuestion({
  options,
  selected,
  onChange,
}: {
  options: ListChoiceOption[];
  selected: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => {
        const checked = option.id === selected;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`w-full text-left rounded-2xl border px-4 py-3.5 transition-colors ${
              checked ? 'border-[#8287FF] bg-[#8287FF]/5' : 'border-gray-100 bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 border-2 ${
                  checked ? 'border-[#8287FF]' : 'border-gray-300'
                }`}
              >
                {checked && <span className="w-2.5 h-2.5 rounded-full bg-[#8287FF]" />}
              </span>
              <span className="text-[14px] font-semibold text-gray-900">{option.label}</span>
            </div>
            <p className="text-[12px] text-gray-500 leading-relaxed pl-[26px]">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}
