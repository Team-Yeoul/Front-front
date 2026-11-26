'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { View } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';

/** 다이얼 반지름·중심 (v3 시안 13f 기준). svg는 280×280, 바깥 칸은 360×360 — 앱 TimeDial과 같은 값 */
const R = 110;
const SVG_C = 140;
const BOX = 360;
const BOX_C = BOX / 2;
/** 15분 단위로 맞춘다 (하루 96칸) */
const STEP_MIN = 15;
const DAY = 1440;

type Handle = 's' | 'e';

/** 분(0~1439) → 다이얼 위 좌표(중심 기준). 자정이 맨 위, 시계 방향. */
const point = (m: number) => {
  const a = (m / DAY) * 2 * Math.PI - Math.PI / 2;
  return [Math.cos(a) * R, Math.sin(a) * R] as const;
};

const fmt = (m: number) => {
  const hh = Math.floor(m / 60) % 24;
  const mm = m % 60;
  return { ampm: hh < 12 ? '오전' : '오후', time: `${hh % 12 || 12}:${String(mm).padStart(2, '0')}` };
};

/** 분 → "오후 9시" / "오전 7시 30분" (서버로 보내는 문구) */
export const timeLabel = (m: number) => {
  const { ampm } = fmt(m);
  const hh = Math.floor(m / 60) % 24;
  const mm = m % 60;
  return `${ampm} ${hh % 12 || 12}시${mm ? ` ${mm}분` : ''}`;
};

/** 시작 → 끝까지 걸리는 분 (자정을 넘겨도 된다) */
export const spanOf = (s: number, e: number) => (((e - s) % DAY) + DAY) % DAY;

const SunIcon = ({ color }: { color: string }) => (
  <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="4.2" fill={color} />
    <g stroke={color} strokeWidth={2} strokeLinecap="round">
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
    </g>
  </svg>
);
const MoonIcon = ({ color }: { color: string }) => (
  <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden>
    <path fill={color} d="M14.5 3.2a8.8 8.8 0 1 0 6.3 12.6A7.2 7.2 0 0 1 14.5 3.2" />
  </svg>
);

/** 15분마다 눈금: 6시간마다 굵게, 1시간마다 중간, 나머지는 옅게. */
const TICKS = Array.from({ length: DAY / STEP_MIN }, (_, i) => {
  const a = (i / (DAY / STEP_MIN)) * 2 * Math.PI - Math.PI / 2;
  const major = i % 24 === 0;
  const hour = i % 4 === 0;
  const r1 = major ? 78 : hour ? 82 : 85;
  const r2 = 90;
  return {
    x1: SVG_C + Math.cos(a) * r1,
    y1: SVG_C + Math.sin(a) * r1,
    x2: SVG_C + Math.cos(a) * r2,
    y2: SVG_C + Math.sin(a) * r2,
    opacity: major ? 0.85 : hour ? 0.45 : 0.2,
    width: major ? 2.5 : 1.5,
  };
});

/**
 * 24시간 원형 다이얼. 달(시작)·해(끝) 손잡이를 끌어 혼자 있는 시간을 고른다.
 * 손잡이를 누른 뒤에는 손가락이 손잡이를 벗어나도 계속 끌린다(포인터를 잡아 둔다).
 * 키보드는 손잡이에 초점을 두고 ←→(↑↓)로 15분씩 바꾼다(앱 increment·decrement 자리).
 */
export function TimeDial({ value, onChange }: { value: [number, number]; onChange: (v: [number, number]) => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Handle | null>(null);
  const [last, setLast] = useState<Handle>('s');
  const [s, e] = value;

  const minuteAt = (ev: PointerEvent<HTMLDivElement>) => {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r) return null;
    let deg = (Math.atan2(ev.clientY - (r.top + r.height / 2), ev.clientX - (r.left + r.width / 2)) * 180) / Math.PI + 90;
    deg = (deg + 360) % 360;
    return (Math.round((deg / 360) * (DAY / STEP_MIN)) % (DAY / STEP_MIN)) * STEP_MIN;
  };

  const [sx, sy] = point(s);
  const [ex, ey] = point(e);
  const span = spanOf(s, e);
  const arc = `M ${SVG_C + sx} ${SVG_C + sy} A ${R} ${R} 0 ${span > 720 ? 1 : 0} 1 ${SVG_C + ex} ${SVG_C + ey}`;
  const cur = (active ?? last) === 's' ? s : e;
  const { ampm, time } = fmt(cur);
  const hrs = Math.floor(span / 60);
  const mins = span % 60;
  const dur = `${hrs ? `${hrs}시간 ` : ''}${mins ? `${mins}분 ` : ''}${span === 0 ? '0분 ' : ''}혼자 있어요`;

  const handle = (k: Handle, x: number, y: number) => {
    const on = active === k;
    const end = k === 'e';
    const size = on ? 54 : 40;
    const color = on ? (end ? '#FFA36B' : '#B4AAFF') : end ? '#F08A4B' : '#6367FF';
    const curValue = end ? e : s;
    const step = (d: number) => {
      const next = (((curValue + d) % DAY) + DAY) % DAY;
      onChange(end ? [s, next] : [next, e]);
      setLast(k);
    };
    const onKeyDown = (ev: KeyboardEvent<HTMLDivElement>) => {
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') step(STEP_MIN);
      else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') step(-STEP_MIN);
      else return;
      ev.preventDefault();
    };
    return (
      <View
        tabIndex={0}
        accessibilityRole="adjustable"
        accessibilityLabel={end ? '끝 시각' : '시작 시각'}
        accessibilityValue={{ min: 0, max: DAY - STEP_MIN, now: curValue, text: timeLabel(curValue) }}
        onKeyDown={onKeyDown}
        onPointerDown={(ev) => {
          ev.currentTarget.setPointerCapture(ev.pointerId);
          setActive(k);
          setLast(k);
        }}
        onPointerMove={(ev) => {
          if (active !== k) return;
          const m = minuteAt(ev);
          if (m !== null && m !== curValue) onChange(end ? [s, m] : [m, e]);
        }}
        onPointerUp={() => setActive(null)}
        onPointerCancel={() => setActive(null)}
        className="absolute z-[2] rounded-full items-center justify-center touch-none select-none cursor-grab outline-none"
        style={{
          left: BOX_C + x - size / 2,
          top: BOX_C + y - size / 2,
          width: size,
          height: size,
          backgroundColor: on ? '#2B235F' : '#FFFFFF',
          border: on ? '3px solid #FFFFFF' : undefined,
          boxShadow: on ? '0 0 0 8px rgba(255,255,255,0.12), 0 6px 18px rgba(0,0,0,0.35)' : '0 4px 12px rgba(0,0,0,0.25)',
        }}
      >
        {end ? <SunIcon color={color} /> : <MoonIcon color={color} />}
      </View>
    );
  };

  const edge = 'text-[12px] font-semibold text-white/70';
  return (
    <View className="items-center">
      <View ref={boxRef} className="shrink-0" style={{ width: BOX, height: BOX }}>
        <View className="absolute top-0 left-0 right-0 items-center">
          <Text className={edge}>자정</Text>
        </View>
        <View className="absolute bottom-0 left-0 right-0 items-center">
          <Text className={edge}>정오</Text>
        </View>
        <View className="absolute top-0 bottom-0 right-0 justify-center">
          <Text className={edge}>오전 6시</Text>
        </View>
        <View className="absolute top-0 bottom-0 left-0 justify-center">
          <Text className={edge}>오후 6시</Text>
        </View>
        <View pointerEvents="none" style={{ position: 'absolute', left: 40, top: 40 }}>
          <svg width={280} height={280} viewBox="0 0 280 280" aria-hidden>
            <defs>
              <linearGradient id="onb-dial-arc" gradientUnits="userSpaceOnUse" x1={SVG_C + sx} y1={SVG_C + sy} x2={SVG_C + ex} y2={SVG_C + ey}>
                <stop offset="0" stopColor="#7C6CFF" />
                <stop offset="0.5" stopColor="#C68ED6" />
                <stop offset="1" stopColor="#FFA36B" />
              </linearGradient>
            </defs>
            <circle cx={SVG_C} cy={SVG_C} r={R} fill="none" stroke="#FFFFFF" strokeOpacity={0.1} strokeWidth={30} />
            {span > 0 && <path d={arc} fill="none" stroke="url(#onb-dial-arc)" strokeWidth={30} strokeLinecap="round" />}
            {TICKS.map((t, i) => (
              <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#FFFFFF" strokeOpacity={t.opacity} strokeWidth={t.width} strokeLinecap="round" />
            ))}
          </svg>
        </View>
        <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
          <Text className="text-[12px] text-white/75">{(active ?? last) === 's' ? '시작' : '끝'}</Text>
          <View className="flex-row items-baseline gap-[3px]">
            <Text className="text-[24px] font-bold text-white tabular-nums tracking-tight">{time}</Text>
            <Text className="text-[16px] font-bold text-white">{ampm}</Text>
          </View>
          <Text className="text-[12px] text-white/70">{dur}</Text>
        </View>
        {handle('s', sx, sy)}
        {handle('e', ex, ey)}
      </View>
      <Text className="mt-6 text-center text-[14px] text-white/70">손잡이를 눌러 끌면 시간이 바뀌어요</Text>
    </View>
  );
}
