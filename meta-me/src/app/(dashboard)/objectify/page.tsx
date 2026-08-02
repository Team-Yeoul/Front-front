"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListDailyRecords, useGetDailyRecord } from "@/entities/diary";
import { useCreateObjectiveMirror } from "@/entities/objective";
import type { UserMonster } from "@/entities/collection";
import { userKeys } from "@/entities/user";
import type { components } from "@/shared/api";
import { LoadingScreen } from "./_components/LoadingScreen";
import { ResultScreen } from "./_components/ResultScreen";
import { MonsterDiscoveryScreen } from "./_components/MonsterDiscoveryScreen";
import { DogamScreen } from "./_components/DogamScreen";
import { MyRecordSheet } from "./_components/MyRecordSheet";
import { MirrorSheet } from "./_components/MirrorSheet";
import { MonsterGrowthSheet } from "./_components/MonsterGrowthSheet";
import { MonsterDetailSheet } from "./_components/MonsterDetailSheet";
import { MY_RECORD_TEXT, MIRROR_TEXT } from "./_components/data";

type Step = "loading" | "result" | "monster_discovery" | "dogam";
type MonsterDetection = components["schemas"]["MonsterDetection"];

export default function ObjectifyPage() {
  // 화면 단계를 관리하는 상태
  const [step, setStep] = useState<Step>("loading");

  // 첫 진입 화면 로딩 진행률 (0 ~ 100)
  const [progress, setProgress] = useState(0);
  const [progressDone, setProgressDone] = useState(false);

  // 바텀시트 모달 상태 관리
  const [isMyRecordOpen, setIsMyRecordOpen] = useState(false);
  const [isMirrorOpen, setIsMirrorOpen] = useState(false);
  const [growthMonster, setGrowthMonster] = useState<MonsterDetection | null>(null);
  const [selectedMonster, setSelectedMonster] = useState<UserMonster | null>(null);

  // 도감 화면 카테고리 필터 선택 상태
  const [selectedCategory, setSelectedCategory] = useState("전체");

  // 객관화 대상으로 쓸 가장 최근 일일 기록
  const { data: recentRecords } = useListDailyRecords({ size: 1 });
  const latestRecordId = recentRecords?.records[0]?.record_id;
  const { data: recordDetail } = useGetDailyRecord(latestRecordId ?? "", !!latestRecordId);
  const originalEmotion =
    recordDetail?.questions[0]?.scene_description || recordDetail?.questions[0]?.user_answer;

  const createMirror = useCreateObjectiveMirror();
  const queryClient = useQueryClient();

  // 첫 진입 로딩 애니메이션 구현 (100% 도달 시 progressDone 플래그만 세팅)
  useEffect(() => {
    if (step === "loading") {
      setProgress(0);
      setProgressDone(false);
      const timer = setInterval(() => {
        setProgress((old) => {
          if (old >= 100) {
            clearInterval(timer);
            setProgressDone(true);
            return 100;
          }
          return old + 20;
        });
      }, 400);
      return () => clearInterval(timer);
    }
  }, [step]);

  // 로딩 화면에 진입하면 실제 객관화 미러 생성 요청
  useEffect(() => {
    if (step === "loading" && latestRecordId && originalEmotion) {
      createMirror.mutate(
        { record_id: latestRecordId, original_emotion: originalEmotion },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.profile() });
            queryClient.invalidateQueries({ queryKey: userKeys.accuracy() });
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, latestRecordId, originalEmotion]);

  // 로딩 애니메이션이 끝나고, 실제 생성 요청도 끝난(또는 애초에 생성할 기록이 없는) 뒤에만 결과창으로 이동
  const willCreateMirror = !!latestRecordId && !!originalEmotion;
  useEffect(() => {
    if (step !== "loading" || !progressDone) return;
    if (!willCreateMirror || createMirror.isSuccess) {
      setStep("result");
    }
  }, [step, progressDone, willCreateMirror, createMirror.isSuccess]);

  const isKorean = (text?: string) => !!text && /[가-힣]/.test(text);

  const mirror = createMirror.data?.mirror;
  const unlockedMonsters = createMirror.data?.unlocked_monsters ?? [];
  const myRecordText = isKorean(mirror?.original_emotion) ? mirror!.original_emotion : MY_RECORD_TEXT;
  const mirrorFactText = isKorean(mirror?.objective_fact) ? mirror!.objective_fact : MIRROR_TEXT;

  const handleRetry = () => {
    createMirror.reset();
    setStep("loading");
  };

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
          <span className="text-[15px] text-gray-500 font-normal">
            {new Date(mirror?.created_at ?? Date.now()).toLocaleDateString("sv-SE").replaceAll("-", ".")}
          </span>
        )}
      </header>

      {/* 메인 뷰포트 영역 */}
      <main className="flex-1 overflow-y-auto px-5">
        {step === "loading" && progressDone && createMirror.isError && (
          <div className="flex flex-col items-center justify-center pt-20 space-y-5 text-center">
            <p className="text-[16px] text-gray-600">거울을 만드는 데 실패했어요.</p>
            <button
              onClick={handleRetry}
              className="px-6 py-3 rounded-full bg-gray-900 text-white text-[14px] font-medium"
            >
              다시 시도
            </button>
          </div>
        )}
        {step === "loading" && !(progressDone && createMirror.isError) && (
          <LoadingScreen progress={progress} />
        )}

        {step === "result" && (
          <ResultScreen
            myRecordText={myRecordText}
            mirrorFactText={mirrorFactText}
            unlockedMonsters={unlockedMonsters}
            onOpenMyRecord={() => setIsMyRecordOpen(true)}
            onOpenMirror={() => setIsMirrorOpen(true)}
            onOpenMonsterGrowth={setGrowthMonster}
            onRetry={handleRetry}
            onViewMonster={() => setStep("monster_discovery")}
          />
        )}

        {step === "monster_discovery" && (
          <MonsterDiscoveryScreen
            monster={unlockedMonsters[0]}
            onGoToDogam={() => setStep("dogam")}
          />
        )}

        {step === "dogam" && (
          <DogamScreen
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectMonster={setSelectedMonster}
          />
        )}
      </main>

      {/* 바텀시트 모달 */}
      <MyRecordSheet open={isMyRecordOpen} onClose={() => setIsMyRecordOpen(false)} text={myRecordText} />
      <MirrorSheet open={isMirrorOpen} onClose={() => setIsMirrorOpen(false)} text={mirrorFactText} />
      <MonsterGrowthSheet monster={growthMonster} onClose={() => setGrowthMonster(null)} />
      <MonsterDetailSheet monster={selectedMonster} onClose={() => setSelectedMonster(null)} />
    </div>
  );
}
