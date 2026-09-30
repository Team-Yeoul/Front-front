'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Button, CheckIcon, CloseIcon, DownloadIcon, Img3D, TextButton, TopBar, type Asset3D } from './primitives';
import { GradientBg, Sheet } from './overlays';
import { Screen } from './Screen';

/* ── 분석 중 화면 (온보딩 · 객관화 공통) ─────────────────── */

export function AnalyzingScreen({
  title,
  steps,
  onDone,
  onClose,
  stepMs = 1100,
}: {
  title: ReactNode;
  steps: string[];
  onDone: () => void;
  onClose?: () => void;
  stepMs?: number;
}) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (done >= steps.length) {
      const t = setTimeout(onDone, 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone((d) => d + 1), stepMs);
    return () => clearTimeout(t);
  }, [done, steps.length, onDone, stepMs]);

  const progress = Math.min(1, (done + 0.6) / steps.length);
  const R = 70;
  const C = 2 * Math.PI * R;

  return (
    <Screen>
      <div className="flex justify-end px-5 h-14 items-center">
        {onClose && (
          <button onClick={onClose} aria-label="닫기">
            <CloseIcon size={24} />
          </button>
        )}
      </div>
      <div className="flex flex-col items-center pt-[100px]">
        <div className="relative w-[150px] h-[150px] flex items-center justify-center">
          <svg width="150" height="150" viewBox="0 0 150 150" className="absolute inset-0 -rotate-90">
            <circle cx="75" cy="75" r={R} fill="none" stroke="#E6E6EE" strokeWidth="4" />
            <circle
              cx="75"
              cy="75"
              r={R}
              fill="none"
              stroke="#6367FF"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progress * C} ${C}`}
              className="transition-all duration-700"
            />
          </svg>
          <Img3D name="star" size={100} />
        </div>
        <p className="text-[16px] text-[#48484F] mt-12">잠시만 기다려주세요...</p>
        <h1 className="text-[22px] font-bold text-ink text-center leading-[1.45] mt-2">{title}</h1>
        <ul className="mt-12 flex flex-col gap-5">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-3">
              {i < done ? (
                <span className="w-[30px] h-[30px] rounded-full bg-primary flex items-center justify-center">
                  <CheckIcon size={15} />
                </span>
              ) : i === done ? (
                <span className="w-[30px] h-[30px] rounded-full border-[3px] border-[#E6E6EE] border-t-primary border-r-primary animate-spin" />
              ) : (
                <span className="w-[30px] h-[30px] rounded-full border-[3px] border-[#E6E6EE]" />
              )}
              <span className={`text-[17px] ${i <= done ? 'text-ink' : 'text-mute'}`}>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </Screen>
  );
}

/* ── 코그니 발견 히어로 (그라데이션 배경 + 특징 카드) ──────── */

export interface CogniFeature {
  icon: ReactNode;
  text: string;
}

export function CogniHero({
  eyebrow,
  name,
  character = 'mascot-glasses',
  category,
  features,
  counterLabel,
  counter,
  primaryLabel,
  primaryVariant = 'dark',
  onPrimary,
  onSave,
  askFriend,
  onBack,
  topRight,
  overlay,
}: {
  eyebrow?: string;
  name?: ReactNode;
  character?: Asset3D;
  category: string;
  features: CogniFeature[];
  counterLabel: string;
  counter: string;
  primaryLabel: string;
  primaryVariant?: 'dark' | 'primary';
  onPrimary: () => void;
  onSave?: () => void;
  askFriend?: () => void;
  onBack?: () => void;
  topRight?: ReactNode;
  overlay?: ReactNode;
}) {
  return (
    <Screen statusBg="#E9E8FB" background={<GradientBg variant="a" />} overlay={overlay}>
      <div className="flex flex-col min-h-full">
        <div className="flex items-center justify-between px-5 h-14">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center"
            aria-label="뒤로가기"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 5l-7 7 7 7" stroke="#1A1A1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {topRight}
        </div>
        {(eyebrow || name) && (
          <div className="text-center -mt-2">
            {eyebrow && <p className="text-[15px] text-[#48484F]">{eyebrow}</p>}
            {name && <h1 className="text-[26px] font-bold text-ink leading-[1.35] mt-1.5">{name}</h1>}
          </div>
        )}
        <div className="flex-1 flex flex-col items-center justify-center py-6 min-h-[230px]">
          <Img3D name={character} size={character === 'cogni-headphone' ? 190 : 180} />
          <span className="mt-3 h-7 px-3 rounded-full bg-white/90 text-[12px] font-semibold text-primary inline-flex items-center">
            {category}
          </span>
        </div>
        <div className="px-4 pb-4 flex flex-col gap-2.5">
          <div className="bg-white/85 backdrop-blur rounded-3xl px-4 py-4 flex flex-col gap-3.5">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">{f.icon}</span>
                <span className="text-[15px] text-ink">{f.text}</span>
              </div>
            ))}
          </div>
          <div className="bg-white/85 backdrop-blur rounded-2xl px-5 h-12 flex items-center justify-between">
            <span className="text-[14px] text-[#48484F]">{counterLabel}</span>
            <span className="font-mono text-[15px] font-bold text-primary">{counter}</span>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={onSave}
              className="flex-1 h-14 rounded-2xl bg-white flex items-center justify-center gap-2 text-[16px] font-semibold text-ink"
            >
              <DownloadIcon /> 이미지 저장
            </button>
            <Button variant={primaryVariant} className="flex-1" onClick={onPrimary}>
              {primaryLabel}
            </Button>
          </div>
          {askFriend && (
            <button onClick={askFriend} className="h-10 text-[14px] font-semibold text-primary flex items-center justify-center gap-1">
              친구는 나를 어떻게 볼까? 물어보기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="#6367FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </Screen>
  );
}

/** Small line icons used in cogni feature lists. */
export const FeatureIcons = {
  target: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="#6367FF" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" stroke="#6367FF" strokeWidth="2" />
    </svg>
  ),
  clock: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="#6367FF" strokeWidth="2" />
      <path d="M12 8v4l2.5 2" stroke="#6367FF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  bolt: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" stroke="#6367FF" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  search: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6" stroke="#6367FF" strokeWidth="2" />
      <path d="M16 16l3.5 3.5" stroke="#6367FF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  cloud: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M7 18h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7 9.5 4.25 4.25 0 0 0 7 18Z" stroke="#6367FF" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  eye: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="#6367FF" strokeWidth="2" />
      <circle cx="12" cy="12" r="2.5" stroke="#6367FF" strokeWidth="2" />
    </svg>
  ),
  sparkle: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v5M12 16v5M3 12h5M16 12h5" stroke="#6367FF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

/* ── "친구는 나를 어떤 유형으로 볼지" 비교 시트 ───────────── */

export function AskFriendSheet({
  open,
  onClose,
  myType,
  onAsk,
}: {
  open: boolean;
  onClose: () => void;
  myType: string;
  onAsk: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="px-5 pt-4 pb-4">
        <h2 className="text-[20px] font-bold text-ink leading-[1.45]">
          친구는 나를 어떤 유형으로
          <br />
          볼지 물어보세요
        </h2>
        <p className="text-[14px] text-sub mt-2">총 9가지 유형이 있어요.</p>
        <div className="flex items-center gap-3 my-5">
          <span className="flex-1 h-px bg-line" />
          <span className="h-6 px-3 rounded-full bg-surface-2 text-[12px] text-sub inline-flex items-center">비교</span>
          <span className="flex-1 h-px bg-line" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="relative h-[120px] rounded-2xl bg-surface-2 flex items-center justify-center">
              <span className="text-[30px] font-bold text-primary">m</span>
              <span className="absolute right-3 bottom-3 h-6 px-2 rounded-full bg-primary text-white text-[11px] font-semibold inline-flex items-center">
                나
              </span>
            </div>
            <p className="text-[15px] font-semibold text-ink mt-3">{myType}</p>
            <p className="text-[12px] text-mute mt-1">내가 고른 나</p>
          </div>
          <div className="text-center">
            <div className="h-[120px] rounded-2xl bg-yellow-soft flex items-center justify-center">
              <span className="text-[30px] font-bold text-[#E5B92E]">?</span>
            </div>
            <p className="text-[15px] font-semibold text-ink mt-3">아직 비어 있음</p>
            <p className="text-[12px] text-mute mt-1">친구가 고른 나</p>
          </div>
        </div>
        <Button variant="dark" className="mt-6" onClick={onAsk}>
          친구에게 물어보기
        </Button>
        <TextButton className="mt-1" onClick={onClose}>
          다음에
        </TextButton>
      </div>
    </Sheet>
  );
}

/* ── 기본 상단바 + 제목/설명 블록 ────────────────────────── */

export function PageHeading({ eyebrow, title, sub }: { eyebrow?: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <div className="px-5">
      {eyebrow && <p className="font-mono text-[12px] tracking-[0.12em] text-sub uppercase">{eyebrow}</p>}
      <h1 className={`text-[24px] font-bold text-ink leading-snug ${eyebrow ? 'mt-1.5' : ''}`}>{title}</h1>
      {sub && <p className="text-[14px] text-sub mt-1.5 leading-relaxed">{sub}</p>}
    </div>
  );
}

export { TopBar };
