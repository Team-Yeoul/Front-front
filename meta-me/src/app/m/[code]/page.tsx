'use client';

import { Suspense, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import {
  BackButton,
  Badge,
  Button,
  CheckIcon,
  ChoiceChip,
  FlagIcon,
  Img3D,
  LockIcon,
  MessageSquareIcon,
  OptionRow,
  ProgressBar,
  Segmented,
  TextButton,
} from '@/components/ui/primitives';
import { GradientBg } from '@/components/ui/overlays';
import { Wordmark } from '@/components/ui/brand';
import { AXES, TYPE_OPTIONS } from '@/lib/mock';

// 타인 평가(친구 응답) API가 아직 없어 응답은 화면 안에서만 흘러간다.
const RELATIONS = ['학교 · 같은 반', '동아리 · 팀 프로젝트', '가족', '온라인에서 알게 된 사이', '기타'];
const YEARS = [
  { value: 'lt1', label: '1년 미만' },
  { value: '1to3', label: '1–3년' },
  { value: 'gt3', label: '3년 이상' },
] as const;
const SCENES = [
  { title: '같이 과제할 때', sub: '역할을 나누고 마감을 맞출 때' },
  { title: '이야기 나눌 때', sub: '고민이나 일상을 나눌 때' },
  { title: '급한 상황에서', sub: '일이 꼬이거나 시간이 없을 때' },
  { title: '여럿이 놀 때', sub: '모임이나 약속 자리에서' },
];
const ROLES = ['앞에서 이끌었어요', '내용을 정리하고 설명했어요', '분위기와 사람을 챙겼어요', '뒤에서 묵묵히 해냈어요', '잘 모르겠어요'];
const WORDS = ['꼼꼼한', '차분한', '말을 잘하는', '걱정이 많은', '책임감 있는', '느긋한', '솔직한', '눈치 빠른', '고집 있는'];
const MESSAGE_TOPICS = ['고마웠던 점', '응원', '바라는 점'];
const TOPIC_PREFIX = new RegExp(`^(${MESSAGE_TOPICS.join('|')}): `);
const HARD = ['시작하기 전, 준비가 길어질 때', '여러 사람 의견이 부딪힐 때', '계획이 갑자기 바뀔 때', '힘들어 보인 적이 없어요'];
const AXIS_DESC = ['설명하거나 발표할 때', '일을 끌고 가는 정도', '상대 감정을 알아채는 정도', '끝까지 밀고 가는 정도', '급한 상황에서의 태도'];
const OTHERS_AVG = [4.2, 3.2, 3.9, 3.6, 3.3];

type Step = 'landing' | 'relation' | 'scene' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'vote' | 'done';
const Q_STEPS: Step[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

function Stepper({ at }: { at: 0 | 1 | 2 }) {
  const items = ['관계', '장면', '질문 6개'];
  return (
    <div className="flex items-center gap-2">
      {items.map((l, i) => (
        <div key={l} className="flex items-center gap-2">
          {i > 0 && <span className="w-4 h-px bg-[#D5D5DC]" />}
          <span
            className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold ${
              i < at ? 'bg-primary' : i === at ? 'bg-ink text-white' : 'border border-[#C4C4CC] text-mute'
            }`}
          >
            {i < at ? <CheckIcon size={10} /> : i + 1}
          </span>
          <span className={`text-[12px] ${i < at ? 'text-primary' : i === at ? 'font-bold text-ink' : 'text-mute'}`}>{l}</span>
        </div>
      ))}
    </div>
  );
}

function QHeader({ index, onBack }: { index: number; onBack: () => void }) {
  return (
    <div className="px-5">
      <div className="flex items-center justify-between h-14">
        <BackButton onClick={onBack} />
        <span className="font-mono text-[13px] text-mute">
          {index + 1} / {Q_STEPS.length}
        </span>
      </div>
      <ProgressBar value={((index + 1) / Q_STEPS.length) * 100} height={4} className="mt-1" />
    </div>
  );
}

function QTitle({ type, scene, title, caption }: { type: string; scene: string; title: ReactNode; caption?: string }) {
  return (
    <div className="px-5 pt-6">
      <div className="flex gap-2">
        <Badge>{type}</Badge>
        <Badge tone="primary" icon={<FlagIcon />}>
          기준 장면 · {scene}
        </Badge>
      </div>
      <h1 className="text-[22px] font-bold text-ink leading-[1.45] mt-4">{title}</h1>
      {caption && <p className="text-[13px] text-sub mt-2">{caption}</p>}
    </div>
  );
}

function FriendFlow() {
  const router = useRouter();
  const params = useSearchParams();
  // 링크를 보낸 사람의 닉네임 (/mirror/invite에서 ?n=으로 담는다)
  const OWNER = params.get('n')?.trim() || '친구';
  // 친구 응답 API가 없어 이미 모인 다른 친구 응답 수는 알 수 없다(0으로 둔다).
  const priorResponses = 0;

  const [step, setStep] = useState<Step>('landing');
  const [relation, setRelation] = useState(RELATIONS[1]);
  const [years, setYears] = useState<(typeof YEARS)[number]['value']>('1to3');
  const [scene, setScene] = useState(0);
  const [sceneNote, setSceneNote] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [wordDraft, setWordDraft] = useState<string | null>(null);
  const [hard, setHard] = useState<string | null>(null);
  const [hardWhy, setHardWhy] = useState('');
  const [strength, setStrength] = useState('');
  const [scores, setScores] = useState<(number | null)[]>([null, null, null, null, null]);
  const [message, setMessage] = useState('');
  const [voteTab, setVoteTab] = useState<'vote' | 'scale'>('vote');
  const [vote, setVote] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);

  const sceneTitle = SCENES[scene].title;
  const go = (s: Step) => setStep(s);
  const qIndex = Q_STEPS.indexOf(step);
  const prevQ = () => go(qIndex === 0 ? 'scene' : Q_STEPS[qIndex - 1]);
  const nextQ = () => go(qIndex === Q_STEPS.length - 1 ? 'vote' : Q_STEPS[qIndex + 1]);

  if (step === 'landing') {
    return (
      <Screen statusBg="#E6E6FF" background={<GradientBg variant="a" />}>
        <div className="flex flex-col min-h-full">
          <div className="flex justify-center pt-5">
            <Wordmark size={18} />
          </div>
          <div className="flex flex-col items-center text-center px-6 pt-10">
            <div className="relative">
              <Img3D name="envelope" size={120} />
              <span className="absolute -right-6 -top-4 w-11 h-11 rounded-full bg-white shadow flex items-center justify-center text-[16px] text-primary">
                {OWNER[0]}
              </span>
            </div>
            <span className="mt-8 h-8 px-3.5 rounded-full bg-white text-[13px] font-semibold text-primary inline-flex items-center">{OWNER}님의 요청</span>
            <h1 className="text-[24px] font-bold text-ink leading-[1.45] mt-4">
              {OWNER}님이 당신이 보는
              <br />
              {OWNER}님을 궁금해해요
            </h1>
            <p className="text-[14px] text-[#5A5A62] leading-[1.7] mt-3">
              {OWNER}님의 기록은 보여주지 않아요.
              <br />
              당신이 직접 본 모습 그대로 답해주세요.
            </p>
          </div>
          <div className="mt-auto bg-white rounded-t-[28px] px-5 pt-5 pb-4 mt-8">
            <div className="rounded-2xl bg-primary-soft px-4 py-3.5">
              <p className="text-[12px] font-semibold text-primary">{OWNER}님이 남긴 말</p>
              <p className="text-[15px] text-ink mt-1">솔직하게 말해줘. 좋은 말만 안 해도 돼</p>
            </div>
            <div className="grid grid-cols-3 gap-2.5 mt-3">
              {[
                { icon: 'spy' as const, title: '이름 비공개', sub: '로그인·이름 입력 없음' },
                { icon: 'lock3d' as const, title: '3명부터 공개', sub: '모인 결과만 전달' },
                { icon: 'clock' as const, title: '약 3분', sub: '질문 6개' },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl bg-surface flex flex-col items-center text-center px-2 pt-4 pb-3.5">
                  <Img3D name={f.icon} size={44} />
                  <p className="text-[14px] font-bold text-ink mt-2">{f.title}</p>
                  <p className="text-[11px] text-sub mt-1">{f.sub}</p>
                </div>
              ))}
            </div>

            <Button variant="dark" className="mt-3" onClick={() => go('relation')}>
              답하러 가기
            </Button>
          </div>
        </div>
      </Screen>
    );
  }

  if (step === 'relation') {
    return (
      <Screen footer={<Button variant="dark" onClick={() => go('scene')}>다음</Button>}>
        <div className="flex items-center gap-8 px-5 h-14">
          <BackButton onClick={() => go('landing')} />
          <Stepper at={0} />
        </div>
        <div className="px-5 pt-6">
          <h1 className="text-[22px] font-bold text-ink">{OWNER}님과 어떤 사이인가요?</h1>
          <p className="text-[13px] text-sub mt-2">{OWNER}님은 ‘동아리 친구들은 이렇게 봤어요’처럼 관계별로만 볼 수 있어요.</p>
          <div className="flex flex-col gap-2.5 mt-5">
            {RELATIONS.map((r) => (
              <OptionRow key={r} label={r} selected={relation === r} onClick={() => setRelation(r)} round />
            ))}
          </div>
          <p className="text-[16px] font-bold text-ink mt-7">알고 지낸 지 얼마나 됐나요?</p>
          <div className="mt-3">
            <Segmented options={[...YEARS]} value={years} onChange={setYears} />
          </div>
        </div>
      </Screen>
    );
  }

  if (step === 'scene') {
    return (
      <Screen footer={<Button variant="dark" onClick={() => go('q1')}>질문 시작하기</Button>}>
        <div className="flex items-center gap-8 px-5 h-14">
          <BackButton onClick={() => go('relation')} />
          <Stepper at={1} />
        </div>
        <div className="px-5 pt-6">
          <h1 className="text-[22px] font-bold text-ink leading-[1.45]">
            {OWNER}님과 함께한 장면 하나를
            <br />
            떠올려주세요
          </h1>
          <p className="text-[13px] text-sub mt-2 leading-relaxed">이어지는 질문은 이 장면을 기준으로 답하면 돼요. 가장 최근에 본 모습이면 충분해요.</p>
          <div className="grid grid-cols-2 gap-2.5 mt-5">
            {SCENES.map((s, i) => (
              <button key={s.title} onClick={() => setScene(i)} className={`rounded-2xl px-4 py-4 text-left ${scene === i ? 'bg-primary' : 'bg-surface'}`}>
                <p className={`text-[15px] font-bold ${scene === i ? 'text-white' : 'text-ink'}`}>{s.title}</p>
                <p className={`text-[12px] mt-1 ${scene === i ? 'text-white/80' : 'text-sub'}`}>{s.sub}</p>
              </button>
            ))}
          </div>
          <label className="block mt-4 rounded-2xl border border-line px-4 py-3.5">
            <span className="text-[13px] font-semibold text-ink">
              그 장면을 한 줄로 적어도 좋아요 <span className="font-normal text-sub">(선택)</span>
            </span>
            <input
              value={sceneNote}
              onChange={(e) => setSceneNote(e.target.value)}
              placeholder="예: 발표 자료 정리를 맡았을 때"
              className="w-full mt-1.5 bg-transparent outline-none text-[14px] text-ink placeholder:text-mute"
            />
          </label>
        </div>
      </Screen>
    );
  }

  if (step === 'q1' || step === 'q3') {
    const isQ1 = step === 'q1';
    const opts = isQ1 ? ROLES : HARD;
    const value = isQ1 ? role : hard;
    const set = isQ1 ? setRole : setHard;
    return (
      <Screen footer={<Button variant="dark" onClick={nextQ} disabled={!value}>다음</Button>}>
        <QHeader index={qIndex} onBack={prevQ} />
        <QTitle
          type="객관식"
          scene={sceneTitle}
          title={
            isQ1 ? (
              <>
                그 장면에서 {OWNER}님은
                <br />
                어떤 역할이었나요?
              </>
            ) : (
              <>
                {OWNER}님이 가장 힘들어 보였던 건
                <br />
                어떤 때였나요?
              </>
            )
          }
          caption={isQ1 ? '가장 가까운 하나를 골라주세요' : undefined}
        />
        <div className="px-5 pt-5 flex flex-col gap-2.5">
          {opts.map((o) => (
            <OptionRow key={o} label={o} selected={value === o} onClick={() => set(o)} round />
          ))}
          {!isQ1 && (
            <label className="block rounded-2xl bg-surface px-4 py-3.5 mt-2">
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-primary">
                <MessageSquareIcon /> 왜 그렇게 보였어요? <span className="font-normal text-sub">(선택)</span>
              </span>
              <input
                value={hardWhy}
                onChange={(e) => setHardWhy(e.target.value)}
                placeholder="예: 자료를 계속 다시 고치고 있었어요"
                className="w-full mt-1.5 bg-transparent outline-none text-[14px] text-ink placeholder:text-mute"
              />
            </label>
          )}
        </div>
      </Screen>
    );
  }

  if (step === 'q2') {
    return (
      <Screen footer={<Button variant="dark" onClick={nextQ} disabled={words.length === 0}>다음</Button>}>
        <QHeader index={qIndex} onBack={prevQ} />
        <QTitle
          type="복수 선택"
          scene={sceneTitle}
          title={
            <>
              {OWNER}님을 떠올리면
              <br />
              먼저 생각나는 단어는?
            </>
          }
          caption="최대 3개까지 골라주세요"
        />
        <div className="px-5 pt-5">
          <div className="flex flex-wrap gap-2">
            {[...WORDS, ...customWords].map((w) => (
              <ChoiceChip
                key={w}
                label={w}
                selected={words.includes(w)}
                onClick={() => setWords((p) => (p.includes(w) ? p.filter((x) => x !== w) : p.length < 3 ? [...p, w] : p))}
              />
            ))}
            {wordDraft === null ? (
              <ChoiceChip label="+ 직접 입력" selected={false} onClick={() => setWordDraft('')} />
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const w = wordDraft.trim();
                  if (w) {
                    if (![...WORDS, ...customWords].includes(w)) setCustomWords((p) => [...p, w]);
                    setWords((p) => (p.includes(w) || p.length >= 3 ? p : [...p, w]));
                  }
                  setWordDraft(null);
                }}
                className="h-9 pl-4 pr-1 rounded-full bg-surface-2 border border-primary flex items-center gap-1"
              >
                <input
                  autoFocus
                  value={wordDraft}
                  onChange={(e) => setWordDraft(e.target.value)}
                  onBlur={(e) => !e.currentTarget.value.trim() && setWordDraft(null)}
                  maxLength={12}
                  placeholder="단어 입력"
                  className="w-24 bg-transparent outline-none text-[14px] text-ink placeholder:text-mute caret-primary"
                />
                <button type="submit" className="h-7 px-3 rounded-full bg-primary text-[13px] font-semibold text-white">
                  추가
                </button>
              </form>
            )}
          </div>
          <p className="font-mono text-[12px] text-sub mt-4">{words.length} / 3 선택</p>
        </div>
      </Screen>
    );
  }

  if (step === 'q4' || step === 'q6') {
    const isQ4 = step === 'q4';
    const value = isQ4 ? strength : message;
    const set = isQ4 ? setStrength : setMessage;
    return (
      <Screen
        footer={
          <>
            <Button variant="dark" onClick={nextQ} disabled={!value.trim()}>
              다음
            </Button>
            <TextButton className="mt-1" onClick={nextQ}>
              넘어가기
            </TextButton>
          </>
        }
      >
        <QHeader index={qIndex} onBack={prevQ} />
        <QTitle
          type="서술형"
          scene={sceneTitle}
          title={
            isQ4 ? (
              <>
                {OWNER}님이 스스로는 잘 모를 것 같은
                <br />
                장점이 있다면?
              </>
            ) : (
              <>
                마지막으로 {OWNER}님에게
                <br />한 마디 남긴다면?
              </>
            )
          }
          caption={isQ4 ? '한 줄이면 충분해요. 건너뛰어도 괜찮아요.' : '익명으로 그대로 전달돼요. 건너뛰어도 괜찮아요.'}
        />
        <div className="px-5 pt-5">
          {!isQ4 && (
            <div className="flex gap-2 mb-3">
              {MESSAGE_TOPICS.map((c) => (
                <ChoiceChip
                  key={c}
                  size="sm"
                  label={c}
                  selected={value.startsWith(`${c}: `)}
                  onClick={() =>
                    set((v) => {
                      // 말머리는 하나만: 같은 칩을 다시 누르면 빼고, 다른 칩이면 바꾼다.
                      const rest = v.replace(TOPIC_PREFIX, '');
                      return v.startsWith(`${c}: `) ? rest : `${c}: ${rest}`;
                    })
                  }
                />
              ))}
            </div>
          )}
          <div className="rounded-3xl bg-surface px-5 py-5 h-[180px] flex flex-col">
            <textarea
              value={value}
              onChange={(e) => set(e.target.value)}
              placeholder={isQ4 ? '예: 복잡한 걸 설명해주면 다들 바로 이해해요.' : '예: 시작이 늦어도 끝은 늘 좋더라.'}
              className="flex-1 bg-transparent outline-none resize-none text-[15px] text-ink leading-[1.75] placeholder:text-mute caret-primary"
            />
            <span className="text-right text-[12px] text-mute">{value.length}자</span>
          </div>
        </div>
      </Screen>
    );
  }

  if (step === 'q5') {
    const answered = scores.filter((s) => s !== null).length;
    return (
      <Screen footer={<Button variant="dark" onClick={nextQ} disabled={answered < 3}>다음</Button>}>
        <div className="px-5">
          <div className="flex items-center h-14">
            <BackButton onClick={prevQ} />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <ProgressBar value={(5 / 6) * 100} height={4} />
            <span className="font-mono text-[13px] font-semibold text-primary shrink-0">5 / 6</span>
          </div>
        </div>
        <div className="px-5 pt-6">
          <h1 className="text-[20px] font-bold text-ink">이 다섯 가지는 어느 정도라고 느껴요?</h1>
          <p className="text-[13px] text-sub mt-2">감으로 답해도 괜찮아요 · 3개만 골라도 돼요</p>
          <div className="flex justify-between text-[11px] text-sub mt-5 px-1">
            <span>1 · 전혀 아니에요</span>
            <span>5 · 매우 그래요</span>
          </div>
          <div className="flex flex-col gap-2.5 mt-2 pb-4">
            {AXES.map((a, i) => (
              <div key={a} className="rounded-2xl bg-surface px-4 pt-3.5 pb-4">
                <p className="text-[15px] font-bold text-ink">
                  {a} <span className="text-[12px] font-normal text-sub ml-1">{AXIS_DESC[i]}</span>
                </p>
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setScores((s) => s.map((v, j) => (j === i ? n : v)))}
                      className={`h-10 rounded-xl text-[14px] ${scores[i] === n ? 'bg-primary text-white font-semibold' : 'bg-white border border-line text-[#48484F]'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Screen>
    );
  }

  if (step === 'vote') {
    const locked = priorResponses < 2;
    const total = priorResponses + 1;
    return (
      <Screen
        footer={
          <>
            <p className="text-center text-[12px] text-sub mb-3">
              {locked ? '투표가 열리면 같은 링크로 다시 참여할 수 있어요' : voted ? '누가 무엇을 골랐는지는 공개되지 않아요' : '투표하면 다른 친구들의 선택 비율이 보여요'}
            </p>
            {locked || voted ? (
              <Button onClick={() => go('done')}>응답 완료</Button>
            ) : (
              <Button variant="dark" disabled={!vote} onClick={() => setVoted(true)}>
                투표하기
              </Button>
            )}
          </>
        }
      >
        <div className="flex items-center gap-3 px-5 h-14">
          <BackButton onClick={() => go('q6')} />
          <span className="text-[16px] font-bold text-ink">{OWNER}님을 보는 눈</span>
        </div>
        <div className="flex gap-6 px-5 border-b border-line">
          {[
            { k: 'vote' as const, l: '투표' },
            { k: 'scale' as const, l: '척도' },
          ].map((t) => (
            <button key={t.k} onClick={() => setVoteTab(t.k)} className={`relative py-3 text-[15px] ${voteTab === t.k ? 'font-bold text-ink' : 'text-mute'}`}>
              {t.l}
              {voteTab === t.k && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-ink" />}
            </button>
          ))}
        </div>

        {voteTab === 'scale' ? (
          <div className="px-5 pt-6 flex flex-col gap-4">
            <p className="text-[14px] text-sub">내 답과 다른 친구들의 평균이에요 (1–5)</p>
            {AXES.map((a, i) => (
              <div key={a}>
                <div className="flex justify-between text-[13px]">
                  <span className="font-semibold text-ink">{a}</span>
                  <span className="font-mono text-sub">
                    나 {scores[i] ?? '-'} · 평균 {OTHERS_AVG[i]}
                  </span>
                </div>
                <ProgressBar value={(OTHERS_AVG[i] / 5) * 100} className="mt-2" height={6} fill="#A9ABFF" />
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 pt-8">
            <div className="text-center">
              <p className="text-[12px] font-semibold text-primary">마지막 · 유형 투표</p>
              <h1 className="text-[24px] font-bold text-ink leading-[1.45] mt-2">
                {OWNER}님은 어떤 사람인
                <br />
                것 같아요?
              </h1>
              <p className="text-[14px] text-sub mt-3">
                {locked ? (
                  '친구들의 답이 모이면 유형이 만들어져요'
                ) : voted ? (
                  <>
                    나 포함 <b className="text-primary">{total + 2}명</b>의 선택
                  </>
                ) : (
                  <>
                    친구 <b className="text-primary">{total}명</b>의 답에서 뽑은 유형이에요
                  </>
                )}
              </p>
            </div>

            <div className="relative flex flex-col gap-3 mt-6">
              {TYPE_OPTIONS.map((o) => {
                if (locked) {
                  return (
                    <div key={o.key} className="flex items-center gap-4 rounded-2xl bg-surface px-4 h-[72px]">
                      <span className="w-9 h-9 rounded-lg bg-[#E4E4EA]" />
                      <div className="flex-1">
                        <span className="block w-28 h-3 rounded bg-[#E4E4EA]" />
                        <span className="block w-full h-2.5 rounded bg-[#ECECF1] mt-2" />
                      </div>
                    </div>
                  );
                }
                const selected = vote === o.label;
                if (voted) {
                  return (
                    <div key={o.key} className={`relative overflow-hidden flex items-center gap-4 rounded-2xl px-4 h-[72px] ${selected ? 'bg-yellow-soft' : 'bg-surface'}`}>
                      <span className={`absolute inset-y-0 left-0 ${selected ? 'bg-yellow' : 'bg-[#E4E4EA]'}`} style={{ width: `${o.pct}%` }} />
                      <span className={`relative w-9 h-9 rounded-lg bg-ink flex items-center justify-center text-[14px] font-bold ${selected ? 'text-yellow' : 'text-white'}`}>
                        {o.key}
                      </span>
                      <span className="relative flex-1 text-[16px] font-bold text-ink">
                        {o.label} <span className="ml-2 text-[14px] font-normal text-sub">{o.pct}%</span>
                      </span>
                      {selected && (
                        <span className="relative">
                          <CheckIcon size={16} color="#1A1A1E" />
                        </span>
                      )}
                    </div>
                  );
                }
                return (
                  <button
                    key={o.key}
                    onClick={() => setVote(o.label)}
                    className={`flex items-center gap-4 rounded-2xl px-4 h-[72px] text-left border ${selected ? 'bg-primary-soft border-primary' : 'bg-surface border-transparent'}`}
                  >
                    <span className={`w-9 h-9 rounded-lg bg-ink flex items-center justify-center text-[14px] font-bold ${selected ? 'text-yellow' : 'text-white'}`}>
                      {o.key}
                    </span>
                    <span className="flex-1">
                      <span className="block text-[16px] font-bold text-ink">{o.label}</span>
                      <span className="block text-[13px] text-sub mt-0.5">{o.desc}</span>
                    </span>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center ${selected ? 'bg-primary' : 'border-[1.5px] border-[#C4C4CC]'}`}>
                      {selected && <CheckIcon size={12} />}
                    </span>
                  </button>
                );
              })}
              {locked && (
                <div className="absolute inset-x-10 top-[70px] rounded-3xl bg-white shadow-[0_10px_40px_rgba(26,26,30,0.12)] px-5 py-6 flex flex-col items-center">
                  <span className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center">
                    <LockIcon size={20} color="#6367FF" />
                  </span>
                  <p className="text-[16px] font-bold text-ink mt-3">친구 답이 2개 이상 모이면 열려요</p>
                  <p className="text-[13px] text-sub mt-1.5">지금까지 모인 답</p>
                  <div className="flex items-center gap-3 w-full mt-3">
                    <ProgressBar value={(priorResponses / 2) * 100} height={6} />
                    <span className="font-mono text-[13px] font-semibold text-primary shrink-0">{priorResponses} / 2</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center gap-1.5 mt-7">
              <span className="w-6 h-1.5 rounded-full bg-ink" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#D0D0D6]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#D0D0D6]" />
            </div>
          </div>
        )}
      </Screen>
    );
  }

  /* done */
  const total = priorResponses + 1;
  return (
    <Screen
      footer={
        <>
          <Button onClick={() => router.push('/')}>나도 메타미 시작하기</Button>
          <TextButton className="mt-1" onClick={() => window.close()}>
            창 닫기
          </TextButton>
        </>
      }
    >
      <div className="flex flex-col items-center text-center px-8 pt-[200px]">
        <Img3D name="check" size={96} />
        <h1 className="text-[24px] font-bold text-ink mt-4">답변을 보냈어요</h1>
        <p className="text-[14px] text-[#5A5A62] leading-[1.7] mt-3">
          {OWNER}님에게는 누가 무엇을 골랐는지 공개되지 않아요. 3명 이상 모이면 결과가 열립니다.
        </p>
        <span className="mt-6 h-9 px-4 rounded-full bg-surface-2 text-[13px] text-[#48484F] inline-flex items-center gap-1.5">
          <b className="font-mono text-ink">
            {Math.min(total, 3)} / 3
          </b>
          명 응답 완료
        </span>
      </div>
    </Screen>
  );
}

export default function FriendResponsePage() {
  return (
    <Suspense>
      <FriendFlow />
    </Suspense>
  );
}
