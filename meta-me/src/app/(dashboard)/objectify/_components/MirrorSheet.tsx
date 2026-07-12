// 거울이 비춘 사실 바텀시트
export function MirrorSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-x-0 top-0 bottom-16 bg-black/30 z-50 flex flex-col justify-end">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white rounded-t-[28px] max-h-[85%] overflow-y-auto p-6 relative z-10 space-y-6 shadow-xl">
        <div className="flex justify-between items-center">
          <h3 className="text-[18px] font-medium">거울이 비춘 사실</h3>
          <button onClick={onClose} className="text-xl text-gray-400 p-1">✕</button>
        </div>

        <div className="space-y-6 text-[13px] leading-relaxed text-gray-700">
          <div className="space-y-1">
            <h4 className="font-medium text-[14px] text-black">1. 사실과 팩트 중심의 객관화 및 분석</h4>
            <p>대학 조별과제 수행 중 일부 구성원의 불성실한 태도로 인해 발생한 갈등과 운영 효율성 저하를 다루고 있습니다...</p>
          </div>

          <div className="space-y-1">
            <h4 className="font-medium text-[14px] text-black">2. 원본 vs 객관화 비교 분석 및 피드백</h4>
            <p>기여도와 무관하게 동일한 집단 학점을 부여받는 평가 구조의 모순이 분노를 유발하는 원인으로 작용하고 있습니다...</p>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="font-medium text-[14px] text-black">종합 피드백: 사용자님의 ‘성장 패턴’ 연결</h4>
            <p>사용자님은 고통스러운 상황을 문학적이고 창의적인 비유(원본)로 쏟아내어 스트레스를 1차 해소한 뒤, 이를 칼 같은 팩트와 구조적 문제(객관화)로 분리해낼 줄 아는 강력한 인지 알고리즘을 가지고 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
