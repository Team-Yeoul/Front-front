'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { Button, TopBar } from '@/components/ui/primitives';
import { AXES, MOCK_COMPARE, MOCK_FRIENDS_RESULT, MOCK_NICKNAME } from '@/lib/mock';

const PIE_COLORS = ['#6367FF', '#A9ABFF', '#E5B92E', '#E4E4EA'];
const GOLD = '#E5B92E';

function Pie({ items }: { items: { pct: number }[] }) {
  const size = 96;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const top = Math.max(...items.map((i) => i.pct));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {items.map((it, i) => {
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={PIE_COLORS[i]}
              strokeWidth={stroke}
              strokeDasharray={`${(it.pct / 100) * c} ${c}`}
              strokeDashoffset={-offset}
            />
          );
          offset += (it.pct / 100) * c;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[16px] font-bold text-ink">{top}%</span>
        <span className="text-[10px] text-sub">최다</span>
      </div>
    </div>
  );
}

function QCard({ no, title, kind, children }: { no: string; title: string; kind: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl bg-surface px-4 py-4">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-bold text-ink">
          <span className="font-mono text-primary mr-2">{no}</span>
          {title}
        </p>
        <span className="text-[11px] text-mute">{kind}</span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function PieBlock({ items }: { items: { label: string; pct: number }[] }) {
  return (
    <div className="flex items-center gap-4">
      <Pie items={items} />
      <ul className="flex-1 flex flex-col gap-2">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-2 text-[12px]">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: PIE_COLORS[i] }} />
            <span className={`flex-1 ${i === 0 ? 'font-bold text-ink' : 'text-[#48484F]'}`}>{it.label}</span>
            <span className={`font-mono ${i === 0 ? 'font-bold text-primary' : 'text-sub'}`}>{it.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Quotes({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((q) => (
        <p key={q} className="rounded-xl bg-white px-4 py-3 text-[14px] text-ink">
          “{q}”
        </p>
      ))}
    </div>
  );
}

export default function MirrorResultsPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const r = MOCK_FRIENDS_RESULT;
  const selfScores = MOCK_COMPARE.self.map((v) => v / 20);
  const otherScores = MOCK_COMPARE.others.map((v) => v / 20);

  return (
    <Screen
      footer={
        page === 0 ? (
          <Button variant="dark" onClick={() => setPage(1)}>
            다음
          </Button>
        ) : (
          <>
            <p className="text-center text-[12px] text-sub mb-3">내 자기평가와 나란히 보는 8d ‘남이 보는 나 vs 내가 보는 나’로 이동해요</p>
            <Button onClick={() => router.push('/report/compare')}>비교 리포트 보기</Button>
            <button onClick={() => router.push('/mirror/invite')} className="w-full h-11 text-[14px] font-semibold text-primary">
              친구에게 더 물어보기 ›
            </button>
          </>
        )
      }
    >
      <TopBar
        title="친구들의 답"
        onBack={() => (page === 0 ? router.back() : setPage(0))}
        right={<span className="font-mono text-[13px] text-mute">{page + 1} / 2</span>}
      />
      <div className="px-5 pb-6">
        {page === 0 ? (
          <>
            <div className="flex items-end justify-between mt-1 mb-3">
              <h1 className="text-[22px] font-bold text-ink">친구들의 답이 모였어요</h1>
              <span className="text-[11px] text-sub mb-1">{r.relation}</span>
            </div>
            <div className="flex flex-col gap-3">
              <QCard no="Q1" title={r.q1.title} kind="객관식">
                <PieBlock items={r.q1.items} />
              </QCard>
              <QCard no="Q2" title="먼저 생각나는 단어" kind="복수 선택">
                <div className="flex flex-wrap gap-2">
                  {r.q2.map((w) => (
                    <span
                      key={w.label}
                      className={`h-9 px-3.5 rounded-full text-[14px] inline-flex items-center gap-1.5 ${
                        w.top ? 'bg-primary text-white font-semibold' : 'bg-white border border-line text-ink'
                      }`}
                    >
                      {w.label}
                      <span className={`font-mono text-[11px] ${w.top ? 'text-white/80' : 'text-mute'}`}>{w.pct}%</span>
                    </span>
                  ))}
                </div>
              </QCard>
              <QCard no="Q3" title={r.q3.title} kind="객관식">
                <PieBlock items={r.q3.items} />
              </QCard>
              <QCard no="투표" title="유형 투표" kind="투표 결과">
                <div className="flex flex-col gap-3">
                  {r.vote.map((v, i) => (
                    <div key={v.label}>
                      <div className="flex justify-between text-[13px]">
                        <span className={i === 0 ? 'font-bold text-ink' : 'text-[#48484F]'}>{v.label}</span>
                        <span className={`font-mono ${i === 0 ? 'font-bold text-primary' : 'text-sub'}`}>{v.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#E4E4EA] mt-1.5">
                        <div className="h-full rounded-full" style={{ width: `${v.pct}%`, background: i === 0 ? '#6367FF' : '#A9ABFF' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </QCard>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3 mt-1">
            <QCard no="Q4" title="스스로는 잘 모를 것 같은 장점" kind="서술 · 4명">
              <Quotes items={r.q4} />
              <p className="text-[12px] text-sub mt-3">+ 2개 더보기</p>
            </QCard>
            <QCard no="Q5" title="다섯 축 평균 (1–5)" kind="척도 · 5명">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-3 text-[#48484F]">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" /> 내 자기평가
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: GOLD }} /> 친구 평균
                  </span>
                </span>
                <span className="text-mute">원을 누르면 수치가 보여요</span>
              </div>
              <div className="flex flex-col gap-4 mt-5">
                {AXES.map((a, i) => {
                  const s = ((selfScores[i] - 1) / 4) * 100;
                  const o = ((otherScores[i] - 1) / 4) * 100;
                  return (
                    <div key={a} className="flex items-center gap-3">
                      <span className="w-12 text-[13px] font-semibold text-ink">{a}</span>
                      <div className="relative flex-1 h-4">
                        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-[#E4E4EA]" />
                        <span className="absolute top-1/2 -translate-y-1/2 h-1 bg-primary-line" style={{ left: `${Math.min(s, o)}%`, width: `${Math.abs(o - s)}%` }} />
                        <span title={`${selfScores[i].toFixed(1)}`} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary border-2 border-white" style={{ left: `${s}%` }} />
                        <span title={`${otherScores[i].toFixed(1)}`} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ left: `${o}%`, background: GOLD }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </QCard>
            <QCard no="Q6" title={`${MOCK_NICKNAME}님에게 한 마디`} kind="서술 · 3명">
              <Quotes items={r.q6} />
            </QCard>
          </div>
        )}
      </div>
    </Screen>
  );
}
