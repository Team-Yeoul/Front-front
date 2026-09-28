'use client';

import { useListMyMonsters } from '@/entities/collection';
import type { MonsterCategory } from '@/entities/collection';

const CATEGORIES: { key: MonsterCategory; label: string }[] = [
  { key: 'COGNITIVE', label: '사고/인지 패턴' },
  { key: 'EMOTIONAL', label: '감정 반응 패턴' },
  { key: 'BEHAVIORAL', label: '행동 패턴' },
  { key: 'RELATIONAL', label: '대인관계 패턴' },
];

const TOTAL_PER_CATEGORY = 10;
const UNLOCK_DAY_HINTS = [3, 5, 7, 10, 14, 21];

const MOCK_DISCOVERED = [
  {
    user_monster_id: 'mock-1',
    monster: { monster_id: 'm1', monster_description: '외부 요인에 책임을 돌리는 경향', stage_titles: '억울한 남탓대마왕' },
    current_title: '억울한 남탓대마왕',
    discovered_label: '발견일 26.02.25',
  },
  {
    user_monster_id: 'mock-2',
    monster: { monster_id: 'm2', monster_description: '한 번의 경험을 전체 상황으로 확대 해석하는 패턴', stage_titles: '돋보기' },
    current_title: '돋보기',
    discovered_label: '발견일 26.02.25',
  },
  {
    user_monster_id: 'mock-3',
    monster: { monster_id: 'm3', monster_description: '중간 없이 성공과 실패로만 나누는 습관', stage_titles: '흑백 재판관' },
    current_title: '흑백 재판관',
    discovered_label: '발견일 26.02.20',
  },
];

interface DogamScreenProps {
  selectedCategory: MonsterCategory;
  onSelectCategory: (category: MonsterCategory) => void;
  onSelectMonster: () => void;
}

export function DogamScreen({ selectedCategory, onSelectCategory, onSelectMonster }: DogamScreenProps) {
  const { data } = useListMyMonsters({ category: selectedCategory });

  const discovered = data?.monsters?.length ? data.monsters : MOCK_DISCOVERED;
  const lockedCount = Math.max(0, TOTAL_PER_CATEGORY - discovered.length);

  return (
    <div className="space-y-5">
      <div className="flex gap-5 overflow-x-auto no-scrollbar border-b border-gray-100 text-[13px]">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => onSelectCategory(c.key)}
            className={`pb-3 shrink-0 font-medium border-b-2 -mb-px transition-colors ${
              selectedCategory === c.key ? 'text-gray-900 border-gray-900' : 'text-gray-400 border-transparent'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {discovered.map((m) => (
          <button
            key={m.user_monster_id}
            onClick={onSelectMonster}
            className="bg-white rounded-2xl p-4 text-left shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-gray-100 mx-auto mb-3" />
            <p className="text-[14px] font-semibold text-gray-900 text-center mb-1">
              {m.current_title || m.monster.stage_titles}
            </p>
            <p className="text-[11px] text-gray-400 text-center leading-relaxed mb-2.5 line-clamp-2">
              {m.monster.monster_description}
            </p>
            <span className="block text-center text-[11px] text-gray-400 bg-gray-50 rounded-full py-1">
              발견일 26.02.25
            </span>
          </button>
        ))}
        {Array.from({ length: lockedCount }).map((_, i) => (
          <div key={`locked-${i}`} className="bg-gray-50 rounded-2xl p-4 text-center">
            <div className="w-9 h-9 rounded-full bg-gray-200 mx-auto mb-3 flex items-center justify-center">
              <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
                <rect x="1" y="6.5" width="11" height="7.5" rx="1.5" stroke="#9CA3AF" strokeWidth="1.4" />
                <path d="M3 6.5V4a3.5 3.5 0 0 1 7 0v2.5" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[14px] font-bold text-gray-400 mb-1">???</p>
            <p className="text-[11px] text-gray-400 leading-relaxed mb-1">
              기록 {UNLOCK_DAY_HINTS[i % UNLOCK_DAY_HINTS.length]}일이 더 쌓이면 열려요
            </p>
            <p className="text-[11px] text-gray-300">기록이 더 필요해요</p>
          </div>
        ))}
      </div>
    </div>
  );
}
