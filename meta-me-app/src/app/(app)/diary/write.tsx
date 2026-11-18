import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { useGetDailyRecord, useGetTodayDailyQuestion, useUpdateDailyRecord } from '@/entities/diary';
import { TodayRecordExistsError, useSaveTodayRecord, useTodayRecord } from '@/hooks/useSaveTodayRecord';
import { TodayRecordExists } from '@/components/ui/TodayRecordExists';
import { useCreateObjectiveMirror } from '@/entities/objective';
import { useAuthStore } from '@/store';
import { SensitiveGate } from '@/components/SensitiveGate';
import { Screen } from '@/components/ui/Screen';
import { Badge, Button, ChoiceChip, Dots, Segmented, TopBar, goBack } from '@/components/ui/primitives';
import { CheckIcon, MessageSquareIcon } from '@/components/ui/icons';
import { AnalyzingScreen } from '@/components/ui/flows';
import { Text } from '@/components/ui/Text';
import { saveLastWrite, type LastWrite } from '@/lib/lastWrite';

const TIME_LIMIT = 180;
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

const INPUT_PROPS = {
  placeholderTextColor: '#B4B4BB',
  selectionColor: '#6367FF',
  style: { fontFamily: 'Pretendard-Regular' },
} as const;

const TrendIcon = () => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <Path d="M4 16l5-5 4 4 7-7M15 8h5v5" stroke="#6367FF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const SearchSmall = () => (
  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={6} stroke="#6367FF" strokeWidth={2.4} />
    <Path d="M16 16l3.5 3.5" stroke="#6367FF" strokeWidth={2.4} strokeLinecap="round" />
  </Svg>
);

function Heading({ children }: { children: ReactNode }) {
  return <Text className="text-[21px] font-bold text-ink leading-[30px] mt-3">{children}</Text>;
}

function FollowUp({
  question,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  question: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLength?: number;
}) {
  return (
    <View className="rounded-3xl bg-surface px-4 py-4 mt-4">
      <View className="flex-row items-center gap-1.5">
        <MessageSquareIcon />
        <Text className="text-[12px] font-semibold text-primary">왜 그렇게 생각했어요?</Text>
      </View>
      <Text className="text-[16px] font-bold text-ink leading-[22px] mt-2">{question}</Text>
      <TextInput
        {...INPUT_PROPS}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        multiline
        textAlignVertical="top"
        className="w-full mt-3 rounded-2xl bg-white px-4 py-3.5 min-h-[76px] text-[15px] text-ink leading-[24px]"
      />
    </View>
  );
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function DiaryWrite() {
  // ?edit=<record_id>: 기존 기록을 불러와 수정한다. 없으면 오늘 기록을 새로 쓴다.
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const editId = edit || null;
  const accessToken = useAuthStore((s) => s.accessToken);
  const createRecord = useSaveTodayRecord();
  const updateRecord = useUpdateDailyRecord();
  const createMirror = useCreateObjectiveMirror();
  const todayRecord = useTodayRecord(!editId);
  // 저장 시점에 409로 오늘 기록이 있다는 걸 알게 된 경우(undefined = 해당 없음)
  const [existingId, setExistingId] = useState<string | null | undefined>(undefined);

  const { data: questionData, isPending: questionPending } = useGetTodayDailyQuestion(!!accessToken && !editId);
  // 질문을 불러오는 동안 기본 문구를 띄웠다가 실제 질문으로 바뀌지 않게 한다(실패하면 기본 문구를 쓴다).
  const questionLoading = !!accessToken && !editId && questionPending;
  const { data: editing, isError: editLoadFailed } = useGetDailyRecord(editId ?? '', !!accessToken && !!editId);
  const editQuestion = editing?.questions?.[0];
  const rawQuestion = editId ? editQuestion?.question_text : questionData?.question?.question_text;
  const todayQuestion = rawQuestion && /[가-힣]/.test(rawQuestion) ? rawQuestion : FALLBACK_QUESTION;
  const questionBadge = QUESTION_TYPE_LABEL[(editId ? editQuestion?.question_type : questionData?.question?.question_type) ?? ''] ?? '오늘의 질문';
  const [step, setStep] = useState(0);
  const [animDone, setAnimDone] = useState(false);
  const [apiDone, setApiDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [mode, setMode] = useState<('text' | 'tag')[]>(['text', 'text', 'tag']);
  const [answer, setAnswer] = useState('');
  const [scene, setScene] = useState('');
  const [sceneTags, setSceneTags] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [emotionWhy, setEmotionWhy] = useState('');
  const [myself, setMyself] = useState<'yes' | 'no' | null>(null);
  const [myselfDesc, setMyselfDesc] = useState('');
  const [saveError, setSaveError] = useState('');
  const [prefilled, setPrefilled] = useState(false);

  // 수정 모드: 기존 기록 내용을 한 번만 폼에 채운다.
  // (웹은 effect에서 채웠다. 앱 lint는 effect 안 setState를 막아 렌더 중에 맞춘다.)
  if (editQuestion && !prefilled) {
    setAnswer(editQuestion.user_answer ?? '');
    setScene(editQuestion.scene_description ?? '');
    setEmotions(editQuestion.emotion_tag.split(',').map((t) => t.trim()).filter(Boolean));
    setMyself(editQuestion.is_myself_moment ? 'yes' : 'no');
    setMyselfDesc(editQuestion.myself_moment_desc ?? '');
    setPrefilled(true);
  }

  // 분석 애니메이션과 API 저장이 모두 끝나면 결과 화면으로 넘어간다.
  useEffect(() => {
    if (animDone && apiDone) router.replace('/diary/mirror');
  }, [animDone, apiDone]);

  useEffect(() => {
    if (analyzing) return;
    const t = setInterval(() => setElapsed((e) => Math.min(TIME_LIMIT, e + 1)), 1000);
    return () => clearInterval(t);
  }, [analyzing]);

  const setStepMode = (i: number, m: 'text' | 'tag') => setMode((prev) => prev.map((x, j) => (j === i ? m : x)));
  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const sceneText = mode[1] === 'text' ? scene.trim() : sceneTags.join(', ');
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
      } catch {
        setSaveError('기록을 수정하지 못했어요. 잠시 후 다시 시도해 주세요.');
        return;
      }
      router.replace({ pathname: '/diary/[id]', params: { id: editId } });
      return;
    }

    setAnalyzing(true);
    const result: LastWrite = {
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
      else setSaveError('기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    if (recordId) {
      try {
        const mirror = await createMirror.mutateAsync({ record_id: recordId, original_emotion: result.original });
        result.mirrorId = mirror?.mirror?.mirror_id;
        result.objective = mirror?.mirror?.objective_fact;
        result.unlocked = mirror?.unlocked_monsters ?? [];
      } catch {
        // 기록은 저장됐고 객관화만 실패한 경우: 결과 화면이 객관화 문장 없이 안내한다.
      }
    }
    saveLastWrite(result);
    setApiDone(true);
  };

  if (analyzing) {
    return (
      <AnalyzingScreen
        title={'감정 밖에서\n내 기록을 읽고 있어요'}
        steps={['사실만 추려내기', '관찰자 시점으로 다시 쓰기', '패턴 태깅']}
        onDone={() => setAnimDone(true)}
        // 웹은 /diary로 push했다. 앱은 작성 화면을 스택에 남기지 않도록 다이어리 탭까지 되돌아간다.
        onClose={() => router.dismissTo('/diary')}
      />
    );
  }

  const saving = createRecord.isPending || updateRecord.isPending;
  const next = () => (step < TOTAL - 1 ? setStep(step + 1) : submit());
  // 서버에 가짜 값을 채워 보내지 않도록, 필수 항목(답변·장면·감정·나다움)은 입력해야 넘어갈 수 있다.
  // 나다움 YES는 명세상 상세 서술이 함께 필요하다.
  const canNext = [
    answer.trim().length > 0,
    sceneText.length > 0,
    emotions.length > 0,
    myself === 'no' || (myself === 'yes' && myselfDesc.trim().length > 0),
  ][step];

  if (existingId !== undefined) return <TodayRecordExists recordId={existingId} />;
  if (!editId && todayRecord.record) return <TodayRecordExists recordId={todayRecord.record.record_id} />;
  if (!editId && todayRecord.isLoading) {
    return (
      <Screen>
        <TopBar title="데일리 다이어리" backHref="/diary" />
        <Text className="text-center text-[14px] text-sub mt-24">불러오는 중...</Text>
      </Screen>
    );
  }

  if (editId && !prefilled) {
    const message = editLoadFailed ? '기록을 불러오지 못했어요.' : editing ? '수정할 내용이 없는 기록이에요.' : '불러오는 중...';
    return (
      <Screen>
        <TopBar title="기록 수정" backHref="/diary" />
        <Text className="text-center text-[14px] text-sub mt-24">{message}</Text>
      </Screen>
    );
  }

  const header = (
    <>
      <TopBar
        title={editId ? '기록 수정' : '데일리 다이어리'}
        onBack={() => (step === 0 ? goBack('/diary') : setStep(step - 1))}
        right={
          <Text className="font-mono text-[13px] text-mute">
            {step + 1} / {TOTAL}
          </Text>
        }
      />
      <View className="flex-row items-center justify-between px-5 mt-1">
        <Dots count={TOTAL} index={step} />
        <Text className="font-mono text-[12px] text-sub">
          {fmt(elapsed)} / {fmt(TIME_LIMIT)}
        </Text>
      </View>
    </>
  );

  const footer =
    step === TOTAL - 1 ? (
      <>
        {!!saveError && <Text className="text-[13px] text-danger text-center mb-2">{saveError}</Text>}
        <Button onPress={next} disabled={!canNext || saving}>
          {saving ? '저장 중...' : editId ? '수정 완료' : '객관화 미러로 보내기'}
        </Button>
      </>
    ) : (
      <Button variant="dark" onPress={next} disabled={!canNext}>
        다음
      </Button>
    );

  return (
    <Screen footer={footer}>
      {header}
      <View className="px-5 pt-6 pb-6">
        {step === 0 && (
          <>
            <Badge tone="primary" icon={<TrendIcon />}>
              {questionBadge}
            </Badge>
            <Heading>{questionLoading ? ' ' : todayQuestion}</Heading>
            <View className="mt-4 rounded-3xl bg-surface px-5 py-5 h-[260px]">
              <TextInput
                {...INPUT_PROPS}
                value={answer}
                onChangeText={setAnswer}
                maxLength={MAX_ANSWER}
                placeholder="떠오르는 대로 적어주세요"
                multiline
                textAlignVertical="top"
                className="flex-1 p-0 text-[15px] text-ink leading-[26px]"
              />
              <Text className="text-right text-[12px] text-mute">
                {answer.length} / {MAX_ANSWER}자
              </Text>
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Badge>오늘의 한 장면</Badge>
            <Heading>{'오늘 가장 선명하게 기억나는\n장면을 묘사해주세요'}</Heading>
            <Text className="text-[13px] text-sub mt-2">무슨 일이 있었는지보다, 그 장면이 어땠는지 적어도 좋아요.</Text>
            <View className="mt-4">
              <Segmented
                options={[
                  { value: 'text', label: '텍스트' },
                  { value: 'tag', label: '태그' },
                ]}
                value={mode[1]}
                onChange={(m) => setStepMode(1, m)}
              />
            </View>
            {mode[1] === 'text' ? (
              <View className="mt-4 rounded-3xl bg-surface px-5 py-5 h-[400px]">
                <TextInput
                  {...INPUT_PROPS}
                  value={scene}
                  onChangeText={setScene}
                  maxLength={MAX_SCENE}
                  placeholder="예: 수학 문제 세 번째에서 30분 멈춰 있었다."
                  multiline
                  textAlignVertical="top"
                  className="flex-1 p-0 text-[15px] text-ink leading-[26px]"
                />
                <Text className="text-right text-[12px] text-mute">
                  {scene.length} / {MAX_SCENE}자
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-2 mt-4">
                {SCENE_TAGS.map((t) => (
                  <ChoiceChip key={t} label={t} selected={sceneTags.includes(t)} onPress={() => toggle(sceneTags, setSceneTags, t)} />
                ))}
              </View>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Badge>감정 스냅샷</Badge>
            <Heading>{'지금 이 감정,\n한 단어로 고른다면?'}</Heading>
            <View className="mt-4">
              <Segmented
                options={[
                  { value: 'text', label: '텍스트' },
                  { value: 'tag', label: '태그' },
                ]}
                value={mode[2]}
                onChange={(m) => setStepMode(2, m)}
              />
            </View>
            <View className="flex-row flex-wrap gap-2 mt-4">
              {/* 다른 화면(대화형 기록)에서 고른 감정도 보이고 해제할 수 있게 함께 그린다. */}
              {[...new Set([...EMOTIONS, ...emotions])].map((e) => (
                <ChoiceChip key={e} label={e} selected={emotions.includes(e)} onPress={() => toggle(emotions, setEmotions, e)} />
              ))}
              <ChoiceChip label="+ 직접 입력" selected={false} />
            </View>
            <FollowUp
              question={'이 조합, 어떤 상황이었나요?\n그때 어떤 감정이 먼저 왔나요?'}
              value={emotionWhy}
              onChange={setEmotionWhy}
              placeholder="떠오르는 대로 적어주세요"
            />
          </>
        )}

        {step === 3 && (
          <>
            <Badge tone="primary" icon={<SearchSmall />}>
              발견 맥락
            </Badge>
            <Heading>{'오늘 나답다고 느낀 순간이\n있었나요?'}</Heading>
            <View className="flex-row gap-3 mt-4">
              {(['yes', 'no'] as const).map((v) => (
                <Pressable
                  key={v}
                  onPress={() => {
                    setMyself(v);
                    if (v === 'no') setMyselfDesc('');
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: myself === v }}
                  className={`flex-1 h-14 rounded-2xl items-center justify-center ${myself === v ? 'bg-primary' : 'bg-surface-2'}`}
                >
                  <Text className={`text-[16px] font-bold ${myself === v ? 'text-white' : 'text-[#48484F]'}`}>{v.toUpperCase()}</Text>
                </Pressable>
              ))}
            </View>
            <Text className="text-[14px] font-semibold text-ink mt-5">
              어떤 순간이었나요? {myself === 'no' && <Text className="text-sub">(선택)</Text>}
            </Text>
            <TextInput
              {...INPUT_PROPS}
              value={myselfDesc}
              onChangeText={setMyselfDesc}
              editable={myself !== 'no'}
              maxLength={MAX_SCENE}
              placeholder="떠오르는 대로 적어주세요"
              multiline
              textAlignVertical="top"
              className={`w-full mt-2.5 rounded-2xl bg-surface px-4 py-4 min-h-[96px] text-[15px] text-ink ${myself === 'no' ? 'opacity-50' : ''}`}
            />
            <View className="mt-4 rounded-2xl border border-line px-4 py-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-[14px] font-bold text-ink">오늘 기록</Text>
                <Text className="font-mono text-[12px] text-sub">
                  {Math.floor(elapsed / 60)}분 {elapsed % 60}초
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-1.5 mt-3">
                {[
                  { label: '오늘의 질문', on: !!answer.trim() },
                  { label: '한 장면', on: !!scene || sceneTags.length > 0 },
                  { label: `감정 ${emotions.length}개${emotionWhy ? ' + 서술' : ''}`, on: emotions.length > 0 },
                  { label: `나다움 ${myself === 'no' ? 'NO' : 'YES'}`, on: myself !== null },
                ]
                  .filter((c) => c.on)
                  .map((c) => (
                    <View key={c.label} className="h-7 px-2.5 rounded-full bg-primary-soft flex-row items-center gap-1">
                      <CheckIcon size={11} color="#6367FF" width={3} />
                      <Text className="text-[12px] font-semibold text-primary">{c.label}</Text>
                    </View>
                  ))}
              </View>
              <Text className="text-[12px] text-sub leading-[20px] mt-3">
                {emotionWhy || answer || scene
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

export default function DiaryWriteScreen() {
  return (
    <SensitiveGate>
      <DiaryWrite />
    </SensitiveGate>
  );
}
