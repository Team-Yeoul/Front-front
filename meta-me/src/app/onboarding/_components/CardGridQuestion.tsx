'use client';

import type { ReactNode } from 'react';

export interface CardGridOption {
  id: string;
  label: string;
  icon: ReactNode;
  special?: boolean;
}

export function CardGridQuestion({
  options,
  selected,
  onChange,
  note,
}: {
  options: CardGridOption[];
  selected: string;
  onChange: (id: string) => void;
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const checked = option.id === selected;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`relative flex flex-col justify-between h-[110px] rounded-2xl p-4 text-left transition-colors ${
                checked
                  ? 'bg-[#8287FF] text-white'
                  : option.special
                    ? 'bg-[#FFF8DE] text-gray-600'
                    : 'bg-gray-50 text-gray-500 border border-gray-100'
              }`}
            >
              {checked && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded bg-[#F5D949] flex items-center justify-center">
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4.5L4 7.5L10 1" stroke="#1C1C1E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
              <span className={checked ? 'text-white' : 'text-gray-400'}>{option.icon}</span>
              <span className={`text-[14px] font-semibold leading-snug ${checked ? 'text-white' : 'text-gray-700'}`}>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
      {note && (
        <p className="flex items-start gap-2 text-[12px] text-gray-500 bg-[#FFF8DE] rounded-xl px-3.5 py-3">
          <span className="text-[#E8B800] shrink-0">ⓘ</span>
          {note}
        </p>
      )}
    </div>
  );
}
