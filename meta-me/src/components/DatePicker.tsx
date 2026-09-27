'use client';

import { useState } from 'react';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseValue(value: string) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m, day: d };
}

export function DatePicker({
  value,
  onChange,
  placeholder = '생년월일을 선택해 주세요',
  maxYear,
  minYear = maxYear ? maxYear - 100 : new Date().getFullYear() - 100,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxYear?: number;
  minYear?: number;
}) {
  const parsed = parseValue(value);
  const today = new Date();
  const effectiveMaxYear = maxYear ?? today.getFullYear();
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState({
    year: parsed?.year ?? effectiveMaxYear - 20,
    month: parsed?.month ?? today.getMonth() + 1,
  });

  const years = Array.from({ length: effectiveMaxYear - minYear + 1 }, (_, i) => effectiveMaxYear - i);
  const daysInMonth = new Date(cursor.year, cursor.month, 0).getDate();
  const firstWeekday = new Date(cursor.year, cursor.month - 1, 1).getDay();
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const displayLabel = parsed ? `${parsed.year}. ${String(parsed.month).padStart(2, '0')}. ${String(parsed.day).padStart(2, '0')}.` : '';

  const selectDay = (day: number) => {
    onChange(toDateString(cursor.year, cursor.month, day));
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex-1 text-left text-[15px] bg-transparent outline-none"
      >
        <span className={displayLabel ? 'text-gray-900' : 'text-gray-300'}>{displayLabel || placeholder}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div onClick={() => setOpen(false)} className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-[520px] bg-white rounded-t-3xl overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <h2 className="text-[16px] font-bold text-gray-900">생년월일 선택</h2>
              <button onClick={() => setOpen(false)} className="-mr-2 p-2" aria-label="닫기">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2 px-5 pt-4 pb-2">
              <div className="relative flex-1">
                <select
                  value={cursor.year}
                  onChange={(e) => setCursor((c) => ({ ...c, year: Number(e.target.value) }))}
                  className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[14px] font-semibold text-gray-900 outline-none appearance-none"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}년
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1">
                <select
                  value={cursor.month}
                  onChange={(e) => setCursor((c) => ({ ...c, month: Number(e.target.value) }))}
                  className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[14px] font-semibold text-gray-900 outline-none appearance-none"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {m}월
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-5 pb-6 pt-2">
              <div className="grid grid-cols-7 gap-y-2">
                {WEEKDAYS.map((w, i) => (
                  <span
                    key={w}
                    className={`text-[12px] text-center font-medium py-1 ${i === 0 ? 'text-[#c94f80]' : 'text-gray-400'}`}
                  >
                    {w}
                  </span>
                ))}
                {cells.map((day, i) => {
                  if (day === null) return <span key={`empty-${i}`} />;
                  const isSelected = parsed?.year === cursor.year && parsed.month === cursor.month && parsed.day === day;
                  return (
                    <div key={day} className="flex items-center justify-center py-0.5">
                      <button
                        type="button"
                        onClick={() => selectDay(day)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] transition-colors ${
                          isSelected ? 'bg-[#8287FF] text-white font-semibold' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {day}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
