import Image from "next/image";
import { MONSTER_DATA } from "./data";

// [화면 3] 야생의 몬스터 발견
export function MonsterDiscoveryScreen({ onGoToDogam }: { onGoToDogam: () => void }) {
  return (
    <div className="flex flex-col items-center text-center pt-4 space-y-5">
      <h2 className="text-[20px] font-medium text-gray-900 tracking-tight">!야생의 몬스터 발견!</h2>

      <div className="h-32">
        <Image src="/남탓_군주.png" alt={MONSTER_DATA.namtat.name} width={115} height={128} className="object-contain h-32 w-auto" />
      </div>

      <div className="space-y-1">
        <h3 className="text-[22px] font-medium">{MONSTER_DATA.namtat.name} x2</h3>
        <p className="text-[18px] text-gray-800 font-normal">{MONSTER_DATA.namtat.category}</p>
        <p className="text-[16px] text-gray-500 tracking-wider font-medium">{MONSTER_DATA.namtat.tier}</p>
      </div>

      <p className="text-[15px] font-normal text-gray-800 px-4 leading-relaxed">
        “문제의 원인을 주로 바깥에서 찾을 때<br />나타나는 몬스터예요.”
      </p>

      <div className="w-full space-y-2 text-center pt-2">
        <h4 className="font-medium text-[16px] text-gray-900">오늘의 출몰 이유</h4>
        <p className="text-[13px] text-gray-600 leading-relaxed px-2">
          {MONSTER_DATA.namtat.reason}
        </p>
      </div>

      <button
        onClick={onGoToDogam}
        className="w-full bg-black text-white py-3.5 rounded-2xl text-[16px] font-medium shadow-sm active:opacity-80 transition mt-4 mb-6"
      >
        도감으로 가기
      </button>
    </div>
  );
}
