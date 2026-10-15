'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetDailyRecord, useGetTodayDailyQuestion, useUpdateDailyRecord } from '@/entities/diary';
import { TodayRecordExistsError, useSaveTodayRecord, useTodayRecord } from '@/hooks/useSaveTodayRecord';
import { TodayRecordExists } from '@/components/ui/TodayRecordExists';
import { useCreateObjectiveMirror } from '@/entities/objective';
import { useAuthStore } from '@/store';
import { Screen } from '@/components/ui/Screen';
import { Badge, Button, CheckIcon, ChoiceChip, MessageSquareIcon, Segmented, TopBar } from '@/components/ui/primitives';
import { AnalyzingScreen } from '@/components/ui/flows';
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

const TrendIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M4 16l5-5 4 4 7-7M15 8h5v5" stroke="#6367FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SearchSmall = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="6" stroke="#6367FF" strokeWidth="2.4" />
    <path d="M16 16l3.5 3.5" stroke="#6367FF" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

function FollowUp({ question, value, onChange, placeholder, maxLength }: { question: ReactNode; value: string; onChange: (v: string) => void; placeholder: string; maxLength?: number }) {
  return (
    <div className="rounded-3xl bg-surface px-4 py-4 mt-4">
      <p className="flex items-center gap-1.5 text-[12px] font-semibold text-primary">
        <MessageSquareIcon /> 왜 그렇게 생각했어요?
      </p>
      <p className="text-[16px] font-bold text-ink leading-snug mt-2">{question}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={2}
        className="w-full mt-3 rounded-2xl bg-white px-4 py-3.5 text-[15px] text-ink leading-relaxed outline-none resize-none placeholder:text-mute caret-primary"
      />
    </div>
  );
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function DiaryWritePage() {
  return (
    <Suspense>
      <DiaryWrite />
    </Suspense>
  );
}

function DiaryWrite() {
  const router = useRouter();
  // ?edit=<record_id>: 기존 기록을 불러와 수정한다. 없으면 오늘 기록을 새로 쓴다.
  const editId = useSearchParams().get('edit');
  const accessToken = useAuthStore((s) => s.accessToken);
  const createRecord = useSaveTodayRecord();
  const updateRecord = useUpdateDailyRecord();
  const createMirror = useCreateObjectiveMirror();
  const todayRecord = useTodayRecord(!editId);
  // 저장 시점에 409로 오늘 기록이 있다는 걸 알게 된 경우(undefined = 해당 없음)
  const [existingId, setExistingId] = useState<string | null | undefined>(undefined);

  const { data: questionData } = useGetTodayDailyQuestion(!!accessToken && !editId);
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
  useEffect(() => {
    if (!editQuestion || prefilled) return;
    setAnswer(editQuestion.user_answer ?? '');
    setScene(editQuestion.scene_description ?? '');
    setEmotions(editQuestion.emotion_tag.split(',').map((t) => t.trim()).filter(Boolean));
    setMyself(editQuestion.is_myself_moment ? 'yes' : 'no');
    setMyselfDesc(editQuestion.myself_moment_desc ?? '');
    setPrefilled(true);
  }, [editQuestion, prefilled]);

  // 분석 애니메이션과 API 저장이 모두 끝나면 결과 화면으로 넘어간다.
  useEffect(() => {
    if (animDone && apiDone) router.replace('/diary/mirror');
  }, [animDone, apiDone, router]);

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
      router.replace(`/diary/${editId}`);
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
        title={
          <>
            감정 밖에서
            <br />내 기록을 읽고 있어요
          </>
        }
        steps={['사실만 추려내기', '관찰자 시점으로 다시 쓰기', '패턴 태깅']}
        onDone={() => setAnimDone(true)}
        onClose={() => router.push('/diary')}
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
        <TopBar title="데일리 다이어리" />
        <p className="text-center text-[14px] text-sub mt-24">불러오는 중...</p>
      </Screen>
    );
  }

  if (editId && !prefilled) {
    const message = editLoadFailed ? '기록을 불러오지 못했어요.' : editing ? '수정할 내용이 없는 기록이에요.' : '불러오는 중...';
    return (
      <Screen>
        <TopBar title="기록 수정" />
        <p className="text-center text-[14px] text-sub mt-24">{message}</p>
      </Screen>
    );
  }

  const header = (
    <>
      <TopBar title={editId ? '기록 수정' : '데일리 다이어리'} onBack={() => (step === 0 ? router.back() : setStep(step - 1))} right={<span className="font-mono text-[13px] text-mute">{step + 1} / {TOTAL}</span>} />
      <div className="flex items-center justify-between px-5 mt-1">
        <div className="flex gap-2">
          {Array.from({ length: TOTAL }, (_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === step ? 'bg-primary scale-125' : i < step ? 'bg-primary-line' : 'bg-[#D8D8DE]'}`} />
          ))}
        </div>
        <span className="font-mono text-[12px] text-sub">
          {fmt(elapsed)} / {fmt(TIME_LIMIT)}
        </span>
      </div>
    </>
  );

  const footer =
    step === TOTAL - 1 ? (
      <>
        {saveError && <p className="text-[13px] text-danger text-center mb-2">{saveError}</p>}
        <Button onClick={next} disabled={!canNext || saving}>
          {saving ? '저장 중...' : editId ? '수정 완료' : '객관화 미러로 보내기'}
        </Button>
      </>
    ) : (
      <Button variant="dark" onClick={next} disabled={!canNext}>
        다음
      </Button>
    );

  return (
    <Screen footer={footer}>
      {header}
      <div className="px-5 pt-6 pb-6">
        {step === 0 && (
          <>
            <Badge tone="primary" icon={<TrendIcon />}>
              {questionBadge}
            </Badge>
            <h1 className="text-[21px] font-bold text-ink leading-[1.45] mt-3">{todayQuestion}</h1>
            <div className="mt-4 rounded-3xl bg-surface px-5 py-5 h-[260px] flex flex-col">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                maxLength={MAX_ANSWER}
                placeholder="떠오르는 대로 적어주세요"
                className="flex-1 bg-transparent outline-none resize-none text-[15px] text-ink leading-[1.75] placeholder:text-mute caret-primary"
              />
              <span className="text-right text-[12px] text-mute">{answer.length} / {MAX_ANSWER}자</span>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <Badge>오늘의 한 장면</Badge>
            <h1 className="text-[21px] font-bold text-ink leading-[1.45] mt-3">
              오늘 가장 선명하게 기억나는
              <br />
              장면을 묘사해주세요
            </h1>
            <p className="text-[13px] text-sub mt-2">무슨 일이 있었는지보다, 그 장면이 어땠는지 적어도 좋아요.</p>
            <div className="mt-4">
              <Segmented options={[{ value: 'text', label: '텍스트' }, { value: 'tag', label: '태그' }]} value={mode[1]} onChange={(m) => setStepMode(1, m)} />
            </div>
            {mode[1] === 'text' ? (
              <div className="mt-4 rounded-3xl bg-surface px-5 py-5 h-[400px] flex flex-col">
                <textarea
                  value={scene}
                  onChange={(e) => setScene(e.target.value)}
                  maxLength={MAX_SCENE}
                  placeholder="예: 수학 문제 세 번째에서 30분 멈춰 있었다."
                  className="flex-1 bg-transparent outline-none resize-none text-[15px] text-ink leading-[1.75] placeholder:text-mute caret-primary"
                />
                <span className="text-right text-[12px] text-mute">{scene.length} / {MAX_SCENE}자</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-4">
                {SCENE_TAGS.map((t) => (
                  <ChoiceChip key={t} label={t} selected={sceneTags.includes(t)} onClick={() => toggle(sceneTags, setSceneTags, t)} />
                ))}
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Badge>감정 스냅샷</Badge>
            <h1 className="text-[21px] font-bold text-ink leading-[1.45] mt-3">
              지금 이 감정,
              <br />한 단어로 고른다면?
            </h1>
            <div className="mt-4">
              <Segmented options={[{ value: 'text', label: '텍스트' }, { value: 'tag', label: '태그' }]} value={mode[2]} onChange={(m) => setStepMode(2, m)} />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {/* 다른 화면(대화형 기록)에서 고른 감정도 보이고 해제할 수 있게 함께 그린다. */}
              {[...new Set([...EMOTIONS, ...emotions])].map((e) => (
                <ChoiceChip key={e} label={e} selected={emotions.includes(e)} onClick={() => toggle(emotions, setEmotions, e)} />
              ))}
              <ChoiceChip label="+ 직접 입력" selected={false} />
            </div>
            <FollowUp
              question={
                <>
                  이 조합, 어떤 상황이었나요?
                  <br />
                  그때 어떤 감정이 먼저 왔나요?
                </>
              }
              value={emotionWhy}
              onChange={setEmotionWhy}
              placeholder="떠오르는 대로 적어주세요"
            />
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex items-center gap-2">
              <Badge tone="primary" icon={<SearchSmall />}>
                발견 맥락
              </Badge>
            </div>
            <h1 className="text-[21px] font-bold text-ink leading-[1.45] mt-3">
              오늘 나답다고 느낀 순간이
              <br />
              있었나요?
            </h1>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {(['yes', 'no'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    setMyself(v);
                    if (v === 'no') setMyselfDesc('');
                  }}
                  className={`h-14 rounded-2xl text-[16px] font-bold ${myself === v ? 'bg-primary text-white' : 'bg-surface-2 text-[#48484F]'}`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-[14px] font-semibold text-ink mt-5">
              어떤 순간이었나요? {myself === 'no' && <span className="font-normal text-sub">(선택)</span>}
            </p>
            <textarea
              value={myselfDesc}
              onChange={(e) => setMyselfDesc(e.target.value)}
              disabled={myself === 'no'}
              maxLength={MAX_SCENE}
              placeholder="떠오르는 대로 적어주세요"
              rows={3}
              className="w-full mt-2.5 rounded-2xl bg-surface px-4 py-4 text-[15px] text-ink outline-none resize-none placeholder:text-mute disabled:opacity-50 caret-primary"
            />
            <div className="mt-4 rounded-2xl border border-line px-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-ink">오늘 기록</span>
                <span className="font-mono text-[12px] text-sub">
                  {Math.floor(elapsed / 60)}분 {elapsed % 60}초
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[
                  { label: '오늘의 질문', on: !!answer.trim() },
                  { label: '한 장면', on: !!scene || sceneTags.length > 0 },
                  { label: `감정 ${emotions.length}개${emotionWhy ? ' + 서술' : ''}`, on: emotions.length > 0 },
                  { label: `나다움 ${myself === 'no' ? 'NO' : 'YES'}`, on: myself !== null },
                ]
                  .filter((c) => c.on)
                  .map((c) => (
                    <span key={c.label} className="h-7 px-2.5 rounded-full bg-primary-soft text-[12px] font-semibold text-primary inline-flex items-center gap-1">
                      <CheckIcon size={11} color="#6367FF" width={3} /> {c.label}
                    </span>
                  ))}
              </div>
              <p className="text-[12px] text-sub leading-relaxed mt-3">
                {emotionWhy || answer || scene
                  ? '서술이 있어서 기록 깊이가 충분해요. 태그만 남긴 날은 리포트에 ‘기록 깊이 부족’으로 표시돼요.'
                  : '태그만 남긴 날은 리포트에 ‘기록 깊이 부족’으로 표시돼요.'}
              </p>
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}
