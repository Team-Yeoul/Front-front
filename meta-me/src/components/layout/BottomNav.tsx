'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type IconProps = { color: string };

const HomeIcon = ({ color }: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-8.5Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const DiaryIcon = ({ color }: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="3.5" width="14" height="17" rx="2" stroke={color} strokeWidth="1.8" />
    <path d="M9 3.5v17M12 8h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const ChatIcon = ({ color }: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M4.5 5.5h15v10h-8l-4 3.5v-3.5h-3v-10Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const ReportIcon = ({ color }: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M6 19v-6M12 19V6M18 19v-9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const MyIcon = ({ color }: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8.5" r="3.5" stroke={color} strokeWidth="1.8" />
    <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const TABS = [
  { href: '/main', label: '메인', Icon: HomeIcon, match: ['/main', '/challenge'] },
  { href: '/diary', label: '다이어리', Icon: DiaryIcon, match: ['/diary'] },
  { href: '/chat', label: '대화', Icon: ChatIcon, match: ['/chat'] },
  { href: '/report', label: '리포트', Icon: ReportIcon, match: ['/report'] },
  { href: '/mypage', label: '마이페이지', Icon: MyIcon, match: ['/mypage', '/dogam'] },
];

const ACTIVE = '#6367FF';
const INACTIVE = '#9A9AA3';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="h-[68px] shrink-0 border-t border-line bg-white px-2">
      <div className="flex h-full">
        {TABS.map(({ href, label, Icon, match }) => {
          const active = match.some((p) => pathname.startsWith(p));
          const color = active ? ACTIVE : INACTIVE;
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center justify-center gap-1">
              <Icon color={color} />
              <span className={`text-[11px] ${active ? 'font-semibold' : 'font-medium'}`} style={{ color }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
