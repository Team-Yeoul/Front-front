'use client';

import { useAuthStore } from '@/store';
import { useGetMyProfile } from '@/entities/user';
import { useGetDailyRecord, useListDailyRecords } from '@/entities/diary';
import type { DailyRecord } from '@/entities/diary';

type DayStatus = 'done' | 'missed' | 'today' | 'pending';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const MOCK_WEEK_FLOW: DayStatus[] = ['done', 'done', 'missed', 'today', 'pending', 'pending', 'pending'];

const MOCK_RECENT_ENTRIES = [
  { id: '1', title: '오늘도 다 친구닷', date: '2025.06.17' },
  { id: '2', title: '엄마 때문에 화남', date: '2025.06.16' },
  { id: '3', title: '회사 때문에 스트레스', date: '2025.06.15' },
];

/** Local YYYY-MM-DD, independent of timezone offset formatting quirks. */
const toDateKey = (d: Date) => d.toLocaleDateString('sv-SE');

const formatDotDate = (iso: string) => toDateKey(new Date(iso)).replaceAll('-', '.');

function getWeekRange(today: Date) {
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function useWeekFlow() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const today = new Date();
  const { start, end } = getWeekRange(today);

  const { data } = useListDailyRecords(
    { start_date: toDateKey(start), end_date: toDateKey(end), size: 50 },
    !!accessToken,
  );

  if (!accessToken || !data) return MOCK_WEEK_FLOW;

  const recordedDates = new Set(data.records.map((r) => toDateKey(new Date(r.created_at))));
  const todayKey = toDateKey(today);

  return WEEKDAYS.map((_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const dayKey = toDateKey(day);

    if (dayKey === todayKey) return 'today' as const;
    if (day > today) return 'pending' as const;
    return recordedDates.has(dayKey) ? ('done' as const) : ('missed' as const);
  });
}

function DayStatusIcon({ status }: { status: DayStatus }) {
  if (status === 'done') {
    return (
      <div className="w-9 h-9 rounded-full bg-[#28A745] flex items-center justify-center">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M1 6l4.5 4.5L15 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (status === 'missed') {
    return (
      <div className="w-9 h-9 rounded-full bg-[#CC0000] flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  if (status === 'today') {
    return <div className="w-9 h-9 rounded-full ring-2 ring-offset-2 ring-[#8287FF] bg-[#8287FF]" />;
  }
  return <div className="w-9 h-9 rounded-full bg-gray-200" />;
}

function ChevronIcon({ size = 7 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.7} viewBox="0 0 8 14" fill="none">
      <path d="M1 1l6 6-6 6" stroke="#C7C7CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RecentEntryRow({ record }: { record: DailyRecord }) {
  const { data } = useGetDailyRecord(record.record_id);
  const question = data?.questions[0];
  const title = question?.scene_description || question?.emotion_tag || '기록 보기';

  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5">
      <span className="w-2 h-2 rounded-full bg-[#8287FF] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-gray-900 truncate">{title}</p>
        <p className="text-[12px] text-gray-400 mt-0.5">{formatDotDate(record.created_at)}</p>
      </div>
      <ChevronIcon />
    </div>
  );
}

export default function MainPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: profile } = useGetMyProfile(!!accessToken);
  const { data: recent } = useListDailyRecords({ size: 3 }, !!accessToken);
  const weekFlow = useWeekFlow();

  const dDay = profile
    ? Math.floor((Date.now() - new Date(profile.user.created_at).getTime()) / 86400000)
    : 0;
  const accuracyPercent = profile?.latest_accuracy?.accuracy_percent ?? 0;

  const hasRealRecent = !!accessToken && !!recent && recent.records.length > 0;

  return (
    <div className="flex flex-col h-full bg-[#F2F2F7] px-5 pb-6 gap-6 overflow-y-auto">
      {/* 상태 카드 */}
      <div className="relative mt-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mascot.png"
          alt="MetaMe 마스코트"
          width={130}
          height={130}
          className="absolute -top-8 right-8 z-10"
        />

        <div
          className="overflow-hidden rounded-3xl"
          style={{ backgroundImage: 'linear-gradient(to bottom, #8287FF, #ffffff)' }}
        >
          <div className="px-5 pt-6">
            <p className="text-[52px] leading-none font-bold text-gray-900">D+{dDay}</p>
            <p className="text-[13px] text-gray-700 mt-2">아직 팔팔한 여울림 CEO</p>

            <div className="flex items-center gap-3 mt-6 mb-4">
              <span className="text-[13px] font-semibold text-gray-900 shrink-0">{accuracyPercent}%</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/50">
                <div className="h-full rounded-full bg-[#8287FF]" style={{ width: `${accuracyPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="px-5 pb-5 pt-1">
            <button className="w-full h-14 bg-gray-900 text-white rounded-2xl text-[15px] font-semibold">
              기록 이어가기
            </button>
          </div>
        </div>
      </div>

      {/* 나의 기록 흐름 */}
      <div>
        <div className="flex items-center gap-1 mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900">나의 기록 흐름</h3>
          <ChevronIcon />
        </div>
        <div className="flex justify-between bg-gray-50 rounded-2xl px-3 py-4">
          {WEEKDAYS.map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-1.5">
              <DayStatusIcon status={weekFlow[i]} />
              <span className="text-[12px] text-gray-500">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 최근 기록 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <h3 className="text-[15px] font-semibold text-gray-900">최근 기록</h3>
            <ChevronIcon />
          </div>
          <span className="flex items-center gap-0.5 text-[12px] text-gray-400">
            더보기
            <ChevronIcon size={6} />
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          {hasRealRecent
            ? recent!.records.map((record) => <RecentEntryRow key={record.record_id} record={record} />)
            : MOCK_RECENT_ENTRIES.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5">
                  <span className="w-2 h-2 rounded-full bg-[#8287FF] shrink-0" />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-gray-900">{entry.title}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">{entry.date}</p>
                  </div>
                  <ChevronIcon />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
