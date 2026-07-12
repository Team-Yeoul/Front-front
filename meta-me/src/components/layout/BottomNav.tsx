'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const INACTIVE = '#9CA3AF';
const ACTIVE = '#8287FF';

const tabs = [
  {
    href: '/main',
    label: '메인',
    icon: (color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 11l9-8 9 8M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/diary',
    label: '다이어리',
    icon: (color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/report',
    label: '리포트',
    icon: (color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 20V10M12 20V4M6 20v-6"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/mypage',
    label: '마이페이지',
    icon: (color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
        <path
          d="M4 21c0-3.87 3.58-7 8-7s8 3.13 8 7"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="border-t border-gray-100 bg-white">
      <div className="flex">
        {tabs.map(tab => {
          const active = pathname.startsWith(tab.href);
          const color = active ? ACTIVE : INACTIVE;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1"
            >
              {tab.icon(color)}
              <span className="text-[10px] font-medium" style={{ color }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
