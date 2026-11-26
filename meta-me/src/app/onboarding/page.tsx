'use client';

import { useEffect, useRef, useState } from 'react';
import { useGetMyAccount, useSubmitOnboarding, userApi, type OnboardingRequest } from '@/entities/user';
import { useAuthStore } from '@/store';
import { ApiError } from '@/shared/api';
import { useMe } from '@/hooks/useMe';
import { fromFirstCogni, hasCogniImage, type FoundCogni } from '@/lib/onboardingCogni';
import { DEFAULT_ALONE_TIME, ONBOARDING_QUESTIONS, type OnboardingQuestion } from '@/lib/onboardingQuestions';
import { toLegacyAnswers } from '@/lib/onboardingLegacyAnswers';
import { gibberishReason } from '@/lib/textQuality';
import { useTheme } from '@/lib/theme';
import { router } from '@/lib/router';
import { Screen } from '@/components/ui/Screen';
import { Button, CogniImg } from '@/components/ui/primitives';
import { Img, Pressable, ScrollView, View, asset } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';
import { StaggerText } from '@/components/ui/states';
import { TimeDial, timeLabel } from '@/components/onboarding/TimeDial';
import {
  GlassBack,
  Note,
  OptionCard,
  OptionRow,
  QuestionBackdrop,
  QuestionHeader,
  SentenceInput,
  SoftBackdrop,
  SpeechBubble,
  StepSlider,
  SunriseBackdrop,
  TipCard,
  UnsureToggle,
} from '@/components/onboarding/ui';
import { Animate, ZOOM_IN, fadeInDown } from '@/components/onboarding/motion';
import { withSensitiveGate } from '@/components/SensitiveGate';
import { hasSensitiveConsent } from '@/hooks/useSensitiveConsent';

type Phase = 'intro' | 'question' | 'sunrise' | 'analyzing' | 'result' | 'welcome';
type Answer = string | string[] | number | [number, number] | undefined;

/** '잘 모르겠어요'를 고른 한 문장 */
const UNSURE = '__unsure__';
/** 서버는 my_one_sentence를 공백을 뺀 10자 이상만 받는다. 화면에서는 막지 않고, 짧으면 이 칸만 빼고 보낸다(선택 항목). */
const SERVER_MIN_SENTENCE = 10;
/** 한 문장이니 30자까지만 받는다. */
const SENTENCE_MAX = 30;
/** 해 뜨는 화면에서 '코그니 찾으러 가기' 버튼이 올라오기까지 기다리는 시간(ms) */
const SUNRISE_BUTTON_MS = 1400;
/** 분석 중 원이 다 차는 시간(ms) */
const ANALYZE_MS = 4200;
/** 분석 원이 100%를 찍고 다음 화면으로 넘어가기 전 잠깐 머무는 시간(ms) */
const ANALYZE_HOLD_MS = 450;

const longEnoughForServer = (text: string) => text.replace(/\s/g, '').length >= SERVER_MIN_SENTENCE;

function isAnswered(q: OnboardingQuestion, a: Answer) {
  switch (q.kind) {
    case 'sentence':
      return a === UNSURE || (typeof a === 'string' && a.trim().length > 0 && !gibberishReason(a));
    case 'scale':
    case 'timeRange':
      // 손대지 않고 넘어가도 된다(가운데 단계 · 기본 시간대를 보낸다).
      return true;
    case 'multi':
      return Array.isArray(a) && a.length > 0;
    default:
      return typeof a === 'string' && a.length > 0;
  }
}

const optionWithDescription = (q: OnboardingQuestion, label: string) => {
  if (q.kind !== 'single' && q.kind !== 'cards') return label;
  const o = q.options.find((x) => x.label === label);
  return o?.description ? `${label.replace(/[“”]/g, '')} - ${o.description}` : label.replace(/[“”]/g, '');
};

/**
 * 서버 제출 내용. 필수 필드는 시안 질문 중 뜻이 맞는 답으로 채운다.
 * - self_strength ← 7번 '내 장점', others_feedback ← 6번 '남한테 자주 듣는 말'
 * - favorite_thing ← 3번 '알고 싶은 것'(', '로 이음). 기기에서 첫 코그니를 다시 고를 때도 이 규칙을 쓴다.
 * - answers ← ⚠️ 임시: 서버에 새 질문이 등록되기 전까지 예전 질문 선택지로 바꿔 보낸다(lib/onboardingLegacyAnswers.ts).
 */
function buildRequest(answers: Record<string, Answer>): OnboardingRequest {
  const byId = (id: string) => ONBOARDING_QUESTIONS.find((q) => q.id === id)!;
  const pick = (id: string) => {
    const a = answers[id];
    return typeof a === 'string' && a ? optionWithDescription(byId(id), a) : '';
  };
  const sentence = answers.my_one_sentence;
  const curious = Array.isArray(answers.curious_about) ? (answers.curious_about as string[]) : [];
  return {
    ...(typeof sentence === 'string' && sentence !== UNSURE && longEnoughForServer(sentence) && { my_one_sentence: sentence.trim() }),
    self_strength: pick('self_strength') || '아직 모르겠어요',
    others_feedback: pick('others_feedback') || '아직 모르겠어요',
    favorite_thing: curious.join(', ') || '아직 모르겠어요',
    // 명세는 "1"~"8" 키별 선택지를 리터럴 타입으로 고정하지만, 값은 예전 질문의 선택지 라벨에서 만들어진다.
    answers: toLegacyAnswers(answers) as NonNullable<OnboardingRequest['answers']>,
  };
}

/* ── 질문 본문 ─────────────────────────────────────────── */

const COUNT = ['', '하나', '두 개', '세 개', '네 개'];

function QuestionBody({ q, answer, setAnswer }: { q: OnboardingQuestion; answer: Answer; setAnswer: (a: Answer) => void }) {
  switch (q.kind) {
    case 'sentence': {
      const unsure = answer === UNSURE;
      const text = typeof answer === 'string' && !unsure ? answer : '';
      return (
        <View className="gap-8 pt-[150px]">
          <SentenceInput value={text} onChange={setAnswer} placeholder={q.placeholder} disabled={unsure} max={SENTENCE_MAX} />
          <UnsureToggle on={unsure} onChange={(on) => setAnswer(on ? UNSURE : '')} />
        </View>
      );
    }
    case 'scale': {
      const idx = typeof answer === 'number' ? answer : Math.floor(q.steps.length / 2);
      return (
        <View className="pt-14">
          <Text className="text-center text-[24px] font-bold tracking-tight text-white" accessibilityLiveRegion="polite">
            {q.steps[idx]}
          </Text>
          <View className="mt-12">
            <StepSlider steps={q.steps.length} value={idx} onChange={setAnswer} label={q.title} />
            <View className="flex-row justify-between mt-3">
              {q.ends.map((e) => (
                <Text key={e} className="text-[14px] text-white/62">
                  {e}
                </Text>
              ))}
            </View>
          </View>
          {q.tip && (
            <View className="mt-9">
              <TipCard {...q.tip} />
            </View>
          )}
        </View>
      );
    }
    case 'multi': {
      const list = Array.isArray(answer) ? (answer as string[]) : [];
      const full = !!q.max && list.length >= q.max;
      const toggle = (o: string) => {
        if (list.includes(o)) setAnswer(list.filter((x) => x !== o));
        else if (!full) setAnswer([...list, o]);
      };
      const left = q.max ? q.max - list.length : 0;
      return (
        <View className="gap-2 pt-5">
          {q.options.map((o) => (
            <OptionRow key={o} label={o} on={list.includes(o)} onPress={() => toggle(o)} />
          ))}
          {!!q.max && list.length > 0 && (
            <View className="mt-3">
              <Note>{left > 0 ? `${COUNT[left] ?? `${left}개`} 더 고를 수 있어요` : `최대 ${q.max}개까지 골랐어요`}</Note>
            </View>
          )}
        </View>
      );
    }
    case 'single':
      return (
        <View className="gap-2 pt-5">
          {q.options.map((o) => (
            <OptionRow key={o.label} label={o.label} description={o.description} on={answer === o.label} onPress={() => setAnswer(o.label)} />
          ))}
        </View>
      );
    case 'cards': {
      const rows = [q.options.slice(0, 2), q.options.slice(2, 4)];
      return (
        <View className="gap-5 pt-5">
          <View className="gap-3" role="radiogroup" aria-label={q.title}>
            {rows.map((row, i) => (
              <View key={i} className="flex-row gap-3">
                {row.map((o) => (
                  <OptionCard key={o.label} label={o.label} description={o.description} on={answer === o.label} onPress={() => setAnswer(o.label)} />
                ))}
              </View>
            ))}
          </View>
          {!!q.note && <Note>{q.note}</Note>}
        </View>
      );
    }
    case 'timeRange':
      return (
        <View className="pt-10">
          <TimeDial value={(Array.isArray(answer) ? answer : DEFAULT_ALONE_TIME) as [number, number]} onChange={setAnswer} />
        </View>
      );
  }
}

/* ── 인트로 (7e) ───────────────────────────────────────── */

const INTRO = [
  { bubble: '안녕하세요, metame예요', title: '나를 알아가는\n첫걸음', sub: '하루 한 문장씩 쌓이면 나를 더 잘 알게 돼요', cta: '좋아요, 시작할게요' },
  { bubble: '어떤 게 좋으세요?', title: '가볍게\n3가지만 골라주세요', sub: '마음이 가는 대로 골라도 2분이면 끝나요', cta: '다음으로' },
  { bubble: '언제든지 다시 고를 수 있어요', title: '잘 모르겠으면\n넘어가도 괜찮아요.', sub: '정답은 없어요, 지금의 나면 충분해요', cta: '시작하기' },
];

const IMG = {
  character: asset('v2/cogni-default.png'),
  spark: asset('onboarding/spark.svg'),
  smile: asset('onboarding/smile.svg'),
  heart: asset('onboarding/heart.svg'),
  star: asset('onboarding/star.svg'),
  starGold: asset('onboarding/star-gold.svg'),
  sunrise: asset('onboarding/sunrise.svg'),
  popper: asset('onboarding/popper.svg'),
};

function Intro({ slide, onNext, onBack }: { slide: number; onNext: () => void; onBack: () => void }) {
  const s = INTRO[slide];
  return (
    // 배경은 바로 이어지는 Q1과 같은 보라 그라데이션(7f)이다. 라이트·다크 모두 같은 어두운 화면이다.
    <Screen statusFg="light" bg="#110F30" background={<QuestionBackdrop index={0} />} contentClassName="flex-grow" footer={<Button onPress={onNext}>{s.cta}</Button>}>
      <View className="h-12 shrink-0 justify-center px-5">{slide > 0 && <GlassBack onPress={onBack} />}</View>
      {/* 장마다 바뀌는 부분이 살짝 밀려 들어오게 한다. */}
      <Animate key={slide} keyframes={fadeInDown(12)} duration={320} className="flex-1 items-center justify-center gap-12 px-8 pb-6">
        <View className="items-center">
          <SpeechBubble>{s.bubble}</SpeechBubble>
          <View className={`w-[150px] mt-7 items-center ${slide === 2 ? 'h-6' : ''}`}>
            {slide < 2 && <Img src={IMG.character} width={150} height={148} />}
            <Img src={IMG.spark} width={40} height={40} style={{ position: 'absolute', right: -34, top: -6 }} />
          </View>
        </View>
        {slide === 1 && (
          <View className="flex-row items-center gap-2.5" importantForAccessibility="no-hide-descendants">
            {(
              [
                [IMG.smile, 'bg-white/12 border border-white/18', '-8deg'],
                [IMG.heart, 'bg-white/12 border border-white/18', '0deg'],
                [IMG.star, 'bg-[#FFE066]/20 border border-[#FFE066]/30', '8deg'],
              ] as const
            ).map(([src, bg, rot], i) => (
              <View key={i} className={`w-[76px] h-[76px] shrink-0 rounded-[18px] items-center justify-center ${bg}`} style={{ transform: `rotate(${rot})` }}>
                <Img src={src} width={34} height={34} />
              </View>
            ))}
          </View>
        )}
        <View className="items-center gap-2.5">
          {/* 제목 줄마다, 그다음 설명이 순서대로 나타난다. */}
          <StaggerText header text={s.title} delay={120} className="text-[24px] font-semibold leading-[35px] tracking-tight text-white text-center" />
          <StaggerText text={s.sub} delay={120 + s.title.split('\n').length * 70} className="text-[16px] leading-[26px] text-white/70 text-center" />
        </View>
      </Animate>
    </Screen>
  );
}

/* ── 분석 중 (13h2) ────────────────────────────────────── */

const REVIEWS = [
  { name: '지윤', text: '막연하게 느끼던 내 습관이 한 문장으로 정리되니까 신기했어요.' },
  { name: '도현', text: '친구가 본 나와 내가 본 나를 비교해보고 처음으로 납득이 됐어요.' },
  { name: '서아', text: '매일 한 줄씩 썼을 뿐인데 내 감정 흐름이 보이기 시작했어요.' },
];
const CARD_W = 290;
const CARD_GAP = 16;

/** 후기 카드가 옆으로 천천히 흘러간다(두 벌을 이어 붙여 끊김 없이). */
function ReviewMarquee() {
  return (
    <View className="mt-9 overflow-hidden" importantForAccessibility="no-hide-descendants">
      <Animate
        keyframes={[{ transform: 'translateX(0)' }, { transform: `translateX(${-(CARD_W + CARD_GAP) * REVIEWS.length}px)` }]}
        duration={14000}
        easing="linear"
        iterations={Infinity}
        className="flex-row pl-6 self-start"
        style={{ gap: CARD_GAP }}
      >
        {[...REVIEWS, ...REVIEWS].map((r, i) => (
          <View key={i} className="shrink-0 rounded-[20px] bg-page border border-surface-2 px-6 py-6 items-center" style={{ width: CARD_W }}>
            <View className="flex-row gap-1">
              {Array.from({ length: 5 }, (_, k) => (
                <Img key={k} src={IMG.starGold} width={20} height={20} />
              ))}
            </View>
            <Text className="mt-2.5 text-[16px] font-bold text-ink">{r.name}</Text>
            <Text className="mt-2 text-[16px] leading-6 text-text-3 text-center">{r.text}</Text>
          </View>
        ))}
      </Animate>
    </View>
  );
}

function Analyzing({ onDone }: { onDone: () => void }) {
  // 원은 소수 진행률로 끊김 없이 그리고, 숫자만 정수로 보여 준다.
  const [progress, setProgress] = useState(0);
  const pct = Math.round(progress * 100);
  const done = useRef(false);
  const finish = () => {
    if (done.current) return;
    done.current = true;
    onDone();
  };
  // 타이머 안에서 부를 최신 finish (렌더 중에 ref를 읽지 않도록 effect에서 갱신한다)
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  });

  // 원이 0 → 100%로 차오른 뒤 잠깐 머물렀다가 다음 화면으로 넘어간다.
  // 처음과 끝이 부드럽게 이어지도록 sine ease-in-out으로 채운다(시작이 튀거나 끝에서 멈칫하지 않게).
  useEffect(() => {
    const start = Date.now();
    let raf = 0;
    let hold: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / ANALYZE_MS);
      setProgress(0.5 - Math.cos(Math.PI * t) / 2);
      if (t < 1) raf = requestAnimationFrame(tick);
      else hold = setTimeout(() => finishRef.current(), ANALYZE_HOLD_MS);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hold);
    };
  }, []);

  const { bg } = useTheme();
  const R = 96;
  const C = 2 * Math.PI * R;
  return (
    <Screen background={<SoftBackdrop />} bg="#F5F6FF">
      <View className="px-5 pt-0.5 items-start">
        <GlassBack onPress={finish} label="닫기" light close />
      </View>
      <View className="w-[220px] h-[220px] shrink-0 self-center mt-7">
        <svg width={220} height={220} viewBox="0 0 220 220" aria-hidden>
          <circle cx={110} cy={110} r={R} fill="none" stroke={bg('#F4F5F8')} strokeWidth={14} />
          <circle
            cx={110}
            cy={110}
            r={R}
            fill="none"
            stroke="#6367FF"
            strokeWidth={14}
            strokeLinecap="round"
            // 0%일 때 둥근 끝이 점으로 보이지 않게 숨긴다.
            strokeOpacity={progress > 0.005 ? 1 : 0}
            strokeDasharray={`${progress * C} ${C}`}
            transform="rotate(-90 110 110)"
          />
        </svg>
        <View className="absolute inset-0 items-center justify-center" accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: pct }}>
          <Text className="text-[24px] font-bold tracking-tight tabular-nums text-ink">{pct}%</Text>
        </View>
      </View>
      <Text className="mt-11 text-center text-[24px] font-bold leading-[34px] tracking-tight text-ink">{'내 답에 꼭 맞는\n첫 코그니를 찾고 있어요'}</Text>
      <Text className="mt-2.5 text-center text-[16px] text-text-4">답변 {ONBOARDING_QUESTIONS.length}개로 기록 습관 · 감정 패턴 · 성향을 읽는 중</Text>
      <ReviewMarquee />
    </Screen>
  );
}

/* ── 해 뜨는 화면 (13h1) ───────────────────────────────── */

const RISE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

function Sunrise({ displayName, onGo }: { displayName?: string; onGo: () => void }) {
  // 해가 다 뜨고 나면 '코그니 찾으러 가기' 버튼이 아래에서 올라온다. 나타나기 전에는 누를 수 없다.
  const [sunUp, setSunUp] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSunUp(true), SUNRISE_BUTTON_MS);
    return () => clearTimeout(t);
  }, []);
  return (
    <Screen
      statusFg="light"
      bg="#4A3A8C"
      background={<SunriseBackdrop />}
      footer={
        <View
          pointerEvents={sunUp ? 'auto' : 'none'}
          style={{
            opacity: sunUp ? 1 : 0,
            transform: `translateY(${sunUp ? 0 : 24}px)`,
            transition: `opacity 600ms ${RISE}, transform 600ms ${RISE}`,
          }}
        >
          <Button onPress={onGo} disabled={!sunUp}>
            코그니 찾으러 가기
          </Button>
        </View>
      }
    >
      <View className="items-center pt-[147px]">
        <Animate
          keyframes={[
            { opacity: 0, transform: 'translateY(90px) scale(0.85)' },
            { opacity: 1, transform: 'translateY(0) scale(1)' },
          ]}
          duration={1100}
          easing={RISE}
        >
          <Img src={IMG.sunrise} width={240} height={240} />
        </Animate>
        <Text className="mt-7 text-[24px] font-bold tracking-tight text-white">다 됐어요</Text>
        <Text className="mt-3 text-[16px] leading-[26px] text-white/92 text-center">{`이제 ${displayName ? `${displayName}님` : '내'} 안의 첫 코그니를\n찾아볼게요`}</Text>
      </View>
    </Screen>
  );
}

/* ── 화면 ──────────────────────────────────────────────── */

function OnboardingScreen() {
  const submitOnboarding = useSubmitOnboarding();
  const [phase, setPhase] = useState<Phase>('intro');
  const [slide, setSlide] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const me = useMe();
  const theme = useTheme();
  // 표시 이름: 가입 때 입력한 닉네임 → 서버 계정 이름(username) → 이메일 앞부분
  const token = useAuthStore((s) => s.accessToken);
  const { data: account } = useGetMyAccount(!!token && !me.nickname);
  const displayName = me.nickname || account?.user?.username || account?.user?.email?.split('@')[0];
  const scrollRef = useRef<HTMLDivElement>(null);

  const q = ONBOARDING_QUESTIONS[qIndex];
  const total = ONBOARDING_QUESTIONS.length;
  const isLast = qIndex === total - 1;

  const [submitted, setSubmitted] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 서버가 배정한 첫 코그니. 제출 응답이 분석 화면보다 늦을 수 있어 발견할 때 이 약속을 기다린다.
  const serverCogni = useRef<Promise<FoundCogni | undefined>>(undefined);

  // 진행 중인 제출. 끝나기 전에 다시 부르면 새로 보내지 않고 이걸 기다린다(겹쳐 보내면 뒤의 것이 400으로 실패한다).
  const pendingSubmit = useRef<Promise<boolean>>(undefined);
  const submit = () => {
    pendingSubmit.current ??= send().then((ok) => {
      if (!ok) pendingSubmit.current = undefined;
      return ok;
    });
    return pendingSubmit.current;
  };

  const send = async () => {
    const sentence = answers.my_one_sentence;
    if (typeof sentence === 'string' && sentence !== UNSURE && sentence.trim()) me.patch((u) => ({ ...u, mySentence: sentence.trim() }));
    const body = buildRequest(answers);
    try {
      const request = submitOnboarding.mutateAsync(body);
      serverCogni.current = request.then((r) => (r.first_cogni ? fromFirstCogni(r.first_cogni) : undefined)).catch(() => undefined);
      await request;
      setSubmitted(true);
      setSubmitError('');
      return true;
    } catch (err) {
      // 이미 제출된 계정(409)은 성공으로 본다. 그 외 실패는 마칠 때 한 번 더 시도한다.
      if (err instanceof ApiError && err.code === 'ONBOARDING_ALREADY_SUBMITTED') {
        setSubmitted(true);
        return true;
      }
      // 답에는 개인적인 내용이 들어 있어 로그에는 상태·코드만 남긴다.
      console.error(`[onboarding] 제출 실패: ${err instanceof ApiError ? `${err.status} ${err.code}` : 'network'}`);
      // 서버가 이유를 알려 주면(예: "1번 질문에 답해 주세요.") 상태·코드와 함께 보여 준다.
      // 서버 오류(5xx)·네트워크 오류도 배포 빌드에서 원인을 알 수 있게 상태·코드를 보여 준다.
      setSubmitError(
        err instanceof ApiError ? (err.status < 500 ? `${err.message} (${err.status} ${err.code})` : `${err.status} ${err.code}`) : 'network',
      );
      return false;
    }
  };

  // 첫 코그니: 서버 배정을 넉넉히 기다리고, 없으면 결과를 한 번 더 묻고, 그래도 없으면 답으로 임시 코그니를 고른다.
  const [found, setFound] = useState<FoundCogni>();
  const discovering = useRef(false);
  const discover = async () => {
    if (discovering.current) return;
    discovering.current = true;
    const within = <T,>(p: Promise<T> | undefined, ms: number) => Promise.race([p, new Promise<undefined>((resolve) => setTimeout(resolve, ms))]);
    const fromResult = () =>
      userApi
        .getOnboardingResult()
        .then((r) => (r.first_cogni ? fromFirstCogni(r.first_cogni) : undefined))
        .catch(() => undefined);
    const fromServer = await within(serverCogni.current, 20000);
    // 기다리는 사이 민감정보 처리 동의를 철회했으면 결과를 더 묻지도, 남기지도 않는다(화면은 동의 화면으로 바뀌어 있다).
    if (!hasSensitiveConsent()) return;
    const picked = fromServer ?? (await within(fromResult(), 5000));
    if (!hasSensitiveConsent()) return;
    // 서버가 첫 코그니를 주지 못했으면(제출 실패·지연) 예시 코그니를 지어내지 않고 첫 코그니 화면을 건너뛴다.
    // 환영 화면이 제출을 다시 시도하고, 배정된 코그니는 나중에 도감·홈에서 서버 값으로 보인다.
    // 그림 없는 몬스터가 배정됐으면(서버가 고치기 전에 배정된 계정) 기본 그림으로 보여 주지 않고 건너뛴다.
    if (!picked || !hasCogniImage(picked.cogni.image)) {
      setPhase('welcome');
      return;
    }
    me.addCogni({ ...picked.cogni, foundAt: new Date().toISOString() });
    setFound(picked);
    setPhase('result');
  };

  /* 인트로 */
  if (phase === 'intro') {
    return (
      <Intro
        slide={slide}
        onNext={() => (slide < INTRO.length - 1 ? setSlide(slide + 1) : setPhase('question'))}
        onBack={() => setSlide(Math.max(0, slide - 1))}
      />
    );
  }

  /* 질문 */
  if (phase === 'question') {
    const answer = answers[q.id];
    const setAnswer = (a: Answer) => setAnswers((prev) => ({ ...prev, [q.id]: a }));
    const go = (i: number) => {
      setQIndex(i);
      scrollRef.current?.scrollTo({ top: 0 });
    };
    const back = () => {
      if (qIndex === 0) {
        setPhase('intro');
        setSlide(INTRO.length - 1);
      } else go(qIndex - 1);
    };
    // 답 저장은 '코그니 찾으러 가기'를 눌러 분석을 시작할 때 보낸다.
    const next = () => (isLast ? setPhase('sunrise') : go(qIndex + 1));
    return (
      <Screen
        statusFg="light"
        bg="#110F30"
        background={<QuestionBackdrop index={qIndex} />}
        scroll={false}
        footer={
          <Button onPress={next} disabled={!isAnswered(q, answer)}>
            {isLast ? '답변 마치기' : '다음'}
          </Button>
        }
      >
        <ScrollView ref={scrollRef} className="flex-1 min-h-0" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <QuestionHeader index={qIndex} total={total} badge={q.badge} title={q.title} caption={'caption' in q ? q.caption : undefined} onBack={back} />
          <View key={q.id} className="px-6 pb-6">
            <QuestionBody q={q} answer={answer} setAnswer={setAnswer} />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  /* 질문을 다 마침 — 해가 뜬다 (13h1) */
  if (phase === 'sunrise') {
    return (
      <Sunrise
        displayName={displayName}
        onGo={() => {
          // 여기서 답을 저장하기 시작하고, 분석 화면이 도는 동안 서버(AI)가 첫 코그니를 정한다.
          void submit();
          setPhase('analyzing');
        }}
      />
    );
  }

  /* 분석 중 (13h2) */
  if (phase === 'analyzing') return <Analyzing onDone={discover} />;

  /* 첫 코그니 (13i) */
  if (phase === 'result' && found) {
    const { cogni, label } = found;
    return (
      <Screen bg="#FFFFFF" background={<SoftBackdrop base={theme.bg('#FFFFFF')} />} footer={<Button onPress={() => setPhase('welcome')}>여정 시작하기</Button>}>
        <View className="h-11 shrink-0 items-center justify-center">
          <Text className="text-[16px] font-semibold text-ink">첫 코그니</Text>
        </View>
        <View className="items-center px-8 pt-10">
          <View className="px-3.5 py-1.5 rounded-full bg-page">
            <Text className="tabular-nums text-[12px] font-semibold text-primary-pressed">No.01 첫 코그니</Text>
          </View>
          <Text className="mt-7 text-[20px] font-medium text-ink text-center">{displayName ? `${displayName}님` : '나'} 안에서 발견된 첫 코그니</Text>
          <Animate keyframes={ZOOM_IN} duration={240} className="mt-9 h-[220px] shrink-0">
            <CogniImg src={cogni.image} size={220} />
          </Animate>
          <View className="mt-9 flex-row items-center gap-2 px-4 py-2 rounded-full bg-page/80">
            <svg width={10} height={10} viewBox="0 0 24 24" aria-hidden>
              <path fill={theme.fg('#8A8A96')} d="M7 3.5v17l13-8.5L7 3.5Z" />
            </svg>
            <Text className="text-[12px] font-medium text-text-3">{label}</Text>
          </View>
          <Text className="mt-[18px] text-[24px] font-bold tracking-tight text-ink text-center">{cogni.name}</Text>
          <Text className="mt-3 text-[16px] leading-[26px] text-text-3 text-center">{cogni.features.slice(0, 2).join('\n')}</Text>
        </View>
      </Screen>
    );
  }

  /* 환영 (7d4) — 서버 제출이 끝까지 실패하면 다시 시도하거나, 저장 없이 시작할 수 있다. */
  const enter = () => {
    me.patch((u) => ({ ...u, onboardedAt: new Date().toISOString() }));
    router.replace('/main');
  };
  const finish = async () => {
    if (finishing) return;
    setFinishing(true);
    setFinishError(false);
    const ok = submitted || (await submit());
    if (!ok) {
      setFinishing(false);
      setFinishError(true);
      return;
    }
    // 제출이 늦거나 실패해 답으로 고른 임시 코그니를 보여 줬다면, 서버가 배정한 코그니로 바꿔 둔다.
    // 다시 보냈든 처음 제출이 늦게 끝났든 서버 결과가 있으면 맞추고, 없을 때만 임시 코그니를 그대로 둔다.
    if (found) {
      const server = await serverCogni.current;
      if (server && server.cogni.id !== found.cogni.id) {
        me.patch((u) => ({
          ...u,
          cognis: u.cognis.map((c) => (c.source === 'onboarding' && c.id === found.cogni.id ? { ...server.cogni, source: 'onboarding', foundAt: c.foundAt } : c)),
        }));
      }
    }
    enter();
  };
  return (
    <Screen
      contentClassName="flex-grow"
      footer={
        <View>
          <Button onPress={finish} loading={finishing}>
            {finishError ? '다시 시도하기' : '시작하기'}
          </Button>
          {/* 서버가 답을 받지 못해도(예: 서버에 새 질문이 아직 없어 400) 앱은 쓸 수 있게 한다. 답은 이 기기에 남는다. */}
          {finishError && !finishing && (
            <Pressable onPress={enter} accessibilityRole="button" className="h-11 mt-1 items-center justify-center">
              <Text className="text-[14px] font-semibold text-sub">저장하지 않고 시작하기</Text>
            </Pressable>
          )}
        </View>
      }
    >
      <View className="flex-1 items-center justify-center px-8 pb-10">
        <Animate keyframes={ZOOM_IN} duration={240}>
          <Img src={IMG.popper} width={72} height={96} />
        </Animate>
        <Text className="mt-6 text-[24px] font-bold tracking-tight text-ink">환영해요!</Text>
        <Text className="mt-3 text-[16px] leading-6 text-sub text-center">{`${displayName ? `${displayName}님, ` : ''}메타미에 오신 걸 환영해요\n오늘부터 한 문장씩 기록해 볼까요?`}</Text>
        {finishError && (
          <Text className="mt-4 text-[12px] leading-[20px] text-danger text-center">
            {`답변을 저장하지 못했어요. 다시 시도해 주세요.${submitError ? `\n(${submitError})` : ''}`}
          </Text>
        )}
      </View>
    </Screen>
  );
}

// timeLabel은 서버에 새 질문이 등록되면 '혼자 있는 시간' 답 문구를 만들 때 다시 쓴다.
void timeLabel;

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(OnboardingScreen);
