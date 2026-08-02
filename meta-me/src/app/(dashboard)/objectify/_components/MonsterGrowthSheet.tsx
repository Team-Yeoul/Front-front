import type { components } from "@/shared/api";
import { CATEGORY_LABELS } from "./data";

type MonsterDetection = components["schemas"]["MonsterDetection"];

// 발견한 몬스터 성장 상세 바텀시트
export function MonsterGrowthSheet({
  monster,
  onClose,
}: {
  monster: MonsterDetection | null;
  onClose: () => void;
}) {
  if (!monster) return null;
  const name = monster.monster.eum_code;
  const category = CATEGORY_LABELS[monster.monster.category] ?? monster.monster.category;

  return (
    <div className="fixed inset-x-0 top-0 bottom-16 bg-black/30 z-50 flex flex-col justify-end">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white rounded-t-[28px] p-6 relative z-10 space-y-6 shadow-xl max-h-[82%] overflow-y-auto">
        <div className="flex justify-between items-start relative">
          <div className="w-full flex flex-col items-center pt-2">
            <h3 className="text-[20px] font-medium tracking-tight">
              {name} x{monster.detected_monster_count}
            </h3>
            <div className="h-16 my-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={monster.monster.icon_url}
                alt={name}
                width={58}
                height={64}
                className="object-contain h-16 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/남탓_군주.png";
                }}
              />
            </div>
            <p className="text-[14px] font-normal text-gray-500">{category}</p>
            <p className="text-[13px] text-gray-400 font-mono tracking-wider">{monster.monster.base_rarity}</p>
          </div>
          <button onClick={onClose} className="absolute right-0 top-2 text-xl text-gray-400 p-1">✕</button>
        </div>

        <div className="space-y-1 text-[13px] pt-2">
          <h4 className="font-medium text-[14px] text-black">설명</h4>
          <p className="text-gray-500 leading-relaxed">{monster.monster.monster_description}</p>
        </div>
      </div>
    </div>
  );
}
