'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useGetMyProfile } from '@/entities/user';
import { Screen } from '@/components/ui/Screen';
import { ChevronLeft, ChevronRight, CogniImg, GearIcon, ProgressBar } from '@/components/ui/primitives';
import { Sheet } from '@/components/ui/overlays';
import { MyTabs } from '@/components/ui/MyTabs';
import { useMe } from '@/hooks/useMe';
import { useCollection } from '@/hooks/useCollection';

const NICKNAME_UNLOCK = 80;

export default function MyPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: profile } = useGetMyProfile(!!accessToken);
  const me = useMe();
  const collection = useCollection();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [shownIdx, setShownIdx] = useState<number | null>(null);
  const [collectionOpen, setCollectionOpen] = useState(false);

  const email = profile?.user.email ?? '';
  const handle = email ? email.split('@')[0] : '';
  const name = me.nickname || profile?.user.username || handle || '나';
  const days = profile ? Math.max(1, Math.ceil((Date.now() - new Date(profile.user.created_at).getTime()) / 86400000)) : 1;
  const level = Math.max(1, Math.floor(days / 20) + 1);
  const accuracy = profile?.latest_accuracy?.accuracy_percent ?? 0;
  const delta = profile?.latest_accuracy?.xp_delta ?? 0;
  const sentence = profile?.profile.ai_first_sentence || me.mySentence;
  const lv = `Lv.${String(level).padStart(2, '0')}`;
  // 기본은 가장 최근에 모은 코그니, ↺ 버튼으로 모은 코그니를 돌려 본다.
  const idx = shownIdx ?? collection.length - 1;
  const character = collection[idx];

  return (
    <Screen
      nav
      overlay={
        <Sheet open={collectionOpen} onClose={() => setCollectionOpen(false)} closeButton title="내가 모은 코그니" sub={<span className="text-[13px] text-sub">{collection.length}마리</span>}>
          <div className="px-5 pt-4 pb-6 max-h-[60vh] overflow-y-auto no-scrollbar">
            {collection.length === 0 ? (
              <p className="text-center text-[14px] text-sub py-10">아직 모은 코그니가 없어요</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {collection.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setShownIdx(i);
                      setCollectionOpen(false);
                    }}
                    className={`rounded-2xl px-2 pt-3 pb-3 flex flex-col items-center border ${i === idx ? 'border-primary bg-primary-soft' : 'border-line bg-white'}`}
                  >
                    <CogniImg src={c.image} size={64} />
                    <span className="text-[12px] font-semibold text-ink mt-2 text-center leading-tight">{c.name}</span>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => router.push('/dogam')} className="w-full h-11 mt-4 text-[14px] font-semibold text-primary">
              도감에서 보기 ›
            </button>
          </div>
        </Sheet>
      }
    >
      <div className="relative flex items-center justify-center h-14 px-5">
        <span className="text-[16px] font-semibold text-ink">마이페이지</span>
        <Link href="/settings" className="absolute right-5 w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center" aria-label="설정">
          <GearIcon size={18} />
        </Link>
      </div>

      <div className="flex items-center gap-4 px-5 pt-2 pb-5">
        <span className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center overflow-hidden shrink-0">
          {character && <CogniImg src={character.image} size={52} />}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[20px] font-bold text-ink">{name}</span>
            <span className="h-6 px-2 rounded-md bg-yellow text-[12px] font-bold text-ink inline-flex items-center">{lv}</span>
          </div>
          <p className="text-[13px] text-sub mt-1">
            {handle && `@${handle} · `}기록 {days}일차
          </p>
        </div>
      </div>

      <MyTabs active="month" />

      <div className="bg-surface-2 px-5 pt-12 pb-5">
        <div className="flex items-center justify-center gap-7">
          <button onClick={() => setMonth((m) => (m === 1 ? 12 : m - 1))} aria-label="이전 달">
            <ChevronLeft size={18} />
          </button>
          <span className="h-8 px-4 rounded-full bg-white text-[14px] font-bold text-ink inline-flex items-center">{month}월</span>
          <button onClick={() => setMonth((m) => Math.min(now.getMonth() + 1, m + 1))} disabled={month === now.getMonth() + 1} aria-label="다음 달">
            <ChevronRight size={18} color={month === now.getMonth() + 1 ? '#C9CBFF' : '#6367FF'} />
          </button>
        </div>
        <h1 className="text-[20px] font-bold text-ink text-center mt-5">이번 달, 나를 {accuracy}%만큼 알았어요</h1>
        <div className="mt-5 rounded-2xl bg-white grid grid-cols-3 py-3.5 mx-1">
          {[
            { label: '이번 달 레벨', value: lv, cls: 'text-primary' },
            { label: '모은 도감', value: `${collection.length}장`, cls: 'text-ink' },
            { label: '정확도 변화', value: `▲ ${delta}%`, cls: 'text-ink' },
          ].map((s, i) => (
            <div key={s.label} className={`text-center ${i > 0 ? 'border-l border-line' : ''}`}>
              <p className="text-[12px] text-sub">{s.label}</p>
              <p className={`text-[18px] font-bold mt-1 ${s.cls}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="relative flex justify-center items-center mt-9 mb-3 min-h-[180px]">
          {character ? (
            <div className="flex flex-col items-center">
              <CogniImg src={character.image} size={170} />
              <span className="mt-2 text-[13px] font-semibold text-[#48484F]">{character.name}</span>
            </div>
          ) : (
            <p className="text-[14px] text-sub">아직 모은 코그니가 없어요</p>
          )}
          <div className="absolute right-2 top-2 flex flex-col gap-3">
            <button
              onClick={() => collection.length > 1 && setShownIdx((idx - 1 + collection.length) % collection.length)}
              disabled={collection.length < 2}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center disabled:opacity-40"
              aria-label="다른 코그니 보기"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4.5h4.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button onClick={() => setCollectionOpen(true)} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center" aria-label="내가 모은 코그니">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M7 17L17 7M9 7h8v8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <button
          onClick={() => router.push('/mypage/nickname')}
          className="w-full text-left rounded-3xl bg-white px-5 py-5 shadow-[0_6px_24px_rgba(26,26,30,0.06)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[16px] font-bold text-ink">나의 문장</span>
            <span className="text-[13px] font-semibold text-primary">정확도 {accuracy}%</span>
          </div>
          <p className={`text-[15px] leading-[1.7] mt-3 ${sentence ? 'text-ink' : 'text-sub'}`}>{sentence || '아직 나의 문장이 없어요. 기록이 쌓이면 만들어져요.'}</p>
          <ProgressBar value={accuracy} className="mt-4" height={6} />
          <div className="flex items-center gap-2 mt-3">
            <span className="h-7 px-2.5 rounded-full bg-surface-2 text-[12px] text-[#48484F] inline-flex items-center gap-1">🔒 나의 별명</span>
            <span className="text-[12px] text-sub">{NICKNAME_UNLOCK}% 달성 시 열려요</span>
          </div>
        </button>
      </div>
    </Screen>
  );
}
