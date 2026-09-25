'use client';

import { useMemo, useState } from 'react';
import { useAuthStore } from '@/store';
import { useListDailyRecords } from '@/entities/diary';
import { DetailHeader } from '@/components/report/DetailHeader';
import { MonthCalendar } from '@/components/home/MonthCalendar';

const MOCK_WRITTEN_DAYS = [2, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 19, 20, 21, 23, 24];
const MOCK_ATTENDED_DAYS = [4, 5];

const toDateKey = (d: Date) => d.toLocaleDateString('sv-SE');

function ChevronButton({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-7 h-7 flex items-center justify-center text-gray-400">
      <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
        <path
          d={direction === 'left' ? 'M8 1.5L1.5 7.5L8 13.5' : 'M1 1.5L7.5 7.5L1 13.5'}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function ChallengePage() {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });
  const accessToken = useAuthStore((s) => s.accessToken);

  const monthStart = new Date(cursor.year, cursor.month - 1, 1);
  const monthEnd = new Date(cursor.year, cursor.month, 0);
  const { data } = useListDailyRecords(
    { start_date: toDateKey(monthStart), end_date: toDateKey(monthEnd), size: 100 },
    !!accessToken,
  );

  const writtenDays = useMemo(() => {
    if (!accessToken || !data) return MOCK_WRITTEN_DAYS;
    return [...new Set(data.records.map((r) => new Date(r.created_at).getDate()))];
  }, [accessToken, data]);

  const daysInMonth = monthEnd.getDate();
  const achievedRate = Math.round((writtenDays.length / daysInMonth) * 100) || 67;
  const achievedCount = writtenDays.length || 20;

  const isCurrentMonth = cursor.year === today.getFullYear() && cursor.month === today.getMonth() + 1;

  return (
    <div className="flex flex-col h-full bg-white">
      <DetailHeader title="기록 챌린지" backHref="/main" />

      <div className="flex-1 overflow-y-auto px-6 pt-5 pb-8">
        <button className="text-[12px] font-medium text-[#8287FF] bg-[#8287FF]/10 px-3.5 py-1.5 rounded-full mb-5">
          챌린지 내용 보기
        </button>

        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-gray-400">내 달성률</span>
          <span className="text-[18px] font-bold text-gray-900">{achievedRate}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 mb-5">
          <div className="h-full rounded-full bg-[#8287FF]" style={{ width: `${Math.min(100, achievedRate)}%` }} />
        </div>

        <div className="bg-gray-50 rounded-2xl px-4 py-3.5 mb-6 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-gray-400">진행 기간</span>
            <span className="text-[13px] text-gray-800">
              {cursor.year}.{cursor.month}.1 - {cursor.month}.{daysInMonth}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-gray-400">기록 주기</span>
            <span className="text-[13px] text-gray-800">매일</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-[12px] text-gray-400">달성일</span>
            <span className="text-[13px] text-gray-800">{achievedCount} / {daysInMonth}일</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mb-4">
          <ChevronButton
            direction="left"
            onClick={() => setCursor((c) => (c.month === 1 ? { year: c.year - 1, month: 12 } : { ...c, month: c.month - 1 }))}
          />
          <span className="text-[15px] font-semibold text-gray-900">
            {cursor.year}년 {cursor.month}월
          </span>
          <ChevronButton
            direction="right"
            onClick={() => setCursor((c) => (c.month === 12 ? { year: c.year + 1, month: 1 } : { ...c, month: c.month + 1 }))}
          />
        </div>

        <MonthCalendar
          year={cursor.year}
          month={cursor.month}
          attendedDays={accessToken ? [] : MOCK_ATTENDED_DAYS}
          writtenDays={writtenDays}
          todayDay={isCurrentMonth ? today.getDate() : undefined}
        />
      </div>
    </div>
  );
}
