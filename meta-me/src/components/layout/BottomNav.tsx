'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const INACTIVE = '#C9CCFF';
const ACTIVE = '#6366F1';

const tabs = [
  {
    href: '/main',
    icon: (color: string, active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 11l9-8 9 8M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"
          stroke={color}
          strokeWidth={active ? 2.5 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/diary',
    icon: (color: string, active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2.5" stroke={color} strokeWidth={active ? 2.5 : 2} />
        <path d="M9 15l6-8" stroke={color} strokeWidth={active ? 2.5 : 2} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/report',
    icon: (color: string, active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 20V10M12 20V4M6 20v-6"
          stroke={color}
          strokeWidth={active ? 2.5 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/mypage',
    icon: (color: string, active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={color} strokeWidth={active ? 2.5 : 2} />
        <path d="M4 21c0-3.87 3.58-7 8-7s8 3.13 8 7" stroke={color} strokeWidth={active ? 2.5 : 2} strokeLinecap="round" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="h-[72px] border-t border-gray-100 bg-white">
      <div className="flex h-full">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const color = active ? ACTIVE : INACTIVE;
          return (
            <Link key={tab.href} href={tab.href} className="relative flex-1 flex items-center justify-center">
              {active && (
                <span
                  className="absolute w-14 h-14 rounded-full pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, rgba(99,102,241,0) 70%)' }}
                />
              )}
              <div className="relative flex flex-col items-center gap-1.5">
                {tab.icon(color, active)}
                <span
                  className="h-[3px] w-4 rounded-full transition-opacity"
                  style={{ backgroundColor: ACTIVE, opacity: active ? 1 : 0 }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
