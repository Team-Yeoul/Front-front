'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    href: '/diary',
    label: '다이어리',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          stroke={active ? '#1C1C1E' : '#C7C7CC'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
          stroke={active ? '#1C1C1E' : '#C7C7CC'}
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
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 20V10M12 20V4M6 20v-6"
          stroke={active ? '#1C1C1E' : '#C7C7CC'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/objectify',
    label: '객관화',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={active ? '#1C1C1E' : '#C7C7CC'}
          strokeWidth="2"
        />
        <path
          d="M12 8v4l3 3"
          stroke={active ? '#1C1C1E' : '#C7C7CC'}
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
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1"
            >
              {tab.icon(active)}
              <span
                className={`text-[10px] font-medium ${active ? 'text-gray-900' : 'text-gray-400'}`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
