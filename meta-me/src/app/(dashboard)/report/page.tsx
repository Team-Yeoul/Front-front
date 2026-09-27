'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getReportStatus } from '@/lib/api';
import { useReportData } from '@/hooks/useReportData';
import { WeeklyAccuracyBars } from '@/components/report/WeeklyAccuracyBars';
import type { ReportStatus } from '@/types';

const MOCK_STATUS: ReportStatus = {
  unlocked: true,
  recordedDays: 8,
  requiredDays: 14,
  weeklyTrend: [
    { label: '7월 2주', value: 40 },
    { label: '3주', value: 55 },
    { label: '4주', value: 62 },
    { label: '이번 주', value: 76 },
  ],
  weeklyDeltaLabel: '▲ 2%',
  personaAxes: [
    { label: '학습 스타일', leftLabel: '', rightLabel: '몰입형', value: 78 },
    { label: '집중 패턴', leftLabel: '', rightLabel: '오전형', value: 65 },
    { label: '감정 회복력', leftLabel: '', rightLabel: '느린 편', value: 42 },
    { label: '의사결정', leftLabel: '', rightLabel: '직관형', value: 70 },
  ],
  strength: '마감이 정해지면 몰입이 깊어져요',
  weakness: '시작 전 준비가 길어지는 편',
  interestTags: [
    { label: '글쓰기', count: 9 },
    { label: '러닝', count: 6 },
    { label: '전시', count: 4 },
  ],
  disinterestTags: [
    { label: '긴 회의', count: 7 },
    { label: '숫자 정리', count: 3 },
  ],
  energyAlert: {
    badge: '에너지 뱀파이어',
    countLabel: '이번 달 5회',
    description: '늦은 밤 알림 확인 후 기분이 내려간 날이 5번이었어요.',
  },
};

const TABS = [
  { key: 'month', label: '이번 달', href: '/challenge' },
  { key: 'dogam', label: '도감', href: '/objectify' },
  { key: 'report', label: '리포트', href: '/report' },
] as const;

function ReportTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-6 px-6 border-b border-gray-100">
      {TABS.map((tab) => {
        const active = tab.key === 'report' ? pathname.startsWith('/report') : false;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`py-3 text-[14px] font-medium border-b-2 -mb-px transition-colors ${
              active ? 'text-[#8287FF] border-[#8287FF]' : 'text-gray-400 border-transparent'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

function ProfileAxisRow({ label, value, rightLabel }: { label: string; value: number; rightLabel: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] text-gray-500 w-[70px] shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-[#8287FF]" style={{ width: `${value}%` }} />
      </div>
      <span className="text-[12px] font-semibold text-[#8287FF] w-[46px] text-right shrink-0">{rightLabel}</span>
    </div>
  );
}

function TagPill({ label, count, tone }: { label: string; count: number; tone: 'primary' | 'neutral' }) {
  return (
    <span
      className={`text-[12px] font-medium px-3 py-1.5 rounded-full mr-2 mb-2 inline-block ${
        tone === 'primary' ? 'bg-[#8287FF] text-white' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {label} {count}
    </span>
  );
}

export default function ReportPage() {
  const status = useReportData(getReportStatus, MOCK_STATUS);

  if (!status.unlocked) {
    const progressPct = Math.min(100, (status.recordedDays / status.requiredDays) * 100);
    return (
      <div className="flex flex-col h-full bg-white">
        <ReportTabs />
        <div className="flex-1 flex flex-col px-6 pt-6">
          <p className="text-[13px] text-gray-400 mb-1">리포트 미리보기</p>
          <p className="text-[12px] text-gray-300 mb-5">내용은 기록이 쌓일수록 더 정확해질 예정이에요</p>

          <div className="bg-[#8287FF] rounded-2xl px-5 py-4 mb-2">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[13px] font-medium text-white/90">며칠째 OO님을 읽는 중이에요</span>
              <span className="text-[13px] font-semibold text-white">
                {status.recordedDays}/{status.requiredDays}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot.png" alt="MetaMe 마스코트" width={140} height={140} />
          </div>

          <p className="text-center text-[13px] text-gray-400 mb-6">
            최소 {status.requiredDays}일간의 기록이 쌓이면 리포트를 보여드려요
          </p>

          <div className="pb-8">
            <Link href="/diary">
              <button className="w-full h-14 bg-gray-900 text-white rounded-2xl text-base font-semibold">
                오늘 기록하기
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <ReportTabs />

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-8">
        <div className="bg-[#8287FF] rounded-3xl px-5 py-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-white">전주 대비 메타인지 정확도</span>
            <span className="text-[12px] font-semibold text-gray-900 bg-[#F5D949] px-2.5 py-1 rounded-full">
              {status.weeklyDeltaLabel}
            </span>
          </div>
          <WeeklyAccuracyBars data={status.weeklyTrend} variant="onPurple" showValues={false} />
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl px-5 py-5 mb-4 shadow-sm">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4">프로필 4축</h3>
          <div className="flex flex-col gap-4">
            {status.personaAxes.map((axis) => (
              <ProfileAxisRow key={axis.label} label={axis.label} value={axis.value} rightLabel={axis.rightLabel} />
            ))}
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-white border border-gray-100 rounded-2xl px-4 py-4 shadow-sm">
            <p className="text-[12px] font-semibold text-[#8287FF] mb-1.5">강점</p>
            <p className="text-[13px] text-gray-700 leading-relaxed">{status.strength}</p>
          </div>
          <div className="flex-1 bg-white border border-gray-100 rounded-2xl px-4 py-4 shadow-sm">
            <p className="text-[12px] font-semibold text-gray-400 mb-1.5">약점</p>
            <p className="text-[13px] text-gray-700 leading-relaxed">{status.weakness}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl px-5 py-5 mb-4 shadow-sm">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-3">키워드</h3>
          <p className="text-[11px] text-gray-400 mb-1.5">흥미</p>
          <div className="mb-3">
            {status.interestTags.map((t, i) => (
              <TagPill key={t.label} label={t.label} count={t.count} tone={i === 0 ? 'primary' : 'neutral'} />
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mb-1.5">무흥미</p>
          <div>
            {status.disinterestTags.map((t) => (
              <TagPill key={t.label} label={t.label} count={t.count} tone="neutral" />
            ))}
          </div>
        </div>

        <div className="bg-[#FFF8DE] rounded-3xl px-5 py-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold text-gray-900 bg-[#F5D949] px-2.5 py-1 rounded-full">
              {status.energyAlert.badge}
            </span>
            <span className="text-[12px] text-gray-500">{status.energyAlert.countLabel}</span>
          </div>
          <p className="text-[13px] text-gray-700 leading-relaxed">{status.energyAlert.description}</p>
        </div>
      </div>
    </div>
  );
}
