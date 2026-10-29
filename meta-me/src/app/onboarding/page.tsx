'use client';

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMyAccount, useSubmitOnboarding, type OnboardingRequest } from '@/entities/user';
import { useAuthStore } from '@/store';
import { ApiError } from '@/shared/api';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, CheckIcon, Dots, Img3D, OptionRow } from '@/components/ui/primitives';
import { AnalyzingScreen, CogniHero, FeatureIcons } from '@/components/ui/flows';
import { HourSlider } from '@/components/ui/HourSlider';
import { useMe } from '@/hooks/useMe';
import { fromFirstCogni, pickOnboardingCogni, type FoundCogni } from '@/lib/onboardingCogni';
import { ONBOARDING_QUESTIONS, type OnboardingQuestion } from './questions';

type Phase = 'intro' | 'question' | 'analyzing' | 'result' | 'outro';
type Answer = string | string[] | number | undefined;

/* ── 인트로 / 아웃트로 슬라이드 ─────────────────────────── */

/** 이 거리(px) 이상 가로로 밀어야 넘어간다. */
const SWIPE_MIN = 10;

type SwipeDir = 'next' | 'prev';
type SlideVariant = 'a' | 'b' | 'c';

/** `spread`: 중심 진하기는 그대로 두고, 중간(45% 지점)에 남는 진하기 비율. 클수록 퍼진 부분이 진하다. */
const blob = (w: number, h: number, x: number, y: number, rgb: string, a: number, spread = 0.3) =>
  `radial-gradient(${w}% ${h}% at ${x}% ${y}%, rgba(${rgb},${a}) 0%, rgba(${rgb},${a * spread}) 45%, rgba(${rgb},0) 85%)`;
const PURPLE = '160,164,255';
const LAVENDER = '200,202,255';
const YELLOW = '255,230,150';
const CREAM = '255,240,195';

const SLIDE_BG: Record<SlideVariant, string[]> = {
  a: [blob(100, 48, 0, 0, PURPLE, 0.9, 0.5), blob(65, 42, 100, 22, YELLOW, 0.85, 0.5), blob(90, 52, 75, 75, LAVENDER, 0.9)],
  b: [blob(100, 62, 60, 0, YELLOW, 0.9), blob(100, 50, 0, 90, PURPLE, 0.8), blob(80, 82, 90, 66, LAVENDER, 0.8)],
  c: [blob(80, 62, 15, 20, YELLOW, 0.9), blob(80, 50, 100, 32, PURPLE, 0.9), blob(50, 30, 25, 70, CREAM, 0.75), blob(75, 32, 100, 90, LAVENDER, 2)],
};

function SlideBackdrop({ variant }: { variant: SlideVariant }) {
  return (
    <div className="absolute inset-0 bg-[#FCFCFF]">
      {(Object.keys(SLIDE_BG) as SlideVariant[]).map((v) => (
        <div
          key={v}
          className="absolute inset-0 transition-opacity duration-500 ease-out motion-reduce:transition-none"
          style={{ backgroundImage: SLIDE_BG[v].join(','), opacity: v === variant ? 1 : 0 }}
        />
      ))}
    </div>
  );
}

function Slide({
  variant,
  children,
  eyebrow,
  align = 'left',
  hint,
  dots,
  onNext,
  onSkip,
  cta,
  swipe,
  enterFrom,
}: {
  variant: SlideVariant;
  children: ReactNode;
  /** 제목 위의 작은 라벨. 제목 위치를 밀어내지 않도록 제목 위에 따로 띄운다. */
  eyebrow?: string;
  align?: 'left' | 'center';
  hint?: string;
  dots?: [number, number];
  onNext: () => void;
  onSkip?: () => void;
  cta?: string;
  /** 주면 탭 대신 스와이프로 넘긴다: 오른쪽→왼쪽은 next, 왼쪽→오른쪽은 prev. */
  swipe?: { next?: () => void; prev?: () => void };
  /** 스와이프로 들어온 방향. 그쪽에서 살짝 밀려 들어오며 나타난다. */
  enterFrom?: SwipeDir;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  const slideIndex = dots?.[0];
  useEffect(() => {
    if (!enterFrom || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // 장이 바뀔 때마다(dots 변경) 들어오는 애니메이션을 다시 건다. 배경이 이어지도록 Slide 자체는 다시 마운트하지 않는다.
    const dx = enterFrom === 'next' ? 40 : -40;
    contentRef.current?.animate(
      [
        { transform: `translateX(${dx}px)`, opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 },
      ],
      { duration: 280, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
    );
  }, [enterFrom, slideIndex]);

  const onPointerDown = (e: PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!start.current || !swipe) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    start.current = null;
    // 세로 스크롤이나 짧은 터치는 무시하고, 가로로 충분히 밀었을 때만 넘긴다.
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) swipe.next?.();
    else swipe.prev?.();
  };

  return (
    <Screen bleed background={<SlideBackdrop variant={variant} />}>
      <div
        className={`relative h-full flex flex-col ${swipe ? 'touch-pan-y select-none' : ''}`}
        onClick={cta || swipe ? undefined : onNext}
        onPointerDown={swipe ? onPointerDown : undefined}
        onPointerUp={swipe ? onPointerUp : undefined}
        onPointerCancel={() => (start.current = null)}
      >
        <div className="h-10 flex items-center justify-end px-6">
          {onSkip && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSkip();
              }}
              className="text-[13px] text-[#48484F]"
            >
              넘어가기
            </button>
          )}
        </div>
        {align === 'left' ? (
          // 장마다 본문 길이·하단 버튼이 달라도 제목 첫 줄이 항상 같은 높이에 오도록, 화면 전체 높이 기준으로 위치를 고정한다.
          <>
            <div className="flex-1" />
            <div ref={contentRef} className="absolute inset-x-0 top-[38%] px-8 flex flex-col">
              {eyebrow && <p className="absolute bottom-full mb-6 font-mono text-[12px] tracking-[0.2em] text-[#5A5A62]">{eyebrow}</p>}
              {children}
            </div>
          </>
        ) : (
          <div ref={contentRef} className="flex-1 flex flex-col justify-center px-10 items-center text-center">
            {children}
          </div>
        )}
        <div className="flex flex-col items-center gap-5 pb-8 px-5">
          {hint && (
            <p className="text-[13px] text-[#48484F] flex items-center gap-2">
              {hint}
              {hint.startsWith('옆으로') && <span>→</span>}
            </p>
          )}
          {dots && <Dots count={dots[1]} index={dots[0]} variant="bar" />}
          {cta && (
            <Button variant="dark" onClick={onNext}>
              {cta}
            </Button>
          )}
        </div>
      </div>
    </Screen>
  );
}

const slideTitle = 'text-[30px] font-semibold text-ink leading-[1.5] tracking-[-0.02em]';

/* ── 질문 본문 ─────────────────────────────────────────── */

function QuestionBody({ q, answer, setAnswer }: { q: OnboardingQuestion; answer: Answer; setAnswer: (a: Answer) => void }) {
  switch (q.kind) {
    case 'sentence': {
      const later = answer === '__later__';
      const text = typeof answer === 'string' && !later ? answer : '';
      return (
        <div className="flex flex-col gap-4">
          <div className={`rounded-2xl px-4 py-3.5 border-[1.5px] ${later ? 'bg-surface border-transparent opacity-50' : 'bg-primary-soft/60 border-primary'}`}>
            <p className="text-[12px] font-semibold text-primary">내 문장</p>
            <textarea
              value={text}
              disabled={later}
              maxLength={80}
              rows={2}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="계획은 잘 세우는데, 시작 앞에서 오래 머무는 사람."
              className="w-full mt-1.5 bg-transparent outline-none resize-none text-[16px] font-semibold text-ink placeholder:text-mute placeholder:font-medium caret-primary"
            />
            <p className="text-right font-mono text-[12px] text-mute">{text.length} / 80</p>
          </div>
          <button
            onClick={() => setAnswer(later ? '' : '__later__')}
            className="flex items-center gap-3 rounded-2xl bg-yellow-soft px-4 h-14 text-left"
          >
            <span className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center ${later ? 'bg-[#E5B92E]' : 'border-[1.5px] border-[#E5C45A]'}`}>
              {later && <CheckIcon size={13} />}
            </span>
            <span className="text-[15px] text-gold">한 문장은 나중에 쓸게요</span>
          </button>
        </div>
      );
    }
    case 'scale': {
      const idx = typeof answer === 'number' ? answer : 2;
      const picked = q.options[idx];
      return (
        <div className="flex flex-col gap-4">
          <div className="rounded-3xl bg-surface px-5 pt-5 pb-5">
            <div className="relative">
              <div className="flex justify-between items-center px-1">
                {q.options.map((o, i) => (
                  <button key={o.label} onClick={() => setAnswer(i)} className="w-9 h-9 flex items-center justify-center" aria-label={o.label}>
                    {i === idx ? (
                      <span className="w-10 h-10 rounded-full bg-primary-line/60 flex items-center justify-center">
                        <span className="w-7 h-7 rounded-full bg-primary" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border-[1.5px] border-[#B4B4BB]" />
                    )}
                  </button>
                ))}
              </div>
              <div className="mx-3 mt-4 h-1 rounded-full bg-[#E1E1E8]">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(idx / (q.options.length - 1)) * 100}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1 mt-4">
              {q.options.map((o, i) => (
                <button
                  key={o.label}
                  onClick={() => setAnswer(i)}
                  className={`text-[11px] leading-[1.45] text-center break-keep ${i === idx ? 'font-bold text-primary' : 'text-sub'}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-line px-5 py-4">
            <p className="text-[12px] font-semibold text-primary">지금 고른 답</p>
            <p className="text-[18px] font-bold text-ink mt-1.5">{picked.label}</p>
            <p className="text-[13px] text-sub mt-1.5 leading-relaxed">{picked.description}</p>
          </div>
        </div>
      );
    }
    case 'multi': {
      const list = Array.isArray(answer) ? answer : [];
      const toggle = (o: string) => {
        if (list.includes(o)) setAnswer(list.filter((x) => x !== o));
        else if (!q.max || list.length < q.max) setAnswer([...list, o]);
      };
      return (
        <div className="flex flex-col gap-2.5">
          {q.options.map((o) =>
            q.soft ? (
              <button
                key={o}
                onClick={() => toggle(o)}
                className={`flex items-center gap-3 rounded-2xl px-4 h-14 text-left ${list.includes(o) ? 'bg-primary-soft' : 'bg-surface'}`}
              >
                <span className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center ${list.includes(o) ? 'bg-primary' : 'bg-white border-[1.5px] border-[#D5D5DC]'}`}>
                  {list.includes(o) && <CheckIcon size={13} />}
                </span>
                <span className="text-[15px] text-[#48484F]">{o}</span>
              </button>
            ) : (
              <OptionRow key={o} label={o} selected={list.includes(o)} onClick={() => toggle(o)} />
            ),
          )}
        </div>
      );
    }
    case 'list':
      return (
        <div className="flex flex-col gap-2.5">
          {q.options.map((o) => (
            <OptionRow key={o.label} label={o.label} description={o.description} selected={answer === o.label} onClick={() => setAnswer(o.label)} />
          ))}
        </div>
      );
    case 'cards':
      return (
        <div className="grid grid-cols-2 gap-3">
          {q.options.map((o, i) => {
            const selected = answer === o.label;
            const solid = q.accent === 'solid';
            return (
              <button
                key={o.label}
                onClick={() => setAnswer(o.label)}
                className={`flex flex-col text-left rounded-3xl p-4 min-h-[150px] border-[1.5px] transition-colors ${
                  selected
                    ? solid
                      ? 'bg-primary border-primary'
                      : 'bg-primary-soft border-primary'
                    : 'bg-surface border-transparent'
                }`}
              >
                {q.glyphs && (
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-semibold ${
                      selected && solid ? 'bg-yellow text-ink' : 'bg-white text-primary'
                    }`}
                  >
                    {selected && solid ? <CheckIcon size={14} color="#1A1A1E" /> : q.glyphs[i] === '✓' ? '◡' : q.glyphs[i]}
                  </span>
                )}
                <span className={`${q.glyphs ? 'mt-auto pt-6' : ''} text-[16px] font-bold leading-snug ${selected && solid ? 'text-white' : 'text-ink'}`}>
                  {o.label}
                </span>
                {o.description && (
                  <span className={`text-[13px] mt-1.5 leading-relaxed ${selected && solid ? 'text-white/85' : 'text-sub'}`}>{o.description}</span>
                )}
              </button>
            );
          })}
        </div>
      );
    case 'hours': {
      const h = typeof answer === 'number' ? answer : 2;
      return (
        <div>
          <p className="text-center text-[40px] font-bold text-ink -mt-2">{h >= 4 ? '4시간 이상' : `${h}시간`}</p>
          <div className="mt-8">
            <HourSlider min={0} max={4} step={0.5} value={h} onChange={setAnswer} />
            <div className="flex justify-between text-[13px] text-sub mt-4">
              <span>0시간</span>
              <span>2시간</span>
              <span>4시간 이상</span>
            </div>
          </div>
          <div className="mt-10 rounded-2xl bg-surface px-5 py-4 flex gap-3">
            <span className="text-[14px] font-bold text-primary">TIP</span>
            <div>
              <p className="text-[15px] font-semibold text-ink">정답은 없어요</p>
              <p className="text-[13px] text-sub mt-1 leading-relaxed">
                요즘 실제로 필요하다고 느끼는 만큼 골라주세요. 리포트에서 기록과 함께 비교해 드려요.
              </p>
            </div>
          </div>
        </div>
      );
    }
  }
}

function isAnswered(q: OnboardingQuestion, a: Answer) {
  if (q.kind === 'sentence') return typeof a === 'string' && a.trim().length > 0;
  if (q.kind === 'multi') return Array.isArray(a) && a.length > 0;
  if (q.kind === 'scale' || q.kind === 'hours') return true;
  return typeof a === 'string' && a.length > 0;
}

/**
 * 서버 answers로 보낼 질문별 원래 답. 척도는 순번 대신 고른 문구로 보낸다.
 * 시간은 슬라이더가 0.5시간 단위라 소수(1.5)가 나오므로, 서버가 정수만 받아도 되게 분 단위 정수(90)로 바꿔 `_minutes` 키로 보낸다.
 */
const rawAnswers = (answers: Record<string, Answer>) => {
  const out: Record<string, string | string[] | number> = {};
  for (const q of ONBOARDING_QUESTIONS) {
    const a = answers[q.id];
    if (a === undefined || a === '' || a === '__later__') continue;
    if (q.kind === 'hours' && typeof a === 'number') out[q.id.replace(/_hours$/, '_minutes')] = Math.round(a * 60);
    else out[q.id] = q.kind === 'scale' && typeof a === 'number' ? q.options[a].label : a;
  }
  return out;
};

const labelOf = (a: Answer, q?: OnboardingQuestion) => {
  if (Array.isArray(a)) return a.join(', ');
  if (typeof a === 'number' && q?.kind === 'scale') return q.options[a].label;
  if (typeof a === 'string' && a !== '__later__') return a;
  return '';
};

/* ── 페이지 ────────────────────────────────────────────── */

export default function OnboardingPage() {
  const router = useRouter();
  const submitOnboarding = useSubmitOnboarding();
  const [phase, setPhase] = useState<Phase>('intro');
  const [slide, setSlide] = useState(0);
  const [slideDir, setSlideDir] = useState<SwipeDir>();
  const [qIndex, setQIndex] = useState(0);
  // 척도·시간 질문은 화면이 가운데 값(2)을 선택된 것처럼 그리므로, 건드리지 않고 넘어가도 보이는 값이 저장되게 미리 채운다.
  const [answers, setAnswers] = useState<Record<string, Answer>>(() =>
    Object.fromEntries(ONBOARDING_QUESTIONS.filter((x) => x.kind === 'scale' || x.kind === 'hours').map((x) => [x.id, 2])),
  );
  const [accuracy, setAccuracy] = useState(12);
  const me = useMe();
  // 표시 이름: 가입 때 입력한 닉네임 → 서버 계정 이름(username) → 이메일 앞부분
  const token = useAuthStore((s) => s.accessToken);
  const { data: account } = useGetMyAccount(!!token && !me.nickname);
  const displayName = me.nickname || account?.user.username || account?.user.email?.split('@')[0];

  const q = ONBOARDING_QUESTIONS[qIndex];
  const total = ONBOARDING_QUESTIONS.length;
  const isLast = qIndex === total - 1;

  const [submitted, setSubmitted] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState(false);

  // 서버가 배정한 첫 코그니. 제출 응답이 분석 화면보다 늦을 수 있어 발견할 때 이 약속을 기다린다.
  const serverCogni = useRef<Promise<FoundCogni | undefined>>(undefined);

  const submit = async () => {
    const byId = (id: string) => labelOf(answers[id], ONBOARDING_QUESTIONS.find((x) => x.id === id)) || '아직 모르겠어요';
    const sentence = labelOf(answers.my_one_sentence);
    if (sentence) me.patch((u) => ({ ...u, mySentence: sentence }));
    let body: OnboardingRequest | undefined;
    try {
      // v2 온보딩 질문은 API 필드(3개 문장)와 1:1로 맞지 않아 가장 가까운 답을 묶어 보내고, 원래 답은 answers로 함께 보낸다.
      body = {
        // 한 문장은 선택 항목이고, 보낼 때는 공백을 뺀 10자 이상이어야 한다.
        ...(sentence.replace(/\s/g, '').length >= 10 && { my_one_sentence: sentence }),
        self_strength: byId('self_awareness'),
        others_feedback: byId('repeating_pattern'),
        favorite_thing: byId('curious_about'),
        answers: rawAnswers(answers),
      };
      const request = submitOnboarding.mutateAsync(body);
      serverCogni.current = request.then((r) => (r.first_cogni ? fromFirstCogni(r.first_cogni) : undefined)).catch(() => undefined);
      const res = await request;
      if (typeof res.accuracy_percent === 'number') setAccuracy(Math.round(res.accuracy_percent));
      setSubmitted(true);
      return true;
    } catch (err) {
      // 이미 제출된 계정(409)은 성공으로 본다. 그 외 실패는 마칠 때 한 번 더 시도한다.
      const already = err instanceof ApiError && err.code === 'ONBOARDING_ALREADY_SUBMITTED';
      if (already) setSubmitted(true);
      // 원인을 재현하기 어려운 실패(예: 400 검증 실패)를 콘솔에서 바로 확인할 수 있게 서버 응답과 보낸 내용을 남긴다.
      else
        console.error(
          '[onboarding] 제출 실패',
          err instanceof ApiError ? { status: err.status, code: err.code, message: err.message } : err,
          body,
        );
      return already;
    }
  };

  // 첫 코그니를 도감(기기 저장)에 넣는다. 메인·마이페이지 캐릭터도 이걸 쓴다.
  // 서버가 배정한 코그니를 쓰되, 없거나 3초 안에 오지 않으면 답으로 임시 코그니를 고른다.
  const [found, setFound] = useState<FoundCogni>();
  // 분석 화면은 끝날 때와 닫을 때 모두 부르므로, 서버 응답을 기다리는 사이 두 번 들어오지 않게 막는다.
  const discovering = useRef(false);
  const discover = async () => {
    if (discovering.current) return;
    discovering.current = true;
    const timeout = new Promise<undefined>((resolve) => setTimeout(resolve, 3000));
    const picked = (await Promise.race([serverCogni.current, timeout])) ?? pickOnboardingCogni(answers);
    me.addCogni({ ...picked.cogni, foundAt: new Date().toISOString() });
    setFound(picked);
    setPhase('result');
  };

  const next = () => {
    if (!isLast) {
      setQIndex(qIndex + 1);
      return;
    }
    submit();
    setPhase('analyzing');
  };

  /* 인트로 */
  if (phase === 'intro') {
    const go = () => (slide < 2 ? setSlide(slide + 1) : (setPhase('question'), setSlide(0)));
    const skip = () => (setPhase('question'), setSlide(0));
    const swipeTo = (to: number) => {
      setSlideDir(to > slide ? 'next' : 'prev');
      setSlide(to);
    };
    // 마지막 장은 '첫 질문 보기' 버튼으로만 시작하고, 스와이프로는 앞 장으로만 돌아간다.
    const swipe = {
      next: slide < 2 ? () => swipeTo(slide + 1) : undefined,
      prev: slide > 0 ? () => swipeTo(slide - 1) : undefined,
    };
    if (slide === 0)
      return (
        <Slide variant="a" eyebrow="METAME" dots={[0, 3]} hint="옆으로 밀어서 계속" onNext={go} swipe={swipe} enterFrom={slideDir}>
          <h1 className={slideTitle}>
            안녕하세요.
            <br />
            처음부터 무거운 질문은
            <br />
            하지 않을게요.
          </h1>
        </Slide>
      );
    if (slide === 1)
      return (
        <Slide variant="b" dots={[1, 3]} hint="옆으로 밀어서 계속" onNext={go} onSkip={skip} swipe={swipe} enterFrom={slideDir}>
          <h1 className={slideTitle}>
            앞으로 당신을 더 잘 이해해서
            <br />
            도와드릴 수 있도록,
            <br />
            가볍게 3가지만 골라주세요.
          </h1>
          <span className="self-start mt-6 h-8 px-4 rounded-full bg-white text-[13px] font-semibold text-primary inline-flex items-center">
            약 2분 · 9개 질문
          </span>
        </Slide>
      );
    return (
      <Slide variant="c" dots={[2, 3]} onNext={go} onSkip={skip} cta="첫 질문 보기" swipe={swipe} enterFrom={slideDir}>
        <h1 className={slideTitle}>
          잘 모르겠으면
          <br />
          “아직 모르겠어요”를
          <br />
          골라도 괜찮아요.
        </h1>
        <span className="self-start mt-6 h-8 px-4 rounded-full bg-yellow text-[13px] font-semibold text-ink inline-flex items-center">
          아직 모르겠어요
        </span>
      </Slide>
    );
  }

  /* 질문 */
  if (phase === 'question') {
    const answer = answers[q.id];
    const setAnswer = (a: Answer) => setAnswers((prev) => ({ ...prev, [q.id]: a }));
    const titleFirst = q.kind === 'hours';
    const title = (
      <div className={titleFirst ? '' : 'mt-2'}>
        <h1 className="text-[20px] font-bold text-ink leading-[1.5] whitespace-pre-line">{q.title}</h1>
        {'caption' in q && q.caption && <p className="text-[13px] text-sub mt-1.5">{q.caption}</p>}
      </div>
    );
    return (
      <Screen
        footer={
          <Button variant={isLast ? 'primary' : 'dark'} onClick={next} disabled={!isAnswered(q, answer)}>
            {isLast ? '답변 마치기' : '다음'}
          </Button>
        }
      >
        {/* 머리·아이콘·질문은 고정하고, 선택지 칸 안에서만 스크롤한다. */}
        <div className="px-5 h-full flex flex-col">
          <div className="shrink-0 flex items-center justify-between h-14">
            {/* 첫 질문에서는 이전으로 돌아가지 않는다. 오른쪽 숫자 위치가 흔들리지 않게 빈 자리는 남긴다. */}
            {qIndex === 0 ? <span className="w-10 h-10" /> : <BackButton onClick={() => setQIndex(qIndex - 1)} />}
            <span className="font-mono text-[13px] text-mute">
              {qIndex + 1} / {total}
            </span>
          </div>
          <div className="shrink-0 flex gap-2 mt-2">
            {ONBOARDING_QUESTIONS.map((x, i) => (
              <span key={x.id} className={`w-1.5 h-1.5 rounded-full ${i === qIndex ? 'bg-primary scale-125' : 'bg-[#D8D8DE]'}`} />
            ))}
          </div>
          {titleFirst && <div className="shrink-0 mt-8">{title}</div>}
          <div className={`shrink-0 flex justify-center ${titleFirst ? 'mt-8 mb-6' : 'mt-[140px] mb-8'}`}>
            <Img3D name={q.icon} size={titleFirst ? 100 : 104} />
          </div>
          {!titleFirst && <div className="shrink-0">{title}</div>}
          {/* 선택 테두리가 잘리지 않도록 좌우에 1px 여유를 둔다. 질문이 바뀌면 key로 스크롤을 맨 위로 되돌린다. */}
          <div key={q.id} className="flex-1 min-h-0 overflow-y-auto no-scrollbar mt-4 -mx-1 px-1 pt-px pb-4">
            <QuestionBody q={q} answer={answer} setAnswer={setAnswer} />
          </div>
        </div>
      </Screen>
    );
  }

  /* 분석 중 */
  if (phase === 'analyzing') {
    return (
      <AnalyzingScreen
        title={
          <>
            내 답에 꼭 맞는
            <br />첫 코그니를 찾고 있어요
          </>
        }
        steps={['내 기록 습관 분석 중', '내 감정 패턴 분석 중', '내 성향 분석 중']}
        onDone={discover}
        onClose={discover}
      />
    );
  }

  /* 첫 코그니 결과 */
  if (phase === 'result' && found) {
    const { cogni, label } = found;
    const [adjective, ...rest] = cogni.name.split(' ');
    const icons = [FeatureIcons.target, FeatureIcons.clock, FeatureIcons.bolt];
    return (
      <CogniHero
        eyebrow={displayName ? `${displayName}님의 첫 코그니는` : '나의 첫 코그니는'}
        name={
          <>
            {adjective}
            <br />
            {rest.join(' ')}
          </>
        }
        imageSrc={cogni.image}
        category={label}
        features={cogni.features.map((text, i) => ({ icon: icons[i % icons.length], text }))}
        counterLabel={`온보딩 답 ${total}개에서 발견`}
        counter="01 / 24"
        primaryLabel="여정 시작하기"
        onPrimary={() => setPhase('outro')}
      />
    );
  }

  /* 아웃트로 */
  // 서버 제출이 끝까지 실패하면 완료로 기록하지 않는다. 완료로 기록하면 다시 제출할 기회가 사라진다.
  const finish = async () => {
    if (finishing) return;
    setFinishing(true);
    setFinishError(false);
    const ok = submitted || (await submit());
    if (!ok) {
      setFinishing(false);
      setFinishError(true);
      setSlide(2);
      return;
    }
    me.patch((u) => ({ ...u, onboardedAt: new Date().toISOString() }));
    router.push('/main');
  };
  if (slide === 0)
    return (
      <Slide variant="a" dots={[0, 3]} hint="화면을 탭해서 계속" align="center" onNext={() => setSlide(1)}>
        <h1 className="text-[22px] font-bold text-ink leading-[1.65]">
          그 문장은 오늘부터 바뀝니다.
          <br />
          당신을 더 잘 이해할 수 있도록 도와줄게요
        </h1>
      </Slide>
    );
  if (slide === 1)
    return (
      <Slide variant="b" dots={[1, 3]} hint="화면을 탭해서 계속" align="center" onNext={() => setSlide(2)} onSkip={finish}>
        <h1 className="text-[36px] font-bold text-ink tracking-tight">Day 0</h1>
        <p className="text-[15px] text-[#48484F] mt-3">당신이 스스로 쓴 첫 문장이 저장됐어요</p>
      </Slide>
    );
  return (
    <Slide variant="c" align="center" onNext={finish} onSkip={finish}>
      <p className="font-mono text-[12px] tracking-[0.25em] text-[#5A5A62]">YOUR JOURNEY BEGINS</p>
      <h1 className="text-[52px] font-bold text-ink tracking-tight mt-2">Day 1</h1>
      <p className="text-[16px] text-ink leading-[1.7] mt-2">
        오늘부터 쌓이는 기록이
        <br />
        당신의 한 문장을 정확하게 만듭니다
      </p>
      {submitted && (
        <span className="mt-6 h-9 px-4 rounded-full bg-white text-[13px] font-semibold text-primary inline-flex items-center">
          정확도 {accuracy}%에서 출발합니다
        </span>
      )}
      {finishing && <p className="mt-4 text-[13px] text-sub">저장하는 중...</p>}
      {finishError && !finishing && (
        <p className="mt-4 text-[13px] text-danger">
          답변을 저장하지 못했어요.
          <br />
          화면을 탭해서 다시 시도해 주세요.
        </p>
      )}
    </Slide>
  );
}
