'use client';

import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  if (pathname.startsWith('/main')) {
    return (
      <header className="flex items-center justify-between px-6 py-4 bg-white">
        <span className="text-[20px] font-bold text-gray-900 lowercase">metame</span>
        <div className="flex items-center gap-4">
          <button aria-label="알림">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="#1C1C1E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#1C1C1E" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button aria-label="설정">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="#1C1C1E" strokeWidth="2" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                stroke="#1C1C1E"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>
    );
  }

  const TITLES: Record<string, string> = {
    '/diary': '다이어리',
    '/report': '리포트 미',
    '/mypage': '마이페이지',
  };
  const title = Object.entries(TITLES).find(([path]) => pathname.startsWith(path))?.[1] ?? 'MetaMe';

  return (
    <header className="px-6 py-4 border-b border-gray-100 bg-white">
      <h1 className="text-[17px] font-semibold text-gray-900">{title}</h1>
    </header>
  );
}
