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
    <div className="relative mx-auto max-w-sm w-full h-full bg-[#F2F3F8] text-[#111111] flex flex-col font-sans overflow-hidden select-none">

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
'use client';

import { getObjectifyMirrors } from '@/lib/api';
import { useReportData } from '@/hooks/useReportData';
import { Chip } from '@/components/report/Chip';
import { DonutChart } from '@/components/charts/DonutChart';
import type { ObjectifyMirrors } from '@/types';

const MOCK: ObjectifyMirrors = {
  myView: {
    title: '돌보기',
    content:
      '스스로를 돌보려 애쓰는 편이라고 느껴요. 기록 시간 대비 꾸준함을 지키려는 모습이 자주 보였어요.',
    tags: [
      { date: '6/30', label: '조절과제 기록' },
      { date: '6/13', label: '답안 기록' },
    ],
  },
  aiView: {
    unlocked: false,
    message: '기록이 더 쌓이면 AI가 나를 분석해 알려드릴게요.',
  },
  othersView: {
    unlocked: true,
    distribution: [
      { label: '공감', percent: 40 },
      { label: '동기', percent: 25 },
      { label: '명확', percent: 20 },
      { label: '기타', percent: 15 },
    ],
    note: '타인이 가장 자주 느낀 인상은 공감이었어요.',
  },
};

function LockedCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 flex flex-col items-center text-center">
      <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
        <svg width="16" height="19" viewBox="0 0 16 19" fill="none">
          <rect x="0.75" y="7.75" width="14.5" height="10.5" rx="2.25" stroke="#9CA3AF" strokeWidth="1.5" />
          <path d="M4 8V5.5C4 3.01 5.79 1 8 1S12 3.01 12 5.5V8" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-[13px] font-semibold text-gray-500 mb-1">아직 잠겨 있어요</p>
      <p className="text-[12px] text-gray-400 leading-relaxed">{message}</p>
    </div>
  );
}

export default function ObjectifyPage() {
  const data = useReportData(getObjectifyMirrors, MOCK);

  return (
    <div className="flex flex-col h-full bg-white px-6 pt-6 pb-8 overflow-y-auto">
      <h1 className="text-[20px] font-bold text-gray-900 mb-1">3개의 거울</h1>
      <p className="text-[13px] text-gray-400 mb-6">내가 보는 나 · AI가 보는 나 · 타인이 보는 나를 비교해보세요</p>

      <div className="mb-6">
        <p className="text-[12px] font-semibold text-[#8287FF] mb-1.5">내가 보는 나</p>
        <h3 className="text-[16px] font-semibold text-gray-900 mb-1.5">&ldquo;{data.myView.title}&rdquo;</h3>
        <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5">{data.myView.content}</p>
        <div className="flex flex-wrap">
          {data.myView.tags.map((t, i) => (
            <Chip key={i} tag={t} variant="primary" />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-[12px] font-semibold text-gray-500 mb-1.5">AI가 보는 나</p>
        {data.aiView.unlocked ? (
          <p className="text-[13px] text-gray-600 leading-relaxed">{data.aiView.message}</p>
        ) : (
          <LockedCard message={data.aiView.message} />
        )}
      </div>

      <div className="mb-2">
        <p className="text-[12px] font-semibold text-gray-500 mb-3">타인이 보는 나</p>
        {data.othersView.unlocked ? (
          <>
            <p className="text-[13px] text-gray-500 mb-3">타인의 공감 정도 분포</p>
            <DonutChart
              segments={data.othersView.distribution.map((d) => ({ label: d.label, value: d.percent }))}
            />
            <p className="text-[12px] text-gray-400 leading-relaxed mt-4">{data.othersView.note}</p>
          </>
        ) : (
          <LockedCard message="아직 타인의 피드백이 모이지 않았어요." />
        )}
      </div>
    </div>
  );
}
