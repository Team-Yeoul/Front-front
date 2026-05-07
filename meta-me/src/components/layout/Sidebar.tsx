'use client';

import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white">
      <nav className="flex flex-col gap-2 p-4">
        <Link href="/diary">다이어리</Link>
        <Link href="/report">리포트</Link>
        <Link href="/objectify">객관화 도감</Link>
      </nav>
    </aside>
  );
}
