import { MONSTER_CATEGORIES, MONSTER_LIST } from "./data";

// [화면 4] 나의 뇌내 도감
interface DogamScreenProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onSelectMonster: () => void;
}

export function DogamScreen({ selectedCategory, onSelectCategory, onSelectMonster }: DogamScreenProps) {
  const filteredMonsters = Array.from({ length: 6 })
    .map((_, idx) => MONSTER_LIST[idx % MONSTER_LIST.length])
    .filter((monster) => selectedCategory === "전체" || monster.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-[20px] font-medium">나의 뇌내 도감</h2>
        <p className="text-[14px] text-gray-500 font-medium">7 / 32 발견</p>
      </div>

      {/* 이번 주 출몰 TOP 3 */}
      <section className="space-y-3">
        <h3 className="text-[14px] font-medium text-gray-800 tracking-wide">이번 주 출몰 TOP 3</h3>
        <div className="grid grid-cols-3 gap-3">
          <div onClick={onSelectMonster} className="bg-white p-4 rounded-2xl text-center shadow-sm cursor-pointer border border-transparent hover:border-green-300">
            <div className="text-3xl mb-1.5">😐</div>
            <div className="text-[12px] font-medium truncate">남탓대마왕</div>
            <div className="text-[11px] text-gray-400 mt-0.5">x 20</div>
          </div>
          <div className="bg-white p-4 rounded-2xl text-center shadow-sm">
            <div className="text-3xl mb-1.5">😡</div>
            <div className="text-[12px] font-medium truncate">자책 인피니티</div>
            <div className="text-[11px] text-gray-400 mt-0.5">x 16</div>
          </div>
          <div className="bg-white p-4 rounded-2xl text-center shadow-sm">
            <div className="text-3xl mb-1.5">🔍</div>
            <div className="text-[12px] font-medium truncate">돋보기</div>
            <div className="text-[11px] text-gray-400 mt-0.5">x 12</div>
          </div>
        </div>
      </section>

      {/* 전체 몬스터 카테고리 필터 */}
      <section className="space-y-3">
        <h3 className="text-[14px] font-medium text-gray-800 tracking-wide">전체 몬스터</h3>
        <div className="flex space-x-2 overflow-x-auto text-[12px] font-normal no-scrollbar">
          {MONSTER_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`px-3.5 py-1.5 rounded-full shadow-sm flex-shrink-0 transition-colors ${
                selectedCategory === category
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-400"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 3열 그리드 카드 배치 */}
        <div className="grid grid-cols-3 gap-3">
          {filteredMonsters.map((monster, idx) => (
            <div
              key={idx}
              onClick={onSelectMonster}
              className="bg-white p-4 rounded-2xl text-center shadow-sm cursor-pointer hover:bg-gray-50"
            >
              <div className="text-3xl mb-1.5">{monster.emoji}</div>
              <div className="text-[12px] font-medium truncate">{monster.name}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">x {monster.count}</div>
            </div>
          ))}
        </div>
        {filteredMonsters.length === 0 && (
          <p className="text-center text-[13px] text-gray-400 py-6">이 카테고리에 발견한 몬스터가 없어요.</p>
        )}
      </section>
    </div>
  );
}
