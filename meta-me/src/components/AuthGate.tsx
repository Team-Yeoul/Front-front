'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, useLocalStore } from '@/store';

/** 로그인 없이 볼 수 있는 경로. 나머지는 로그인이 필요하다. */
const PUBLIC = ['/login', '/signup', '/terms', '/forgot-password', '/notifications', '/feedback'];
const isPublic = (path: string) => path === '/' || PUBLIC.some((p) => path.startsWith(p));

/**
 * 저장된 로그인/기기 데이터를 복원한 뒤 화면을 그린다.
 * 로그인하지 않은 상태로 앱 화면에 들어오면 시작 화면으로 보낸다(목업 데모 화면을 보여주지 않음).
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.accessToken);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([useAuthStore.persist.rehydrate(), useLocalStore.persist.rehydrate()]).finally(() => setReady(true));
  }, []);

  const blocked = ready && !token && !isPublic(pathname);

  useEffect(() => {
    if (blocked) router.replace('/');
  }, [blocked, router]);

  if (!ready || blocked) return null;
  return <>{children}</>;
}
