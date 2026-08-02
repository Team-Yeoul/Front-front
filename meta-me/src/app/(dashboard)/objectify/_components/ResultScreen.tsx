import type { components } from "@/shared/api";
import { truncateText } from "./data";

type MonsterDetection = components["schemas"]["MonsterDetection"];

// [화면 2] 결과 화면
interface ResultScreenProps {
  myRecordText: string;
  mirrorFactText: string;
  unlockedMonsters: MonsterDetection[];
  onOpenMyRecord: () => void;
  onOpenMirror: () => void;
  onOpenMonsterGrowth: (detection: MonsterDetection) => void;
  onRetry: () => void;
  onViewMonster: () => void;
}

export function ResultScreen({
  myRecordText,
  mirrorFactText,
  unlockedMonsters,
  onOpenMyRecord,
  onOpenMirror,
  onOpenMonsterGrowth,
  onRetry,
  onViewMonster,
}: ResultScreenProps) {
  return (
    <div className="space-y-6">
      {/* 내가 쓴 기록 */}
      <section className="space-y-2 cursor-pointer" onClick={onOpenMyRecord}>
        <h3 className="text-[18px] font-medium text-gray-800 pl-1">내가 쓴 기록</h3>
        <div className="bg-white p-5 rounded-2xl shadow-sm text-[14px] text-gray-700 leading-relaxed">
          {truncateText(myRecordText, 80)}
        </div>
      </section>

      {/* 거울이 비춘 사실 */}
      <section className="space-y-2 cursor-pointer" onClick={onOpenMirror}>
        <h3 className="text-[18px] font-medium text-gray-800 pl-1">거울이 비춘 사실</h3>
        <div className="bg-white p-5 rounded-2xl shadow-sm text-[14px] text-gray-700 leading-relaxed">
          {truncateText(mirrorFactText, 80)}
        </div>
      </section>

      {/* 발견한 몬스터 */}
      {unlockedMonsters.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-[18px] font-medium text-gray-800 pl-1">발견한 몬스터</h3>

          {unlockedMonsters.map((detection) => (
            <div
              key={detection.monster_detection_id}
              className="bg-white p-4 rounded-2xl shadow-sm flex items-center space-x-4 cursor-pointer"
              onClick={() => onOpenMonsterGrowth(detection)}
            >
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="h-14">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={detection.monster.icon_url}
                    alt={detection.monster.eum_code}
                    width={50}
                    height={56}
                    className="object-contain h-14 w-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/남탓_군주.png";
                    }}
                  />
                </div>
                <span className="text-[11px] text-gray-500 mt-1 font-medium">
                  x{detection.detected_monster_count}
                </span>
              </div>
              <div className="flex-1 min-w-0 space-y-1.5 text-[11px] text-gray-600">
                <div className="bg-[#F2F3F8] p-2 rounded-xl break-words">
                  {detection.monster.monster_description}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 하단 제어 버튼 */}
      <div className="grid grid-cols-2 gap-4 pt-2 mb-6">
        <button
          onClick={onRetry}
          className="bg-[#949499] text-white py-3.5 rounded-2xl text-[16px] font-medium shadow-sm active:opacity-80 transition"
        >
          다시 생성
        </button>
        <button
          onClick={onViewMonster}
          disabled={unlockedMonsters.length === 0}
          className="bg-black text-white py-3.5 rounded-2xl text-[16px] font-medium shadow-sm active:opacity-80 transition disabled:opacity-40"
        >
          몬스터 보기
        </button>
      </div>
    </div>
  );
}
