'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { CogniImg, LockIcon, TopBar } from '@/components/ui/primitives';
import { useCollection } from '@/hooks/useCollection';
import type { CollectedCogni } from '@/store';

const TOTAL = 24;
const SLOTS_PER_TAB = 4;

const TABS = [
  { key: 'cognitive', label: '사고/인지 패턴', match: ['사고', '인지'] },
  { key: 'emotional', label: '감정 반응 패턴', match: ['감정'] },
  { key: 'behavioral', label: '행동 패턴', match: ['행동', '습관', '상황', '성장'] },
  { key: 'relational', label: '대인관계 패턴', match: ['대인'] },
] as const;

const tabOf = (c: CollectedCogni) => TABS.find((t) => t.match.some((m) => c.category.includes(m)))?.key ?? 'behavioral';
const shortDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString('sv-SE').slice(2).replaceAll('-', '.') : '');

export default function DogamPage() {
  const router = useRouter();
  const collection = useCollection();
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>(() => (collection[0] ? tabOf(collection[0]) : 'cognitive'));
  const items = collection.filter((c) => tabOf(c) === tab);
  const locked = Math.max(0, SLOTS_PER_TAB - items.length);

  return (
    <Screen nav>
      <TopBar
        title={<span className="text-[18px] font-bold">코그니 도감</span>}
        backHref="/mypage"
        right={
          <span className="font-mono text-[16px] font-bold text-ink">
            {collection.length}/{TOTAL}
          </span>
        }
      />
      <div className="flex gap-5 px-5 border-b border-line overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`relative py-3 text-[14px] whitespace-nowrap ${t.key === tab ? 'font-bold text-ink' : 'text-sub'}`}>
            {t.label}
            {t.key === tab && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-ink" />}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 px-5 pt-6 pb-8">
        {items.map((c) => (
          <button
            key={c.id}
            onClick={() => router.push(`/dogam/${encodeURIComponent(c.id)}`)}
            className="rounded-3xl bg-white border border-line flex flex-col items-center text-center px-4 pt-4 pb-4 min-h-[214px]"
          >
            <span className="w-[70px] h-[70px] rounded-full bg-surface-2 flex items-center justify-center overflow-hidden">
              <CogniImg src={c.image} size={60} />
            </span>
            <p className="text-[15px] font-bold text-ink mt-3">{c.name}</p>
            <p className="text-[12px] text-sub leading-relaxed mt-1.5 line-clamp-2">{c.desc}</p>
            {c.foundAt && (
              <span className="mt-auto h-7 px-2.5 rounded-lg bg-surface-2 text-[12px] text-[#48484F] inline-flex items-center">발견일 {shortDate(c.foundAt)}</span>
            )}
          </button>
        ))}
        {Array.from({ length: locked }, (_, i) => (
          <div key={`lock-${i}`} className="rounded-3xl bg-[#EEEEF2] flex flex-col items-center justify-center text-center px-4 py-6 min-h-[214px]">
            <LockIcon size={30} />
            <p className="text-[16px] font-bold text-ink mt-5">???</p>
            <p className="text-[13px] text-sub mt-2">기록이 쌓이면 열려요</p>
          </div>
        ))}
      </div>
    </Screen>
  );
}
