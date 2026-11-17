'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/primitives';
import { LogoMark, SPLASH_BG } from '@/components/ui/brand';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { useAuthStore } from '@/store';

/** 스플래시를 보여주는 시간(ms) */
const SPLASH_MS = 2600;
/** 스플래시 1단계(심볼) → 2단계(문구 + 워드마크)로 바뀌는 시점(ms) */
const SPLASH_LOGO_MS = 1200;
/** 스플래시가 걷히며 시작 화면으로 넘어가는 시간(ms) */
const TRANSITION_MS = 900;
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
/** 시작 화면 배경: 위쪽 절반이 보라색에서 흰색으로 번진다 */
const HERO_GRADIENT = 'linear-gradient(180deg, #6367FF 0%, #6367FF 22%, #8F92FF 38%, #E9E9FF 50%, #FFFFFF 58%)';

/**
 * 스플래시는 앱을 처음 열 때만 보여준다. 모듈 변수라 앱 안에서 이동하는 동안 유지되고(로그인 → 뒤로가기 등)
 * 새로고침하면 초기화된다.
 */
let splashShown = false;

/**
 * 시작 화면 위에 겹쳐 놓았다가 서서히 걷어내는 스플래시. 심볼(7a00) → 문구 + 워드마크(7a0) 순서로 바뀐다.
 * 폰 화면(#phone-screen) 전체에 포털로 깔아서 하단 홈 인디케이터 영역까지 배경이 꽉 차게 한다.
 * (상태바·인디케이터는 z-10이라 그 위에 그대로 보인다)
 */
function SplashOverlay({ leaving }: { leaving: boolean }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [showText, setShowText] = useState(false);
  useEffect(() => setTarget(document.getElementById('phone-screen')), []);
  useEffect(() => {
    const t = setTimeout(() => setShowText(true), SPLASH_LOGO_MS);
    return () => clearTimeout(t);
  }, []);

  // 심볼과 문구는 같은 자리에 겹쳐 두고 서로 엇갈려 페이드한다.
  const fade = (visible: boolean) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'scale(1)' : 'scale(0.96)',
    transition: 'opacity 500ms ease-out, transform 500ms ease-out',
  });

  const splash = (
    <div
      className={`absolute inset-0 overflow-hidden ${target ? 'z-[5]' : 'z-50'} motion-reduce:transition-none`}
      style={{
        opacity: leaving ? 0 : 1,
        transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
        pointerEvents: leaving ? 'none' : 'auto',
        background: SPLASH_BG,
      }}
    >
      {/* 배경보다 글자를 먼저 지워서 시작 화면 로고와 겹쳐 보이지 않게 한다. */}
      <div className="relative h-full transition-opacity duration-300" style={{ opacity: leaving ? 0 : 1 }}>
        <div className="absolute inset-0 flex items-center justify-center motion-reduce:transition-none" style={fade(!showText)}>
          <LogoMark size={108} color="#FFFFFF" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center motion-reduce:transition-none" style={fade(showText)}>
          <p className="text-[19px] text-white">
            나를 이해하는 <b className="font-bold">짧은 기록</b>
          </p>
          <span className="block mt-2 text-[52px] font-extrabold text-white tracking-[-0.03em] leading-none">metame</span>
        </div>
      </div>
    </div>
  );
  return target ? createPortal(splash, target) : splash;
}

/** 스플래시가 걷히기 시작하면 아래에서 살짝 올라오며 나타난다. */
function Reveal({ show, delay, children, className = '' }: { show: boolean; delay: number; children: ReactNode; className?: string }) {
  return (
    <div
      className={`motion-reduce:transition-none ${className}`}
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
        // 배경을 상태바 뒤까지 깔아 상태바를 늘 투명하게 둔다.
        bleed
        statusFg="light"
        indicatorFg={phase === 'splash' ? 'light' : 'dark'}
        background={
          <div className="absolute inset-0 bg-white">
            {/* 보라 영역이 올라오는 동안 그 위가 흰색으로 비치지 않게, 그라데이션 맨 위 색으로 미리 깔아 둔다. */}
            <div className="absolute inset-x-0 top-0 h-[40%] bg-primary" />
            {/* 위쪽 보라 영역: 아래로 내려가 있다가 스플래시가 걷히면서 제자리로 올라온다. */}
            <div
              className="absolute inset-0 motion-reduce:transition-none"
              style={{
                background: HERO_GRADIENT,
                transform: revealed ? 'translateY(0)' : 'translateY(20%)',
                transition: `transform ${TRANSITION_MS}ms ${EASE}`,
              }}
            />
          </div>
        }
      >
        <div className="flex flex-col min-h-full">
          <Reveal show={revealed} delay={150} className="flex flex-col items-center pt-[156px]">
            <LogoMark size={112} color="#FFFFFF" />
            <span className="text-[46px] font-bold text-white tracking-[-0.02em] leading-none mt-2 drop-shadow-[0_6px_20px_rgba(60,60,200,0.25)]">
              metame
            </span>
          </Reveal>

          <div className="flex-1 min-h-8" />

          <Reveal show={revealed} delay={300} className="px-6">
            <h1 className="text-[30px] font-bold text-ink leading-[1.35] tracking-[-0.02em]">
              하루 한 번의 기록으로
              <br />
              나를 한 문장으로
            </h1>
            <p className="text-[15px] leading-[1.65] text-[#71717A] mt-3">
              질문에 답하기만 하면 됩니다. 기록이 쌓일수록 그 문장이 정확해져요.
            </p>
          </Reveal>

          <Reveal show={revealed} delay={450} className="px-7 pt-8 pb-8">
            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push('/login')}>로그인</Button>
              <GoogleLoginButton />
            </div>
            <p className="mt-3 text-center text-[13px] text-sub">
              계정이 존재하지 않는다면?{' '}
              <Link href="/terms" className="text-primary font-semibold">
                회원가입
              </Link>
            </p>
          </Reveal>
        </div>
      </Screen>
      {phase !== 'start' && <SplashOverlay leaving={phase === 'leaving'} />}
    </div>
  );
}
