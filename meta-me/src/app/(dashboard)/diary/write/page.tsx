'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateDailyRecord } from '@/entities/diary';
import { useCreateObjectiveMirror } from '@/entities/objective';
import { useAuthStore } from '@/store';
import { Screen } from '@/components/ui/Screen';
import { Badge, Button, CheckIcon, ChoiceChip, MessageSquareIcon, Segmented, TextButton, TopBar } from '@/components/ui/primitives';
import { AnalyzingScreen } from '@/components/ui/flows';

const TIME_LIMIT = 180;
const DIFFICULTY = ['생각보다 쉬웠어요', '예상한 만큼', '생각보다 어려웠어요'];
const SCENE_TAGS = ['공부', '일', '관계', '휴식', '이동 중', '혼자 있는 시간'];
const EMOTIONS = ['답답함', '오기', '뿌듯함', '불안', '지루함', '편안함'];
const TOTAL = 4;

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

function FollowUp({ question, value, onChange, placeholder }: { question: ReactNode; value: string; onChange: (v: string) => void; placeholder: string }) {
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
        rows={2}
        className="w-full mt-3 rounded-2xl bg-white px-4 py-3.5 text-[15px] text-ink leading-relaxed outline-none resize-none placeholder:text-mute caret-primary"
      />
    </div>
  );
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function DiaryWritePage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const createRecord = useCreateDailyRecord();
  const createMirror = useCreateObjectiveMirror();

  const [step, setStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [mode, setMode] = useState<('text' | 'tag')[]>(['tag', 'text', 'tag']);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [difficultyWhy, setDifficultyWhy] = useState('');
  const [scene, setScene] = useState('');
  const [sceneTags, setSceneTags] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [emotionWhy, setEmotionWhy] = useState('');
  const [myself, setMyself] = useState<'yes' | 'no' | null>(null);
  const [myselfDesc, setMyselfDesc] = useState('');
  const [mirrorId, setMirrorId] = useState<string | null>(null);

  useEffect(() => {
    if (analyzing) return;
    const t = setInterval(() => setElapsed((e) => Math.min(TIME_LIMIT, e + 1)), 1000);
    return () => clearInterval(t);
  }, [analyzing]);

  const setStepMode = (i: number, m: 'text' | 'tag') => setMode((prev) => prev.map((x, j) => (j === i ? m : x)));
  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const submit = async () => {
    setAnalyzing(true);
    const sceneText = scene.trim() || sceneTags.join(', ') || '오늘의 한 장면';
    try {
      if (!accessToken) return;
      const res = await createRecord.mutateAsync({
        answer_type: 'TEXT',
        user_answer: sceneText,
        emotion_tag: emotions.join(', ') || '기록함',
        scene_description: sceneText,
        is_myself_moment: myself === 'yes',
        myself_moment_desc: myself === 'yes' && myselfDesc.trim() ? myselfDesc.trim() : undefined,
      });
      const mirror = await createMirror.mutateAsync({
        record_id: res.record.record_id,
        original_emotion: [emotionWhy, sceneText].filter(Boolean).join(' '),
      });
      setMirrorId(mirror.mirror.mirror_id);
    } catch {
      // 실패해도 데모 객관화 결과로 이어감
    }
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
        onDone={() => router.replace(mirrorId ? `/diary/mirror?id=${mirrorId}` : '/diary/mirror')}
        onClose={() => router.push('/diary')}
      />
    );
  }

  const next = () => (step < TOTAL - 1 ? setStep(step + 1) : submit());
  const canNext = [
    mode[0] === 'tag' ? !!difficulty : difficultyWhy.trim().length > 0,
    mode[1] === 'text' ? scene.trim().length > 0 : sceneTags.length > 0,
    emotions.length > 0,
    myself !== null,
  ][step];

  const header = (
    <>
      <TopBar title="데일리 다이어리" onBack={() => (step === 0 ? router.back() : setStep(step - 1))} right={<span className="font-mono text-[13px] text-mute">{step + 1} / {TOTAL}</span>} />
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
      <Button onClick={next} disabled={!canNext}>
        객관화 미러로 보내기
      </Button>
    ) : (
      <>
        <Button variant="dark" onClick={next} disabled={!canNext}>
          다음
        </Button>
        <TextButton className="mt-1" onClick={() => setStep(step + 1)}>
          넘어가기
        </TextButton>
      </>
    );

  return (
    <Screen footer={footer}>
      {header}
      <div className="px-5 pt-6 pb-6">
        {step === 0 && (
          <>
            <div className="flex items-center gap-2">
              <Badge tone="primary" icon={<TrendIcon />}>
                성장 맥락
              </Badge>
              <span className="text-[12px] text-sub">지난주 메타인지 결과</span>
            </div>
            <h1 className="text-[21px] font-bold text-ink leading-[1.45] mt-3">
              지난주 수학 이해도를 20% 과대평가했어요.
              <br />
              오늘 체감 난이도는 어땠나요?
            </h1>
            <div className="mt-4 rounded-2xl border border-line px-4 h-12 flex items-center gap-3 text-[13px] text-[#48484F]">
              <span className="font-mono text-mute">08.01</span>
              <span>
                예상 이해도 <b className="text-ink">80%</b> → 실제 정답률 <b className="text-ink">60%</b>
              </span>
            </div>
            <div className="mt-4">
              <Segmented options={[{ value: 'text', label: '텍스트' }, { value: 'tag', label: '태그' }]} value={mode[0]} onChange={(m) => setStepMode(0, m)} />
            </div>
            {mode[0] === 'tag' && (
              <div className="flex flex-wrap gap-2 mt-4">
                {DIFFICULTY.map((d) => (
                  <ChoiceChip key={d} label={d} selected={difficulty === d} onClick={() => setDifficulty(d)} />
                ))}
              </div>
            )}
            <FollowUp
              question={difficulty === '생각보다 쉬웠어요' ? '쉽다고 느낀 이유가 뭐였어요?' : difficulty === '예상한 만큼' ? '예상이 맞았던 이유가 뭐였어요?' : '어렵다고 느낀 이유가 뭐였어요?'}
              value={difficultyWhy}
              onChange={setDifficultyWhy}
              placeholder="떠오르는 대로 한 줄이면 돼요"
            />
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
                  placeholder="예: 수학 문제 세 번째에서 30분 멈춰 있었다."
                  className="flex-1 bg-transparent outline-none resize-none text-[15px] text-ink leading-[1.75] placeholder:text-mute caret-primary"
                />
                <span className="text-right text-[12px] text-mute">{scene.length}자</span>
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
              {EMOTIONS.map((e) => (
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
              <span className="text-[12px] text-sub">최근 ‘끝까지 붙잡기’를 3번 언급</span>
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
                  onClick={() => setMyself(v)}
                  className={`h-14 rounded-2xl text-[16px] font-bold ${myself === v ? 'bg-primary text-white' : 'bg-surface-2 text-[#48484F]'}`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-[14px] font-semibold text-ink mt-5">
              어떤 순간이었나요? <span className="font-normal text-sub">(선택)</span>
            </p>
            <textarea
              value={myselfDesc}
              onChange={(e) => setMyselfDesc(e.target.value)}
              disabled={myself === 'no'}
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
                  { label: '오늘의 질문 + 이유', on: !!difficulty || !!difficultyWhy },
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
                {emotionWhy || difficultyWhy || scene
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
