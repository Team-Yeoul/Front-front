import type { Metadata } from 'next';
import { QueryProvider } from '@/shared/api';
import { PhoneFrame } from '@/components/layout/PhoneFrame';
import { AuthGate } from '@/components/AuthGate';
import { SensitiveConsentGate } from '@/components/SensitiveConsentGate';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'MetaMe',
  description: '나를 객관적으로 바라보는 AI 다이어리',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-white md:bg-[#0d0d1a] min-h-dvh md:flex md:items-center md:justify-center">
        <PhoneFrame>
          <QueryProvider>
            <AuthGate>
              <SensitiveConsentGate>{children}</SensitiveConsentGate>
            </AuthGate>
          </QueryProvider>
        </PhoneFrame>
      </body>
    </html>
  );
}
