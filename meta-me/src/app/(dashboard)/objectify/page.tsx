"use client";

import { useState, useEffect } from "react";
import { LoadingScreen } from "./_components/LoadingScreen";
import { ResultScreen } from "./_components/ResultScreen";
import { MonsterDiscoveryScreen } from "./_components/MonsterDiscoveryScreen";
import { DogamScreen } from "./_components/DogamScreen";
import { MyRecordSheet } from "./_components/MyRecordSheet";
import { MirrorSheet } from "./_components/MirrorSheet";
import { MonsterGrowthSheet } from "./_components/MonsterGrowthSheet";
import { MonsterDetailSheet } from "./_components/MonsterDetailSheet";

type Step = "loading" | "result" | "monster_discovery" | "dogam";

export default function ObjectifyPage() {
  // 화면 단계를 관리하는 상태
  const [step, setStep] = useState<Step>("loading");

  // 첫 진입 화면 로딩 진행률 (0 ~ 100)
  const [progress, setProgress] = useState(0);

  // 바텀시트 모달 상태 관리
  const [isMyRecordOpen, setIsMyRecordOpen] = useState(false);
  const [isMirrorOpen, setIsMirrorOpen] = useState(false);
  const [isMonsterGrowthOpen, setIsMonsterGrowthOpen] = useState(false);
  const [selectedMonsterDetail, setSelectedMonsterDetail] = useState(false);

  // 도감 화면 카테고리 필터 선택 상태
  const [selectedCategory, setSelectedCategory] = useState("전체");

  // 첫 진입 로딩 애니메이션 구현 (100% 도달 시 결과창으로 자동 이동)
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

  return (
    <div className="relative w-full h-full bg-[#F2F3F8] text-[#111111] flex flex-col font-sans overflow-hidden select-none">

      {/* 상단 앱바 */}
      <header className="p-5 pt-8 bg-transparent flex justify-between items-center">
        <h1 className="text-[22px] font-medium tracking-tight">
          {step === "loading" && "객관화 도감"}
          {(step === "result" || step === "monster_discovery") && "객관화 미러"}
          {step === "dogam" && "객관화 도감"}
        </h1>
        {step === "result" && (
          <span className="text-[15px] text-gray-500 font-normal">2026.06.30</span>
        )}
      </header>

      {/* 메인 뷰포트 영역 */}
      <main className="flex-1 overflow-y-auto px-5">
        {step === "loading" && <LoadingScreen progress={progress} />}

        {step === "result" && (
          <ResultScreen
            onOpenMyRecord={() => setIsMyRecordOpen(true)}
            onOpenMirror={() => setIsMirrorOpen(true)}
            onOpenMonsterGrowth={() => setIsMonsterGrowthOpen(true)}
            onRetry={() => setStep("loading")}
            onViewMonster={() => setStep("monster_discovery")}
          />
        )}

        {step === "monster_discovery" && (
          <MonsterDiscoveryScreen onGoToDogam={() => setStep("dogam")} />
        )}

        {step === "dogam" && (
          <DogamScreen
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectMonster={() => setSelectedMonsterDetail(true)}
          />
        )}
      </main>

      {/* 바텀시트 모달 */}
      <MyRecordSheet open={isMyRecordOpen} onClose={() => setIsMyRecordOpen(false)} />
      <MirrorSheet open={isMirrorOpen} onClose={() => setIsMirrorOpen(false)} />
      <MonsterGrowthSheet open={isMonsterGrowthOpen} onClose={() => setIsMonsterGrowthOpen(false)} />
      <MonsterDetailSheet open={selectedMonsterDetail} onClose={() => setSelectedMonsterDetail(false)} />
    </div>
  );
}
