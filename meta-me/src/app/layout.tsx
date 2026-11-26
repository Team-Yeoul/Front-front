import type { Metadata } from 'next';
import { QueryProvider } from '@/shared/api';
import { PhoneFrame } from '@/components/layout/PhoneFrame';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGate } from '@/components/AuthGate';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'MetaMe',
  description: '나를 객관적으로 바라보는 AI 다이어리',
};

// 민감정보 동의는 화면마다 withSensitiveGate(@/components/SensitiveGate)로 감싼다(앱과 같은 방식).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // 테마 클래스(dark)는 브라우저에서 AppShell이 붙이므로 서버 HTML과 달라도 경고하지 않게 한다.
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-page text-ink md:bg-[#0d0d1a] min-h-dvh md:flex md:items-center md:justify-center">
        <AppShell>
          <PhoneFrame>
            <QueryProvider>
              <AuthGate>{children}</AuthGate>
            </QueryProvider>
          </PhoneFrame>
        </AppShell>
      </body>
    </html>
  );
}
