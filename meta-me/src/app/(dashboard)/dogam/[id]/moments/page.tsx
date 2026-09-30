'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Img3D } from '@/components/ui/primitives';
import { MOCK_COGNI_MOMENTS, MOCK_COGNIS } from '@/lib/mock';

const WORDS = [
  { word: '나만', count: 3 },
  { word: '매번', count: 2 },
  { word: '~때문에', count: 2 },
];

export default function CogniMomentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const cogni = MOCK_COGNIS.find((c) => c.id === id) ?? MOCK_COGNIS[0];

  return (
    <Screen>
      <div className="px-5 pt-2">
        <BackButton />
      </div>
      <div className="px-5 pt-4 pb-8 flex flex-col gap-4">
        <div className="rounded-3xl bg-surface px-4 py-4">
          <div className="flex items-center gap-4">
            <span className="w-[72px] h-[72px] rounded-2xl bg-white flex items-center justify-center overflow-hidden shrink-0">
              <Img3D name="mascot-glasses" size={64} />
            </span>
            <div>
              <span className="h-6 px-2.5 rounded-full bg-primary-soft text-[12px] font-semibold text-primary inline-flex items-center">
                {cogni.category.replace('/', ' · ')}
              </span>
              <p className="text-[20px] font-bold text-ink mt-1.5">{cogni.name}</p>
              <p className="text-[13px] text-sub mt-0.5">{cogni.desc}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 rounded-2xl bg-white mt-4 py-3">
            {[
              { label: '첫 발견', value: '02.25' },
              { label: '잡은 횟수', value: '3번' },
              { label: '최근', value: '06.17' },
            ].map((s, i) => (
              <div key={s.label} className={`text-center ${i ? 'border-l border-line' : ''}`}>
                <p className="text-[12px] text-sub">{s.label}</p>
                <p className="font-mono text-[16px] font-bold text-ink mt-1">{s.value}</p>
              </div>
            ))}
          </div>
          <p className="text-[13px] font-semibold text-ink mt-4">이 말을 쓸 때 자주 나타나요</p>
          <div className="flex gap-2 mt-2.5">
            {WORDS.map((w) => (
              <span key={w.word} className="h-8 px-3 rounded-full bg-white text-[13px] font-semibold text-ink inline-flex items-center gap-1">
                {w.word} <span className="font-normal text-sub">{w.count}</span>
              </span>
            ))}
          </div>
        </div>

        {MOCK_COGNI_MOMENTS.map((m) => (
          <article key={m.date} className="rounded-3xl bg-surface px-5 py-5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px] text-sub">{m.date}</span>
              <span className="h-6 px-2.5 rounded-full bg-primary-soft text-[12px] font-semibold text-primary inline-flex items-center">{m.tag}</span>
              <button onClick={() => router.push('/diary/d1')} className="text-[12px] font-semibold text-primary">
                기록 보기 ›
              </button>
            </div>
            <h2 className="text-[18px] font-bold text-ink leading-[1.45] mt-3">
              {m.title[0]}
              <br />
              {m.title[1]}
            </h2>
            <p className="text-[15px] text-ink leading-[1.75] mt-3">
              “
              {m.quote.map((q, i) =>
                q.hl ? (
                  <mark key={i} className="bg-yellow/70 text-ink font-semibold rounded px-0.5">
                    {q.t}
                  </mark>
                ) : (
                  <span key={i}>{q.t}</span>
                ),
              )}
              ”
            </p>
            <div className="rounded-2xl bg-white px-4 py-3.5 mt-4">
              <p className="text-[12px] font-semibold text-primary">실제로 있었던 일</p>
              <p className="text-[14px] text-[#48484F] mt-1">{m.fact}</p>
            </div>
          </article>
        ))}
      </div>
    </Screen>
  );
}
