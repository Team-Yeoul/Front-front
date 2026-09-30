import Link from 'next/link';

const TABS = [
  { key: 'month', label: '이번 달', href: '/mypage' },
  { key: 'dogam', label: '도감', href: '/dogam' },
  { key: 'report', label: '리포트', href: '/mypage/report' },
] as const;

/** 마이페이지 상단 탭 (이번 달 · 도감 · 리포트). */
export function MyTabs({ active }: { active: (typeof TABS)[number]['key'] }) {
  return (
    <div className="flex gap-6 px-5 border-b border-line">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`relative py-3 text-[16px] ${t.key === active ? 'font-bold text-ink' : 'text-sub'}`}
        >
          {t.label}
          {t.key === active && <span className="absolute left-0 right-0 -bottom-px h-[3px] rounded-full bg-primary" />}
        </Link>
      ))}
    </div>
  );
}
