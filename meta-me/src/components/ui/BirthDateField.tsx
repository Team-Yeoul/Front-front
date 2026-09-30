'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from './primitives';

const ROW = 44;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2) * ROW;

const daysIn = (y: number, m: number) => new Date(y, m, 0).getDate();
const pad2 = (n: number) => String(n).padStart(2, '0');

function parse(v: string) {
  const [y, m, d] = v.split('-').map(Number);
  return y && m && d ? { y, m, d } : null;
}

/** Scroll-snap wheel column. Tapping a row also selects it. */
function Wheel({ items, value, unit, onChange }: { items: number[]; value: number; unit: string; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  // 처음 열릴 때, 그리고 항목 수가 바뀔 때(월별 일수) 선택값 위치로 맞춘다.
  useEffect(() => {
    const el = ref.current;
    const i = items.indexOf(value);
    if (el && i >= 0) el.scrollTop = i * ROW;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const onScroll = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ROW)));
      if (items[i] !== value) onChange(items[i]);
    }, 90);
  };

  return (
    <div
      ref={ref}
      onScroll={onScroll}
      className="relative flex-1 overflow-y-auto snap-y snap-mandatory no-scrollbar overscroll-contain"
      style={{ height: ROW * VISIBLE, paddingBlock: PAD }}
    >
      {items.map((n, i) => (
        <button
          key={n}
          type="button"
          onClick={() => ref.current?.scrollTo({ top: i * ROW, behavior: 'smooth' })}
          className={`w-full snap-center flex items-center justify-center text-[18px] transition-colors ${
            n === value ? 'font-bold text-ink' : 'text-[#B4B4BB]'
          }`}
          style={{ height: ROW }}
        >
          {n}
          {unit}
        </button>
      ))}
    </div>
  );
}

/** 생년월일 입력: 탭하면 하단 시트 휠 피커가 열린다 (네이티브 date input 대신). */
export function BirthDateField({ label = '생년월일', value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) {
  const now = new Date();
  const maxYear = now.getFullYear();
  const minYear = maxYear - 100;
  const parsed = parse(value);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => parsed ?? { y: maxYear - 20, m: 1, d: 1 });

  const openSheet = () => {
    setDraft(parsed ?? { y: maxYear - 20, m: 1, d: 1 });
    setOpen(true);
  };

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: daysIn(draft.y, draft.m) }, (_, i) => i + 1);
  // 2월 30일처럼 없는 날짜가 되지 않게 월/연 변경 시 일을 줄인다.
  const set = (next: Partial<typeof draft>) =>
    setDraft((d) => {
      const merged = { ...d, ...next };
      return { ...merged, d: Math.min(merged.d, daysIn(merged.y, merged.m)) };
    });

  const confirm = () => {
    onChange(`${draft.y}-${pad2(draft.m)}-${pad2(draft.d)}`);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-[#48484F]">{label}</span>
      <button
        type="button"
        onClick={openSheet}
        className={`flex items-center justify-between h-14 rounded-2xl px-4 border-[1.5px] text-left transition-colors ${
          open ? 'bg-white border-primary' : 'bg-surface border-transparent'
        }`}
      >
        <span className={`text-[16px] ${parsed ? 'text-ink' : 'text-mute'}`}>
          {parsed ? `${parsed.y}. ${pad2(parsed.m)}. ${pad2(parsed.d)}.` : '생년월일을 선택해 주세요'}
        </span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="#A8A8B0" strokeWidth="1.7" />
          <path d="M4 10h16M9 3v4M15 3v4" stroke="#A8A8B0" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        // PhoneFrame의 translateZ(0) 덕분에 데스크톱 미리보기에선 폰 화면 안에, 모바일에선 전체 화면에 붙는다.
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <button type="button" className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setOpen(false)} aria-label="닫기" />
          <div className="relative bg-white rounded-t-[28px] px-5 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] animate-sheet-up">
            <div className="flex justify-center pb-3">
              <span className="w-10 h-1 rounded-full bg-[#DADAE0]" />
            </div>
            <h2 className="text-[18px] font-bold text-ink">생년월일</h2>
            <div className="relative mt-4">
              <div className="pointer-events-none absolute inset-x-0 rounded-xl bg-surface-2" style={{ top: PAD, height: ROW }} />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 z-10 bg-gradient-to-b from-white to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 z-10 bg-gradient-to-t from-white to-transparent" />
              <div className="relative flex">
                <Wheel items={years} value={draft.y} unit="년" onChange={(y) => set({ y })} />
                <Wheel items={months} value={draft.m} unit="월" onChange={(m) => set({ m })} />
                <Wheel items={days} value={draft.d} unit="일" onChange={(d) => set({ d })} />
              </div>
            </div>
            <Button className="mt-5" onClick={confirm}>
              완료
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
