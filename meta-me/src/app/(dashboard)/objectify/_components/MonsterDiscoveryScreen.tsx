import type { components } from "@/shared/api";
import { MONSTER_DATA } from "./data";

type MonsterDetection = components["schemas"]["MonsterDetection"];

// [화면 3] 야생의 몬스터 발견
export function MonsterDiscoveryScreen({
  monster,
  onGoToDogam,
}: {
  monster?: MonsterDetection;
  onGoToDogam: () => void;
}) {
  const name = monster?.monster.eum_code ?? MONSTER_DATA.namtat.name;
  const category = monster?.monster.category ?? MONSTER_DATA.namtat.category;
  const tier = monster?.monster.base_rarity ?? MONSTER_DATA.namtat.tier;
  const description = monster?.monster.monster_description ?? MONSTER_DATA.namtat.desc;
  const iconUrl = monster?.monster.icon_url;
  const count = monster?.detected_monster_count ?? 2;

  return (
    <div className="flex flex-col items-center text-center pt-4 space-y-5">
      <h2 className="text-[20px] font-medium text-gray-900 tracking-tight">!야생의 몬스터 발견!</h2>

      <div className="h-32">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconUrl ?? "/남탓_군주.png"}
          alt={name}
          width={115}
          height={128}
          className="object-contain h-32 w-auto"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/남탓_군주.png";
          }}
        />
      </div>

      <div className="space-y-1">
        <h3 className="text-[22px] font-medium">{name} x{count}</h3>
        <p className="text-[18px] text-gray-800 font-normal">{category}</p>
        <p className="text-[16px] text-gray-500 tracking-wider font-medium">{tier}</p>
      </div>

      <p className="text-[15px] font-normal text-gray-800 px-4 leading-relaxed">{description}</p>

      <button
        onClick={onGoToDogam}
        className="w-full bg-black text-white py-3.5 rounded-2xl text-[16px] font-medium shadow-sm active:opacity-80 transition mt-4 mb-6"
      >
        도감으로 가기
      </button>
    </div>
  );
}
