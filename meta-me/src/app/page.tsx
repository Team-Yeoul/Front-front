'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/primitives';
import { LogoMark } from '@/components/ui/brand';
import { Span, Text } from '@/components/ui/Text';
import { LinearGradient, Portal, View, absoluteFill } from '@/components/ui/rn';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import { FarewellSheet } from '@/components/settings/PeekSheet';
import { useAuthStore } from '@/store';
import { router } from '@/lib/router';
import { useTheme } from '@/lib/theme';

/** 스플래시를 보여주는 시간(ms) */
const SPLASH_MS = 2600;
/** 스플래시 1단계(심볼) → 2단계(문구 + 워드마크)로 바뀌는 시점(ms) */
const SPLASH_LOGO_MS = 1200;
/** 스플래시가 걷히며 시작 화면으로 넘어가는 시간(ms) */
const TRANSITION_MS = 900;
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const PRIMARY = '#6367FF';

/** 스플래시는 앱을 처음 열 때만 보여준다. 앱 안에서 이동하는 동안 유지되고(로그인 → 뒤로가기 등) 새로고침하면 초기화된다. */
let splashShown = false;

/** 심볼과 문구는 같은 자리에 겹쳐 두고 서로 엇갈려 페이드한다(살짝 커지며 나타남). */
function CrossFade({ visible, children }: { visible: boolean; children: ReactNode }) {
  return (
    <View
      className="items-center justify-center motion-reduce:transition-none"
      style={{
        ...absoluteFill,
        opacity: visible ? 1 : 0,
        transform: `scale(${visible ? 1 : 0.96})`,
        transition: 'opacity 500ms ease-out, transform 500ms ease-out',
      }}
    >
      {children}
    </View>
  );
}

/**
 * 시작 화면 위에 겹쳐 놓았다가 서서히 걷어내는 스플래시. 보라 바탕에
 * 심볼(7a00) → 문구 + 워드마크(7a0) 순서로 바뀐다.
 * 폰 화면(#phone-screen) 전체에 깔아 상태바·홈 인디케이터 뒤까지 채운다(상태바는 z-10이라 그 위에 보인다).
 */
function SplashOverlay({ leaving }: { leaving: boolean }) {
  const [showText, setShowText] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowText(true), SPLASH_LOGO_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <Portal>
      <View
        className="z-[5] motion-reduce:transition-none"
        pointerEvents={leaving ? 'none' : 'auto'}
        style={{ ...absoluteFill, backgroundColor: PRIMARY, opacity: leaving ? 0 : 1, transition: `opacity ${TRANSITION_MS}ms ease-in-out` }}
      >
        {/* 배경보다 글자를 먼저 지워서 시작 화면 로고와 겹쳐 보이지 않게 한다. */}
        <View className="motion-reduce:transition-none" style={{ ...absoluteFill, opacity: leaving ? 0 : 1, transition: 'opacity 300ms' }}>
          <CrossFade visible={!showText}>
            <LogoMark size={108} color="#FFFFFF" />
          </CrossFade>
          <CrossFade visible={showText}>
            <Text className="text-[20px] text-white">
              나를 이해하는 <Span className="font-bold text-white">짧은 기록</Span>
            </Text>
            <Text className="mt-2 text-[52px] font-bold text-white tracking-tighter" style={{ lineHeight: '56px' }}>
              metame
            </Text>
          </CrossFade>
        </View>
      </View>
    </Portal>
  );
}

/** 스플래시가 걷히기 시작하면 아래에서 살짝 올라오며 나타난다. */
function Reveal({ show, delay, children }: { show: boolean; delay: number; children: ReactNode }) {
  return (
    <View
      className="motion-reduce:transition-none"
      style={{
        opacity: show ? 1 : 0,
        transform: `translateY(${show ? 0 : 24}px)`,
        transition: `opacity 700ms ${EASE} ${delay}ms, transform 700ms ${EASE} ${delay}ms`,
      }}
    >
      {children}
    </View>
  );
}

/**
 * 시작 화면 위쪽: 보라 → 흰색으로 번지는 배경.
 * 화면 높이의 20% 아래에 내려가 있다가 스플래시와 함께 제자리로 올라온다.
 * 올라오는 동안 위가 흰색으로 비치지 않게 맨 위 40%는 보라색으로 미리 깔아 둔다.
 */
function TopGradient({ revealed }: { revealed: boolean }) {
  // 아래쪽 흰 바탕은 다크 모드에서 화면 바탕색으로 바뀐다(위쪽 보라는 그대로).
  const { bg } = useTheme();
  return (
    <View style={{ ...absoluteFill, backgroundColor: bg('#FFFFFF') }}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '40%', backgroundColor: PRIMARY }} />
      <View
        className="motion-reduce:transition-none"
        style={{ ...absoluteFill, transform: `translateY(${revealed ? 0 : 20}%)`, transition: `transform ${TRANSITION_MS}ms ${EASE}` }}
      >
        <LinearGradient
          style={absoluteFill}
          colors={[PRIMARY, PRIMARY, '#8F92FF', bg('#E9E9FF'), bg('#FFFFFF')]}
          locations={[0, 0.22, 0.38, 0.5, 0.58]}
        />
      </View>
    </View>
  );
}

function StartScreen() {
  const token = useAuthStore((s) => s.accessToken);
  // 회원탈퇴 직후(?bye=이름)면 시작 화면 위에 인사 시트를 띄운다. '-'는 이름이 없는 경우.
  const bye = useSearchParams().get('bye') ?? undefined;
  const [skipSplash] = useState(() => splashShown);
  const [phase, setPhase] = useState<'splash' | 'leaving' | 'start'>(skipSplash ? 'start' : 'splash');
  const revealed = phase !== 'splash';
  const redirect = skipSplash && !!token;

  useEffect(() => {
    if (skipSplash) return;
    // 스플래시를 보여준 뒤 걷어내고, 이미 로그인한 사용자는 메인으로 보낸다.
    const leave = setTimeout(() => {
      splashShown = true;
      if (useAuthStore.getState().accessToken) router.replace('/main');
      else setPhase('leaving');
    }, SPLASH_MS);
    const done = setTimeout(() => setPhase('start'), SPLASH_MS + TRANSITION_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, [skipSplash]);

  // 스플래시를 이미 봤다면 로그인한 사용자는 바로 메인으로.
  useEffect(() => {
    if (redirect) router.replace('/main');
  }, [redirect]);
  if (redirect) return null;

  return (
    <View className="h-full">
      <Screen
        bg={PRIMARY}
        statusFg="light"
        background={<TopGradient revealed={revealed} />}
        contentClassName="flex-grow"
        footer={
          <Reveal show={revealed} delay={450}>
            <View className="gap-3">
              <Button onPress={() => router.push('/login')}>로그인</Button>
              <GoogleLoginButton />
            </View>
            <View className="flex-row justify-center mt-3">
              <Text className="text-[12px] text-sub">계정이 존재하지 않는다면? </Text>
              <Link href="/terms">
                <Text className="text-[12px] text-primary font-semibold">회원가입</Text>
              </Link>
            </View>
          </Reveal>
        }
      >
        <Reveal show={revealed} delay={150}>
          <View className="items-center pt-[156px]">
            <LogoMark size={112} color="#FFFFFF" />
            <Text
              className="text-[46px] font-bold text-white tracking-tight mt-2"
              style={{ lineHeight: '50px', textShadow: '0 6px 20px rgba(60,60,200,0.25)' }}
            >
              metame
            </Text>
          </View>
        </Reveal>
        <View className="flex-1 min-h-8" />
        <Reveal show={revealed} delay={300}>
          <View className="px-6 pb-8">
            <Text className="text-[24px] font-bold text-ink leading-[32px] tracking-tight">{'하루 한 번의 기록으로\n나를 한 문장으로'}</Text>
            <Text className="text-[16px] text-text-4 mt-3 leading-[26px]">질문에 답하기만 하면 됩니다. 기록이 쌓일수록 그 문장이 정확해져요.</Text>
          </View>
        </Reveal>
      </Screen>
      {phase !== 'start' && <SplashOverlay leaving={phase === 'leaving'} />}
      <FarewellSheet open={!!bye && !token} name={bye && bye !== '-' ? bye : undefined} onClose={() => router.replace('/')} />
    </View>
  );
}

export default function StartPage() {
  // useSearchParams를 쓰는 화면은 Suspense로 감싸야 한다(Next).
  return (
    <Suspense>
      <StartScreen />
    </Suspense>
  );
}
