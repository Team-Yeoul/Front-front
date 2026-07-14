'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store';

/**
 * 구글 로그인(next-auth 세션)을 앱 자체 인증 스토어(useAuthStore)와 연결한다.
 * 백엔드에 구글 토큰 교환 전용 엔드포인트가 없어서, 구글 access_token을
 * 그대로 accessToken 자리에 채우는 임시 방편이다. 실제 백엔드가 이 토큰을
 * 검증하지 않으므로, 백엔드에 교환 엔드포인트가 생기면 이 부분을 교체해야 한다.
 */
export function AuthBridge() {
  const { data: session, status } = useSession();
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken && session.user?.id && !accessToken) {
      setAuth(session.accessToken, '', session.user.id);
    }
  }, [status, session, accessToken, setAuth]);

  return null;
}
