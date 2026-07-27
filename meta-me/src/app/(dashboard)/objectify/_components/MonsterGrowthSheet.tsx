import Image from "next/image";

// 발견한 몬스터 성장 상세 바텀시트
export function MonsterGrowthSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-x-0 top-0 bottom-16 bg-black/30 z-50 flex flex-col justify-end">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white rounded-t-[28px] p-6 relative z-10 space-y-6 shadow-xl max-h-[82%] overflow-y-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="h-10">
              <Image src="/남탓_군주.png" alt="남탓대마왕" width={36} height={40} className="object-contain h-10 w-auto" />
            </div>
            <h3 className="text-[18px] font-medium">성장하는 현우 x2</h3>
          </div>
          <button onClick={onClose} className="text-xl text-gray-400 p-1">✕</button>
        </div>

        <div className="space-y-5 text-[13px] leading-relaxed">
          <div className="space-y-1">
            <h4 className="font-medium text-[14px] text-black">1. 위기 관리 및 문제 해결 능력의 성장</h4>
            <p className="text-gray-500"><span className="text-gray-700 font-medium">이유:</span> 팀원들의 소통 거부, 저품질 결과물 제출이라는 극단적인 악조건 속에서 과제를 끝까지 이끌고 수습하는 과정입니다.</p>
            <p className="text-gray-500"><span className="text-gray-700 font-medium">포인트:</span> 불량 참여자를 통제하고 리스크를 최소화하는 ‘실무형 위기 관리 능력’과 갈등 해결 역량이 강제로 성장하는 부분입니다.</p>
          </div>

          <div className="space-y-1">
            <h4 className="font-medium text-[14px] text-black">2. 시스템적 안목과 대안 제시 능력의 성장</h4>
            <p className="text-gray-500"><span className="text-gray-700 font-medium">이유:</span> &ldquo;돌멩이 4개와 회의하는 게 낫다&rdquo;, &ldquo;교수님의 이상은 안드로메다로 갔다&rdquo;며 현행 시스템의 한계를 명확히 인지하는 과정입니다.</p>
          </div>

          <div className="space-y-1 pt-2 border-t">
            <h4 className="font-medium text-[14px] text-black">N+1 패턴</h4>
            <p className="text-gray-700 font-medium">1단계: 폭발적 인지 패턴 (감정의 신호화)</p>
            <p className="text-gray-500">과거 패턴: 사용자님은 위기 상황이나 비상식적인 인간을 마주했을 때, 이를 단순한 짜증으로 넘기지 않고 시각화합니다...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
