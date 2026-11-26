'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Sheet } from './overlays';
import { Button } from './primitives';
import { Text } from './Text';
import { CalendarIcon } from './icons';
import { Pressable, View } from './rn';
import { useTheme } from '@/lib/theme';

const ROW = 44;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2) * ROW;

const daysIn = (y: number, m: number) => new Date(y, m, 0).getDate();
const pad2 = (n: number) => String(n).padStart(2, '0');

function parse(v: string) {
  const [y, m, d] = v.split('-').map(Number);
  return y && m && d ? { y, m, d } : null;
}

/**
 * 한 칸씩 멈추는 휠 열(CSS scroll-snap). 항목을 누르면 그 값으로 이동한다.
 * 굴러가는 동안에는 onMovingChange(true)로 알려, 멈추기 전 값으로 확정되지 않게 한다.
 */
function Wheel({
  items,
  value,
  unit,
  onChange,
  onMovingChange,
}: {
  items: number[];
  value: number;
  unit: string;
  onChange: (v: number) => void;
  onMovingChange: (moving: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 처음 열 때 선택값 위치로 맞추는 스크롤. 이 스크롤로는 값을 바꾸지 않는다.
  const syncing = useRef(false);

  // 처음 열릴 때, 그리고 항목 수가 바뀔 때(월별 일수) 선택값 위치로 맞춘다.
  useLayoutEffect(() => {
    const i = items.indexOf(value);
    if (i < 0 || !ref.current) return;
    if (Math.abs(ref.current.scrollTop - i * ROW) < 1) return;
    syncing.current = true;
    ref.current.scrollTop = i * ROW;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => () => void (idle.current && clearTimeout(idle.current)), []);

  const onScroll = () => {
    if (syncing.current) {
      syncing.current = false;
      return;
    }
    onMovingChange(true);
    if (idle.current) clearTimeout(idle.current);
    // 잠시 멈추면(스냅이 끝나면) 그 위치의 값으로 반영한다.
    idle.current = setTimeout(() => {
      idle.current = null;
      const y = ref.current?.scrollTop ?? 0;
      const i = Math.max(0, Math.min(items.length - 1, Math.round(y / ROW)));
      if (items[i] !== value) onChange(items[i]);
      onMovingChange(false);
    }, 150);
  };

  return (
    <div
      ref={ref}
      onScroll={onScroll}
      className="flex-1 overflow-y-auto no-scrollbar snap-y snap-mandatory overscroll-contain"
      style={{ height: ROW * VISIBLE, paddingTop: PAD, paddingBottom: PAD, scrollPaddingTop: PAD }}
    >
      {items.map((n, i) => (
        <Pressable
          key={n}
          onPress={() => {
            ref.current?.scrollTo({ top: i * ROW, behavior: 'smooth' });
            onChange(n);
          }}
          className="items-center justify-center snap-start"
          style={{ height: ROW }}
        >
          <Text className={`text-[18px] ${n === value ? 'font-bold text-ink' : 'text-[#B4B4BB] dark:text-[#6E6D82]'}`}>
            {n}
            {unit}
          </Text>
        </Pressable>
      ))}
    </div>
  );
}

/** 생년월일 입력: 누르면 하단 시트 휠 피커가 열린다. */
export function BirthDateField({ label, value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) {
  const today = new Date();
  const maxYear = today.getFullYear();
  const minYear = maxYear - 100;
  const parsed = parse(value);
  const { fg, bg } = useTheme();
  const page = bg('#FFFFFF');
  const [open, setOpen] = useState(false);
  type YMD = { y: number; m: number; d: number };
  // 올해는 이번 달·오늘까지만 고를 수 있다(미래 날짜 막기).
  const lastMonth = (y: number) => (y === maxYear ? today.getMonth() + 1 : 12);
  const lastDay = (y: number, m: number) => (y === maxYear && m === today.getMonth() + 1 ? today.getDate() : daysIn(y, m));
  // 2월 30일·미래 날짜처럼 없는(고를 수 없는) 날짜가 되지 않게 줄인다.
  const clamp = ({ y, m, d }: YMD): YMD => {
    const yy = Math.min(Math.max(y, minYear), maxYear);
    const mm = Math.min(m, lastMonth(yy));
    return { y: yy, m: mm, d: Math.min(d, lastDay(yy, mm)) };
  };
  const [draft, setDraft] = useState<YMD>(() => clamp(parsed ?? { y: maxYear - 20, m: 1, d: 1 }));
  // 굴러가는 휠(년·월·일). 하나라도 굴러가면 완료를 막는다.
  const [moving, setMoving] = useState<Record<string, boolean>>({});
  const anyMoving = Object.values(moving).some(Boolean);
  const movingOf = (k: string) => (v: boolean) => setMoving((s) => (s[k] === v ? s : { ...s, [k]: v }));

  const openSheet = () => {
    setDraft(clamp(parsed ?? { y: maxYear - 20, m: 1, d: 1 }));
    setMoving({});
    setOpen(true);
  };

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
  const months = Array.from({ length: lastMonth(draft.y) }, (_, i) => i + 1);
  const days = Array.from({ length: lastDay(draft.y, draft.m) }, (_, i) => i + 1);
  const set = (next: Partial<YMD>) => setDraft((d) => clamp({ ...d, ...next }));

  const confirm = () => {
    if (anyMoving) return;
    const v = clamp(draft);
    onChange(`${v.y}-${pad2(v.m)}-${pad2(v.d)}`);
    setOpen(false);
  };

  return (
    <View className="gap-2">
      {!!label && <Text className="text-[14px] font-semibold text-text-2">{label}</Text>}
      {/* 인풋과 같은 모양: 회색 채움 · 열려 있으면 1px 보라 테두리 · 앞에 달력 아이콘 */}
      <Pressable
        onPress={openSheet}
        accessibilityRole="button"
        accessibilityLabel="생년월일"
        className={`flex-row items-center gap-3 h-14 rounded-xl px-4 border bg-surface ${open ? 'border-primary' : 'border-transparent'}`}
      >
        <CalendarIcon size={20} color={fg(open || parsed ? '#1A1A1E' : '#A1A1AA')} width={1.8} />
        <Text className={`text-[16px] ${parsed ? 'text-ink' : 'text-placeholder'}`}>
          {parsed ? `${parsed.y}. ${pad2(parsed.m)}. ${pad2(parsed.d)}.` : '생년월일'}
        </Text>
      </Pressable>

      <Sheet open={open} onClose={() => setOpen(false)} title="생년월일">
        <View className="px-5 pb-5">
          <View className="mt-4">
            <View pointerEvents="none" className="absolute left-0 right-0 rounded-xl bg-surface-2" style={{ top: PAD, height: ROW }} />
            {/* 시트는 열릴 때 붙으므로 휠도 그때 선택값 위치로 맞춰진다. */}
            <View className="flex-row">
                <Wheel items={years} value={draft.y} unit="년" onChange={(y) => set({ y })} onMovingChange={movingOf('y')} />
                <Wheel items={months} value={draft.m} unit="월" onChange={(m) => set({ m })} onMovingChange={movingOf('m')} />
                <Wheel items={days} value={draft.d} unit="일" onChange={(d) => set({ d })} onMovingChange={movingOf('d')} />
            </View>
            <View pointerEvents="none" className="absolute left-0 right-0 top-0 h-16" style={{ backgroundImage: `linear-gradient(${page}, ${page}00)` }} />
            <View pointerEvents="none" className="absolute left-0 right-0 bottom-0 h-16" style={{ backgroundImage: `linear-gradient(${page}00, ${page})` }} />
          </View>
          <Button className="mt-5" onPress={confirm} disabled={anyMoving}>
            완료
          </Button>
        </View>
      </Sheet>
    </View>
  );
}
