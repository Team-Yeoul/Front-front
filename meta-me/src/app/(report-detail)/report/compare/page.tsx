'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Radar, ReportScreen } from '@/components/ui/report';
import { AXES, MOCK_COMPARE } from '@/lib/mock';

const GOLD = '#E5B92E';

export default function ReportComparePage() {
  const router = useRouter();
  const [tab, setTab] = useState<'self' | 'both'>('both');
  const { gap } = MOCK_COMPARE;
  const diff = gap.others - gap.self;

  return (
    <ReportScreen eyebrow="MIRROR" title="남이 보는 나 vs 내가 보는 나">
      <div className="-mt-3 -mx-5 flex gap-6 px-5 border-b border-line">
        {[
          { key: 'self' as const, label: '내가 보는 나' },
          { key: 'both' as const, label: '두 시선 비교' },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`relative py-3 text-[16px] ${tab === t.key ? 'font-bold text-ink' : 'text-mute'}`}>
            {t.label}
            {tab === t.key && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-primary" />}
          </button>
        ))}
      </div>

      <div className="flex items-start gap-3">
        <p className="flex-1 text-[12px] text-sub leading-relaxed">08 타인 평가 · 친구에게 물어보기로 모은 답 5개를 기준으로 만들어진 페이지예요</p>
        <button onClick={() => router.push('/mirror/invite')} className="h-9 px-3.5 rounded-xl bg-primary text-[13px] font-semibold text-white shrink-0">
          친구에게 물어보기
        </button>
      </div>

      <Card>
        <p className="text-center text-[17px] font-bold text-ink leading-[1.5] relative">
          <span className="absolute left-2 -top-1 text-[24px] text-mute font-serif">“</span>
          {MOCK_COMPARE.headline[0]}
          <br />
          {MOCK_COMPARE.headline[1]}
          <span className="absolute right-2 -top-1 text-[24px] text-mute font-serif">”</span>
        </p>
        {tab === 'both' ? (
          <div className="grid grid-cols-2 mt-4">
            <div className="flex flex-col items-center">
              <span className="text-[12px] font-semibold text-primary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" /> 내가 보는 나
              </span>
              <Radar labels={AXES} values={MOCK_COMPARE.self} color="#6367FF" fill="rgba(99,103,255,0.22)" size={160} />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[12px] font-semibold flex items-center gap-1.5" style={{ color: GOLD }}>
                <span className="w-2 h-2 rounded-full" style={{ background: GOLD }} /> 남이 보는 나
              </span>
              <Radar labels={AXES} values={MOCK_COMPARE.others} color={GOLD} fill="rgba(229,185,46,0.28)" size={160} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center mt-4">
            <Radar labels={AXES} values={MOCK_COMPARE.self} color="#6367FF" fill="rgba(99,103,255,0.22)" size={220} />
            <p className="text-[13px] text-sub mt-2">공감(86)과 차분함(74)을 가장 높게 매겼어요.</p>
          </div>
        )}
      </Card>

      {tab === 'both' && (
        <>
          <Card>
            <p className="text-[12px] font-semibold text-primary">일치하는 부분</p>
            <div className="flex gap-2 mt-3">
              {MOCK_COMPARE.matches.map((m) => (
                <span key={m} className="h-9 px-3.5 rounded-full bg-primary-soft text-[14px] font-semibold text-primary inline-flex items-center">
                  {m}
                </span>
              ))}
            </div>
            <p className="text-[13px] text-[#48484F] leading-relaxed mt-3">{MOCK_COMPARE.matchDesc}</p>
          </Card>

          <div className="rounded-3xl bg-yellow-soft px-5 py-5">
            <div className="flex justify-between text-[12px] font-semibold text-gold">
              <span>차이가 큰 부분</span>
              <span>{gap.axis}</span>
            </div>
            <p className="text-[17px] font-bold text-ink leading-[1.5] mt-3">
              친구들은 나를 생각보다
              <br />
              <span className="text-gold">훨씬 설명을 잘하는 사람</span>으로 봐요
            </p>
            <div className="relative h-[92px] mt-3">
              <div className="absolute text-center -translate-x-1/2" style={{ left: `${gap.self}%`, top: 0 }}>
                <p className="text-[11px] text-primary">나</p>
                <p className="text-[18px] font-bold text-primary leading-tight">{gap.self}</p>
              </div>
              <div className="absolute text-center -translate-x-1/2" style={{ left: `${gap.others}%`, top: 0 }}>
                <p className="text-[11px] text-gold">친구 평균</p>
                <p className="text-[18px] font-bold text-gold leading-tight">{gap.others}</p>
              </div>
              <span
                className="absolute -translate-x-1/2 top-[44px] h-6 px-2 rounded-full bg-white text-[11px] font-bold text-gold inline-flex items-center"
                style={{ left: `${(gap.self + gap.others) / 2}%` }}
              >
                +{diff}
              </span>
              <div className="absolute inset-x-0 top-[76px] h-px bg-[#E4D9A8]" />
              {[0, 25, 50, 75, 100].map((t) => (
                <span key={t} className="absolute top-[72px] w-px h-2 bg-[#D8CC96]" style={{ left: `${t}%` }} />
              ))}
              <div className="absolute top-[75px] h-[3px] bg-[#E5B92E]" style={{ left: `${gap.self}%`, width: `${diff}%` }} />
              <span className="absolute top-[68px] -translate-x-1/2 w-4 h-4 rounded-full bg-white border-[3px] border-primary" style={{ left: `${gap.self}%` }} />
              <span className="absolute top-[68px] -translate-x-1/2 w-4 h-4 rounded-full bg-[#E5B92E]" style={{ left: `${gap.others}%` }} />
            </div>
            <p className="text-[12px] text-gold mt-1">내 점수는 자기평가 · 친구는 5명 평균 (0–100점)</p>
          </div>
        </>
      )}
    </ReportScreen>
  );
}
