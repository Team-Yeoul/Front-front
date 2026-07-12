import Image from "next/image";

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

      <div className="h-36">
        <Image src="/남탓_군주.png" alt="남탓대마왕" width={129} height={144} className="object-contain h-36 w-auto" />
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
