'use client';

import Link from 'next/link';

const TABS = [
  { key: 'month', label: '이번 달', href: '/mypage' },
  { key: 'dogam', label: '도감', href: '/objectify?view=dogam' },
  { key: 'report', label: '리포트', href: '/report' },
] as const;

export function HubTabs({ active }: { active: 'month' | 'dogam' | 'report' }) {
  return (
    <div className="flex gap-6 px-6 border-b border-gray-100">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`py-3 text-[14px] font-medium border-b-2 -mb-px transition-colors ${
              isActive ? 'text-[#8287FF] border-[#8287FF]' : 'text-gray-400 border-transparent'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
