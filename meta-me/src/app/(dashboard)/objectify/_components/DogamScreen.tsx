"use client";

import { useListMyMonsters } from "@/entities/collection";
import { useListMirrorMonsters } from "@/entities/dictionary";
import type { UserMonster } from "@/entities/collection";
import { MONSTER_CATEGORIES, MONSTER_LIST } from "./data";

const CATEGORY_LABELS: Record<string, string> = {
  COGNITIVE: "사고/인지",
  EMOTIONAL: "감정 반응",
  BEHAVIORAL: "행동",
  RELATIONAL: "대인관계",
  GROWTH: "성장",
  SITUATIONAL: "상황",
};

function MonsterCard({
  iconUrl,
  name,
  count,
  onClick,
}: {
  iconUrl: string;
  name: string;
  count: number;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-4 rounded-2xl text-center shadow-sm cursor-pointer hover:bg-gray-50"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={iconUrl}
        alt={name}
        width={32}
        height={36}
        className="mx-auto mb-1.5 object-contain w-8 h-9"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/남탓_군주.png";
        }}
      />
      <div className="text-[12px] font-medium truncate">{name}</div>
      <div className="text-[11px] text-gray-400 mt-0.5">x {count}</div>
    </div>
  );
}

// [화면 4] 나의 뇌내 도감
interface DogamScreenProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onSelectMonster: (monster: UserMonster) => void;
}

export function DogamScreen({ selectedCategory, onSelectCategory, onSelectMonster }: DogamScreenProps) {
  const { data: myMonsters } = useListMyMonsters({ size: 50 });
  const { data: allMonsters } = useListMirrorMonsters({ size: 50 });

  const hasRealData = !!myMonsters && myMonsters.monsters.length > 0;
  const monsters = myMonsters?.monsters ?? [];
  const discoveredCount = myMonsters?.total_count ?? MONSTER_LIST.length;
  const totalCount = allMonsters?.total_count ?? 32;

  const categoryOptions = hasRealData ? ["전체", ...Object.keys(CATEGORY_LABELS)] : MONSTER_CATEGORIES;
  const top3 = [...monsters].sort((a, b) => b.monster_count - a.monster_count).slice(0, 3);

  const filteredRealMonsters = monsters.filter(
    (m) => selectedCategory === "전체" || m.monster.category === selectedCategory,
  );
  const filteredMockMonsters = Array.from({ length: 6 })
    .map((_, idx) => MONSTER_LIST[idx % MONSTER_LIST.length])
    .filter((monster) => selectedCategory === "전체" || monster.category === selectedCategory);

  const isEmpty = hasRealData ? filteredRealMonsters.length === 0 : filteredMockMonsters.length === 0;

  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-[20px] font-medium">나의 뇌내 도감</h2>
        <p className="text-[14px] text-gray-500 font-medium">{discoveredCount} / {totalCount} 발견</p>
      </div>

      {/* 가장 많이 발견한 몬스터 TOP 3 */}
      {hasRealData && top3.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-[14px] font-medium text-gray-800 tracking-wide">가장 많이 발견한 몬스터</h3>
          <div className="grid grid-cols-3 gap-3">
            {top3.map((m) => (
              <MonsterCard
                key={m.user_monster_id}
                iconUrl={m.monster.icon_url}
                name={m.current_title ?? m.monster.eum_code}
                count={m.monster_count}
                onClick={() => onSelectMonster(m)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 전체 몬스터 카테고리 필터 */}
      <section className="space-y-3">
        <h3 className="text-[14px] font-medium text-gray-800 tracking-wide">전체 몬스터</h3>
        <div className="flex space-x-2 overflow-x-auto text-[12px] font-normal no-scrollbar">
          {categoryOptions.map((category) => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`px-3.5 py-1.5 rounded-full shadow-sm flex-shrink-0 transition-colors ${
                selectedCategory === category
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-400"
              }`}
            >
              {CATEGORY_LABELS[category] ?? category}
            </button>
          ))}
        </div>

        {/* 3열 그리드 카드 배치 */}
        <div className="grid grid-cols-3 gap-3">
          {hasRealData
            ? filteredRealMonsters.map((m) => (
                <MonsterCard
                  key={m.user_monster_id}
                  iconUrl={m.monster.icon_url}
                  name={m.current_title ?? m.monster.eum_code}
                  count={m.monster_count}
                  onClick={() => onSelectMonster(m)}
                />
              ))
            : filteredMockMonsters.map((monster, idx) => (
                <MonsterCard key={idx} iconUrl={monster.image} name={monster.name} count={monster.count} />
              ))}
        </div>
        {isEmpty && (
          <p className="text-center text-[13px] text-gray-400 py-6">이 카테고리에 발견한 몬스터가 없어요.</p>
        )}
      </section>
    </div>
  );
}
