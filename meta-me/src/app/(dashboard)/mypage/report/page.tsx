'use client';

import { useState } from 'react';
import { Screen } from '@/components/ui/Screen';
import { ChatFab, TopBar } from '@/components/ui/primitives';
import { MyTabs } from '@/components/ui/MyTabs';
import { AskSheet } from '@/components/ui/AskSheet';
import { MOCK_REPORT } from '@/lib/mock';

const AXES4 = [
  { label: '학습 스타일', value: 72, tag: '몰입형' },
  { label: '집중 패턴', value: 54, tag: '오전형' },
  { label: '감정 회복력', value: 38, tag: '느린 편' },
  { label: '의사결정', value: 64, tag: '직관형' },
];

export default function MyReportPage() {
  const [ask, setAsk] = useState(false);
  const bars = MOCK_REPORT.weekly;
  const max = Math.max(...bars.map((b) => b.value));

  return (
    <Screen
      bg="#F2F2F7"
      overlay={
        <>
          <ChatFab className="absolute right-5 bottom-6 z-20" onClick={() => setAsk(true)} />
          <AskSheet open={ask} onClose={() => setAsk(false)} context="리포트 미" />
        </>
      }
    >
      <div className="bg-white">
        <TopBar title="리포트 미" backHref="/mypage" />
        <MyTabs active="report" />
      </div>
      <div className="px-4 pt-4 pb-24 flex flex-col gap-3">
        <div className="rounded-3xl bg-primary px-5 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-white/75">전주 대비 메타인지 정확도</span>
            <span className="text-[22px] font-bold text-yellow">▲ 2%</span>
          </div>
          <div className="grid grid-cols-4 gap-2 items-end h-[72px] mt-3">
            {bars.map((b, i) => (
              <div key={b.label} className="flex justify-center items-end h-full">
                <div
                  className={`w-12 rounded-lg ${i === bars.length - 1 ? 'bg-yellow' : 'bg-white/35'}`}
                  style={{ height: `${30 + ((b.value - 60) / (max - 60)) * 70}%` }}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {bars.map((b, i) => (
              <span key={b.label} className={`text-center text-[11px] ${i === bars.length - 1 ? 'font-bold text-white' : 'text-white/60'}`}>
                {b.label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white px-5 py-5">
          <p className="text-[16px] font-bold text-ink">프로필 4축</p>
          <div className="flex flex-col gap-3 mt-4">
            {AXES4.map((a) => (
              <div key={a.label} className="flex items-center gap-3">
                <span className="w-[88px] text-[13px] text-[#48484F]">{a.label}</span>
                <span className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${a.value}%` }} />
                </span>
                <span className="w-14 text-right text-[12px] font-semibold text-primary">{a.tag}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-white px-4 py-4 min-h-[96px]">
            <p className="text-[12px] font-semibold text-primary">강점</p>
            <p className="text-[14px] text-ink leading-relaxed mt-2">마감이 정해지면 몰입이 깊어져요</p>
          </div>
          <div className="rounded-3xl bg-white px-4 py-4 min-h-[96px]">
            <p className="text-[12px] font-semibold text-sub">약점</p>
            <p className="text-[14px] text-ink leading-relaxed mt-2">시작 전 준비가 길어지는 편</p>
          </div>
        </div>

        <div className="rounded-3xl bg-white px-5 py-5">
          <p className="text-[16px] font-bold text-ink">키워드</p>
          {[
            { label: '흥미', items: MOCK_REPORT.interests, on: true },
            { label: '무흥미', items: MOCK_REPORT.disinterests, on: false },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3 mt-3">
              <span className="w-12 text-[12px] text-sub">{row.label}</span>
              <div className="flex flex-wrap gap-2">
                {row.items.map((k) => (
                  <span
                    key={k.label}
                    className={`h-8 px-3 rounded-full text-[13px] inline-flex items-center ${row.on ? 'bg-primary-soft font-semibold text-primary' : 'bg-surface-2 text-[#48484F]'}`}
                  >
                    {k.label} {k.count}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-yellow-soft px-5 py-5">
          <div className="flex items-center gap-2">
            <span className="h-6 px-2 rounded-md bg-yellow text-[11px] font-bold text-ink inline-flex items-center">에너지 뱀파이어</span>
            <span className="text-[12px] text-gold">이번 달 5회</span>
          </div>
          <p className="text-[14px] text-ink mt-2.5">늦은 밤 알림 확인 후 기분이 내려간 날이 5번이었어요.</p>
        </div>
      </div>
    </Screen>
  );
}
