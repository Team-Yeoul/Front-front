import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'MetaMe',
  description: '나를 객관적으로 바라보는 AI 다이어리',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-white md:bg-neutral-900 min-h-screen md:flex md:items-center md:justify-center">
        {/*
          모바일: 풀스크린 (w-full, min-h-screen)
          데스크톱(md+): 390×844 폰 프레임
        */}
        <div
          className="
            relative w-full h-screen bg-white flex flex-col
            md:w-[390px] md:h-[844px] md:rounded-[44px] md:overflow-hidden
          "
          style={{ boxShadow: 'var(--frame-shadow)' }}
        >
          {children}
        </div>

        <style>{`
          @media (min-width: 768px) {
            :root { --frame-shadow: 0 32px 80px rgba(0,0,0,0.6); }
          }
          @media (max-width: 767px) {
            :root { --frame-shadow: none; }
          }
        `}</style>
      </body>
    </html>
  );
}
