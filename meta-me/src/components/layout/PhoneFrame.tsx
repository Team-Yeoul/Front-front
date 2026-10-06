'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useStatusBarStore } from '@/store';

/**
 * 화면 전환: 상태바와 콘텐츠에 같은 페이드를 동시에 걸어 둘이 한 화면처럼 바뀌게 한다.
 * (콘텐츠만 페이드하면 상태바와의 경계가 드러난다)
 */
const ROUTE_FADE = { from: 0.7, ms: 180 };

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const theme = useStatusBarStore((s) => s.theme);
  const pathname = usePathname();
  const statusRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (const el of [statusRef.current, contentRef.current]) {
      el?.animate([{ opacity: ROUTE_FADE.from }, { opacity: 1 }], { duration: ROUTE_FADE.ms, easing: 'ease-out' });
    }
  }, [pathname]);
  const iconColor = theme.fg === 'light' ? '#ffffff' : '#000000';

  return (
    <div className="relative w-full h-dvh md:w-[430px] md:h-[932px]">

      {/* 다크 네이비 베젤 - 데스크톱 전용 */}
      <div className="hidden md:block absolute -inset-[14px] rounded-[60px] bg-[#1c1c2e] shadow-[0_0_0_2px_#2e2e5c,0_0_0_5px_#151525,0_50px_100px_rgba(0,0,0,0.85)]" />

      {/* 스크린 영역 */}
      {/* 스플래시처럼 상태바·홈 인디케이터 뒤까지 꽉 채워야 하는 화면은 #phone-screen에 포털로 그린다. */}
      <div id="phone-screen" className="relative h-full flex flex-col overflow-hidden bg-white md:rounded-[44px] [transform:translateZ(0)]">

        {/* 다이나믹 아일랜드 - 데스크톱 전용 */}
        <div className="hidden md:block absolute top-[14px] left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-black rounded-full z-20" />

        {/* 상태바 - 데스크톱 전용. 배경색은 현재 페이지가 useStatusBarTheme으로 지정 */}
        <div
          ref={statusRef}
          className="hidden md:flex h-[59px] shrink-0 items-end justify-between px-7 pb-2 relative z-10"
          style={{ backgroundColor: theme.bg }}
        >
          <span className="text-[15px] font-semibold" style={{ color: iconColor }}>9:41</span>
          <div className="flex items-center gap-[6px]">
            <svg width="17" height="12" viewBox="0 0 17 12" fill={iconColor} xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="9" width="3" height="3" rx="0.8"/>
              <rect x="4.5" y="6" width="3" height="6" rx="0.8"/>
              <rect x="8.5" y="3" width="3" height="9" rx="0.8"/>
              <rect x="13" y="0" width="3.5" height="12" rx="0.8"/>
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="11" r="1.5" fill={iconColor}/>
              <path d="M4.5 7.5C5.8 6.1 6.8 5.5 8 5.5S10.2 6.1 11.5 7.5" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M1.5 4.5C3.5 2.3 5.6 1 8 1S12.5 2.3 14.5 4.5" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div className="flex items-center gap-[1px]">
              <div className="relative w-[25px] h-[12px] rounded-[3.5px] border-[1.5px]" style={{ borderColor: iconColor }}>
                <div className="absolute inset-[1.5px] rounded-[1.5px]" style={{ backgroundColor: iconColor }} />
              </div>
              <div className="w-[2.5px] h-[5px] rounded-r-[1px] opacity-50" style={{ backgroundColor: iconColor }} />
            </div>
          </div>
        </div>

        {/* 페이지 콘텐츠 */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* 홈 인디케이터 - 데스크톱 전용 */}
        <div className="hidden md:flex h-[34px] shrink-0 items-center justify-center relative z-10">
          <div
            className="w-[134px] h-[5px] rounded-full transition-colors duration-300"
            style={{ backgroundColor: theme.indicator === 'light' ? '#ffffff' : 'rgba(0,0,0,0.2)' }}
          />
        </div>
      </div>

      {/* 사이드 버튼들 - 데스크톱 전용 */}
      <div className="hidden md:block absolute -right-[18px] top-[204px] w-[4px] h-[68px] bg-[#151525] rounded-r-[3px]" />
      <div className="hidden md:block absolute -left-[18px] top-[144px] w-[4px] h-[28px] bg-[#151525] rounded-l-[3px]" />
      <div className="hidden md:block absolute -left-[18px] top-[184px] w-[4px] h-[36px] bg-[#151525] rounded-l-[3px]" />
      <div className="hidden md:block absolute -left-[18px] top-[230px] w-[4px] h-[36px] bg-[#151525] rounded-l-[3px]" />
    </div>
  );
}
