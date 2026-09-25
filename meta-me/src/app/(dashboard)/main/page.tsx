'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

const PROMPTS = [
  '오늘 하루는 어떤 장면으로 남았나요?',
  '오늘 가장 크게 흔들린 감정은 뭐였나요?',
  '오늘 스스로를 칭찬하고 싶은 순간이 있었나요?',
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

    if (dayKey === todayKey) return recordedDates.has(dayKey) ? ('done' as const) : ('today' as const);
    if (day > today) return 'pending' as const;
    return recordedDates.has(dayKey) ? ('done' as const) : ('missed' as const);
  });
}

function WeekdayPill({ status, label }: { status: DayStatus; label: string }) {
  if (status === 'done') {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
        <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
          <path d="M1 5l3.5 3.5L12 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] ${
        status === 'today' ? 'ring-2 ring-[#8287FF] text-[#8287FF] font-semibold' : 'bg-gray-100 text-gray-400'
      }`}
    >
      {label}
    </div>
  );
}

function ChevronIcon({ size = 7 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.7} viewBox="0 0 8 14" fill="none">
      <path d="M1 1l6 6-6 6" stroke="#C7C7CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RecentEntryRow({ record }: { record: DailyRecord }) {
  const router = useRouter();
  const { data } = useGetDailyRecord(record.record_id);
  const question = data?.questions[0];
  const rawTitle = question?.scene_description || question?.emotion_tag;
  const title = rawTitle && /[가-힣]/.test(rawTitle) ? rawTitle : '기록 보기';

  return (
    <button
      onClick={() => router.push('/objectify')}
      className="w-full flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 text-left"
    >
      <span className="w-2 h-2 rounded-full bg-[#8287FF] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-gray-900 truncate">{title}</p>
        <p className="text-[12px] text-gray-400 mt-0.5">{formatDotDate(record.created_at)}</p>
      </div>
      <ChevronIcon />
    </button>
  );
}

export default function MainPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: profile } = useGetMyProfile(!!accessToken);
  const { data: recent } = useListDailyRecords({ size: 3 }, !!accessToken);
  const weekFlow = useWeekFlow();

  const today = new Date();
  const accuracyPercent = accessToken ? (profile?.latest_accuracy?.accuracy_percent ?? 0) : 76;
  const nickname = '이시은';
  const prompt = PROMPTS[today.getDate() % PROMPTS.length];
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일 ${WEEKDAYS[today.getDay()]}요일`;

  const streakDays = weekFlow.filter((s) => s === 'done').length;
  const todayIndex = today.getDay();
  const completedToday = !!accessToken && weekFlow[todayIndex] === 'done';
  const achievementRate = Math.round((streakDays / 7) * 100);

  const hasRealRecent = !!accessToken && !!recent && recent.records.length > 0;

  return (
    <div className="flex flex-col h-full bg-[#F2F2F7] px-5 pb-6 gap-6 overflow-y-auto">
      {/* 주간 스트립 */}
      <div className="flex items-center justify-between mt-5">
        <div className="flex items-center gap-2">
          {WEEKDAYS.map((day, i) => (
            <WeekdayPill key={day} status={weekFlow[i]} label={day} />
          ))}
        </div>
        <Link
          href="/challenge"
          className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0"
          aria-label="기록 챌린지"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="17" rx="2" stroke="#6B7280" strokeWidth="2" />
            <path d="M3 9h18M7 2v4M17 2v4" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>
      </div>

      {/* 오늘 기록 카드 */}
      <div
        className="relative overflow-hidden rounded-3xl px-5 pt-6 pb-5"
        style={
          completedToday
            ? { backgroundImage: 'linear-gradient(135deg, #C9CCFF 0%, #FFFFFF 55%, #FFE9A8 100%)' }
            : { backgroundColor: 'white', border: '1px solid #F0F0F0' }
        }
      >
        <p className="text-[13px] font-semibold text-gray-900">{dateLabel}</p>
        <h2 className="text-[19px] font-bold text-gray-900 leading-snug mt-1.5 mb-6">
          {completedToday ? (
            '오늘의 기록을 완료했어요'
          ) : (
            <>
              {nickname}님, 오늘 하루는
              <br />
              {prompt}
            </>
          )}
        </h2>

        <div className="relative w-full flex justify-center mb-6">
          <div className="w-[150px] h-[150px] rounded-full bg-gradient-to-br from-white to-gray-100 shadow-inner flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="MetaMe" className="w-16 h-auto opacity-80" />
          </div>
          {completedToday && (
            <span className="absolute bottom-0 right-[calc(50%-75px)] w-8 h-8 rounded-full bg-[#8287FF] border-4 border-white flex items-center justify-center">
              <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                <path d="M1 5l3.5 3.5L12 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </div>

        {streakDays > 0 && (
          <p className="text-[12px] font-semibold text-[#8287FF] mb-2">
            연속 {streakDays}일{completedToday ? ' 작성 완료' : '째 작성 중'}
          </p>
        )}

        {completedToday ? (
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold text-gray-900">새로운 기록 남기기</span>
            <button
              onClick={() => router.push('/diary')}
              className="w-11 h-11 rounded-full bg-gray-900 flex items-center justify-center shrink-0"
              aria-label="새로운 기록 남기기"
            >
              <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                <path d="M1 6h11M7 1l5 5-5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/diary')}
            className="w-full h-14 bg-gray-900 text-white rounded-2xl text-[15px] font-semibold"
          >
            오늘기록 이어가기
          </button>
        )}
      </div>

      {/* 이번 주 달성률 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold text-gray-900">이번 주 달성률</span>
          <span className="text-[13px] font-bold text-gray-900">{achievementRate}%</span>
        </div>
        <div className="h-2 rounded-full bg-white">
          <div className="h-full rounded-full bg-[#8287FF]" style={{ width: `${achievementRate}%` }} />
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">
          {streakDays}/7일 · 문장 정확도 {accuracyPercent}%
        </p>
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
                <button
                  key={entry.id}
                  onClick={() => router.push('/objectify')}
                  className="w-full flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 text-left"
                >
                  <span className="w-2 h-2 rounded-full bg-[#8287FF] shrink-0" />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-gray-900">{entry.title}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">{entry.date}</p>
                  </div>
                  <ChevronIcon />
                </button>
              ))}
        </div>
      </div>
    </div>
  );
}
