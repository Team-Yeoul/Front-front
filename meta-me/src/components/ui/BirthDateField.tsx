'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from './primitives';
import { SelectField } from './Field';

const ROW = 44;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2) * ROW;
/** 이 시간(ms) 안에 가운데 값을 두 번 누르면 직접 입력으로 바뀐다. (모바일은 dblclick이 잘 안 와서 직접 잰다) */
const DOUBLE_TAP_MS = 350;

const daysIn = (y: number, m: number) => new Date(y, m, 0).getDate();
const pad2 = (n: number) => String(n).padStart(2, '0');

function parse(v: string) {
  const [y, m, d] = v.split('-').map(Number);
  return y && m && d ? { y, m, d } : null;
}

/**
 * 스크롤 스냅 휠 한 칸(연·월·일). 줄을 누르면 그 값으로 굴러가고,
 * 가운데 선택된 값을 두 번 누르면 그 자리가 입력칸으로 바뀌어 숫자를 직접 칠 수 있다.
 */
function Wheel({ items, value, unit, onChange }: { items: number[]; value: number; unit: string; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const lastTap = useRef(0);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [invalid, setInvalid] = useState(false);

  // 처음 열릴 때, 그리고 항목 수가 바뀔 때(월별 일수) 선택값 위치로 맞춘다.
  useEffect(() => {
    const el = ref.current;
    const i = items.indexOf(value);
    if (el && i >= 0) el.scrollTop = i * ROW;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // 직접 입력으로 값이 바뀌면 그 자리로 굴러간다. (스크롤로 고른 값이면 이미 그 자리라 움직이지 않는다)
  useEffect(() => {
    const el = ref.current;
    const i = items.indexOf(value);
    if (el && i >= 0 && Math.round(el.scrollTop / ROW) !== i) el.scrollTo({ top: i * ROW, behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onScroll = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ROW)));
      if (items[i] !== value) onChange(items[i]);
    }, 90);
  };

  const startEdit = () => {
    setText(String(value));
    setInvalid(false);
    setEditing(true);
  };

  // 범위 안의 숫자면 반영하고 닫는다. 아니면 칸을 빨갛게 표시하고 그대로 둔다(Esc·바깥 누르기로 취소).
  const commit = () => {
    const n = Number(text);
    if (text && items.includes(n)) {
      onChange(n);
      setEditing(false);
    } else if (!text) {
      setEditing(false);
    } else {
      setInvalid(true);
    }
  };

  const onTapRow = (n: number, i: number) => {
    if (n !== value) {
      lastTap.current = 0;
      ref.current?.scrollTo({ top: i * ROW, behavior: 'smooth' });
      return;
    }
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      startEdit();
    } else {
      lastTap.current = now;
    }
  };

  const center = items.indexOf(value);
  const maxLen = String(items[items.length - 1]).length;

  return (
    <div className="relative flex-1">
      <div
        ref={ref}
        onScroll={onScroll}
        className={`relative overflow-y-auto snap-y snap-mandatory no-scrollbar overscroll-contain ${editing ? 'overflow-hidden' : ''}`}
        style={{ height: ROW * VISIBLE, paddingBlock: PAD }}
      >
        {items.map((n, i) => (
          <button
            key={n}
            type="button"
            onClick={() => onTapRow(n, i)}
            className={`w-full snap-center flex items-center justify-center transition-colors select-none ${
              n === value
                ? 'text-[20px] font-medium text-ink'
                : Math.abs(center - i) === 1
                  ? 'text-[17px] text-[#A8ACB8]'
                  : 'text-[17px] text-[#D4D6DD]'
            }`}
            style={{ height: ROW }}
            aria-label={n === value ? `${n}${unit}, 두 번 누르면 직접 입력` : `${n}${unit}`}
          >
            {n}
            {unit}
          </button>
        ))}
      </div>
      {editing && (
        <div className="absolute inset-x-1.5 z-20 flex items-center justify-center gap-0.5" style={{ top: PAD, height: ROW }}>
          <input
            autoFocus
            value={text}
            onChange={(e) => {
              setInvalid(false);
              setText(e.target.value.replace(/\D/g, '').slice(0, maxLen));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') setEditing(false);
            }}
            // 다른 곳을 누르면(예: 선택 완료) 맞는 값일 때만 반영하고 닫는다.
            onBlur={() => {
              const n = Number(text);
              if (text && items.includes(n)) onChange(n);
              setEditing(false);
            }}
            onFocus={(e) => e.currentTarget.select()}
            inputMode="numeric"
            aria-label={`${unit} 직접 입력`}
            className={`w-full h-full rounded-xl bg-white text-center text-[20px] font-medium text-ink outline-none caret-primary border-[1.5px] ${
              invalid ? 'border-danger' : 'border-primary'
            }`}
            style={{ paddingRight: 22 }}
          />
          <span className="absolute right-4 text-[20px] font-medium text-ink pointer-events-none">{unit}</span>
        </div>
      )}
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
    <>
      <SelectField
        label={label}
        value={parsed ? `${parsed.y}. ${pad2(parsed.m)}. ${pad2(parsed.d)}.` : undefined}
        placeholder="생년월일을 선택해 주세요"
        onClick={openSheet}
        active={open}
      />

      {open && (
        // PhoneFrame의 translateZ(0) 덕분에 데스크톱 미리보기에선 폰 화면 안에, 모바일에선 전체 화면에 붙는다.
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <button type="button" className="absolute inset-0 bg-[#11111E]/62 animate-fade-in" onClick={() => setOpen(false)} aria-label="닫기" />
          <div className="relative bg-white rounded-t-[28px] px-6 pt-3 pb-[max(32px,env(safe-area-inset-bottom))] animate-sheet-up">
            <div className="flex justify-center pb-5">
              <span className="w-10 h-1.25 rounded-full bg-[#DCDCE4]" />
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-bold text-ink tracking-[-0.02em]">생년월일</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-[14px] font-semibold text-[#8A8A96]">
                취소
              </button>
            </div>
            <div className="relative mt-5">
              <div className="pointer-events-none absolute inset-x-0 rounded-xl bg-[#F0F0FF]" style={{ top: PAD, height: ROW }} />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 z-10 bg-linear-to-b from-white to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 z-10 bg-linear-to-t from-white to-transparent" />
              <div className="relative flex">
                <Wheel items={years} value={draft.y} unit="년" onChange={(y) => set({ y })} />
                <Wheel items={months} value={draft.m} unit="월" onChange={(m) => set({ m })} />
                <Wheel items={days} value={draft.d} unit="일" onChange={(d) => set({ d })} />
              </div>
            </div>
            <p className="mt-2 text-center text-[12px] text-[#A8ACB8]">가운데 숫자를 두 번 누르면 직접 입력할 수 있어요</p>
            <Button className="mt-4" onClick={confirm}>
              선택 완료
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
