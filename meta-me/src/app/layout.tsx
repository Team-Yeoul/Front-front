import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MetaMe',
  description: '나를 객관적으로 바라보는 AI 다이어리',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
