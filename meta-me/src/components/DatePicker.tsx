'use client';

import { useEffect, useRef, useState } from 'react';

const ITEM_HEIGHT = 40;
const VISIBLE_ROWS = 5;
const PAD_ROWS = Math.floor(VISIBLE_ROWS / 2);

function parseValue(value: string) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m, day: d };
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function WheelColumn({
  items,
  selected,
  onChange,
  unit,
}: {
  items: number[];
  selected: number;
  onChange: (value: number) => void;
  unit: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || scrollingRef.current) return;
    const index = items.indexOf(selected);
    if (index >= 0) el.scrollTop = index * ITEM_HEIGHT;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const timerRef = useRef<number | undefined>(undefined);

  const handleScroll = () => {
    scrollingRef.current = true;
    const el = ref.current;
    if (!el) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const index = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      if (el.scrollTop !== clamped * ITEM_HEIGHT) el.scrollTop = clamped * ITEM_HEIGHT;
      scrollingRef.current = false;
      const value = items[clamped];
      if (value !== undefined && value !== selected) onChange(value);
    }, 120);
  };

  return (
    <div className="relative flex-1">
      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-[200px] overflow-y-auto snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingBlock: PAD_ROWS * ITEM_HEIGHT }}
      >
        {items.map((n) => (
          <div
            key={n}
            className="h-10 flex items-center justify-center snap-center text-[16px]"
            style={{ color: n === selected ? '#111827' : '#C7CBD4', fontWeight: n === selected ? 700 : 400 }}
          >
            {n}
            {unit}
          </div>
        ))}
      </div>
    </div>
  );
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
  const [draft, setDraft] = useState(
    parsed ?? { year: effectiveMaxYear - 20, month: today.getMonth() + 1, day: today.getDate() },
  );

  useEffect(() => {
    if (open) setDraft(parsed ?? { year: effectiveMaxYear - 20, month: today.getMonth() + 1, day: today.getDate() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const years = Array.from({ length: effectiveMaxYear - minYear + 1 }, (_, i) => minYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const dayCount = daysInMonth(draft.year, draft.month);
  const days = Array.from({ length: dayCount }, (_, i) => i + 1);

  const displayLabel = parsed
    ? `${parsed.year}. ${String(parsed.month).padStart(2, '0')}. ${String(parsed.day).padStart(2, '0')}.`
    : '';

  const confirm = () => {
    const day = Math.min(draft.day, daysInMonth(draft.year, draft.month));
    onChange(`${draft.year}-${String(draft.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    setOpen(false);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex-1 text-left text-[15px] bg-transparent outline-none">
        <span className={displayLabel ? 'text-gray-900' : 'text-gray-300'}>{displayLabel || placeholder}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div onClick={() => setOpen(false)} className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-[520px] bg-white rounded-t-3xl overflow-hidden pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <button onClick={() => setOpen(false)} className="text-[14px] text-gray-400 w-14 text-left">
                취소
              </button>
              <h2 className="text-[16px] font-bold text-gray-900">생년월일 선택</h2>
              <button onClick={confirm} className="text-[14px] font-semibold text-[#8287FF] w-14 text-right">
                완료
              </button>
            </div>

            <div className="relative px-5 py-2">
              <div className="pointer-events-none absolute left-5 right-5 top-1/2 -translate-y-1/2 h-10 rounded-xl bg-gray-100" />
              <div className="flex">
                <WheelColumn items={years} selected={draft.year} unit="년" onChange={(year) => setDraft((d) => ({ ...d, year }))} />
                <WheelColumn items={months} selected={draft.month} unit="월" onChange={(month) => setDraft((d) => ({ ...d, month }))} />
                <WheelColumn items={days} selected={draft.day} unit="일" onChange={(day) => setDraft((d) => ({ ...d, day }))} />
              </div>
            </div>
            <div className="pb-6" />
          </div>
        </div>
      )}
    </>
  );
}
