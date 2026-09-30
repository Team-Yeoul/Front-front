'use client';

import { useMemo, useState } from 'react';
import { useAuthStore } from '@/store';
import { useListDailyRecords } from '@/entities/diary';
import { Screen } from '@/components/ui/Screen';
import { BackButton, ChevronLeft, ChevronRight, ProgressBar } from '@/components/ui/primitives';

// 로그아웃 데모용: 다이어리를 쓴 날 / 출석만 한 날
const MOCK_WRITTEN_DAYS = [2, 3, 4, 9, 10, 11, 12, 17, 18, 19, 24, 25];
const MOCK_ATTENDED_DAYS = [1, 6, 7, 13, 16, 20, 23];
const CHALLENGE_DAYS = 30;
const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const toDateKey = (d: Date) => d.toLocaleDateString('sv-SE');

export default function ChallengePage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  // 로그아웃 데모는 시안과 같은 2025년 6월 26일 기준으로 보여준다.
  const now = accessToken ? new Date() : new Date(2025, 5, 26);
  const [cursor, setCursor] = useState<Date | null>(null);
  const shown = cursor ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const year = shown.getFullYear();
  const month = shown.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const { data } = useListDailyRecords(
    { start_date: toDateKey(monthStart), end_date: toDateKey(monthEnd), size: 100 },
    !!accessToken,
  );

  const written = useMemo(() => {
    if (!accessToken) return new Set(isCurrentMonth ? MOCK_WRITTEN_DAYS : []);
    if (!data) return new Set<number>();
    return new Set(data.records.map((r) => new Date(r.created_at).getDate()));
  }, [accessToken, data, isCurrentMonth]);
  const isDemoMonth = !accessToken && isCurrentMonth;
  const attended = useMemo(() => new Set(isDemoMonth ? MOCK_ATTENDED_DAYS : []), [isDemoMonth]);

  const achieved = written.size + attended.size;
  const rate = Math.round((achieved / CHALLENGE_DAYS) * 100);
  const today = isCurrentMonth ? now.getDate() : -1;

  const cells: (number | null)[] = [
    ...Array(monthStart.getDay()).fill(null),
    ...Array.from({ length: monthEnd.getDate() }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  return (
    <Screen nav>
      <div className="px-5 pt-2">
        <BackButton href="/main" />
        <h1 className="text-[18px] font-bold text-ink mt-4">기록 챌린지</h1>
        <button className="mt-5 h-9 px-3.5 rounded-xl bg-primary-soft text-[14px] font-semibold text-primary">챌린지 내용 보기</button>
        <div className="flex items-end justify-between mt-4">
          <span className="text-[16px] font-bold text-primary">
            {achieved} / {CHALLENGE_DAYS} 일
          </span>
          <div className="text-right">
            <p className="text-[11px] text-sub">내 달성률</p>
            <p className="text-[30px] font-bold text-ink leading-none mt-1">{rate}%</p>
          </div>
        </div>
        <ProgressBar value={rate} className="mt-3" height={9} />
        <div className="mt-4 rounded-2xl bg-surface px-4 py-3.5 flex flex-col gap-2.5 text-[14px]">
          <div className="flex justify-between">
            <span className="text-sub">진행 기간</span>
            <span className="font-mono text-ink">
              {year}.{month + 1}.1 - {month + 1}.{monthEnd.getDate()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sub">기록 주기</span>
            <span className="text-ink">매일</span>
          </div>
        </div>
      </div>

      <div className="h-2 bg-surface-2 mt-6" />

      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center justify-center gap-9">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center"
            aria-label="이전 달"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[17px] font-bold text-ink">
            {year}년 {month + 1}월
          </span>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            disabled={isCurrentMonth}
            className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center disabled:opacity-50"
            aria-label="다음 달"
          >
            <ChevronRight size={16} color={isCurrentMonth ? '#C4C4CC' : '#1A1A1E'} />
          </button>
        </div>

        <div className="grid grid-cols-7 mt-6 pb-2 border-b border-line">
          {WEEK_LABELS.map((w, i) => (
            <span key={w} className={`text-center text-[14px] ${i === 0 ? 'text-danger' : 'text-sub'}`}>
              {w}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-1.5 mt-3">
          {weeks.map((week, wi) => (
            <div key={wi} className="relative grid grid-cols-7 h-[40px]">
              {/* 연속으로 다이어리를 쓴 구간을 하나의 캡슐로 묶는다 */}
              {week.map((day, i) => {
                if (!day || !written.has(day) || day === today) return null;
                const prev = week[i - 1];
                if (prev && written.has(prev) && prev !== today) return null;
                let len = 1;
                while (i + len < 7 && week[i + len] && written.has(week[i + len]!) && week[i + len] !== today) len++;
                return (
                  <span
                    key={`run-${day}`}
                    className="absolute top-0 h-[40px] rounded-full bg-primary-soft"
                    style={{ left: `calc(${(i / 7) * 100}% + 2px)`, width: `calc(${(len / 7) * 100}% - 4px)` }}
                  />
                );
              })}
              {week.map((day, i) => {
                if (!day) return <span key={i} />;
                const isToday = day === today;
                const future = isCurrentMonth && day > now.getDate();
                const isWritten = written.has(day);
                return (
                  <div key={i} className="relative flex flex-col items-center justify-center">
                    {isToday ? (
                      <span className="w-[34px] h-[34px] rounded-full bg-primary text-white text-[15px] font-bold flex items-center justify-center">
                        {day}
                      </span>
                    ) : (
                      <span
                        className={`text-[15px] ${
                          future ? 'text-[#C4C4CC]' : isWritten ? 'font-bold text-primary' : i === 0 ? 'text-danger' : 'text-ink'
                        }`}
                      >
                        {day}
                      </span>
                    )}
                    {!isWritten && attended.has(day) && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-6 text-[12px] text-sub">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-2.5 rounded-full bg-primary-soft" /> 출석 + 다이어리
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-primary" /> 출석만
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" /> 오늘
          </span>
        </div>
      </div>
    </Screen>
  );
}
