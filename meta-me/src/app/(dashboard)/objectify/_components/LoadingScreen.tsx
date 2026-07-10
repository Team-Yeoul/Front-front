// [화면 1] 첫 진입 (로딩 화면)
export function LoadingScreen({ progress }: { progress: number }) {
  const filledCount = Math.floor(progress / 10);
  const emptyCount = 10 - filledCount;
  const progressText = `[${"■".repeat(filledCount)}${"□".repeat(emptyCount)}]`;

  return (
    <div className="flex flex-col items-center justify-center pt-12 space-y-10 text-center">
      <div className="space-y-4">
        <p className="text-[17px] text-gray-600 font-normal">감정을 닦는 중...</p>
        <h2 className="text-[23px] font-medium leading-snug">
          “짜증”과 “사실”을<br />분리하고 있어요
        </h2>
      </div>

      {/* 원형 그래디언트 캐릭터 임시 에어리어 */}
      <div className="w-36 h-36 bg-gradient-to-b from-[#E2F5E1] to-[#C9EAC7] rounded-full flex items-center justify-center text-4xl shadow-sm">
        😐
      </div>

      {/* 텍스트 형태의 프로그레스 바 */}
      <div className="text-[16px] font-mono text-[#7482FF] tracking-widest font-bold">
        {progressText}
      </div>

      <p className="text-[16px] text-gray-600 font-normal leading-relaxed">
        오늘의 뇌내 몬스터가<br />숨어있는지 확인 중...
      </p>
    </div>
  );
}
