"use client";

import React, { useState, useEffect } from "react";

// --- 디자인 데이터 정의 ---
const MONSTER_DATA = {
  namtat: {
    name: "남탓대마왕",
    count: 20,
    category: "사고/인지",
    tier: "COMMON",
    desc: "일이 잘 안 풀렸을 때 원인을 외부에서 먼저 찾는 패턴이에요.",
    reason: "“조별과제 문제의 원인을 팀원 행동에 집중해서 해석했어요. 다만 실제로는 업무 분배 구조와 피로도도 함께 작용했을 수 있어요.”",
    situations: ["조별과제", "피곤한 날", "역할 분배가 애매할 때"],
    records: ["[6/30 조별과제 기록]", "[6/21 친구와 대화]", "[6/13 화장실의 변비]"],
  },
};

export default function ObjectifyPage() {
  // 'loading' | 'result' | 'monster_discovery' | 'dogam'
  const [step, setStep] = useState<"loading" | "result" | "monster_discovery" | "dogam">("loading");
  const [progress, setProgress] = useState(0);

  // 바텀시트 상태
  const [isMirrorOpen, setIsMirrorOpen] = useState(false);
  const [isMonsterGrowthOpen, setIsMonsterGrowthOpen] = useState(false);
  const [selectedMonsterDetail, setSelectedMonsterDetail] = useState(false);

  // 로딩 바 애니메이션
  useEffect(() => {
    if (step === "loading") {
      setProgress(0);
      const timer = setInterval(() => {
        setProgress((old) => {
          if (old >= 100) {
            clearInterval(timer);
            setStep("result");
            return 100;
          }
          return old + 20;
        });
      }, 400);
      return () => clearInterval(timer);
    }
  }, [step]);

  const renderProgressText = () => {
    const filled = Math.floor(progress / 10);
    return `[${"■".repeat(filled)}${"□".repeat(10 - filled)}]`;
  };

  return (
    <div className="relative mx-auto max-w-sm w-full min-h-screen bg-[#F2F3F8] text-[#111111] flex flex-col font-sans overflow-hidden select-none pb-8">
      
      {/* 1. 상단 헤더 */}
      <header className="p-5 pt-8 bg-transparent flex justify-between items-center flex-shrink-0">
        <h1 className="text-[22px] font-medium tracking-tight">
          {step === "loading" && "객관화 도감"}
          {(step === "result" || step === "monster_discovery") && "객관화 미러"}
          {step === "dogam" && "객관화 도감"}
        </h1>
        {step === "result" && (
          <span className="text-[15px] text-gray-400 font-normal">2026.06.30</span>
        )}
      </header>

      {/* 2. 스크롤 가능한 메인 콘텐츠 에어리어 */}
      <main className="flex-1 overflow-y-auto px-5 pb-10">
        
        {/* [화면 1] 첫 진입 */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center pt-12 space-y-10 text-center">
            <div className="space-y-4">
              <p className="text-[17px] text-gray-600 font-normal">감정을 닦는 중...</p>
              <h2 className="text-[23px] font-medium leading-snug">“짜증”과 “사실”을<br />분리하고 있어요</h2>
            </div>
            <div className="w-36 h-36 bg-gradient-to-b from-[#E2F5E1] to-[#C9EAC7] rounded-full flex items-center justify-center text-4xl shadow-sm">
              😐
            </div>
            <div className="text-[16px] font-mono text-[#7482FF] tracking-widest font-bold">
              {renderProgressText()}
            </div>
            <p className="text-[16px] text-gray-600 font-normal leading-relaxed">오늘의 뇌내 몬스터가<br />숨어있는지 확인 중...</p>
          </div>
        )}

        {/* [화면 2] 결과 화면 */}
        {step === "result" && (
          <div className="space-y-6">
            <section className="space-y-2">
              <h3 className="text-[18px] font-medium text-gray-800 pl-1">내가 쓴 기록</h3>
              {/* 줄바꿈 강제 및 텍스트 자동 줄내림 속성 보강 */}
              <div className="bg-white p-5 rounded-2xl shadow-sm text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap break-all">
                조별과제 팀원들이 보여주는 기상천외한 행태는 현대 의학으로도 치료할 수 없는 만성 편두통의 근원입니다. 그들은 평소에는 멀쩡히 숨 쉬고 살아가다가도, 과제 단톡방만 개설되면 갑자기 손가락이 마비되거나 우주 정거장 수준의 심해로 잠수를 타버리는 초능력을 발휘합니다. "제가 지금 알바 중이라서요", "갑자기 상을 당해서요"라며 온갖 핑계를 대기 바쁩니다.
              </div>
            </section>

            <section className="space-y-2 cursor-pointer" onClick={() => setIsMirrorOpen(true)}>
              <h3 className="text-[18px] font-medium text-gray-800 pl-1">거울이 비춘 사실</h3>
              <div className="bg-white p-5 rounded-2xl shadow-sm text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap break-all">
                제시된 본문은 대학 조별과제 과정에서 발생하는 팀원들의 비협조적인 태도와 이로 인한 극심한 스트레스를 주관적이고 감정적인 언어로 기술한 글입니다. 이를 감정을 배제하고 사실 관계와 학술적 분석으로 객관화하여 줄글로 정리한 내용은 다음과 같습니다. 본문에서 확인할 수 있는 객관적 사실은 크게 소통 부재, 산출물의 저품질, 평가의 불합리성 등으로 나뉩니다.
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-[18px] font-medium text-gray-800 pl-1">발견한 몬스터</h3>
              <div 
                className="bg-white p-4 rounded-2xl shadow-sm flex items-center space-x-4 cursor-pointer"
                onClick={() => setIsMonsterGrowthOpen(true)}
              >
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-14 h-14 bg-[#E2F5E1] rounded-full flex items-center justify-center text-2xl">😐</div>
                  <span className="text-[11px] text-gray-500 mt-1 font-medium text-center max-w-[70px] break-all leading-tight">성장하는 현우 x2</span>
                </div>
                {/* 내부 아이템이 박스를 넘어갈 경우 줄내림(flex-wrap) 및 단어 파괴(break-all) 처리 */}
                <div className="flex-1 flex flex-col space-y-1.5 text-[11px] text-gray-600 min-w-0">
                  <div className="bg-[#F2F3F8] p-2 rounded-xl whitespace-pre-wrap break-all leading-normal">
                    위기 관리 및 문제 해결 능력의 성장 (개인적 측면)
                  </div>
                  <div className="bg-[#F2F3F8] p-2 rounded-xl whitespace-pre-wrap break-all leading-normal">
                    시스템적 안목과 대안 제시 능력의 성장 (조직적 측면)
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button onClick={() => setStep("loading")} className="bg-[#949499] text-white py-3.5 rounded-2xl text-[16px] font-medium shadow-sm active:opacity-80 transition">
                다시 생성
              </button>
              <button onClick={() => setStep("monster_discovery")} className="bg-black text-white py-3.5 rounded-2xl text-[16px] font-medium shadow-sm active:opacity-80 transition">
                몬스터 보기
              </button>
            </div>
          </div>
        )}

        {/* [화면 3] 야생의 몬스터 발견 */}
        {step === "monster_discovery" && (
          <div className="flex flex-col items-center text-center pt-4 space-y-5">
            <h2 className="text-[20px] font-medium text-gray-900 tracking-tight">!야생의 몬스터 발견!</h2>
            <div className="w-32 h-32 bg-[#E2F5E1] rounded-full flex items-center justify-center text-5xl shadow-sm">😐</div>
            <div className="space-y-1">
              <h3 className="text-[22px] font-medium break-all">{MONSTER_DATA.namtat.name} x2</h3>
              <p className="text-[18px] text-gray-800 font-normal">{MONSTER_DATA.namtat.category}</p>
              <p className="text-[16px] text-gray-500 tracking-wider font-medium">{MONSTER_DATA.namtat.tier}</p>
            </div>
            <p className="text-[15px] font-normal text-gray-800 px-4 leading-relaxed whitespace-pre-wrap break-all">“문제의 원인을 주로 바깥에서 찾을 때<br />나타나는 몬스터예요.”</p>
            <div className="w-full space-y-2 text-center pt-2">
              <h4 className="font-medium text-[16px] text-gray-900">오늘의 출몰 이유</h4>
              <p className="text-[13px] text-gray-600 leading-relaxed px-2 whitespace-pre-wrap break-all">{MONSTER_DATA.namtat.reason}</p>
            </div>
            <button onClick={() => setStep("dogam")} className="w-full bg-black text-white py-3.5 rounded-2xl text-[16px] font-medium shadow-sm active:opacity-80 transition mt-4">
              도감으로 가기
            </button>
          </div>
        )}

        {/* [화면 4] 나의 뇌내 도감 */}
        {step === "dogam" && (
          <div className="space-y-6">
            <div className="space-y-0.5">
              <h2 className="text-[20px] font-medium">나의 뇌내 도감</h2>
              <p className="text-[14px] text-gray-500 font-medium">7 / 32 발견</p>
            </div>

            <section className="space-y-3">
              <h3 className="text-[14px] font-medium text-gray-800 tracking-wide">이번 주 출몰 TOP 3</h3>
              <div className="grid grid-cols-3 gap-3">
                <div onClick={() => setSelectedMonsterDetail(true)} className="bg-white p-4 rounded-2xl text-center shadow-sm cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center min-w-0">
                  <div className="text-3xl mb-1.5">😐</div>
                  <div className="text-[12px] font-medium w-full truncate text-center">남탓대마왕</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">x 20</div>
                </div>
                <div className="bg-white p-4 rounded-2xl text-center shadow-sm opacity-60 flex flex-col items-center justify-center min-w-0">
                  <div className="text-3xl mb-1.5">😡</div>
                  <div className="text-[12px] font-medium w-full truncate text-center">자책 인피니티</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">x 16</div>
                </div>
                <div className="bg-white p-4 rounded-2xl text-center shadow-sm opacity-60 flex flex-col items-center justify-center min-w-0">
                  <div className="text-3xl mb-1.5">🔍</div>
                  <div className="text-[12px] font-medium w-full truncate text-center">돋보기</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">x 12</div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex space-x-2 overflow-x-auto text-[12px] font-normal no-scrollbar">
                <span className="bg-white text-gray-800 px-3.5 py-1.5 rounded-full shadow-sm flex-shrink-0">전체</span>
                <span className="bg-white text-gray-400 px-3.5 py-1.5 rounded-full shadow-sm flex-shrink-0">사고/인지</span>
                <span className="bg-white text-gray-400 px-3.5 py-1.5 rounded-full shadow-sm flex-shrink-0">감정 반응</span>
                <span className="bg-white text-gray-400 px-3.5 py-1.5 rounded-full shadow-sm flex-shrink-0">행동</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} onClick={() => setSelectedMonsterDetail(true)} className="bg-white p-4 rounded-2xl text-center shadow-sm cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center min-w-0">
                    <div className="text-3xl mb-1.5">{idx % 3 === 0 ? "😐" : idx % 3 === 1 ? "😡" : "🔍"}</div>
                    <div className="text-[12px] font-medium w-full truncate text-center">
                      {idx % 3 === 0 ? "남탓대마왕" : idx % 3 === 1 ? "자책 인피니티" : "돋보기"}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">x {idx % 3 === 0 ? 20 : idx % 3 === 1 ? 16 : 12}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* 3. 모달 오버레이 레이어 (전체 고정 고수 및 모달 내부만 스크롤 설정 완료) */}
      
      {/* 거울 바텀시트 */}
      {isMirrorOpen && (
        <div className="fixed inset-x-0 bottom-0 top-0 bg-black/40 z-50 flex flex-col justify-end max-w-sm mx-auto">
          <div className="absolute inset-0" onClick={() => setIsMirrorOpen(false)} />
          <div className="bg-white rounded-t-[28px] max-h-[80%] overflow-y-auto p-6 relative z-10 space-y-6 shadow-xl w-full">
            <div className="flex justify-between items-center">
              <h3 className="text-[18px] font-medium">거울이 비춘 사실</h3>
              <button onClick={() => setIsMirrorOpen(false)} className="text-xl text-gray-400 p-1">✕</button>
            </div>
            <div className="space-y-4 text-[13px] leading-relaxed text-gray-700 whitespace-pre-wrap break-all">
              <p>대학 조별과제 수행 중 일부 구성원의 불성실한 태도로 인해 발생한 갈등과 운영 효율성 저하를 다루고 있습니다. 전체 배경 화면 레이아웃은 고정된 채 이 바텀시트 내부 텍스트창만 안정적으로 스크롤을 이용하실 수 있습니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* 발견한 몬스터 상세 바텀시트 */}
      {isMonsterGrowthOpen && (
        <div className="fixed inset-x-0 bottom-0 top-0 bg-black/40 z-50 flex flex-col justify-end max-w-sm mx-auto">
          <div className="absolute inset-0" onClick={() => setIsMonsterGrowthOpen(false)} />
          <div className="bg-white rounded-t-[28px] p-6 relative z-10 space-y-6 shadow-xl max-h-[80%] overflow-y-auto w-full">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 bg-[#E2F5E1] rounded-full flex items-center justify-center text-xl">😐</div>
                <h3 className="text-[18px] font-medium break-all">성장하는 현우 x2</h3>
              </div>
              <button onClick={() => setIsMonsterGrowthOpen(false)} className="text-xl text-gray-400 p-1">✕</button>
            </div>
            <div className="space-y-4 text-[13px] leading-relaxed text-gray-500 whitespace-pre-wrap break-all">
              <h4 className="font-medium text-[14px] text-black">1. 위기 관리 및 문제 해결 능력의 성장</h4>
              <p>팀원들의 소통 거부, 결과물 미제출 등 악조건 속에서 주도권을 잡고 수습해 나가는 값진 실전 프로세스 과정입니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* 몬스터 도감 상세 모달 */}
      {selectedMonsterDetail && (
        <div className="fixed inset-x-0 bottom-0 top-0 bg-black/40 z-50 flex flex-col justify-end max-w-sm mx-auto">
          <div className="absolute inset-0" onClick={() => setSelectedMonsterDetail(false)} />
          <div className="bg-white rounded-t-[28px] p-6 relative z-10 space-y-6 shadow-xl max-h-[85%] overflow-y-auto w-full">
            <div className="flex justify-between items-start relative">
              <div className="w-full flex flex-col items-center pt-2">
                <h3 className="text-[24px] font-medium break-all">{MONSTER_DATA.namtat.name}</h3>
                <div className="w-20 h-20 bg-[#E2F5E1] rounded-full flex items-center justify-center text-4xl my-3">😐</div>
                <p className="text-[14px] font-normal text-gray-500">{MONSTER_DATA.namtat.category}</p>
              </div>
              <button onClick={() => setSelectedMonsterDetail(false)} className="absolute right-0 top-2 text-xl text-gray-400 p-1">✕</button>
            </div>
            <div className="space-y-3 text-[13px] text-gray-500 whitespace-pre-wrap break-all leading-relaxed">
              <p>{MONSTER_DATA.namtat.desc}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}