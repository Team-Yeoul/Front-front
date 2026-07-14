import type { UserMonster } from "@/entities/collection";

const CATEGORY_LABELS: Record<string, string> = {
  COGNITIVE: "사고/인지",
  EMOTIONAL: "감정 반응",
  BEHAVIORAL: "행동",
  RELATIONAL: "대인관계",
  GROWTH: "성장",
  SITUATIONAL: "상황",
};

// [화면 5] 몬스터 도감 상세 바텀시트
export function MonsterDetailSheet({
  monster,
  onClose,
}: {
  monster: UserMonster | null;
  onClose: () => void;
}) {
  if (!monster) return null;
  const name = monster.current_title ?? monster.monster.eum_code;
  const category = CATEGORY_LABELS[monster.monster.category] ?? monster.monster.category;

  return (
    <div className="fixed inset-x-0 top-0 bottom-16 bg-black/30 z-50 flex flex-col justify-end">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white rounded-t-[28px] p-6 relative z-10 space-y-6 shadow-xl max-h-[85%] overflow-y-auto">
        <div className="flex justify-between items-start relative">
          <div className="w-full flex flex-col items-center pt-2">
            <h3 className="text-[24px] font-medium tracking-tight">{name}</h3>
            <div className="h-20 my-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={monster.monster.icon_url}
                alt={name}
                width={72}
                height={80}
                className="object-contain h-20 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/남탓_군주.png";
                }}
              />
            </div>
            <p className="text-[14px] font-normal text-gray-500">{category}</p>
            <p className="text-[13px] text-gray-400 font-mono tracking-wider">{monster.effective_rarity}</p>
          </div>
          <button onClick={onClose} className="absolute right-0 top-2 text-xl text-gray-400 p-1">✕</button>
        </div>

        <div className="space-y-4 text-[13px] pt-2">
          <div>
            <span className="text-gray-400 font-medium">누적:</span>{" "}
            <span className="font-medium text-gray-900">{monster.monster_count}회</span>
            {monster.current_title && (
              <span className="ml-2 text-gray-400">· 칭호: {monster.current_title}</span>
            )}
          </div>

          <div className="space-y-1">
            <h4 className="font-medium text-[14px] text-black">설명</h4>
            <p className="text-gray-500 leading-relaxed">{monster.monster.monster_description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
