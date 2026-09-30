'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useGetMyProfile } from '@/entities/user';
import { Screen } from '@/components/ui/Screen';
import { ChatFab, ChevronRight } from '@/components/ui/primitives';
import { AskSheet } from '@/components/ui/AskSheet';
import { RingDonut } from '@/components/ui/report';
import { MOCK_REPORT } from '@/lib/mock';

const icon = (d: ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6367FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const ROWS = [
  { href: '/report/summary', title: '이번 주 요약', sub: `문장 정확도 ${MOCK_REPORT.accuracy}% · 기록 ${MOCK_REPORT.records}개`, icon: icon(<path d="M6 19v-6M12 19V6M18 19v-9" />) },
  { href: '/report/strengths', title: '강점 / 약점', sub: '기록에서 발견된 모습', icon: icon(<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />) },
  { href: '/report/keywords', title: '키워드 · 에너지 패턴', sub: '자주 쓴 말과 몰입한 시간', icon: icon(<path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" />) },
  {
    href: '/report/compare',
    title: '남이 보는 나 vs 내가 보는 나',
    sub: '친구 5명의 답과 비교',
    icon: icon(
      <>
        <circle cx="9" cy="9" r="3" />
        <circle cx="16" cy="9" r="3" />
        <path d="M3.5 19c.6-2.8 2.8-4.5 5.5-4.5s4.9 1.7 5.5 4.5M13 14.8c.9-.2 1.9-.3 3-.3 2.7 0 4.9 1.7 5.5 4.5" />
      </>,
    ),
  },
  { href: '/report/growth', title: '성장 지표 · 핵심 발견', sub: '지난주보다 달라진 점', icon: icon(<path d="M4 16l5-5 4 4 7-7M15 8h5v5" />) },
];

export default function ReportHubPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: profile } = useGetMyProfile(!!accessToken);
  const [ask, setAsk] = useState(false);
  const accuracy = accessToken ? (profile?.latest_accuracy?.accuracy_percent ?? 0) : MOCK_REPORT.accuracy;

  return (
    <Screen
      nav
      overlay={
        <>
          <ChatFab className="absolute right-5 bottom-[88px] z-20" onClick={() => setAsk(true)} />
          <AskSheet open={ask} onClose={() => setAsk(false)} context="이번 주 리포트" />
        </>
      }
    >
      <div className="px-5 pt-5">
        <p className="font-mono text-[12px] tracking-[0.12em] text-sub">REPORT ME</p>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-[26px] font-bold text-ink">리포트</h1>
          <button className="h-9 px-3.5 rounded-full bg-surface-2 text-[14px] font-semibold text-ink flex items-center gap-1.5">
            {MOCK_REPORT.weekLabel}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="#1A1A1E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 mt-4">
        <div className="rounded-3xl bg-surface px-5 py-5 flex items-center gap-5">
          <RingDonut size={100} stroke={14} value={accuracy}>
            <span className="text-[22px] font-bold text-ink leading-none">{accuracy}%</span>
            <span className="text-[11px] font-semibold text-primary mt-1">▲ {MOCK_REPORT.accuracyDelta}%p</span>
          </RingDonut>
          <div>
            <p className="text-[13px] text-sub">이번 주 문장 정확도</p>
            <div className="flex gap-5 mt-2">
              <div>
                <p className="text-[20px] font-bold text-ink">{MOCK_REPORT.records}</p>
                <p className="text-[12px] text-sub">기록</p>
              </div>
              <div>
                <p className="text-[20px] font-bold text-ink">{MOCK_REPORT.streak}</p>
                <p className="text-[12px] text-sub">연속 기록일</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 pb-24">
        <p className="text-[13px] font-semibold text-[#48484F] px-1">이번 주 리포트 {ROWS.length}개</p>
        <div className="flex flex-col gap-3 mt-3">
          {ROWS.map((r) => (
            <button key={r.href} onClick={() => router.push(r.href)} className="flex items-center gap-3.5 rounded-2xl bg-surface px-4 py-4 text-left">
              <span className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">{r.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-[16px] font-bold text-ink">{r.title}</span>
                <span className="block text-[13px] text-sub mt-0.5">{r.sub}</span>
              </span>
              <ChevronRight size={18} color="#8E8E95" />
            </button>
          ))}
        </div>
      </div>
    </Screen>
  );
}
