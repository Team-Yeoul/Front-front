'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/primitives';
import { LogoMark } from '@/components/ui/brand';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { useAuthStore } from '@/store';

/** 스플래시를 보여주는 시간(ms) */
const SPLASH_MS = 2600;
/** 스플래시가 위로 걷히며 시작 화면으로 넘어가는 시간(ms) */
const TRANSITION_MS = 900;
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

/**
 * 스플래시는 앱을 처음 열 때만 보여준다. 모듈 변수라 앱 안에서 이동하는 동안 유지되고(로그인 → 뒤로가기 등)
 * 새로고침하면 초기화된다.
 */
let splashShown = false;

/**
 * 시작 화면 위에 겹쳐 놓았다가 서서히 걷어내는 스플래시. (밀어 올리면 아래 끝이 가로선처럼 드러나서 페이드만 한다)
 * 폰 화면(#phone-screen) 전체에 포털로 깔아서 하단 홈 인디케이터 영역까지 배경이 꽉 차게 한다.
 * (상태바·인디케이터는 z-10이라 그 위에 그대로 보인다)
 */
function SplashOverlay({ leaving }: { leaving: boolean }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setTarget(document.getElementById('phone-screen')), []);

  const splash = (
    <div
      className={`absolute inset-0 overflow-hidden ${target ? 'z-[5]' : 'z-50'} motion-reduce:transition-none`}
      style={{
        opacity: leaving ? 0 : 1,
        transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
        pointerEvents: leaving ? 'none' : 'auto',
        background: 'linear-gradient(180deg, #4F52E5 0%, #8E8BFF 35%, #7C80FF 55%, #3B3E9E 80%, #2E3190 100%)',
      }}
    >
      {/* 빛 번짐 두 개가 천천히 떠다닌다. 움직여도 가장자리가 드러나지 않게 화면보다 15%씩 크게 깔고 위치를 그만큼 보정했다. */}
      <div
        className="absolute -inset-[15%] animate-splash-drift-a"
        style={{ background: 'radial-gradient(46% 23% at 11.5% 28.5%, rgba(255,200,190,0.55) 0%, rgba(255,200,190,0) 70%)' }}
      />
      <div
        className="absolute -inset-[15%] animate-splash-drift-b"
        style={{ background: 'radial-gradient(54% 31% at 77% 54%, rgba(200,200,255,0.9) 0%, rgba(200,200,255,0) 70%)' }}
      />
      {/* 배경보다 글자를 먼저 지워서 시작 화면 로고와 겹쳐 보이지 않게 한다. */}
      <div
        className="relative h-full flex flex-col items-center justify-center transition-opacity duration-300"
        style={{ opacity: leaving ? 0 : 1 }}
      >
        <p className="text-[17px] text-white/90">
          나를 이해하는 <b className="font-bold text-white">짧은 기록</b>
        </p>
        <div className="flex items-center gap-3 mt-3">
          <LogoMark size={46} color="#FFFFFF" />
          <span className="text-[34px] font-semibold text-white tracking-tight">metame</span>
        </div>
        <p className="absolute bottom-8 text-[12px] text-white/80">나를 이해하는 가장 짧은 기록</p>
      </div>
    </div>
  );
  return target ? createPortal(splash, target) : splash;
}

/** 스플래시가 걷히기 시작하면 아래에서 살짝 올라오며 나타난다. */
function Reveal({ show, delay, children }: { show: boolean; delay: number; children: ReactNode }) {
  return (
    <div
      className="motion-reduce:transition-none"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 600ms ease-out ${delay}ms, transform 700ms ${EASE} ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function StartPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const [skipSplash] = useState(() => splashShown);
  const [phase, setPhase] = useState<'splash' | 'leaving' | 'start'>(skipSplash ? 'start' : 'splash');
  const revealed = phase !== 'splash';

  useEffect(() => {
    if (skipSplash) {
      if (token) router.replace('/main');
      return;
    }
    // 스플래시를 보여준 뒤 걷어내고, 이미 로그인한 사용자는 메인으로 보낸다.
    const leave = setTimeout(() => {
      splashShown = true;
      if (token) router.replace('/main');
      else setPhase('leaving');
    }, SPLASH_MS);
    const done = setTimeout(() => setPhase('start'), SPLASH_MS + TRANSITION_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, [skipSplash, token, router]);

  return (
    <div className="relative h-full">
      <Screen
        // 보라색 영역이 올라오는 동안 위쪽 빈 공간이 흰색으로 비치지 않도록 상단 색으로 채운다.
        bg="#4F52E5"
        // 스플래시 동안엔 상태바를 투명하게 둬서 배경 그라데이션이 끊기지 않게 한다.
        statusBg={phase === 'splash' ? 'transparent' : '#4F52E5'}
        statusFg="light"
        indicatorFg={phase === 'splash' ? 'light' : 'dark'}
        background={
          // 상단 보라색 영역: 아래쪽에 내려가 있다가 스플래시와 함께 제자리로 올라온다.
          <div
            className="absolute inset-0 motion-reduce:transition-none"
            style={{
              background:
                'linear-gradient(180deg, #4F52E5 0%, #6367FF 22%, #8F92FF 38%, #E9E9FF 50%, #FFFFFF 58%)',
              transform: revealed ? 'translateY(0)' : 'translateY(35%)',
              transition: `transform ${TRANSITION_MS}ms ${EASE}`,
            }}
          />
        }
        footer={
          <Reveal show={revealed} delay={450}>
            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push('/login')}>로그인</Button>
              <GoogleLoginButton />
              <p className="text-center text-[13px] text-sub mt-1">
                계정이 존재하지 않는다면?{' '}
                <Link href="/terms" className="text-primary font-semibold">
                  회원가입
                </Link>
              </p>
            </div>
          </Reveal>
        }
      >
        <Reveal show={revealed} delay={150}>
          <div className="flex flex-col items-center pt-[165px]">
            <LogoMark size={112} color="#FFFFFF" />
            <span className="text-[44px] font-bold text-white tracking-tight -mt-1 drop-shadow-[0_6px_20px_rgba(60,60,200,0.25)]">
              metame
            </span>
          </div>
        </Reveal>
        <Reveal show={revealed} delay={300}>
          <div className="px-7 mt-[150px]">
            <h1 className="text-[27px] font-bold text-ink leading-[1.4]">
              하루 한 번의 기록으로
              <br />
              나를 한 문장으로
            </h1>
            <p className="text-[14px] text-[#6B6B73] mt-4 leading-relaxed">
              질문에 답하기만 하면 됩니다. 기록이 쌓일수록 그 문장이 정확해져요.
            </p>
          </div>
        </Reveal>
      </Screen>
      {phase !== 'start' && <SplashOverlay leaving={phase === 'leaving'} />}
    </div>
  );
}
