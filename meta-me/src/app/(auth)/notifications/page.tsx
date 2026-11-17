'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useGetNotificationSettings, useUpdateNotificationSettings, userApi } from '@/entities/user';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, TextButton } from '@/components/ui/primitives';
import { HourSlider } from '@/components/ui/HourSlider';
import { LogoMark } from '@/components/ui/brand';
import { PhoneOverlay } from '@/components/ui/overlays';
import { AUTH_FOOTER } from '@/components/ui/auth';

/** 오후 6시(18) ~ 새벽 2시(26) — 슬라이더 값은 18~26 사이 정수 시각. */
const MIN_HOUR = 18;
const MAX_HOUR = 26;

const hourLabel = (h: number) => {
  const hh = h % 24;
  if (hh === 0) return '자정';
  if (hh < 6) return `새벽 ${hh}시`;
  if (hh < 12) return `오전 ${hh}시`;
  if (hh === 12) return '낮 12시';
  return `오후 ${hh - 12}시`;
};

const PREVIEW_ICONS = [
  // 연필 · 막대 그래프 · 시계 (기록 · 리포트 · 알림 시간)
  'M3.738 20.967c-.454-.122-.712-.516-.742-.966v-5.243c.015-.43.137-.84.395-1.189l.191-.225L13.896 3.03c.69-.638 1.714-.781 2.515-.25l.313.25l4.243 4.243c.771.834.771 1.994 0 2.828l-2.433 2.433l-7.881 7.881c-.396.37-.872.567-1.414.586H3.996Zm1.263-6.207l-.005 4.241l4.241-.005l7.176-7.169l-4.243-4.242Zm8.583-8.59l4.243 4.243l1.714-1.726l-4.231-4.231Z',
  'M5 18h15c.543.036 1 .428 1 1s-.457.964-1 1H4c-.36-.024-.68-.178-.866-.5c-.101-.175-.121-.302-.134-.5V5c.036-.543.428-1 1-1s.964.457 1 1Zm10.034-8.259c.226-.842 1.396-.996 1.832-.241c.101.175.121.302.134.5v5c-.03.451-.288.844-.741.966c-.656.176-1.217-.327-1.259-.966v-5Zm-4-3C11.328 5.643 12.921 5.796 13 7v8c-.036.543-.428 1-1 1s-.964-.457-1-1V7Zm-4 5c.226-.842 1.396-.996 1.832-.241c.101.175.121.302.134.5v3c-.03.451-.288.844-.741.966c-.656.176-1.217-.327-1.259-.966v-3Z',
  'm13 11.586l2.707 2.707c.359.409.404 1.01 0 1.414s-1.005.359-1.414 0l-3-3l-.159-.207c-.101-.175-.121-.302-.134-.5V7c.03-.451.288-.844.741-.966c.656-.176 1.217.327 1.259.966Zm-1.742 10.386c-1.75-.119-3.446-.731-4.895-1.712C1.054 16.668.538 9.075 5.166 4.701a9.8 9.8 0 0 1 3.148-1.999a10.2 10.2 0 0 1 4.428-.674c1.75.119 3.446.731 4.895 1.712c5.309 3.592 5.825 11.185 1.197 15.559a9.8 9.8 0 0 1-3.148 1.999a10.2 10.2 0 0 1-4.428.674m.116-17.947a8 8 0 0 0-4.377 1.733C2.03 9.744 3.51 17.709 9.585 19.629a8 8 0 0 0 7.418-1.387c4.967-3.985 3.487-11.951-2.588-13.871a8.1 8.1 0 0 0-3.041-.346',
];

/** 폰 화면 위로 '오늘의 질문' 알림이 떠 있는 미리보기. 아래쪽은 흰색으로 흐려진다. */
function NotificationPreview() {
  return (
    <div className="relative mt-[27px] h-[525px] max-h-[60vh] overflow-hidden">
      <div className="absolute inset-x-13 top-0 bottom-0 rounded-t-[40px] border-[6px] border-b-0 border-[#F1F2F6] bg-white">
        <div className="flex flex-col gap-2.5 px-[18px] pt-[96px]">
          {PREVIEW_ICONS.map((d) => (
            <div key={d.slice(0, 8)} className="h-14 rounded-[14px] bg-surface flex items-center gap-3 px-3.5">
              <span className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#A1A1AA]">
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                  <path fill="currentColor" d={d} />
                </svg>
              </span>
              <span className="flex flex-col gap-[7px]">
                <span className="w-[151px] h-2 rounded-full bg-[#E4E5EC]" />
                <span className="w-[101px] h-2 rounded-full bg-[#ECEDF2]" />
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-6 top-[26px] h-[68px] rounded-[18px] bg-white shadow-[0_12px_32px_rgba(30,30,60,0.14),0_0_0_0.5px_rgba(30,30,60,0.06)] flex items-center gap-3 px-4">
        <span className="w-10 h-10 rounded-[11px] bg-primary flex items-center justify-center shrink-0">
          <LogoMark size={26} color="#FFFFFF" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="flex items-baseline justify-between">
            <b className="text-[14px] font-bold text-ink">오늘의 질문이 도착했어요</b>
            <span className="text-[13px] text-[#A1A1AA]">지금</span>
          </span>
          <span className="block text-[13px] text-[#52525B] mt-0.5 truncate">“오늘 하루는 어떤 장면으로 남았나요?”</span>
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[160px] bg-[linear-gradient(rgba(255,255,255,0)_0%,#FFFFFF_90%)]" />
    </div>
  );
}

/** 서버 "HH:mm" → 슬라이더 시각(18~26). 범위 밖이면 null. */
const toSliderHour = (time?: string | null) => {
  const h = Number(time?.split(':')[0]);
  if (!time || Number.isNaN(h)) return null;
  const v = h < 6 ? h + 24 : h;
  return v >= MIN_HOUR && v <= MAX_HOUR ? v : null;
};

export default function NotificationsPage() {
  return (
    <Suspense>
      <NotificationsContent />
    </Suspense>
  );
}

function NotificationsContent() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  // 설정 > 기록 리마인더에서 들어오면 시간만 바꾸고 설정으로 돌아간다 (온보딩으로 보내지 않음).
  const fromSettings = useSearchParams().get('from') === 'settings';
  const { data: current } = useGetNotificationSettings(!!accessToken && fromSettings);
  const updateSettings = useUpdateNotificationSettings();
  const [step, setStep] = useState<'permission' | 'time'>(fromSettings ? 'time' : 'permission');
  const [dialog, setDialog] = useState(false);
  const [hour, setHour] = useState(22);

  // 설정에서 들어온 경우 현재 저장된 시각으로 슬라이더를 맞춘다.
  const savedHour = toSliderHour(current?.daily_question_time);
  useEffect(() => {
    if (savedHour !== null) setHour(savedHour);
  }, [savedHour]);

  const goOnboarding = () => router.push('/onboarding');
  const goNext = () => (fromSettings ? router.back() : goOnboarding());

  // 데일리 질문 알림 시각을 서버(daily_question_time, HH:mm)에 저장한다.
  const saveTime = async () => {
    if (accessToken) {
      try {
        const current = await userApi.getNotificationSettings();
        await updateSettings.mutateAsync({ ...current, daily_question_time: `${String(hour % 24).padStart(2, '0')}:00` });
      } catch {
        // 실패해도 흐름은 이어간다
      }
    }
    goNext();
  };

  const allow = async (enabled: boolean) => {
    setDialog(false);
    if (accessToken) {
      try {
        const current = await userApi.getNotificationSettings();
        await updateSettings.mutateAsync({ ...current, push_enabled: enabled });
      } catch {
        // 알림 설정 실패는 흐름을 막지 않음
      }
    }
    if (enabled) setStep('time');
    else goOnboarding();
  };

  if (step === 'time') {
    return (
      <Screen
        footerClassName={AUTH_FOOTER}
        footer={
          <>
            <Button onClick={saveTime} disabled={updateSettings.isPending}>
              이 시간에 알림 받기
            </Button>
            <TextButton className="h-11" onClick={goNext}>
              {fromSettings ? '취소' : '나중에 설정할게요'}
            </TextButton>
          </>
        }
      >
        <div className="px-5 pt-0">
          <BackButton onClick={() => (fromSettings ? router.back() : setStep('permission'))} />
          <h1 className="text-[24px] font-bold text-ink leading-[1.4] tracking-[-0.01em] mt-8">
            매일 몇 시에
            <br />
            기록 알림을 드릴까요?
          </h1>
          <p className="text-[15px] text-[#71717A] mt-2">하루 3분, 이 시간에 오늘의 질문을 보내드려요</p>
        </div>
        <div className="px-6">
          <div className="flex flex-col items-center mt-[52px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v2/clock-3d.png" alt="" width={112} height={112} draggable={false} />
            <p className="text-[40px] font-extrabold text-ink tracking-[-0.03em] mt-6">{hourLabel(hour)}</p>
          </div>
          <div className="mt-8">
            <HourSlider min={MIN_HOUR} max={MAX_HOUR} value={hour} onChange={setHour} />
            <div className="flex justify-between text-[14px] text-[#8A8A96] mt-3">
              <span>{hourLabel(MIN_HOUR)}</span>
              <span>{hourLabel(22)}</span>
              <span>{hourLabel(MAX_HOUR)}</span>
            </div>
          </div>
          <div className="mt-9 rounded-2xl bg-surface px-5 py-[18px] flex gap-2.5">
            <span className="text-[15px] font-extrabold text-primary">TIP</span>
            <div>
              <p className="text-[15px] font-bold text-ink">잠들기 전이 기록하기 좋아요</p>
              <p className="text-[13px] text-[#71717A] mt-1 leading-[1.55]">
                하루를 되돌아보기 좋은 밤 10시를 추천해요. 알림 시간은 설정에서 언제든 바꿀 수 있어요.
              </p>
            </div>
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen
      overlay={
        dialog && (
          <PhoneOverlay>
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#11111E]/[0.62] animate-fade-in">
            <div
              role="alertdialog"
              aria-label="알림 허용"
              className="w-[300px] rounded-[14px] bg-card shadow-[0_24px_60px_rgba(20,20,40,0.22)] overflow-hidden animate-pop-in"
            >
              <div className="px-5 pt-5 pb-4 text-center">
                <p className="text-[15px] font-bold text-ink">‘메타미’ 에서 알림을 보내고자 합니다.</p>
                <p className="text-[13px] leading-[1.6] text-[#3F3F46] mt-2">
                  경고, 사운드 및 아이콘 배지가 알림에 포함될 수 있습니다. 설정에서 이를 구성할 수 있습니다.
                </p>
              </div>
              <div className="grid grid-cols-2 border-t border-[#E1E1E6]">
                <button onClick={() => allow(false)} className="h-12 text-[15px] text-[#3F3F46] border-r border-[#E1E1E6]">
                  허용하지 않음
                </button>
                <button onClick={() => allow(true)} className="h-12 text-[15px] font-semibold text-[#4A4ED9]">
                  허용
                </button>
              </div>
            </div>
          </div>
          </PhoneOverlay>
        )
      }
      footerClassName={AUTH_FOOTER}
      footer={
        <>
          <Button onClick={() => setDialog(true)}>알림받기</Button>
          <TextButton className="h-11" onClick={goOnboarding}>
            나중에
          </TextButton>
        </>
      }
    >
      <div className="px-6">
        <BackButton />
      </div>
      <div className="text-center px-6 mt-6">
        <h1 className="text-[24px] font-bold text-ink leading-[1.45] tracking-[-0.02em]">
          오늘의 질문을 놓치지 않도록
          <br />
          알림을 허용해 주세요
        </h1>
        <p className="text-[15px] leading-[1.65] text-[#8A8A96] mt-3">
          하루 한 번, 데일리 질문과 리포트 미 소식을
          <br />
          알림으로 알려드릴게요.
        </p>
      </div>
      <NotificationPreview />
    </Screen>
  );
}
