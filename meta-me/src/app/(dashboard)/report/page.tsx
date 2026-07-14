'use client';

import Link from 'next/link';
import { getReportStatus } from '@/lib/api';
import { useReportData } from '@/hooks/useReportData';
import { HighlightText } from '@/components/report/HighlightText';
import { useAuthStore } from '@/store';
import { useGetMyAccount } from '@/entities/user';
import { useListDailyRecords } from '@/entities/diary';
import type { ReportStatus } from '@/types';

const MOCK_STATUS: ReportStatus = {
  unlocked: false,
  recordedDays: 8,
  requiredDays: 14,
  matchPercent: 42,
  matchLabel: '이런 사람에 가까워요',
  matchDescription: '문제를 오래 붙잡고, 혼자 정리할 때 몰입이 올라가는 사람',
  weeklyHighlights: [
    { text: '혼자 공부할 때 집중이 높아졌어요', highlight: '집중' },
    { text: '역할이 애매한 협업에서 피로가 컸어요', highlight: '피로' },
    { text: '결과보다 감정을 자주 언급했어요', highlight: '감정' },
  ],
};

export default function ReportPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const nickname = useAuthStore((s) => s.nickname);
  const status = useReportData(getReportStatus, MOCK_STATUS);
  const { data: account } = useGetMyAccount(!!accessToken);
  const { data: recordsData } = useListDailyRecords({ size: 1 }, !!accessToken);

  const displayName = nickname || (account?.user.email ? account.user.email.split('@')[0] : '회원');
  // /v1/report/status가 실패할 때가 있어 실제 기록 수는 daily-records 총 개수로 대체
  const recordedDays = recordsData?.page_info.total_elements ?? status.recordedDays;

  if (!status.unlocked) {
    const progressPct = Math.min(100, (recordedDays / status.requiredDays) * 100);
    return (
      <div className="flex flex-col h-full bg-white px-6 pt-6">
        <p className="text-[13px] text-gray-400 mb-1">리포트 미리보기</p>
        <p className="text-[12px] text-gray-300 mb-5">내용은 기록이 쌓일수록 더 정확해질 예정이에요</p>

        <div className="bg-[#8287FF] rounded-2xl px-5 py-4 mb-2">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[13px] font-medium text-white/90">며칠째 {displayName}님을 읽는 중이에요</span>
            <span className="text-[13px] font-semibold text-white">
              {recordedDays}/{status.requiredDays}
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
    );
  }

  return (
    <div className="flex flex-col h-full bg-white px-6 pt-6">
      <p className="text-[13px] text-gray-400 mb-5">리포트 미리보기</p>

      <h2 className="text-[24px] font-bold text-gray-900 mb-2">{status.matchLabel}</h2>
      <p className="text-[13px] text-gray-400 mb-5">&lt;{status.matchDescription}&gt;</p>

      <div className="bg-[#8287FF] rounded-2xl px-5 py-4 flex mb-7">
        <div className="flex-1">
          <p className="text-[12px] text-white/70 mb-1">적합 정도</p>
          <p className="text-[20px] font-bold text-white">{status.matchPercent}%</p>
        </div>
        <div className="w-px bg-white/20 mx-2" />
        <div className="flex-1">
          <p className="text-[12px] text-white/70 mb-1">기록일수</p>
          <p className="text-[20px] font-bold text-white">{recordedDays}일</p>
        </div>
      </div>

      <h3 className="text-[15px] font-semibold text-gray-900 mb-3">이번 주 핵심 요약</h3>
      <div className="flex flex-col gap-2.5 mb-8">
        {status.weeklyHighlights.map((line, i) => (
          <p key={i} className="text-[13px] text-gray-600 leading-relaxed">
            {i + 1}. <HighlightText line={line} />
          </p>
        ))}
      </div>

      <div className="mt-auto pb-8">
        <Link href="/report/summary">
          <button className="w-full h-14 bg-gray-900 text-white rounded-2xl text-base font-semibold">
            자세히 보기
          </button>
        </Link>
      </div>
    </div>
  );
}
