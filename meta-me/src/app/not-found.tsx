'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/primitives';

// 예전 친구 초대 링크(/feedback/{token}). 서버 invite_url도 이 형식이라 /feedback/?token=으로 넘겨준다.
const LEGACY_FEEDBACK = /^\/feedback\/([^/]+)\/?$/;

/** 정적 배포라 없는 주소는 모두 이 화면(404.html)으로 온다. */
export default function NotFound() {
  const router = useRouter();
  const [legacy, setLegacy] = useState(true);

  useEffect(() => {
    const match = window.location.pathname.match(LEGACY_FEEDBACK);
    if (!match) {
      setLegacy(false);
      return;
    }
    const query = new URLSearchParams(window.location.search);
    query.set('token', decodeURIComponent(match[1]));
    window.location.replace(`/feedback/?${query}`);
  }, []);

  if (legacy) return null;
  return (
    <Screen footer={<Button onClick={() => router.replace('/')}>처음으로</Button>}>
      <p className="text-center text-[14px] text-sub mt-[200px]">없는 페이지예요.</p>
    </Screen>
  );
}
