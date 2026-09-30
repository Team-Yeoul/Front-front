'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useGetMyProfile } from '@/entities/user';
import { useGetDailyRecord, useListDailyRecords } from '@/entities/diary';
import type { DailyRecord } from '@/entities/diary';
import { Screen } from '@/components/ui/Screen';
import { Button, CheckIcon, ChevronRight, GearIcon, Img3D, ProgressBar } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/overlays';
import { MOCK_DIARIES } from '@/lib/mock';

type DayStatus = 'done' | 'missed' | 'today' | 'pending';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
/** 로그아웃 데모: 오늘 이전은 모두 기록, 오늘은 아직 안 씀. */
const mockWeekFlow = (todayIndex: number): DayStatus[] =>
  WEEKDAYS.map((_, i) => (i < todayIndex ? 'done' : i === todayIndex ? 'today' : 'pending'));
const PROMPTS = ['오늘 하루는\n어떤 장면으로 남았나요?', '오늘 가장 크게 흔들린\n감정은 뭐였나요?', '오늘 스스로를 칭찬하고\n싶은 순간이 있었나요?'];
const FRIEND_NOTICE_KEY = 'metame:friend-notice-seen';

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
  const { data } = useListDailyRecords({ start_date: toDateKey(start), end_date: toDateKey(end), size: 50 }, !!accessToken);

  if (!accessToken || !data) return mockWeekFlow(today.getDay());

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

function WeekdayPill({ status, label, isToday }: { status: DayStatus; label: string; isToday: boolean }) {
  if (status === 'done') {
    return (
      <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
        <CheckIcon size={16} />
      </span>
    );
  }
  return (
    <span
      className={`w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center shrink-0 text-[14px] ${
        isToday ? 'font-bold text-ink' : 'text-mute'
      }`}
    >
      {label}
    </span>
  );
}

function RecordRow({ title, date, onClick }: { title: string; date: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center rounded-2xl bg-card border border-line px-4 py-4 text-left">
      <div className="flex-1 min-w-0">
        <p className="text-[16px] font-semibold text-ink truncate">{title}</p>
        <p className="font-mono text-[13px] text-sub mt-1">{date}</p>
      </div>
      <ChevronRight size={18} />
    </button>
  );
}

function RealRecordRow({ record }: { record: DailyRecord }) {
  const router = useRouter();
  const { data } = useGetDailyRecord(record.record_id);
  const question = data?.questions[0];
  const rawTitle = question?.scene_description || question?.emotion_tag;
  const title = rawTitle && /[가-힣]/.test(rawTitle) ? rawTitle : '기록 보기';
  return <RecordRow title={title} date={formatDotDate(record.created_at)} onClick={() => router.push(`/diary/${record.record_id}`)} />;
}

const PencilIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M4 20l1-4L16 5l3 3L8 19l-4 1Z" stroke="#6367FF" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

export default function MainPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: profile } = useGetMyProfile(!!accessToken);
  const { data: recent } = useListDailyRecords({ size: 3 }, !!accessToken);
  const weekFlow = useWeekFlow();
  const [stripOpen, setStripOpen] = useState(true);
  const [friendNotice, setFriendNotice] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(FRIEND_NOTICE_KEY)) setFriendNotice(true);
    } catch {
      // storage 접근 불가 시 알림 생략
    }
  }, []);

  const dismissNotice = (go: boolean) => {
    try {
      localStorage.setItem(FRIEND_NOTICE_KEY, '1');
    } catch {}
    setFriendNotice(false);
    if (go) router.push('/mirror/results');
  };

  const today = new Date();
  const todayIndex = today.getDay();
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일 ${WEEKDAYS[todayIndex]}요일`;
  const prompt = PROMPTS[today.getDate() % PROMPTS.length];
  const completedToday = weekFlow[todayIndex] === 'done';
  const doneCount = weekFlow.filter((s) => s === 'done').length;
  const streak = (() => {
    let n = 0;
    for (let i = completedToday ? todayIndex : todayIndex - 1; i >= 0 && weekFlow[i] === 'done'; i--) n++;
    return n;
  })();
  const accuracy = accessToken ? (profile?.latest_accuracy?.accuracy_percent ?? 0) : 76;
  const weekRate = Math.round((doneCount / 7) * 100);
  const hasRealRecent = !!accessToken && !!recent && recent.records.length > 0;

  return (
    <Screen
      nav
      overlay={
        <Modal open={friendNotice} onClose={() => dismissNotice(false)}>
          <div className="flex flex-col items-center text-center">
            <Img3D name="megaphone" size={96} />
            <p className="text-[18px] font-bold text-ink leading-snug mt-3">
              소희님, 친구의 답이
              <br />
              도착했어요
            </p>
            <p className="text-[13px] text-sub mt-2">3 / 5명 응답 · 내가 몰랐던 나를 확인해보세요</p>
            <div className="grid grid-cols-2 gap-2 w-full mt-6">
              <Button variant="gray" className="h-12 bg-[#E6E6EC]" onClick={() => dismissNotice(false)}>
                나중에
              </Button>
              <Button className="h-12" onClick={() => dismissNotice(true)}>
                확인하기
              </Button>
            </div>
          </div>
        </Modal>
      }
    >
      <div className="flex items-center justify-between px-5 h-14">
        <span className="text-[22px] font-bold text-ink tracking-tight">metame</span>
        <Link href="/settings" className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center" aria-label="설정">
          <GearIcon size={18} />
        </Link>
      </div>

      <div className="px-5">
        <div className="flex justify-end">
          <button
            onClick={() => setStripOpen((v) => !v)}
            className="h-7 px-3 rounded-full bg-surface-2 text-[12px] font-medium text-[#48484F] flex items-center gap-1"
          >
            달성 현황
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className={stripOpen ? '' : 'rotate-180'}>
              <path d="M6 15l6-6 6 6" stroke="#48484F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {stripOpen && (
          <div className="flex items-center justify-between mt-2">
            {WEEKDAYS.map((d, i) => (
              <WeekdayPill key={d} label={d} status={weekFlow[i]} isToday={i === todayIndex} />
            ))}
            <Link href="/challenge" className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center" aria-label="기록 챌린지">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="#1A1A1E" strokeWidth="1.8" />
                <path d="M4 10h16M9 3v4M15 3v4" stroke="#1A1A1E" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      <div className="px-4 mt-4">
        <div
          className="rounded-[28px] px-5 pt-6 pb-5"
          style={{
            background: completedToday
              ? 'radial-gradient(60% 45% at 90% 5%, rgba(255,226,140,0.7) 0%, rgba(255,226,140,0) 70%), radial-gradient(50% 40% at 10% 45%, rgba(170,172,255,0.55) 0%, rgba(170,172,255,0) 70%), #F1F1F7'
              : 'linear-gradient(180deg, #E4E4F8 0%, #ECECF4 60%, #EFEFF3 100%)',
          }}
        >
          <p className="font-mono text-[13px] text-sub">{dateLabel}</p>
          <h1 className="text-[22px] font-bold text-ink leading-[1.45] mt-2 whitespace-pre-line">
            {completedToday ? '오늘 기록을\n완료했어요' : prompt}
          </h1>
          <div className="relative w-[172px] h-[152px] mx-auto mt-3 rounded-full bg-white flex items-center justify-center">
            <Img3D name="mascot-glasses" size={150} className="-mt-2" />
            {completedToday && (
              <span className="absolute right-1 bottom-1 w-10 h-10 rounded-full bg-primary border-[3px] border-white flex items-center justify-center">
                <CheckIcon size={16} />
              </span>
            )}
          </div>
          {completedToday ? (
            <button onClick={() => router.push('/diary/write')} className="w-full flex items-center justify-between mt-4 text-left">
              <div>
                <p className="text-[13px] font-semibold text-primary">연속 {streak}일 작성 완료</p>
                <p className="text-[17px] font-bold text-ink mt-1">새로운 기록 남기기</p>
              </div>
              <span className="w-10 h-10 rounded-full bg-ink flex items-center justify-center">
                <ChevronRight size={16} color="#FFFFFF" />
              </span>
            </button>
          ) : (
            <button
              onClick={() => router.push('/diary/chat')}
              className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 mt-4 text-left shadow-[0_4px_16px_rgba(26,26,30,0.04)]"
            >
              <span className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                <PencilIcon />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[12px] text-sub">아직 오늘 기록하지 않았어요 · 연속 {streak}일째</span>
                <span className="block text-[17px] font-bold text-primary mt-0.5">오늘 기록하러 가기</span>
              </span>
              <ChevronRight size={18} color="#8E8E95" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 mt-4 pb-4">
        {completedToday ? (
          <div className="rounded-3xl bg-card border border-line px-5 py-5 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-semibold text-ink">이번 주 달성률</span>
              <span className="text-[24px] font-bold text-ink">{weekRate}%</span>
            </div>
            <ProgressBar value={weekRate} className="mt-3" height={8} />
            <p className="text-[12px] text-sub mt-2.5">
              {doneCount} / 7일 · 문장 정확도 {accuracy}%
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between px-1 mb-3">
            <span className="text-[17px] font-bold text-ink">최근 기록</span>
            <Link href="/diary" className="text-[13px] text-sub">
              더보기
            </Link>
          </div>
        )}
        <div className="flex flex-col gap-2.5">
          {hasRealRecent
            ? recent.records.slice(0, completedToday ? 2 : 3).map((r) => <RealRecordRow key={r.record_id} record={r} />)
            : MOCK_DIARIES.slice(0, completedToday ? 2 : 3).map((d) => (
                <RecordRow key={d.id} title={d.title} date={d.date} onClick={() => router.push(`/diary/${d.id}`)} />
              ))}
        </div>
      </div>
    </Screen>
  );
}
