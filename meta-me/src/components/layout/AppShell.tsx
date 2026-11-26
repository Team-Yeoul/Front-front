'use client';

import { useApplyTheme } from '@/lib/theme';
import { useRouterBridge } from '@/lib/router';

/**
 * 루트 레이아웃(서버 컴포넌트)에서 한 번 쓰는 클라이언트 설정.
 * - 저장된 테마(라이트·다크·기기 설정)를 <html class="dark">로 적용한다.
 * - @/lib/router의 router 싱글턴(앱 expo-router 자리)에 Next 라우터를 넣어 준다.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  useApplyTheme();
  useRouterBridge();
  return <>{children}</>;
}
