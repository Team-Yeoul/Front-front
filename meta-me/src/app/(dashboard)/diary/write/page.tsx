'use client';

import { Suspense, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { StatusView } from '@/components/ui/states';
import { useGetDailyRecord, useGetTodayDailyQuestion, useUpdateDailyRecord } from '@/entities/diary';
import { TodayRecordExistsError, useSaveTodayRecord, useTodayRecord } from '@/hooks/useSaveTodayRecord';
import { TodayRecordExists } from '@/components/ui/TodayRecordExists';
import { useCreateObjectiveMirror, useRecordLatestMirror } from '@/entities/objective';
import { useAuthStore } from '@/store';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Spinner, TopBar } from '@/components/ui/primitives';
import { Img, LinearGradient, Pressable, TextInput, View, absoluteFill, asset } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';
import { MirrorAnalyzing } from '@/components/diary/MirrorAnalyzing';
import { beginLastWrite, saveLastWrite, type LastWrite } from '@/lib/lastWrite';
import { DEFAULT_MOOD, MOODS, getMood, saveMood, themedMood, type Mood } from '@/lib/mood';
import { router } from '@/lib/router';
import { useTheme } from '@/lib/theme';
import { useTextCheck } from '@/lib/textQuality';
import { useMe } from '@/hooks/useMe';
import { ConsentRequired, withSensitiveGate } from '@/components/SensitiveGate';
import { hasSensitiveConsent, isConsentRequiredError } from '@/hooks/useSensitiveConsent';
import { MAX_TEXT_LENGTH } from '@/lib/textLimits';

const QUESTION_TYPE_LABEL: Record<string, string> = {
  TIME_CONTEXT: '시간 맥락',
  GROWTH_CONTEXT: '성장 맥락',
  DISCOVERY_CONTEXT: '발견 맥락',
};
const FALLBACK_QUESTION = '오늘 하루는 어떤 장면으로 남았나요?';
const SCENE_TAGS = ['공부', '일', '관계', '휴식', '이동 중', '혼자 있는 시간'];
const EMOTIONS = ['답답함', '오기', '뿌듯함', '불안', '지루함', '편안함'];
const TOTAL = 4;
// 명세상 최대 길이 (SubmitDailyRecordRequest)
const MAX_ANSWER = 2000;
const MAX_SCENE = 1000;

const ICON_PATH = {
  // 성장 맥락(오르는 선) · 발견 맥락(돋보기) · 시간 맥락(시계)
  GROWTH_CONTEXT: 'M4 16l5-5 4 4 7-7M15 8h5v5',
  DISCOVERY_CONTEXT: 'M11 5a6 6 0 1 0 0 12a6 6 0 0 0 0-12ZM16 16l3.5 3.5',
  TIME_CONTEXT: 'M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16ZM12 8v4l2.5 2',
} as const;

/** 기분 그림. 앱 MOODS[i].image(require)는 웹에서 쓸 수 없어 같은 파일을 경로로 연다. */
const moodImage = (i: number) => asset(`diary/mood-${i + 1}.png`);

const inputProps = (m: Mood, placeholder: string) =>
  ({
    placeholderTextColor: placeholder,
    selectionColor: m.accent,
    cursorColor: m.accent,
    multiline: true,
  }) as const;

const CheckMark = ({ color, size = 14 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
    <path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const H1 = ({ children }: { children: string }) => (
  <Text accessibilityRole="header" className="mt-3 text-[24px] font-bold leading-[34px] tracking-[-0.24px] text-ink">
    {children}
  </Text>
);

/** 질문 위 작은 꼬리표 (성장 맥락 · 오늘의 한 장면 · 감정 스냅샷 …) */
function Tag({ mood, children, icon }: { mood: Mood; children: string; icon?: string }) {
  return (
    <View className="self-start flex-row items-center gap-1.5 rounded-full bg-page/60 px-2.5 py-[5px]">
      {icon && (
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d={icon} stroke={mood.sub} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <Text className="text-[12px] font-bold" style={{ color: mood.sub }}>
        {children}
      </Text>
    </View>
  );
}

/** 텍스트 | 태그 전환 */
function ModeSwitch({ mood, value, onChange }: { mood: Mood; value: 'text' | 'tag'; onChange: (v: 'text' | 'tag') => void }) {
  return (
    <View className="flex-row p-1 rounded-xl" style={{ backgroundColor: mood.card }} accessibilityRole="tablist">
      {(['text', 'tag'] as const).map((v) => {
        const on = value === v;
        return (
          <Pressable
            key={v}
            onPress={() => onChange(v)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            className={`flex-1 h-9 rounded-[10px] items-center justify-center ${on ? 'bg-page' : ''}`}
            style={on ? { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } : undefined}
          >
            <Text className={`text-[14px] ${on ? 'font-bold text-ink' : 'font-medium text-sub'}`}>{v === 'text' ? '텍스트' : '태그'}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** 고를 수 있는 알약. 고르면 기분 색으로 채워지고 체크가 붙는다. */
function Pill({ mood, label, on, onPress }: { mood: Mood; label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      className={`h-[37px] shrink-0 px-3.5 rounded-full flex-row items-center gap-1 ${on ? '' : 'bg-page'}`}
      style={on ? { backgroundColor: mood.accent } : undefined}
    >
      {on && <CheckMark color={mood.onAccent} />}
      <Text className={`text-[14px] ${on ? 'font-bold' : 'text-text-2'}`} style={on ? { color: mood.onAccent } : undefined}>
        {label}
      </Text>
    </Pressable>
  );
}

/** 입력칸 아래 줄: 왼쪽엔 이상한 답 안내, 오른쪽엔 글자 수 */
function CountRow({ hint, count }: { hint: string | null; count: number }) {
  return (
    <View className="flex-row items-center justify-between gap-2 shrink-0">
      <Text className="text-[12px] text-danger">{hint}</Text>
      <Text className="text-[12px] text-mute tabular-nums">{count}자</Text>
    </View>
  );
}

/** 0단계 기분 슬라이더: 막대를 누르거나 끌어서 다섯 칸 중 하나를 고른다. 화살표 키로도 바꾼다. */
function MoodSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const last = MOODS.length - 1;
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pick = (clientX: number) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    onChange(Math.round(Math.max(0, Math.min(1, (clientX - box.left - 24) / (box.width - 48))) * last));
  };
  return (
    <View
      ref={ref}
      tabIndex={0}
      accessibilityRole="adjustable"
      accessibilityLabel="오늘의 기분"
      accessibilityValue={{ min: 0, max: last, now: value, text: MOODS[value].label }}
      onKeyDown={(e) => {
        const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        onChange(Math.max(0, Math.min(last, value + d)));
      }}
      onPointerDown={(e: PointerEvent<HTMLDivElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        pick(e.clientX);
      }}
      onPointerMove={(e: PointerEvent<HTMLDivElement>) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) pick(e.clientX);
      }}
      className="h-12 shrink-0 rounded-full bg-[#28283C]/8 dark:bg-white/12 touch-none select-none outline-none"
    >
      {w > 0 && (
        <View
          className="absolute top-1.5 w-9 h-9 rounded-full bg-white"
          style={{ left: 24 + (w - 48) * (value / last) - 18, boxShadow: '0 2px 8px rgba(30,30,60,0.18)' }}
        />
      )}
    </View>
  );
}

function DiaryWriteScreen() {
  // ?edit=<record_id>: 기존 기록을 불러와 수정한다. 없으면 오늘 기록을 새로 쓴다.
  const edit = useSearchParams()?.get('edit');
  const editId = edit || null;
  const accessToken = useAuthStore((s) => s.accessToken);
  const theme = useTheme();
  const createRecord = useSaveTodayRecord();
  const updateRecord = useUpdateDailyRecord();
  const createMirror = useCreateObjectiveMirror();
  const { patch: patchMe } = useMe();
  const todayRecord = useTodayRecord(!editId);
  // 저장 시점에 409로 오늘 기록이 있다는 걸 알게 된 경우(undefined = 해당 없음)
  const [existingId, setExistingId] = useState<string | null | undefined>(undefined);

  const { data: questionData, isPending: questionPending } = useGetTodayDailyQuestion(!!accessToken && !editId);
  // 질문을 불러오는 동안 기본 문구를 띄웠다가 실제 질문으로 바뀌지 않게 한다(실패하면 기본 문구를 쓴다).
  const questionLoading = !!accessToken && !editId && questionPending;
  const { data: editing, isError: editLoadFailed, refetch: refetchEditing, isFetching: editRefetching } = useGetDailyRecord(editId ?? '', !!accessToken && !!editId);
  const editQuestion = editing?.questions?.[0];
  const rawQuestion = editId ? editQuestion?.question_text : questionData?.question?.question_text;
  const todayQuestion = rawQuestion && /[가-힣]/.test(rawQuestion) ? rawQuestion : FALLBACK_QUESTION;
  const questionType = (editId ? editQuestion?.question_type : questionData?.question?.question_type) ?? '';
  const questionBadge = QUESTION_TYPE_LABEL[questionType] ?? '오늘의 질문';
  const [step, setStep] = useState(0);
  const [animDone, setAnimDone] = useState(false);
  const [apiDone, setApiDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  // 장면 단계만 글/태그로 쓸 수 있다. 감정은 고르기 + '왜 그렇게 생각했어요?' 서술로 받는다.
  const [sceneMode, setSceneMode] = useState<'text' | 'tag'>('text');
  const [answer, setAnswer] = useState('');
  const [scene, setScene] = useState('');
  const [sceneTags, setSceneTags] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [emotionWhy, setEmotionWhy] = useState('');
  const [myself, setMyself] = useState<'yes' | 'no' | null>(null);
  const [myselfDesc, setMyselfDesc] = useState('');
  const [saveError, setSaveError] = useState('');
  // 저장하려는데 서버가 민감정보 동의가 없다고 막았을 때(기기에만 동의가 남은 경우). 동의 화면을 띄우고 동의하면 다시 저장한다.
  const [needConsent, setNeedConsent] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  // 0단계 기분. 수정할 때는 그 기록 날짜에 고른 기분을 쓰고 기분 화면은 건너뛴다.
  const [mood, setMoodIndex] = useState(DEFAULT_MOOD);
  const [moodPicked, setMoodPicked] = useState(!!editId);
  const editDate = editing?.record?.recorded_date;
  const [moodFor, setMoodFor] = useState<string | undefined>(undefined);
  if (editDate && moodFor !== editDate) {
    setMoodFor(editDate);
    const saved = getMood(editDate);
    if (saved !== undefined) setMoodIndex(saved);
  }

  // 수정 모드: 기존 기록 내용을 한 번만 폼에 채운다.
  if (editQuestion && !prefilled) {
    setPrefilled(true);
    setAnswer(editQuestion.user_answer ?? '');
    setScene(editQuestion.scene_description ?? '');
    setEmotions(
      (editQuestion.emotion_tag ?? '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    );
    setMyself(editQuestion.is_myself_moment ? 'yes' : 'no');
    setMyselfDesc(editQuestion.myself_moment_desc ?? '');
  }

  // 감정 서술(emotionWhy)은 기록 필드가 없어 객관화 요청의 원문(original_emotion = 답 · 장면 · 서술)에만 남는다.
  // 수정할 때는 이 기록의 가장 최근 객관화 원문에서 답·장면 뒤를 잘라 서술 칸을 채운다.
  const { data: latest, isPending: mirrorsPending } = useRecordLatestMirror(editId ?? undefined, !!accessToken && !!editId);
  const [whyPrefilled, setWhyPrefilled] = useState(false);
  if (editId && editQuestion && !whyPrefilled && !mirrorsPending) {
    setWhyPrefilled(true);
    const head = [editQuestion.user_answer?.trim(), editQuestion.scene_description?.trim()].filter(Boolean).join(' ');
    const original = latest?.original_emotion ?? '';
    // 목록이 늦게 와서 그사이 직접 적었다면 덮어쓰지 않는다.
    if (head && original.startsWith(`${head} `)) setEmotionWhy((prev) => prev || original.slice(head.length + 1).trim());
  }

  // 분석 애니메이션과 API 저장이 모두 끝나면 결과 화면으로 넘어간다.
  useEffect(() => {
    if (animDone && apiDone) router.replace('/diary/mirror');
  }, [animDone, apiDone]);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  // 알아볼 수 없는 답(ㅋㅋㅋㅋ · ㅍ튵 · 1234 등)은 넘어가지 못하게 한다.
  const answerCheck = useTextCheck(answer);
  const sceneCheck = useTextCheck(scene, sceneMode === 'text');
  const emotionWhyCheck = useTextCheck(emotionWhy);
  const myselfCheck = useTextCheck(myselfDesc, myself === 'yes');

  const sceneText = sceneMode === 'text' ? scene.trim() : sceneTags.join(', ');
  const body = {
    answer_type: 'TEXT' as const,
    user_answer: answer.trim(),
    emotion_tag: emotions.join(', '),
    scene_description: sceneText,
    is_myself_moment: myself === 'yes',
    // 수정(PATCH)은 보낸 필드만 바뀌므로, NO로 바꿨으면 예전 설명을 빈 값으로 지운다.
    myself_moment_desc: myself === 'yes' ? myselfDesc.trim() : editId ? '' : undefined,
  };

  const submit = async () => {
    setSaveError('');
    if (editId) {
      try {
        await updateRecord.mutateAsync({ recordId: editId, body });
      } catch (err) {
        if (isConsentRequiredError(err)) {
          setNeedConsent(true);
          return;
        }
        setSaveError('기록을 수정하지 못했어요. 잠시 후 다시 시도해 주세요.');
        return;
      }
      // 수정 전 글로 만든 객관화 문장을 상세·공유에서 쓰지 않도록 수정 시각을 남긴다.
      patchMe((u) => ({ ...u, recordEditedAt: { ...u.recordEditedAt, [editId]: new Date().toISOString() } }));
      // 감정 서술은 객관화 원문으로만 저장된다. 서술이 있으면 고친 글로 객관화를 새로 만들어 서술을 남긴다.
      // 실패하면 수정 완료로 넘어가지 않고 알린다(다시 누르면 기록 수정과 객관화를 다시 시도한다).
      const why = emotionWhy.trim();
      // 기록을 고치는 사이 동의를 철회했으면 감정 서술을 AI 분석에 보내지 않는다.
      if (why && hasSensitiveConsent()) {
        try {
          await createMirror.mutateAsync({ record_id: editId, original_emotion: [answer.trim(), sceneText, why].filter(Boolean).join(' ') });
        } catch {
          setSaveError('기록은 고쳤지만 감정 서술을 저장하지 못했어요. 다시 시도해 주세요.');
          return;
        }
      }
      router.replace({ pathname: '/diary/[id]', params: { id: editId } });
      return;
    }

    // 저장을 기다리는 사이 계정이 바뀌어도 결과를 다른 계정에 남기지 않도록, 쓰기 시작한 계정을 기억해 둔다.
    const owner = beginLastWrite();
    saveMood(mood);
    setAnalyzing(true);
    const result: LastWrite = {
      scene: sceneText,
      original: [answer.trim(), sceneText, emotionWhy.trim()].filter(Boolean).join(' '),
      emotions,
      unlocked: [],
    };
    let recordId: string | undefined;
    try {
      const res = await createRecord.mutateAsync(body);
      recordId = res?.record?.record_id;
    } catch (err) {
      // 기록 저장에 실패하면 입력을 그대로 두고 작성 화면으로 돌아간다.
      setAnalyzing(false);
      setAnimDone(false);
      if (err instanceof TodayRecordExistsError) setExistingId(err.recordId);
      else if (isConsentRequiredError(err)) setNeedConsent(true);
      else setSaveError('기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    // 기록을 저장하는 사이 민감정보 처리 동의를 철회했으면 객관화(AI 분석)에 글을 보내지 않는다.
    // 이미 저장된 기록은 그대로 두고, 객관화가 실패했을 때처럼 객관화 문장 없이 결과로 넘어간다.
    if (recordId && hasSensitiveConsent()) {
      try {
        const mirror = await createMirror.mutateAsync({ record_id: recordId, original_emotion: result.original });
        result.mirrorId = mirror?.mirror?.mirror_id;
        result.objective = mirror?.mirror?.objective_fact;
        result.unlocked = mirror?.unlocked_monsters ?? [];
      } catch {
        // 기록은 저장됐고 객관화만 실패한 경우: 결과 화면이 객관화 문장 없이 안내한다.
      }
    }
    saveLastWrite(owner, result);
    setApiDone(true);
  };

  // 쓰던 내용은 이 화면의 상태로 남겨 둔 채 동의 화면만 보여 준다. 동의하면 바로 다시 저장한다.
  if (needConsent) {
    return (
      <ConsentRequired
        onAgreed={() => {
          setNeedConsent(false);
          void submit();
        }}
        onCancel={() => setNeedConsent(false)}
      />
    );
  }

  if (analyzing) {
    return <MirrorAnalyzing mood={themedMood(MOODS[mood], theme)} onDone={() => setAnimDone(true)} onBack={() => router.dismissTo('/diary')} />;
  }

  // 다크에서는 기분 색의 바탕·카드는 같은 색조의 어두운 면으로, 글자는 밝게 바꾼다(12q0-dk · 12a-dk). 버튼(accent)은 그대로.
  const raw = MOODS[mood];
  const themed = themedMood(raw, theme);
  const m: Mood = {
    ...themed,
    // 중간 밝기 색 글자(#4F5B7A 등)는 변환 표에서 그대로 나와 어두운 바탕에서 묻히므로 12q0-dk의 보조 글자색을 쓴다.
    sub: theme.isDark && themed.sub === raw.sub ? '#B8B8C4' : themed.sub,
  };
  const placeholder = theme.fg('#A1A1AA');
  const saving = createRecord.isPending || updateRecord.isPending || createMirror.isPending;
  const next = () => (step < TOTAL - 1 ? setStep(step + 1) : submit());
  // 서버에 가짜 값을 채워 보내지 않도록, 필수 항목(답변·장면·감정·나다움)은 입력해야 넘어갈 수 있다.
  // 나다움 YES는 명세상 상세 서술이 함께 필요하다.
  const canNext = [
    answer.trim().length > 0 && !answerCheck.invalid,
    sceneText.length > 0 && !sceneCheck.invalid,
    emotions.length > 0 && !emotionWhyCheck.invalid,
    myself === 'no' || (myself === 'yes' && myselfDesc.trim().length > 0 && !myselfCheck.invalid),
  ][step];

  if (existingId !== undefined) return <TodayRecordExists recordId={existingId} />;
  if (!editId && todayRecord.record) return <TodayRecordExists recordId={todayRecord.record.record_id} />;
  if (!editId && todayRecord.isLoading) {
    return (
      <Screen>
        <TopBar title="데일리 다이어리" />
        <Text className="text-center text-[14px] text-sub mt-24">불러오는 중...</Text>
      </Screen>
    );
  }

  if (editId && !prefilled) {
    return (
      <Screen>
        <TopBar title="기록 수정" />
        {editLoadFailed && !editing ? (
          <StatusView kind="error" title="기록을 불러오지 못했어요" onRetry={() => refetchEditing()} retrying={editRefetching} className="pt-28" />
        ) : (
          <Text className="text-center text-[14px] text-sub mt-24">{editing ? '수정할 내용이 없는 기록이에요.' : '불러오는 중...'}</Text>
        )}
      </Screen>
    );
  }

  const background = <LinearGradient style={absoluteFill} colors={m.bg} />;
  // loading이면 글자 대신 도는 로딩 표시를 보이고 누를 수 없게 한다(흐리게 하지 않는다).
  const accentButton = (label: string, onPress: () => void, disabled = false, loading = false) => (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      className="h-16 shrink-0 rounded-2xl items-center justify-center"
      style={{ backgroundColor: m.accent, opacity: disabled && !loading ? 0.4 : 1 }}
    >
      {loading ? (
        <Spinner size={22} color={m.onAccent} />
      ) : (
        <Text className="text-[16px] font-bold" style={{ color: m.onAccent }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
  const card = (h: number, children: ReactNode) => (
    <View className="shrink-0 rounded-[22px] px-5 py-5" style={{ backgroundColor: m.card, height: h }}>
      {children}
    </View>
  );
  const area = 'flex-1 min-h-0 p-0 text-[16px] leading-[28px] text-ink';

  /* ── ⓪ 오늘의 기분 (12q0) ── */
  if (!moodPicked) {
    return (
      <Screen
        bg={m.bg[1]}
        background={background}
        footer={accentButton('다음', () => {
          saveMood(mood);
          setMoodPicked(true);
        })}
      >
        <View className="h-11 flex-row items-center justify-center px-5 mt-2">
          <View className="absolute left-5">
            <BackButton onPress={() => (router.canGoBack() ? router.back() : router.dismissTo('/diary'))} />
          </View>
          <Text className="text-[16px] font-semibold text-ink">기분</Text>
        </View>
        <View className="items-center px-8">
          <Text accessibilityRole="header" className="mt-7 text-center text-[24px] font-bold leading-[35px] tracking-[-0.5px]" style={{ color: m.ink }}>
            {'오늘 전반적으로 기분이\n어떤지 선택해 보세요.'}
          </Text>
          <Img key={mood} src={moodImage(mood)} width={280} height={280} contentFit="contain" style={{ marginTop: 24, animation: 'zoom-in 260ms ease-out' }} />
          <Text accessibilityLiveRegion="polite" className="mt-5 text-[24px] font-bold tracking-[-0.5px]" style={{ color: m.ink }}>
            {m.label}
          </Text>
        </View>
        <View className="px-8 mt-6">
          <MoodSlider value={mood} onChange={setMoodIndex} />
          <View className="mt-2.5 flex-row justify-between">
            <Text className="text-[12px]" style={{ color: m.sub }}>
              {MOODS[0].label}
            </Text>
            <Text className="text-[12px]" style={{ color: m.sub }}>
              {MOODS[MOODS.length - 1].label}
            </Text>
          </View>
          <View className="mt-7 h-7 flex-row items-center justify-center gap-3.5">
            {MOODS.map((x, i) => (
              <Pressable
                key={x.label}
                onPress={() => setMoodIndex(i)}
                accessibilityRole="button"
                accessibilityLabel={x.label}
                accessibilityState={{ selected: i === mood }}
                className={`shrink-0 rounded-full ${i === mood ? 'w-7 h-7' : 'w-5 h-5'}`}
                style={{ backgroundColor: x.dot, boxShadow: i === mood ? `0 0 0 3px ${theme.bg('#FFFFFF')}` : undefined }}
              />
            ))}
          </View>
          <Text className="mt-3.5 text-center text-[12px]" style={{ color: m.sub }}>
            고른 기분 색으로 오늘 다이어리가 채워져요
          </Text>
        </View>
      </Screen>
    );
  }

  const header = (
    <View className="px-5 pt-2">
      <View className="h-11 flex-row items-center justify-between">
        <BackButton onPress={() => (step === 0 ? (editId ? router.back() : setMoodPicked(false)) : setStep(step - 1))} />
        <View className="absolute left-0 right-0 items-center" pointerEvents="none">
          <Text className="text-[16px] font-semibold text-ink">{editId ? '기록 수정' : '데일리 다이어리'}</Text>
        </View>
        <Text className="text-[12px] text-mute tabular-nums">
          {step + 1} / {TOTAL}
        </Text>
      </View>
      <View className="mt-[18px] flex-row items-center gap-3">
        <View className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: m.track }}>
          <View className="h-full rounded-full" style={{ width: `${((step + 1) / TOTAL) * 100}%`, backgroundColor: m.accent }} />
        </View>
        <View className="shrink-0 flex-row items-center gap-1.5 rounded-full bg-page/60 px-2 py-[5px]">
          <View className="w-3.5 h-3.5 shrink-0 rounded-full" style={{ backgroundColor: m.accent }} />
          <Text className="text-[12px] font-semibold" style={{ color: m.sub }}>
            {m.label}
          </Text>
        </View>
      </View>
    </View>
  );

  const answered = [
    { label: '오늘의 질문', on: !!answer.trim() },
    { label: '한 장면', on: !!scene.trim() || sceneTags.length > 0 },
    { label: `감정 ${emotions.length}개${emotionWhy.trim() ? ' + 서술' : ''}`, on: emotions.length > 0 },
    { label: `나다움 ${myself === 'no' ? 'NO' : 'YES'}`, on: myself !== null },
  ].filter((c) => c.on);
  const hasNarrative = !!(answer.trim() || scene.trim() || emotionWhy.trim() || myselfDesc.trim());

  return (
    <Screen
      bg={m.bg[1]}
      background={background}
      footer={
        <>
          {saveError ? <Text className="text-[12px] text-danger text-center mb-2">{saveError}</Text> : null}
          {step === TOTAL - 1
            ? accentButton(editId ? '수정 완료' : '객관화 미러로 보내기', next, !canNext, saving)
            : accentButton('다음', next, !canNext)}
        </>
      }
    >
      {header}
      <View className="px-5 pt-9 pb-6">
        {step === 0 && (
          <>
            <Tag mood={m} icon={ICON_PATH[questionType as keyof typeof ICON_PATH]}>
              {questionBadge}
            </Tag>
            <H1>{questionLoading ? ' ' : todayQuestion}</H1>
            <View className="mt-5">
              {card(
                260,
                <>
                  <TextInput
                    value={answer}
                    onChangeText={setAnswer}
                    maxLength={MAX_ANSWER}
                    placeholder="떠오르는 대로 적어주세요"
                    accessibilityLabel="오늘의 질문 답"
                    {...inputProps(m, placeholder)}
                    className={area}
                  />
                  <CountRow hint={answerCheck.hint} count={answer.length} />
                </>,
              )}
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Tag mood={m}>오늘의 한 장면</Tag>
            <H1>{'오늘 가장 선명하게 기억나는\n장면을 묘사해주세요'}</H1>
            <Text className="mt-2 text-[12px] text-sub">무슨 일이 있었는지보다, 그 장면이 어땠는지 적어도 좋아요.</Text>
            <View className="mt-4">
              <ModeSwitch mood={m} value={sceneMode} onChange={setSceneMode} />
            </View>
            {sceneMode === 'text' ? (
              <View className="mt-6">
                {card(
                  240,
                  <>
                    <TextInput
                      value={scene}
                      onChangeText={setScene}
                      maxLength={MAX_SCENE}
                      placeholder="예: 수학 문제 세 번째에서 30분 멈춰 있었다."
                      accessibilityLabel="오늘의 한 장면"
                      {...inputProps(m, placeholder)}
                      className={area}
                    />
                    <CountRow hint={sceneCheck.hint} count={scene.length} />
                  </>,
                )}
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-2 mt-6">
                {SCENE_TAGS.map((t) => (
                  <Pill key={t} mood={m} label={t} on={sceneTags.includes(t)} onPress={() => toggle(sceneTags, setSceneTags, t)} />
                ))}
              </View>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Tag mood={m}>감정 스냅샷</Tag>
            <H1>{'지금 이 감정,\n한 단어로 고른다면?'}</H1>
            <Text className="mt-2 text-[12px] text-sub">여러 개를 골라도 괜찮아요.</Text>
            <View className="flex-row flex-wrap gap-2 mt-5">
              {/* 다른 화면(대화형 기록)에서 고른 감정도 보이고 해제할 수 있게 함께 그린다. */}
              {[...new Set([...EMOTIONS, ...emotions])].map((e) => (
                <Pill key={e} mood={m} label={e} on={emotions.includes(e)} onPress={() => toggle(emotions, setEmotions, e)} />
              ))}
            </View>
            {/* '왜 그렇게 생각했어요?' 이어 묻는 카드 */}
            <View className="mt-4 rounded-[22px] px-4 py-4" style={{ backgroundColor: m.card }}>
              <View className="flex-row items-center gap-1.5">
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M4.5 5.5h15v10h-8l-4 3.5v-3.5h-3v-10Z" stroke={m.label2} strokeWidth={2.2} strokeLinejoin="round" />
                </svg>
                <Text className="text-[12px] font-bold" style={{ color: m.label2 }}>
                  왜 그렇게 생각했어요?
                </Text>
              </View>
              <Text className="mt-2 text-[16px] font-semibold leading-[23px] text-ink">{'이 조합, 어떤 상황이었나요?\n그때 어떤 감정이 먼저 왔나요?'}</Text>
              <TextInput
                value={emotionWhy}
                onChangeText={setEmotionWhy}
                placeholder="떠오르는 대로 적어주세요"
                maxLength={MAX_TEXT_LENGTH}
                {...inputProps(m, placeholder)}
                className="mt-3 min-h-[76px] rounded-[14px] bg-page px-4 py-3.5 text-[14px] leading-[22px] text-ink"
              />
              {emotionWhyCheck.hint ? <Text className="mt-2 text-[12px] text-danger">{emotionWhyCheck.hint}</Text> : null}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Tag mood={m} icon={ICON_PATH.DISCOVERY_CONTEXT}>
              발견 맥락
            </Tag>
            <H1>{'오늘 나답다고 느낀 순간이\n있었나요?'}</H1>
            <View className="flex-row gap-3 mt-5">
              {(['yes', 'no'] as const).map((v) => {
                const on = myself === v;
                return (
                  <Pressable
                    key={v}
                    onPress={() => {
                      setMyself(v);
                      if (v === 'no') setMyselfDesc('');
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    className="flex-1 h-16 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: on ? m.accent : m.card }}
                  >
                    <Text className="text-[16px] font-bold" style={{ color: on ? m.onAccent : m.ink }}>
                      {v.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="mt-6 text-[14px] font-semibold text-ink">
              왜 그 순간이 나답다고 생각했어요? {myself !== 'yes' && <Text className="text-[14px] font-normal text-mute">(선택)</Text>}
            </Text>
            <TextInput
              value={myselfDesc}
              onChangeText={setMyselfDesc}
              editable={myself !== 'no'}
              maxLength={MAX_SCENE}
              placeholder="떠오르는 대로 적어주세요"
              {...inputProps(m, placeholder)}
              className={`mt-2.5 min-h-[124px] rounded-[22px] px-5 py-4 text-[16px] leading-[24px] text-ink ${myself === 'no' ? 'opacity-50' : ''}`}
              style={{ backgroundColor: m.card }}
            />
            {myselfCheck.hint ? <Text className="mt-2 text-[12px] text-danger">{myselfCheck.hint}</Text> : null}
            <View className="mt-4 rounded-[22px] bg-page/60 px-4 py-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-[14px] font-bold text-ink">오늘 기록</Text>
                <Text className="text-[12px] text-sub">답변 {answered.length}개</Text>
              </View>
              <View className="flex-row flex-wrap gap-x-4 gap-y-2 mt-3">
                {answered.map((c) => (
                  <View key={c.label} className="flex-row items-center gap-1">
                    <CheckMark color={m.sub} size={13} />
                    <Text className="text-[12px] font-semibold" style={{ color: m.sub }}>
                      {c.label}
                    </Text>
                  </View>
                ))}
              </View>
              <Text className="mt-3 text-[12px] leading-[19px] text-sub">
                {hasNarrative
                  ? '서술이 있어서 기록 깊이가 충분해요. 태그만 남긴 날은 리포트에 ‘기록 깊이 부족’으로 표시돼요.'
                  : '태그만 남긴 날은 리포트에 ‘기록 깊이 부족’으로 표시돼요.'}
              </Text>
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

// ?edit= 를 읽으므로 Next 규칙대로 Suspense로 감싼다.
function DiaryWritePage() {
  return (
    <Suspense fallback={null}>
      <DiaryWriteScreen />
    </Suspense>
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(DiaryWritePage);
