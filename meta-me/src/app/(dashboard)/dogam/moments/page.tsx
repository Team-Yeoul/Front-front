'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { BackButton, CogniImg } from '@/components/ui/primitives';
import { useCollection } from '@/hooks/useCollection';

const mmdd = (iso: string) => (iso ? new Date(iso).toLocaleDateString('sv-SE').slice(5).replace('-', '.') : '-');

export default function CogniMomentsPage() {
  return (
    <Suspense>
      <CogniMoments />
    </Suspense>
  );
}

function CogniMoments() {
  const id = useSearchParams().get('id') ?? '';
  const cogni = useCollection().find((c) => c.id === id);

  return (
    <Screen>
      <div className="px-5 pt-2">
        <BackButton />
      </div>
      {!cogni ? (
        <p className="text-center text-[14px] text-sub mt-24">아직 모으지 않은 코그니예요.</p>
      ) : (
        <div className="px-5 pt-4 pb-8 flex flex-col gap-4">
          <div className="rounded-3xl bg-surface px-4 py-4">
            <div className="flex items-center gap-4">
              <span className="w-[72px] h-[72px] rounded-2xl bg-white flex items-center justify-center overflow-hidden shrink-0">
                <CogniImg src={cogni.image} size={62} />
              </span>
              <div>
                <span className="h-6 px-2.5 rounded-full bg-primary-soft text-[12px] font-semibold text-primary inline-flex items-center">{cogni.category}</span>
                <p className="text-[20px] font-bold text-ink mt-1.5">{cogni.name}</p>
                <p className="text-[13px] text-sub mt-0.5">{cogni.desc}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 rounded-2xl bg-white mt-4 py-3">
              {[
                { label: '첫 발견', value: mmdd(cogni.foundAt) },
                { label: '잡은 횟수', value: '1번' },
                { label: '최근', value: mmdd(cogni.foundAt) },
              ].map((s, i) => (
                <div key={s.label} className={`text-center ${i ? 'border-l border-line' : ''}`}>
                  <p className="text-[12px] text-sub">{s.label}</p>
                  <p className="font-mono text-[16px] font-bold text-ink mt-1">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {cogni.source === 'onboarding' ? (
            <article className="rounded-3xl bg-surface px-5 py-5">
              <span className="font-mono text-[12px] text-sub">{mmdd(cogni.foundAt)} · 온보딩</span>
              <h2 className="text-[18px] font-bold text-ink leading-[1.45] mt-3">온보딩 답에서 처음 발견됐어요</h2>
              <p className="text-[14px] text-[#48484F] leading-relaxed mt-2">앞으로 기록에서 이 코그니가 다시 나타나면, 그 순간이 여기에 쌓여요.</p>
            </article>
          ) : (
            <div className="rounded-3xl border border-dashed border-line px-5 py-8 text-center">
              <p className="text-[14px] text-sub">기록에서 이 코그니가 잡힌 순간이 여기에 모여요</p>
            </div>
          )}
        </div>
      )}
    </Screen>
  );
}
