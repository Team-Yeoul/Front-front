'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Screen } from './Screen';
import { ChatFab, ChevronLeft } from './primitives';
import { AskSheet } from './AskSheet';

export const REPORT_TABS = [
  { href: '/report/summary', label: '요약', context: '이번 주 요약' },
  { href: '/report/strengths', label: '강점·약점', context: '강점 / 약점' },
  { href: '/report/keywords', label: '키워드', context: '키워드 · 에너지' },
  { href: '/report/compare', label: '남 vs 나', context: '남 vs 나' },
  { href: '/report/growth', label: '성장', context: '성장 지표' },
];

/** Report detail shell: back + pill tabs, eyebrow/title block, chat FAB with the "물어보기" sheet. */
export function ReportScreen({
  eyebrow,
  title,
  sub,
  children,
  footer,
  nav = false,
  headerExtra,
}: {
  eyebrow?: string;
  title?: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  nav?: boolean;
  headerExtra?: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ask, setAsk] = useState(false);
  const context = REPORT_TABS.find((t) => pathname.startsWith(t.href))?.context ?? '리포트';

  return (
    <Screen
      nav={nav}
      footer={footer}
      overlay={
        <>
          <ChatFab className={`absolute right-5 z-20 ${footer ? 'bottom-[92px]' : nav ? 'bottom-[88px]' : 'bottom-6'}`} onClick={() => setAsk(true)} />
          <AskSheet open={ask} onClose={() => setAsk(false)} context={context} />
        </>
      }
    >
      <div className="sticky top-0 z-10 bg-white">
        <div className="flex items-center gap-1.5 px-5 h-16">
          <button onClick={() => router.push('/report')} className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center shrink-0 mr-1" aria-label="리포트로">
            <ChevronLeft />
          </button>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {REPORT_TABS.map((t) => {
              const active = pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  replace
                  className={`h-9 px-3 rounded-full text-[13px] whitespace-nowrap inline-flex items-center ${
                    active ? 'bg-ink text-white font-semibold' : 'bg-surface-2 text-[#48484F]'
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>
        {headerExtra}
      </div>
      {title && (
        <div className="px-5 pt-3">
          {eyebrow && <p className="font-mono text-[12px] tracking-[0.12em] text-sub">{eyebrow}</p>}
          <h1 className="text-[24px] font-bold text-ink mt-1.5">{title}</h1>
          {sub && <p className="text-[13px] text-sub mt-2">{sub}</p>}
        </div>
      )}
      <div className="px-5 pt-6 pb-24 flex flex-col gap-4">{children}</div>
    </Screen>
  );
}

/** Ring donut with an optional secondary (yellow) segment. */
export function RingDonut({
  size,
  stroke,
  value,
  extra = 0,
  children,
}: {
  size: number;
  stroke: number;
  value: number;
  extra?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const base = value - extra;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ECECF1" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#6367FF" strokeWidth={stroke} strokeDasharray={`${(base / 100) * c} ${c}`} />
        {extra > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#FFE066"
            strokeWidth={stroke}
            strokeDasharray={`${(extra / 100) * c} ${c}`}
            strokeDashoffset={-(base / 100) * c}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

/** Pentagon radar (표현력 · 주도성 · 공감 · 추진력 · 차분함). Values are 0–100. */
export function Radar({ labels, values, color, fill, size = 170 }: { labels: readonly string[]; values: number[]; color: string; fill: string; size?: number }) {
  const cx = size / 2;
  const cy = size / 2 + 6;
  const R = size * 0.3;
  const pt = (i: number, f: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / labels.length;
    return [cx + Math.cos(a) * R * f, cy + Math.sin(a) * R * f];
  };
  const poly = (f: number | number[]) => labels.map((_, i) => pt(i, Array.isArray(f) ? f[i] : f).join(',')).join(' ');
  const fr = values.map((v) => Math.max(0.15, v / 100));

  return (
    <svg width={size} height={size + 12} viewBox={`0 0 ${size} ${size + 12}`}>
      {[1, 0.66, 0.33].map((f) => (
        <polygon key={f} points={poly(f)} fill={f === 1 ? '#F1F1F5' : 'none'} stroke="#E2E2E8" strokeWidth="1" />
      ))}
      <polygon points={poly(fr)} fill={fill} stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      {fr.map((f, i) => {
        const [x, y] = pt(i, f);
        return <circle key={i} cx={x} cy={y} r="3.2" fill={color} />;
      })}
      {labels.map((l, i) => {
        const [x, y] = pt(i, 1.38);
        return (
          <text key={l} x={x} y={y + 4} textAnchor="middle" fontSize="12" fill="#48484F">
            {l}
          </text>
        );
      })}
    </svg>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-surface px-5 py-5 ${className}`}>{children}</div>;
}

/** 이번 주 리포트가 아직 없을 때: 기록 진행도와 '리포트 만들기' / '기록하러 가기'. */
export function ReportLocked({
  recordCount,
  min,
  canGenerate,
  generating,
  onGenerate,
  error,
}: {
  recordCount: number;
  min: number;
  canGenerate: boolean;
  generating: boolean;
  onGenerate: () => void;
  /** 목록 조회·생성 실패 문구. 있으면 진행도 대신 오류와 재시도 버튼을 보여준다. */
  error?: string;
}) {
  if (error) {
    return (
      <div className="rounded-3xl bg-surface px-5 py-7 flex flex-col items-center text-center">
        <p className="text-[16px] font-bold text-ink">{error}</p>
        <button onClick={onGenerate} disabled={generating} className="mt-5 h-11 px-5 rounded-xl bg-primary text-white text-[14px] font-semibold disabled:opacity-50">
          {generating ? '다시 시도하는 중...' : '다시 시도'}
        </button>
      </div>
    );
  }
  return (
    <div className="rounded-3xl bg-surface px-5 py-7 flex flex-col items-center text-center">
      <span className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="4.5" y="10" width="15" height="11" rx="2.5" fill="#6367FF" />
          <path d="M8 10V7.5a4 4 0 0 1 8 0V10" stroke="#6367FF" strokeWidth="2.2" />
        </svg>
      </span>
      <p className="text-[16px] font-bold text-ink mt-4">이번 주 리포트가 아직 없어요</p>
      <p className="text-[13px] text-sub mt-1.5 leading-relaxed">
        이번 주 기록이 {min}개 쌓이면
        <br />
        AI가 한 주를 정리해 드려요
      </p>
      <div className="flex items-center gap-3 w-full mt-5">
        <div className="flex-1 h-1.5 rounded-full bg-[#E4E4EA] overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (recordCount / min) * 100)}%` }} />
        </div>
        <span className="font-mono text-[13px] font-semibold text-primary">
          {Math.min(recordCount, min)} / {min}
        </span>
      </div>
      {canGenerate ? (
        <button onClick={onGenerate} disabled={generating} className="mt-5 h-11 px-5 rounded-xl bg-primary text-white text-[14px] font-semibold disabled:opacity-50">
          {generating ? '리포트 만드는 중...' : '이번 주 리포트 만들기'}
        </button>
      ) : (
        <Link href="/diary/chat" className="mt-5 h-11 px-5 rounded-xl bg-white border border-line text-[14px] font-semibold text-ink inline-flex items-center">
          오늘 기록하러 가기
        </Link>
      )}
    </div>
  );
}

/** 리포트 content에서 뽑은 문장 목록. 비어 있으면 안내 문구. */
export function ContentList({ title, items, empty = '이번 리포트에는 이 항목이 없어요' }: { title: string; items: string[]; empty?: string }) {
  return (
    <Card>
      <p className="text-[16px] font-bold text-ink">{title}</p>
      {items.length > 0 ? (
        <div className="divide-y divide-[#E6E6EC] mt-1">
          {items.map((t, i) => (
            <p key={`${i}-${t}`} className="py-3 text-[15px] text-ink leading-relaxed">
              {t}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-sub mt-3">{empty}</p>
      )}
    </Card>
  );
}
