'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { router } from '@/lib/router';
import { AUTH_STORAGE_KEY, syncAuthFromStorage, useAuthStore, useLocalStore } from '@/store';
import { useThemeStore } from '@/lib/theme';
import { useMe } from '@/hooks/useMe';
import { clearTermsPendingIfAgreed } from '@/hooks/useSensitiveConsent';
import { useCheckInAttendance } from '@/entities/user';

/**
 * 로그인해야 들어올 수 있는 화면들(앱 (app) 그룹, Stack.Protected). 웹 주소는 앱 경로와 같다.
 * 나머지(시작·로그인·가입·약관·비밀번호 찾기·알림 설정, 웹 공유 링크 /feedback, 없는 주소)는 로그인 없이 열린다.
 */
const PROTECTED = ['/main', '/diary', '/chat', '/report', '/mypage', '/challenge', '/dogam', '/inbox', '/mirror', '/onboarding', '/settings'];
const isProtected = (path: string) => PROTECTED.some((p) => path === p || path.startsWith(`${p}/`));

/** 로그아웃 직후 화면이 직접 시작 화면으로 보내는 것(탈퇴 인사 ?bye= 등)을 기다리는 시간(ms) */
const LOGOUT_REDIRECT_DELAY = 1000;

/**
 * 앱 루트 레이아웃(_layout.tsx)과 (app) 레이아웃의 웹 자리.
 * - 저장된 로그인/기기/테마 데이터를 복원할 때까지 화면을 그리지 않는다(앱은 스플래시를 유지).
 * - 로그인하지 않은 채 (app) 화면에 들어오면 시작 화면으로 보낸다(Stack.Protected).
 * - Google로 막 가입해 약관 동의가 남은 사용자는 어느 화면에 있든 약관 화면으로 보낸다(useTermsPendingRedirect).
 * - (app) 화면에 들어오면 오늘 출석을 남긴다((app)/_layout).
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const token = useAuthStore((s) => s.accessToken);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([useAuthStore.persist.rehydrate(), useLocalStore.persist.rehydrate(), useThemeStore.persist.rehydrate()]).finally(() =>
      setReady(true),
    );
  }, []);

  // 다른 탭에서 토큰을 갱신하거나 로그인·로그아웃하면 이 탭에도 바로 반영한다.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY || e.key === null) void syncAuthFromStorage();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const inApp = isProtected(pathname);
  const blocked = ready && !token && inApp;

  // 이 탭에서 로그인한 적이 있는지. 로그아웃·탈퇴 화면은 토큰을 지운 뒤 직접 시작 화면으로 이동하므로(?bye= 등)
  // 그 이동을 덮지 않게 조금 기다렸다가, 그래도 (app) 화면에 남아 있으면(토큰 갱신 실패 등) 시작 화면으로 보낸다.
  const hadToken = useRef(false);
  if (token) hadToken.current = true;
  useEffect(() => {
    if (!blocked) return;
    if (!hadToken.current) {
      router.replace('/');
      return;
    }
    const t = setTimeout(() => router.replace('/'), LOGOUT_REDIRECT_DELAY);
    return () => clearTimeout(t);
  }, [blocked, pathname]);

  if (!ready || blocked) return null;
  return (
    <>
      <TermsPendingRedirect pathname={pathname} />
      {inApp && token && <AppLayoutEffects />}
      {children}
    </>
  );
}

/**
 * Google로 막 가입해 약관 동의가 남은 사용자는 어느 화면에 있든 약관 화면으로 보낸다.
 * 보내기 전에 서버 약관 동의를 한 번 확인한다. 동의 저장 뒤 기기 표시를 지우기 전에 앱이 닫혔다면,
 * 서버에는 이미 동의가 있으므로 표시만 지우고 약관 화면으로 보내지 않는다. 확인에 실패하면 약관 화면으로 보낸다.
 * (민감정보 동의 화면에서 agree()가 'terms-required'를 돌려준 경우도 termsPending이 켜져 여기서 약관 화면으로 간다)
 */
function TermsPendingRedirect({ pathname }: { pathname: string }) {
  const token = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.userId);
  const { termsPending } = useMe();
  // 서버 동의를 확인한 계정. 확인이 끝나기 전에는 약관 화면으로 보내지 않는다.
  const [checked, setChecked] = useState<string | null>(null);
  const pending = !!token && !!userId && !!termsPending && pathname !== '/terms';

  useEffect(() => {
    if (!pending || !userId || checked === userId) return;
    let alive = true;
    void clearTermsPendingIfAgreed(userId).finally(() => {
      if (alive) setChecked(userId);
    });
    return () => {
      alive = false;
    };
  }, [pending, userId, checked]);

  const mustAgreeTerms = pending && checked === userId;
  useEffect(() => {
    if (mustAgreeTerms) router.replace('/terms');
  }, [mustAgreeTerms]);
  return null;
}

/** 로그인한 사용자만 들어오는 화면들((app) 레이아웃)에 들어올 때 한 번 하는 일. */
function AppLayoutEffects() {
  const { mutate: checkIn } = useCheckInAttendance();
  // 앱에 들어올 때 오늘 출석을 남긴다. 서버가 하루 한 번만 기록하므로(멱등) 여러 번 불려도 괜찮고, 실패해도 화면에는 영향이 없다.
  // (앱의 받은 푸시 모으기(useCollectPushes)는 웹에 푸시 알림이 없어 하지 않는다)
  useEffect(() => {
    checkIn();
  }, [checkIn]);
  return null;
}
