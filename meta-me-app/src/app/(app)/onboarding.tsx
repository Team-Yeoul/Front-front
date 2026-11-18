import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View, type GestureResponderEvent, type ScrollViewInstance } from 'react-native';
import { router } from 'expo-router';
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useGetMyAccount, useSubmitOnboarding, userApi, type OnboardingRequest } from '@/entities/user';
import { useAuthStore } from '@/store';
import { ApiError } from '@/shared/api';
import { useMe } from '@/hooks/useMe';
import { fromFirstCogni, pickOnboardingCogni, type FoundCogni } from '@/lib/onboardingCogni';
import { ONBOARDING_QUESTIONS, type OnboardingQuestion } from '@/lib/onboardingQuestions';
import { SensitiveGate } from '@/components/SensitiveGate';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, CheckBox, Dots, Img3D, OptionRow, TextButton } from '@/components/ui/primitives';
import { AnalyzingScreen, CogniHero, FeatureIcons } from '@/components/ui/flows';
import { Glow, blob, type GlowLayer } from '@/components/ui/Glow';
import { CheckIcon } from '@/components/ui/icons';
import { Text } from '@/components/ui/Text';

type Phase = 'intro' | 'question' | 'analyzing' | 'result' | 'outro';
type Answer = string | string[] | number | undefined;

/* ── 인트로 / 아웃트로 슬라이드 ─────────────────────────── */

/** 이 거리(px) 이상 가로로 밀어야 넘어간다. */
const SWIPE_MIN = 10;

type SwipeDir = 'next' | 'prev';
type SlideVariant = 'a' | 'b' | 'c';

const PURPLE = '160,164,255';
const LAVENDER = '200,202,255';
const YELLOW = '255,230,150';
const CREAM = '255,240,195';

const SLIDE_BG: Record<SlideVariant, GlowLayer[]> = {
  a: [blob(100, 48, 0, 0, PURPLE, 0.9, 0.5), blob(65, 42, 100, 22, YELLOW, 0.85, 0.5), blob(90, 52, 75, 75, LAVENDER, 0.9)],
  b: [blob(100, 62, 60, 0, YELLOW, 0.9), blob(100, 50, 0, 90, PURPLE, 0.8), blob(80, 82, 90, 66, LAVENDER, 0.8)],
  c: [blob(80, 62, 15, 20, YELLOW, 0.9), blob(80, 50, 100, 32, PURPLE, 0.9), blob(50, 30, 25, 70, CREAM, 0.75), blob(75, 32, 100, 90, LAVENDER, 2)],
};
const VARIANTS = Object.keys(SLIDE_BG) as SlideVariant[];

/** 배경 한 겹. 지금 장의 배경만 서서히 나타나고 나머지는 사라진다. */
function BackdropLayer({ layers, visible }: { layers: GlowLayer[]; visible: boolean }) {
  const opacity = useSharedValue(visible ? 1 : 0);
  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 500, easing: Easing.out(Easing.ease), reduceMotion: ReduceMotion.System });
  }, [visible, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Glow layers={layers} />
    </Animated.View>
  );
}

function SlideBackdrop({ variant }: { variant: SlideVariant }) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FCFCFF' }]} pointerEvents="none">
      {VARIANTS.map((v) => (
        <BackdropLayer key={v} layers={SLIDE_BG[v]} visible={v === variant} />
      ))}
    </View>
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
  const start = useRef<{ x: number; y: number } | null>(null);
  const tx = useSharedValue(0);
  const opacity = useSharedValue(1);

  const slideIndex = dots?.[0];
  useEffect(() => {
    if (!enterFrom) return;
    // 장이 바뀔 때마다(dots 변경) 들어오는 애니메이션을 다시 건다. 배경이 이어지도록 Slide 자체는 다시 마운트하지 않는다.
    const config = { duration: 280, easing: Easing.bezier(0.2, 0.8, 0.2, 1), reduceMotion: ReduceMotion.System };
    tx.value = enterFrom === 'next' ? 40 : -40;
    opacity.value = 0;
    tx.value = withTiming(0, config);
    opacity.value = withTiming(1, config);
  }, [enterFrom, slideIndex, tx, opacity]);
  const contentStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateX: tx.value }] }));

  const onTouchStart = (e: GestureResponderEvent) => {
    start.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
  };
  const onTouchEnd = (e: GestureResponderEvent) => {
    if (!start.current || !swipe) return;
    const dx = e.nativeEvent.pageX - start.current.x;
    const dy = e.nativeEvent.pageY - start.current.y;
    start.current = null;
    // 세로로 민 것이나 짧은 터치는 무시하고, 가로로 충분히 밀었을 때만 넘긴다.
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) swipe.next?.();
    else swipe.prev?.();
  };

  // 버튼(cta)도 스와이프도 없는 장은 화면 아무 곳이나 탭하면 넘어간다.
  const tapToNext = !cta && !swipe;

  return (
    <Screen bg="#FCFCFF" background={<SlideBackdrop variant={variant} />} scroll={false}>
      <Pressable
        className="flex-1"
        onPress={tapToNext ? onNext : undefined}
        disabled={!tapToNext}
        accessible={false}
        onTouchStart={swipe ? onTouchStart : undefined}
        onTouchEnd={swipe ? onTouchEnd : undefined}
        onTouchCancel={() => (start.current = null)}
      >
        <View className="h-10 flex-row items-center justify-end px-6">
          {onSkip && (
            <Pressable onPress={onSkip} accessibilityRole="button" hitSlop={10}>
              <Text className="text-[13px] text-[#48484F]">넘어가기</Text>
            </Pressable>
          )}
        </View>
        {align === 'left' ? (
          // 장마다 본문 길이·하단 버튼이 달라도 제목 첫 줄이 항상 같은 높이에 오도록, 화면 전체 높이 기준으로 위치를 고정한다.
          <>
            <View className="flex-1" />
            <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: '38%' }, contentStyle]} className="px-8">
              {!!eyebrow && (
                <Text
                  className="font-mono text-[12px] tracking-[2.4px] text-[#5A5A62]"
                  style={{ position: 'absolute', left: 32, bottom: '100%', marginBottom: 24 }}
                >
                  {eyebrow}
                </Text>
              )}
              {children}
            </Animated.View>
          </>
        ) : (
          <Animated.View style={contentStyle} className="flex-1 justify-center px-10 items-center">
            {children}
          </Animated.View>
        )}
        <View className="items-center gap-5 pb-8 px-5">
          {!!hint && (
            <Text className="text-[13px] text-[#48484F]">
              {hint}
              {hint.startsWith('옆으로') && '  →'}
            </Text>
          )}
          {dots && <Dots count={dots[1]} index={dots[0]} variant="bar" />}
          {cta && (
            <Button variant="dark" onPress={onNext}>
              {cta}
            </Button>
          )}
        </View>
      </Pressable>
    </Screen>
  );
}

const slideTitle = 'text-[30px] font-semibold text-ink leading-[45px] tracking-[-0.6px]';

/** 슬라이드 제목 아래 작은 알약 라벨. */
function Pill({ children, yellow = false }: { children: string; yellow?: boolean }) {
  return (
    <View className={`self-start mt-6 h-8 px-4 rounded-full justify-center ${yellow ? 'bg-yellow' : 'bg-white'}`}>
      <Text className={`text-[13px] font-semibold ${yellow ? 'text-ink' : 'text-primary'}`}>{children}</Text>
    </View>
  );
}

/* ── 질문 본문 ─────────────────────────────────────────── */

function QuestionBody({
  q,
  answer,
  setAnswer,
  onInputFocus,
}: {
  q: OnboardingQuestion;
  answer: Answer;
  setAnswer: (a: Answer) => void;
  /** 입력 칸이 키보드에 가리지 않게 스크롤을 내린다. */
  onInputFocus: () => void;
}) {
  switch (q.kind) {
    case 'sentence': {
      // '잘 모르겠습니다.'로 넘긴 질문(__later__)에 돌아오면 빈 칸으로 다시 쓸 수 있다.
      const text = typeof answer === 'string' && answer !== '__later__' ? answer : '';
      return (
        <View className="rounded-2xl px-4 py-3.5 border-[1.5px] bg-primary-soft/60 border-primary">
          <Text className="text-[12px] font-semibold text-primary">내 문장</Text>
          <TextInput
            value={text}
            maxLength={80}
            multiline
            onChangeText={setAnswer}
            onFocus={onInputFocus}
            placeholder="계획은 잘 세우는데, 시작 앞에서 오래 머무는 사람."
            placeholderTextColor="#B4B4BB"
            selectionColor="#6367FF"
            className="mt-1.5 min-h-[52px] text-[16px] text-ink"
            style={{ fontFamily: 'Pretendard-SemiBold', textAlignVertical: 'top' }}
          />
          <View className="flex-row items-center justify-between gap-2">
            <Text className="flex-1 text-[12px] text-danger">
              {tooShortSentence(q, text) ? `공백을 빼고 ${MIN_SENTENCE_LENGTH}자 이상 써 주세요` : ''}
            </Text>
            <Text className="font-mono text-[12px] text-mute">{text.length} / 80</Text>
          </View>
        </View>
      );
    }
    case 'scale': {
      const idx = typeof answer === 'number' ? answer : 2;
      const picked = q.options[idx];
      return (
        <View className="gap-4">
          <View className="rounded-3xl bg-surface p-5">
            <View className="flex-row justify-between items-center px-1">
              {q.options.map((o, i) => (
                <Pressable
                  key={o.label}
                  onPress={() => setAnswer(i)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: i === idx }}
                  accessibilityLabel={o.label}
                  hitSlop={6}
                  className="w-9 h-9 items-center justify-center"
                >
                  {i === idx ? (
                    <View className="w-10 h-10 rounded-full bg-primary-line/60 items-center justify-center">
                      <View className="w-7 h-7 rounded-full bg-primary" />
                    </View>
                  ) : (
                    <View className="w-4 h-4 rounded-full border-[1.5px] border-[#B4B4BB]" />
                  )}
                </Pressable>
              ))}
            </View>
            <View className="mx-3 mt-4 h-1 rounded-full bg-[#E1E1E8]">
              <View className="h-full rounded-full bg-primary" style={{ width: `${(idx / (q.options.length - 1)) * 100}%` }} />
            </View>
            <View className="flex-row gap-1 mt-4">
              {q.options.map((o, i) => (
                <Pressable key={o.label} onPress={() => setAnswer(i)} className="flex-1" accessible={false}>
                  <Text className={`text-[11px] leading-[16px] text-center ${i === idx ? 'font-bold text-primary' : 'text-sub'}`}>{o.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View className="rounded-3xl border border-line px-5 py-4">
            <Text className="text-[12px] font-semibold text-primary">지금 고른 답</Text>
            <Text className="text-[18px] font-bold text-ink mt-1.5">{picked.label}</Text>
            <Text className="text-[13px] text-sub mt-1.5 leading-[21px]">{picked.description}</Text>
          </View>
        </View>
      );
    }
    case 'multi': {
      const list = Array.isArray(answer) ? answer : [];
      const toggle = (o: string) => {
        if (list.includes(o)) setAnswer(list.filter((x) => x !== o));
        else if (!q.max || list.length < q.max) setAnswer([...list, o]);
      };
      // 직접 적은 답은 선택지에 없는 항목 하나로 같은 목록에 넣는다. 비우면 목록에서 뺀다.
      const custom = list.find((x) => !q.options.includes(x)) ?? '';
      const setCustom = (text: string) => {
        const rest = list.filter((x) => q.options.includes(x));
        setAnswer(text ? [...rest, text] : rest);
      };
      return (
        <View className="gap-2.5">
          {q.options.map((o) =>
            q.soft ? (
              <Pressable
                key={o}
                onPress={() => toggle(o)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: list.includes(o) }}
                className={`flex-row items-center gap-3 rounded-2xl px-4 h-14 ${list.includes(o) ? 'bg-primary-soft' : 'bg-surface'}`}
              >
                <CheckBox checked={list.includes(o)} />
                <Text className="text-[15px] text-[#48484F]">{o}</Text>
              </Pressable>
            ) : (
              <OptionRow key={o} label={o} selected={list.includes(o)} onPress={() => toggle(o)} />
            ),
          )}
          {q.custom && (
            <TextInput
              value={custom}
              maxLength={40}
              onChangeText={setCustom}
              onFocus={onInputFocus}
              placeholder={q.custom}
              placeholderTextColor="#8E8E95"
              selectionColor="#6367FF"
              className={`rounded-2xl px-4 h-14 bg-surface border text-[15px] text-ink ${custom ? 'border-primary' : 'border-transparent'}`}
              style={{ fontFamily: custom ? 'Pretendard-SemiBold' : 'Pretendard-Regular' }}
            />
          )}
        </View>
      );
    }
    case 'list':
      return (
        <View className="gap-2.5">
          {q.options.map((o) => (
            <OptionRow key={o.label} label={o.label} description={o.description} selected={answer === o.label} onPress={() => setAnswer(o.label)} round />
          ))}
        </View>
      );
    case 'cards':
      return (
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {q.options.map((o, i) => {
            const selected = answer === o.label;
            const solid = q.accent === 'solid';
            const filled = selected && solid;
            return (
              <Pressable
                key={o.label}
                onPress={() => setAnswer(o.label)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                style={{ width: '48.3%' }}
                className={`rounded-3xl p-4 min-h-[150px] border-[1.5px] ${
                  selected ? (solid ? 'bg-primary border-primary' : 'bg-primary-soft border-primary') : 'bg-surface border-transparent'
                }`}
              >
                {q.glyphs && (
                  <View className={`w-8 h-8 rounded-lg items-center justify-center ${filled ? 'bg-yellow' : 'bg-white'}`}>
                    {filled ? (
                      <CheckIcon size={14} color="#1A1A1E" />
                    ) : (
                      <Text className="text-[14px] font-semibold text-primary">{q.glyphs[i] === '✓' ? '◡' : q.glyphs[i]}</Text>
                    )}
                  </View>
                )}
                {q.glyphs && <View className="flex-1 min-h-6" />}
                <Text className={`text-[16px] font-bold leading-[22px] ${filled ? 'text-white' : 'text-ink'}`}>{o.label}</Text>
                {!!o.description && (
                  <Text className={`text-[13px] mt-1.5 leading-[20px] ${filled ? 'text-white/85' : 'text-sub'}`}>{o.description}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      );
  }
}

/** 서버는 한 문장(my_one_sentence)을 공백을 뺀 10자 이상만 받는다. 나머지 소개 문장은 1자 이상이면 된다. */
const MIN_SENTENCE_LENGTH = 10;
const tooShortSentence = (q: OnboardingQuestion, text: string) =>
  q.id === 'my_one_sentence' && text.trim().length > 0 && text.replace(/\s/g, '').length < MIN_SENTENCE_LENGTH;

function isAnswered(q: OnboardingQuestion, a: Answer) {
  // 한 문장이 10자보다 짧으면 막는다. 쓰기 어렵다면 '잘 모르겠습니다.'로 넘길 수 있다.
  if (q.kind === 'sentence') return typeof a === 'string' && a.trim().length > 0 && !tooShortSentence(q, a);
  if (q.kind === 'multi') return Array.isArray(a) && a.some((x) => x.trim().length > 0);
  if (q.kind === 'scale') return true;
  return typeof a === 'string' && a.length > 0;
}

/** 서버 answers로 보낼 질문별 원래 답. 척도는 순번 대신 고른 문구로 보낸다. sentenceOnly면 소개 문장 답만 고른다. */
const rawAnswers = (answers: Record<string, Answer>, sentenceOnly = false) => {
  const out: Record<string, string | string[] | number> = {};
  for (const q of ONBOARDING_QUESTIONS) {
    if (sentenceOnly && q.kind !== 'sentence') continue;
    const a = answers[q.id];
    if (a === undefined || a === '' || a === '__later__') continue;
    out[q.id] = q.kind === 'scale' && typeof a === 'number' ? q.options[a].label : a;
  }
  return out;
};

/**
 * 서버 answers(밸런스 게임). 설문 8개를 화면 순서대로 "1"~"8" 키로 보낸다. 서버는 8개 모두 답해야 받는다.
 * 척도는 순번 대신 고른 문구로, 여러 개 고르는 질문은 비어 있지 않은 항목만 보낸다.
 */
const balanceAnswers = (answers: Record<string, Answer>) => {
  const out: Record<string, string | string[]> = {};
  ONBOARDING_QUESTIONS.filter((q) => q.kind !== 'sentence').forEach((q, i) => {
    const a = answers[q.id];
    if (q.kind === 'scale' && typeof a === 'number') out[i + 1] = q.options[a].label;
    else if (Array.isArray(a)) out[i + 1] = a.map((x) => x.trim()).filter(Boolean);
    else if (typeof a === 'string') out[i + 1] = a;
  });
  return out;
};

const labelOf = (a: Answer, q?: OnboardingQuestion) => {
  if (Array.isArray(a)) return a.join(', ');
  if (typeof a === 'number' && q?.kind === 'scale') return q.options[a].label;
  if (typeof a === 'string' && a !== '__later__') return a;
  return '';
};

/* ── 화면 ──────────────────────────────────────────────── */

export default function OnboardingRoute() {
  return (
    <SensitiveGate>
      <OnboardingScreen />
    </SensitiveGate>
  );
}

function OnboardingScreen() {
  const submitOnboarding = useSubmitOnboarding();
  const [phase, setPhase] = useState<Phase>('intro');
  const [slide, setSlide] = useState(0);
  const [slideDir, setSlideDir] = useState<SwipeDir>();
  const [qIndex, setQIndex] = useState(0);
  // 척도 질문은 화면이 가운데 값(2)을 선택된 것처럼 그리므로, 건드리지 않고 넘어가도 보이는 값이 저장되게 미리 채운다.
  const [answers, setAnswers] = useState<Record<string, Answer>>(() =>
    Object.fromEntries(ONBOARDING_QUESTIONS.filter((x) => x.kind === 'scale').map((x) => [x.id, 2])),
  );
  // 소개 문장 중 '잘 모르겠습니다.'를 누른 질문. 설문 첫 장에서 뒤로 가면 여기로 돌아간다.
  const [skippedFrom, setSkippedFrom] = useState<number>();
  const [accuracy, setAccuracy] = useState(12);
  const me = useMe();
  // 표시 이름: 가입 때 입력한 닉네임 → 서버 계정 이름(username) → 이메일 앞부분
  const token = useAuthStore((s) => s.accessToken);
  const { data: account } = useGetMyAccount(!!token && !me.nickname);
  const displayName = me.nickname || account?.user.username || account?.user.email?.split('@')[0];
  const scrollRef = useRef<ScrollViewInstance>(null);

  const q = ONBOARDING_QUESTIONS[qIndex];
  const total = ONBOARDING_QUESTIONS.length;
  const isLast = qIndex === total - 1;
  const isSentence = q.kind === 'sentence';
  // 진행 표시는 묶음(소개 문장 / 설문)마다 따로 센다.
  const section = ONBOARDING_QUESTIONS.filter((x) => (x.kind === 'sentence') === isSentence);
  const sectionIndex = section.indexOf(q);
  // 설문의 첫 질문 위치. 소개 문장은 모두 이보다 앞에 있다.
  const surveyStart = ONBOARDING_QUESTIONS.findIndex((x) => x.kind !== 'sentence');

  const [submitted, setSubmitted] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState(false);

  // 서버가 배정한 첫 코그니. 제출 응답이 분석 화면보다 늦을 수 있어 발견할 때 이 약속을 기다린다.
  const serverCogni = useRef<Promise<FoundCogni | undefined>>(undefined);

  // 진행 중인 제출. 분석 화면에서 보낸 제출이 끝나기 전에 '여정 시작하기'를 누르면 새로 보내지 않고 이걸 기다린다.
  // 겹쳐 보내면 서버가 둘 다 저장하려다 뒤의 것이 400(INVALID_REQUEST)으로 실패해, 저장됐는데도 실패로 보인다.
  const pendingSubmit = useRef<Promise<boolean>>(undefined);
  const submit = () => {
    pendingSubmit.current ??= send().then((ok) => {
      // 실패하면 다음에 다시 보낼 수 있게 비운다.
      if (!ok) pendingSubmit.current = undefined;
      return ok;
    });
    return pendingSubmit.current;
  };
  const send = async () => {
    const byId = (id: string) => labelOf(answers[id], ONBOARDING_QUESTIONS.find((x) => x.id === id)) || '아직 모르겠어요';
    const sentence = labelOf(answers.my_one_sentence);
    if (sentence) me.patch((u) => ({ ...u, mySentence: sentence }));
    let body: OnboardingRequest | undefined;
    try {
      // 소개 질문 4개는 API 필드와 id가 같아 그대로 보내고, 설문을 거쳤을 때만 설문 답을 answers로 함께 보낸다.
      // 소개 문장만으로 끝낸 경우(마지막 화면이 소개 문장)엔 미리 채운 척도 값 등이 섞이지 않게 answers를 보내지 않는다.
      body = {
        // 한 문장은 선택 항목이다. 직접 썼다면 질문 화면에서 공백을 뺀 10자 이상만 통과시킨다.
        ...(sentence && { my_one_sentence: sentence }),
        self_strength: byId('self_strength'),
        others_feedback: byId('others_feedback'),
        favorite_thing: byId('favorite_thing'),
        ...(!isSentence && { answers: balanceAnswers(answers) }),
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
      // 원인을 재현하기 어려운 실패(예: 400 검증 실패)를 Metro 로그에서 바로 확인할 수 있게 서버 응답과 보낸 내용을 남긴다.
      else
        console.error(
          '[onboarding] 제출 실패',
          err instanceof ApiError ? { status: err.status, code: err.code, message: err.message } : err,
          body,
        );
      return already;
    }
  };

  // 첫 코그니를 도감(기기 저장)에 넣는다. 메인 캐릭터도 이걸 쓴다.
  // 서버가 배정한 코그니를 쓴다. 홈·도감은 서버 first_cogni를 보여주므로, 여기서 임시 코그니를 고르면 서로 달라진다.
  // 그래서 AI 배정이 끝날 때까지 넉넉히 기다리고, 제출 응답에 없으면(이미 제출된 계정 등) 서버 결과를 한 번 더 묻는다.
  // 그래도 없을 때만 답으로 임시 코그니를 고른다.
  const [found, setFound] = useState<FoundCogni>();
  // 분석 화면은 끝날 때와 닫을 때 모두 부르므로, 서버 응답을 기다리는 사이 두 번 들어오지 않게 막는다.
  const discovering = useRef(false);
  const discover = async () => {
    if (discovering.current) return;
    discovering.current = true;
    const within = <T,>(p: Promise<T> | undefined, ms: number) =>
      Promise.race([p, new Promise<undefined>((resolve) => setTimeout(resolve, ms))]);
    const fromResult = () =>
      userApi
        .getOnboardingResult()
        .then((r) => (r.first_cogni ? fromFirstCogni(r.first_cogni) : undefined))
        .catch(() => undefined);
    const picked = (await within(serverCogni.current, 20000)) ?? (await within(fromResult(), 5000)) ?? pickOnboardingCogni(answers);
    me.addCogni({ ...picked.cogni, foundAt: new Date().toISOString() });
    setFound(picked);
    setPhase('result');
  };

  // 소개 문장을 끝까지 쓰면 설문 없이 바로 분석으로 넘어간다. 설문은 '잘 모르겠습니다.'를 누른 경우에만 거친다.
  const next = () => {
    if (!isLast && qIndex !== surveyStart - 1) {
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
          <Text className={slideTitle}>{'안녕하세요.\n처음부터 무거운 질문은\n하지 않을게요.'}</Text>
        </Slide>
      );
    if (slide === 1)
      return (
        <Slide variant="b" dots={[1, 3]} hint="옆으로 밀어서 계속" onNext={go} onSkip={skip} swipe={swipe} enterFrom={slideDir}>
          <Text className={slideTitle}>{'앞으로 당신을 더 잘 이해해서\n도와드릴 수 있도록,\n가볍게 3가지만 골라주세요.'}</Text>
          <Pill>{`약 1분 · 문장 ${surveyStart}개`}</Pill>
        </Slide>
      );
    return (
      <Slide variant="c" dots={[2, 3]} onNext={go} onSkip={skip} cta="첫 질문 보기" swipe={swipe} enterFrom={slideDir}>
        <Text className={slideTitle}>{'잘 모르겠으면\n“아직 모르겠어요”를\n골라도 괜찮아요.'}</Text>
        <Pill yellow>아직 모르겠어요</Pill>
      </Slide>
    );
  }

  /* 질문 */
  if (phase === 'question') {
    const answer = answers[q.id];
    const setAnswer = (a: Answer) => setAnswers((prev) => ({ ...prev, [q.id]: a }));
    // 첫 질문에서 뒤로 가면 인트로 마지막 장('첫 질문 보기')으로, 설문 첫 장에서는 건너뛴 소개 문장으로 돌아간다.
    const back = () => {
      if (qIndex === 0) {
        setSlideDir(undefined);
        setPhase('intro');
        setSlide(2);
      } else setQIndex(qIndex === surveyStart ? (skippedFrom ?? qIndex - 1) : qIndex - 1);
    };
    // 소개 문장을 모르겠다고 하면 남은 소개 문장 대신 설문으로 넘어간다.
    const skipToSurvey = () => {
      setAnswer('__later__');
      setSkippedFrom(qIndex);
      setQIndex(surveyStart);
    };
    // 키보드가 올라오면 화면이 줄어드므로, 입력 칸이 보이도록 맨 아래로 내린다.
    const onInputFocus = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250);
    return (
      <Screen
        scroll={false}
        footer={
          isLast ? (
            <Button onPress={next} disabled={!isAnswered(q, answer)}>
              답변 마치기
            </Button>
          ) : (
            <View className="items-center gap-1">
              <Button onPress={next} disabled={!isAnswered(q, answer)}>
                {`다음 (${sectionIndex + 1}/${section.length})`}
              </Button>
              {/* 설문은 서버가 8개 모두 답해야 받으므로 넘기기 버튼을 두지 않는다. */}
              {isSentence && (
                <TextButton onPress={skipToSurvey} textClassName="text-[15px] font-medium">
                  잘 모르겠습니다.
                </TextButton>
              )}
            </View>
          )
        }
      >
        <View className="flex-1 px-5">
          <View className="flex-row items-center justify-between h-14">
            <BackButton onPress={back} />
            <Text className="font-mono text-[13px] text-mute">
              {sectionIndex + 1} / {section.length}
            </Text>
          </View>
          <View className="flex-row items-center gap-2 mt-2 pl-[15px]">
            {section.map((x, i) => (
              <View key={x.id} className={`rounded-full ${i === sectionIndex ? 'w-2 h-2 bg-primary' : 'w-1.5 h-1.5 bg-[#D4D4DC]'}`} />
            ))}
          </View>
          {/* 질문이 바뀌면 key로 스크롤을 맨 위로 되돌린다. 작은 화면·키보드가 올라온 상태에서도 모두 보이도록 전체를 스크롤한다. */}
          <ScrollView
            key={q.id}
            ref={scrollRef}
            className="flex-1 -mx-1"
            contentContainerClassName="px-1 pt-px pb-4"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          >
            <View className={`items-center ${isSentence ? 'mt-20 mb-12' : 'mt-[120px] mb-12'}`}>
              <Img3D name={q.icon} size={100} />
            </View>
            <View className="mt-2">
              <Text className="text-[20px] font-bold text-ink leading-[30px]">{q.title}</Text>
              {'caption' in q && !!q.caption && <Text className="text-[13px] text-sub mt-1.5">{q.caption}</Text>}
            </View>
            <View className="mt-4">
              <QuestionBody q={q} answer={answer} setAnswer={setAnswer} onInputFocus={onInputFocus} />
            </View>
          </ScrollView>
        </View>
      </Screen>
    );
  }

  /* 분석 중 */
  if (phase === 'analyzing') {
    return (
      <AnalyzingScreen
        title={'내 답에 꼭 맞는\n첫 코그니를 찾고 있어요'}
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
        // 한 단어 이름이면 빈 줄이 생기지 않게 줄바꿈을 넣지 않는다.
        name={rest.length ? `${adjective}\n${rest.join(' ')}` : adjective}
        imageSrc={cogni.image}
        category={label}
        features={cogni.features.map((text, i) => ({ icon: icons[i % icons.length], text }))}
        counterLabel={`온보딩 답 ${Object.keys(rawAnswers(answers, isSentence)).length}개에서 발견`}
        counter="01 / 24"
        primaryLabel="여정 시작하기"
        onPrimary={() => {
          setSlideDir(undefined);
          setSlide(0);
          setPhase('outro');
        }}
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
    router.replace('/main');
  };
  if (slide === 0)
    return (
      <Slide variant="a" dots={[0, 3]} hint="화면을 탭해서 계속" align="center" onNext={() => setSlide(1)}>
        <Text className="text-[22px] font-bold text-ink leading-[36px] text-center">
          {'그 문장은 오늘부터 바뀝니다.\n당신을 더 잘 이해할 수 있도록 도와줄게요'}
        </Text>
      </Slide>
    );
  if (slide === 1)
    return (
      <Slide variant="b" dots={[1, 3]} hint="화면을 탭해서 계속" align="center" onNext={() => setSlide(2)} onSkip={finish}>
        <Text className="text-[36px] font-bold text-ink tracking-tight">Day 0</Text>
        <Text className="text-[15px] text-[#48484F] mt-3">당신이 스스로 쓴 첫 문장이 저장됐어요</Text>
      </Slide>
    );
  return (
    <Slide variant="c" align="center" onNext={finish} onSkip={finish}>
      <Text className="font-mono text-[12px] tracking-[3px] text-[#5A5A62]">YOUR JOURNEY BEGINS</Text>
      <Text className="text-[52px] font-bold text-ink tracking-tight mt-2">Day 1</Text>
      <Text className="text-[16px] text-ink leading-[27px] mt-2 text-center">{'오늘부터 쌓이는 기록이\n당신의 한 문장을 정확하게 만듭니다'}</Text>
      {submitted && (
        <View className="mt-6 h-9 px-4 rounded-full bg-white justify-center">
          <Text className="text-[13px] font-semibold text-primary">정확도 {accuracy}%에서 출발합니다</Text>
        </View>
      )}
      {finishing && <Text className="mt-4 text-[13px] text-sub">저장하는 중...</Text>}
      {finishError && !finishing && (
        <Text className="mt-4 text-[13px] text-danger text-center">{'답변을 저장하지 못했어요.\n화면을 탭해서 다시 시도해 주세요.'}</Text>
      )}
    </Slide>
  );
}
