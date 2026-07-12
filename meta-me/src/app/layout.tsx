import type { Metadata } from 'next';
import { QueryProvider } from '@/shared/api';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'MetaMe',
  description: '나를 객관적으로 바라보는 AI 다이어리',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-white md:bg-[#0d0d1a] min-h-dvh md:flex md:items-center md:justify-center">
        <div className="relative w-full h-dvh md:w-[430px] md:h-[932px]">

          {/* 다크 네이비 베젤 - 데스크톱 전용 */}
          <div className="hidden md:block absolute -inset-[14px] rounded-[60px] bg-[#1c1c2e] shadow-[0_0_0_2px_#2e2e5c,0_0_0_5px_#151525,0_50px_100px_rgba(0,0,0,0.85)]" />

          {/* 스크린 영역 */}
          <div className="relative h-full flex flex-col overflow-hidden bg-white md:rounded-[44px] [transform:translateZ(0)]">

            {/* 다이나믹 아일랜드 - 데스크톱 전용 */}
            <div className="hidden md:block absolute top-[14px] left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-black rounded-full z-20" />

            {/* 상태바 - 데스크톱 전용 */}
            <div className="hidden md:flex h-[59px] shrink-0 items-end justify-between px-7 pb-2 relative z-10">
              <span className="text-[15px] font-semibold text-black">9:41</span>
              <div className="flex items-center gap-[6px]">
                <svg width="17" height="12" viewBox="0 0 17 12" fill="black" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0.5" y="9" width="3" height="3" rx="0.8"/>
                  <rect x="4.5" y="6" width="3" height="6" rx="0.8"/>
                  <rect x="8.5" y="3" width="3" height="9" rx="0.8"/>
                  <rect x="13" y="0" width="3.5" height="12" rx="0.8"/>
                </svg>
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="11" r="1.5" fill="black"/>
                  <path d="M4.5 7.5C5.8 6.1 6.8 5.5 8 5.5S10.2 6.1 11.5 7.5" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M1.5 4.5C3.5 2.3 5.6 1 8 1S12.5 2.3 14.5 4.5" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div className="flex items-center gap-[1px]">
                  <div className="relative w-[25px] h-[12px] rounded-[3.5px] border-[1.5px] border-black">
                    <div className="absolute inset-[1.5px] bg-black rounded-[1.5px]" />
                  </div>
                  <div className="w-[2.5px] h-[5px] bg-black/50 rounded-r-[1px]" />
                </div>
              </div>
            </div>

            {/* 페이지 콘텐츠 */}
            <div className="flex-1 overflow-y-auto">
              <QueryProvider>{children}</QueryProvider>
            </div>

            {/* 홈 인디케이터 - 데스크톱 전용 */}
            <div className="hidden md:flex h-[34px] shrink-0 items-center justify-center">
              <div className="w-[134px] h-[5px] bg-black/20 rounded-full" />
            </div>
          </div>

          {/* 사이드 버튼들 - 데스크톱 전용 */}
          <div className="hidden md:block absolute -right-[18px] top-[204px] w-[4px] h-[68px] bg-[#151525] rounded-r-[3px]" />
          <div className="hidden md:block absolute -left-[18px] top-[144px] w-[4px] h-[28px] bg-[#151525] rounded-l-[3px]" />
          <div className="hidden md:block absolute -left-[18px] top-[184px] w-[4px] h-[36px] bg-[#151525] rounded-l-[3px]" />
          <div className="hidden md:block absolute -left-[18px] top-[230px] w-[4px] h-[36px] bg-[#151525] rounded-l-[3px]" />
        </div>
      </body>
    </html>
  );
}
