import Image from "next/image";
import { MONSTER_DATA } from "./data";

// [화면 5] 몬스터 도감 상세 바텀시트
export function MonsterDetailSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-x-0 top-0 bottom-16 bg-black/30 z-50 flex flex-col justify-end">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white rounded-t-[28px] p-6 relative z-10 space-y-6 shadow-xl max-h-[85%] overflow-y-auto">
        <div className="flex justify-between items-start relative">
          <div className="w-full flex flex-col items-center pt-2">
            <h3 className="text-[24px] font-medium tracking-tight">{MONSTER_DATA.namtat.name}</h3>
            <div className="h-20 my-3">
              <Image src="/남탓_군주.png" alt={MONSTER_DATA.namtat.name} width={72} height={80} className="object-contain h-20 w-auto" />
            </div>
            <p className="text-[14px] font-normal text-gray-500">{MONSTER_DATA.namtat.category}</p>
            <p className="text-[13px] text-gray-400 font-mono tracking-wider">{MONSTER_DATA.namtat.tier}</p>
          </div>
          <button onClick={onClose} className="absolute right-0 top-2 text-xl text-gray-400 p-1">✕</button>
        </div>

        {/* 도감 히스토리 카드 목록 */}
        <div className="flex justify-center space-x-2.5">
          <div className="w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
            <Image src="/남탓_군주.png" alt={MONSTER_DATA.namtat.name} width={28} height={31} className="object-contain w-[28px] h-[31px]" />
          </div>
          <div className="w-14 h-14 bg-[#EAECEF] rounded-2xl flex items-center justify-center text-xl text-gray-400 font-medium">?</div>
          <div className="w-14 h-14 bg-[#EAECEF] rounded-2xl flex items-center justify-center text-xl text-gray-400 font-medium">?</div>
          <div className="w-14 h-14 bg-[#EAECEF] rounded-2xl flex items-center justify-center text-xl text-gray-400 font-medium">?</div>
        </div>

        <div className="space-y-4 text-[13px] pt-2">
          <div>
            <span className="text-gray-400 font-medium">누적:</span> <span className="font-medium text-gray-900">20회 (최근: 7월 3일)</span>
          </div>

          <div className="space-y-1">
            <h4 className="font-medium text-[14px] text-black">설명</h4>
            <p className="text-gray-500 leading-relaxed">{MONSTER_DATA.namtat.desc}</p>
          </div>

          <div className="space-y-1">
            <h4 className="font-medium text-[14px] text-black">자주 나타나는 상황</h4>
            <ul className="list-disc pl-4 text-gray-500 space-y-0.5">
              {MONSTER_DATA.namtat.situations.map((sit, i) => <li key={i}>{sit}</li>)}
            </ul>
          </div>

          <div className="space-y-1">
            <h4 className="font-medium text-[14px] text-black">최근 기록 보기</h4>
            <div className="space-y-1 text-blue-500 font-medium">
              {MONSTER_DATA.namtat.records.map((rec, i) => <div key={i} className="hover:underline cursor-pointer">{rec}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
