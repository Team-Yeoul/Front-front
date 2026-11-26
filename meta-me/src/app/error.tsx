'use client';

import { useEffect } from 'react';
import { router } from '@/lib/router';
import { Screen } from '@/components/ui/Screen';
import { TextButton } from '@/components/ui/primitives';
import { StatusView, useOnline } from '@/components/ui/states';

/** 화면을 그리다 오류가 나면 앱 전체가 하얗게 멈추지 않도록 오류 화면(15b)으로 받는다. (앱 (app)/_layout ErrorBoundary) */
export default function ErrorScreen({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const online = useOnline();
  useEffect(() => {
    console.error('[app] 화면 오류', error);
  }, [error]);
  return (
    <Screen footer={<TextButton onPress={() => router.replace('/main')}>홈으로</TextButton>}>
      <StatusView kind={online ? 'error' : 'offline'} title={online ? '화면을 불러오지 못했어요' : undefined} onRetry={reset} className="pt-[260px]" />
    </Screen>
  );
}
