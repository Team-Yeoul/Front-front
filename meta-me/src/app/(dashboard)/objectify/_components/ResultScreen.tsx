import { MY_RECORD_TEXT, MIRROR_TEXT, truncateText } from "./data";

// [화면 2] 결과 화면
interface ResultScreenProps {
  onOpenMyRecord: () => void;
  onOpenMirror: () => void;
  onOpenMonsterGrowth: () => void;
  onRetry: () => void;
  onViewMonster: () => void;
}

export function ResultScreen({
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
          {truncateText(MY_RECORD_TEXT, 80)}
        </div>
      </section>

      {/* 거울이 비춘 사실 */}
      <section className="space-y-2 cursor-pointer" onClick={onOpenMirror}>
        <h3 className="text-[18px] font-medium text-gray-800 pl-1">거울이 비춘 사실</h3>
        <div className="bg-white p-5 rounded-2xl shadow-sm text-[14px] text-gray-700 leading-relaxed">
          {truncateText(MIRROR_TEXT, 80)}
        </div>
      </section>

      {/* 발견한 몬스터 */}
      <section className="space-y-3">
        <h3 className="text-[18px] font-medium text-gray-800 pl-1">발견한 몬스터</h3>

        {/* 캐릭터 카드 1 */}
        <div
          className="bg-white p-4 rounded-2xl shadow-sm flex items-center space-x-4 cursor-pointer"
          onClick={onOpenMonsterGrowth}
        >
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-14 h-14 bg-[#E2F5E1] rounded-full flex items-center justify-center text-2xl">😐</div>
            <span className="text-[11px] text-gray-500 mt-1 font-medium">성장하는 현우 x2</span>
          </div>
          <div className="flex-1 min-w-0 space-y-1.5 text-[11px] text-gray-600">
            <div className="bg-[#F2F3F8] p-2 rounded-xl break-words">위기 관리 및 문제 해결 능력의 성장 (개인적 측면)</div>
            <div className="bg-[#F2F3F8] p-2 rounded-xl break-words">시스템적 안목과 대안 제시 능력의 성장 (조직·환경적 측면)</div>
          </div>
        </div>

        {/* 캐릭터 카드 2 */}
        <div
          className="bg-white p-4 rounded-2xl shadow-sm flex items-center space-x-4 cursor-pointer"
          onClick={onOpenMonsterGrowth}
        >
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-14 h-14 bg-[#FEE2E2] rounded-full flex items-center justify-center text-2xl">😡</div>
            <span className="text-[11px] text-gray-500 mt-1 font-medium">성장하는 현우 x2</span>
          </div>
          <div className="flex-1 min-w-0 space-y-1.5 text-[11px] text-gray-600">
            <div className="bg-[#F2F3F8] p-2 rounded-xl break-words">위기 관리 및 문제 해결 능력의 성장 (개인적 측면)</div>
            <div className="bg-[#F2F3F8] p-2 rounded-xl break-words">시스템적 안목과 대안 제시 능력의 성장 (조직·환경적 측면)</div>
          </div>
        </div>
      </section>

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
          className="bg-black text-white py-3.5 rounded-2xl text-[16px] font-medium shadow-sm active:opacity-80 transition"
        >
          몬스터 보기
        </button>
      </div>
    </div>
  );
}
