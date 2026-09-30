'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useListMyMonsters } from '@/entities/collection';
import type { MonsterCategory } from '@/entities/collection';
import { Screen } from '@/components/ui/Screen';
import { Img3D, LockIcon, TopBar } from '@/components/ui/primitives';
import { MOCK_COGNIS, type Cogni } from '@/lib/mock';

const CATEGORIES: { key: MonsterCategory; label: Cogni['category'] }[] = [
  { key: 'COGNITIVE', label: '사고/인지 패턴' },
  { key: 'EMOTIONAL', label: '감정 반응 패턴' },
  { key: 'BEHAVIORAL', label: '행동 패턴' },
  { key: 'RELATIONAL', label: '대인관계 패턴' },
];

const TOTAL_SLOTS = 10;

function CogniCard({ cogni, onClick }: { cogni: Cogni; onClick: () => void }) {
  if (cogni.locked) {
    return (
      <div className="rounded-3xl bg-[#EEEEF2] flex flex-col items-center justify-center text-center px-4 py-6 min-h-[214px]">
        <LockIcon size={30} />
        <p className="text-[16px] font-bold text-ink mt-5">???</p>
        <p className="text-[13px] text-sub mt-2">기록 {cogni.locked.remainDays}일이 더 쌓이면 열려요</p>
        <p className="text-[12px] text-mute mt-3">기록이 더 필요해요</p>
      </div>
    );
  }
  return (
    <button onClick={onClick} className="rounded-3xl bg-white border border-line flex flex-col items-center text-center px-4 pt-4 pb-4 min-h-[214px]">
      <span className="w-[70px] h-[70px] rounded-full bg-surface-2 flex items-center justify-center overflow-hidden">
        <Img3D name="mascot-glasses" size={62} />
      </span>
      <p className="text-[15px] font-bold text-ink mt-3">{cogni.name}</p>
      <p className="text-[12px] text-sub leading-relaxed mt-1.5 line-clamp-2">{cogni.desc}</p>
      <span className="mt-auto h-7 px-2.5 rounded-lg bg-surface-2 text-[12px] text-[#48484F] inline-flex items-center">발견일 {cogni.foundAt}</span>
    </button>
  );
}

export default function DogamPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [category, setCategory] = useState<MonsterCategory>('COGNITIVE');
  const { data } = useListMyMonsters({ category }, !!accessToken);

  const label = CATEGORIES.find((c) => c.key === category)!.label;
  const real: Cogni[] | null =
    accessToken && data
      ? data.monsters.map((m) => ({
          id: m.user_monster_id,
          name: m.current_title || m.monster.stage_titles.split(',')[0] || m.monster.eum_code,
          shortName: m.monster.eum_code,
          desc: m.monster.monster_description,
          category: label,
          foundAt: '',
        }))
      : null;
  const items = real ?? MOCK_COGNIS.filter((c) => c.category === label);
  const found = real ? real.length : MOCK_COGNIS.filter((c) => !c.locked).length + 1;

  return (
    <Screen nav>
      <TopBar
        title={<span className="text-[18px] font-bold">코그니 도감</span>}
        backHref="/mypage"
        right={
          <span className="font-mono text-[16px] font-bold text-ink">
            {found}/{TOTAL_SLOTS}
          </span>
        }
      />
      <div className="flex gap-5 px-5 border-b border-line overflow-x-auto no-scrollbar">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`relative py-3 text-[14px] whitespace-nowrap ${c.key === category ? 'font-bold text-ink' : 'text-sub'}`}
          >
            {c.label}
            {c.key === category && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-ink" />}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 px-5 pt-6 pb-8">
        {items.map((c) => (
          <CogniCard key={c.id} cogni={c} onClick={() => router.push(`/dogam/${c.id}`)} />
        ))}
        {items.length === 0 && <p className="col-span-2 text-center text-[14px] text-sub mt-12">아직 발견한 코그니가 없어요.</p>}
      </div>
    </Screen>
  );
}
