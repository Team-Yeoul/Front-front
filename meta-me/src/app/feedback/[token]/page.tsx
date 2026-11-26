'use client';

import { Suspense, useState, type ReactNode } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { router } from '@/lib/router';
import { Img, Pressable, TextInput, View, asset } from '@/components/ui/rn';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Badge, Button, ChoiceChip, Img3D, OptionRow, ProgressBar, Segmented, TextButton } from '@/components/ui/primitives';
import { CheckIcon, FlagIcon, MessageSquareIcon } from '@/components/ui/icons';
import { GradientBg } from '@/components/ui/flows';
import { Wordmark } from '@/components/ui/brand';
import { Span, Text } from '@/components/ui/Text';
import { AXES } from '@/lib/mock';
import { HARD, ROLES, TITLES } from '@/lib/peerFeedback';
import { useGetPeerFeedbackInvitation, useSubmitPeerFeedback, type SubmitPeerFeedbackRequest } from '@/entities/peer-feedback';

/*
 * 친구가 앱 없이 여는 답변 화면 (웹 전용). 질문별 답을 "머리말: 값" 줄로 담아 보내고,
 * 앱·웹의 결과 화면(/mirror/results)은 lib/peerFeedback의 parseFeedback으로 같은 머리말을 다시 읽는다.
 * 고르는 값(역할·힘들어 보였던 때·칭호)은 lib/peerFeedback의 ROLES · HARD · TITLES를 그대로 써서 결과 집계와 이름이 어긋나지 않게 한다.
 */

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
const WORDS = ['꼼꼼한', '차분한', '말을 잘하는', '걱정이 많은', '책임감 있는', '느긋한', '솔직한', '눈치 빠른', '고집 있는'];
const MESSAGE_TOPICS = ['고마웠던 점', '응원', '바라는 점'];
const TOPIC_PREFIX = new RegExp(`^(${MESSAGE_TOPICS.join('|')}): `);
const AXIS_DESC = ['설명하거나 발표할 때', '일을 끌고 가는 정도', '상대 감정을 알아채는 정도', '끝까지 밀고 가는 정도', '급한 상황에서의 태도'];
const MAX_FIELD = 2000;
const SKIPPED = '답하지 않음';

/** 칭호 그림. lib/peerFeedback TITLES의 그림(앱 require)과 같은 파일을 웹 주소로 둔다. */
const TITLE_IMAGE: Record<string, string> = {
  '메타인지 대천사장': asset('feedback/cogni-meta.png'),
  '경청의 달인': asset('feedback/cogni-listen.png'),
  '인정 선생': asset('feedback/cogni-approval.png'),
};
const titleImage = (label: string) => TITLE_IMAGE[label] ?? asset('v2/cogni-default.png');

/**
 * 머리말. lib/peerFeedback의 P와 글자 하나까지 같아야 결과 화면이 읽는다(머리말을 바꾸면 양쪽 함께).
 * 이름은 묻지 않으므로(익명) 보내지 않는다.
 */
const P = {
  relation: '관계: ',
  scene: '기준 장면: ',
  role: '그 장면에서의 역할: ',
  words: '떠오르는 단어: ',
  hard: '힘들어 보였던 때: ',
  hardWhy: '이유: ',
  scores: '점수(1–5): ',
  message: '한 마디: ',
  title: '칭호: ',
};

/** 머리말 뒤 값은 한 줄이어야 다시 읽을 때 잘리지 않는다. */
const oneLine = (s: string) => s.replace(/\s*\n+\s*/g, ' ').trim();

// 서버는 장점·아쉬운 점·인상 세 칸의 글만 받으므로, 질문별 답을 줄 단위로 나눠 담는다.
function buildFeedback(a: {
  relation: string;
  years: string;
  scene: string;
  sceneNote: string;
  role: string | null;
  words: string[];
  hard: string | null;
  hardWhy: string;
  strength: string;
  scores: (number | null)[];
  message: string;
  title: string | null;
}): SubmitPeerFeedbackRequest {
  const lines = (...xs: (string | false | null)[]) => xs.filter(Boolean).join('\n').slice(0, MAX_FIELD) || SKIPPED;
  const scored = AXES.flatMap((axis, i) => (a.scores[i] === null ? [] : [`${axis} ${a.scores[i]}`]));
  const note = oneLine(a.sceneNote);
  const why = oneLine(a.hardWhy);
  const message = oneLine(a.message);
  return {
    // 장점 칸의 머리말 없는 줄은 결과 화면에서 Q4 장점 글로 읽힌다.
    strengths: lines(oneLine(a.strength), a.words.length > 0 && `${P.words}${a.words.join(', ')}`),
    growth_areas: lines(a.hard && `${P.hard}${a.hard}`, why && `${P.hardWhy}${why}`),
    impression: lines(
      `${P.relation}${a.relation} (알고 지낸 지 ${a.years})`,
      `${P.scene}${a.scene}${note ? ` — ${note}` : ''}`,
      a.role && `${P.role}${a.role}`,
      scored.length > 0 && `${P.scores}${scored.join(' · ')}`,
      message && `${P.message}${message}`,
      a.title && `${P.title}${a.title}`,
    ),
  };
}

type Step = 'landing' | 'relation' | 'scene' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'title' | 'done';
const Q_STEPS: Step[] = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

function Stepper({ at }: { at: 0 | 1 | 2 }) {
  const items = ['관계', '장면', '질문 6개'];
  return (
    <View className="flex-row items-center gap-2">
      {items.map((l, i) => (
        <View key={l} className="flex-row items-center gap-2">
          {i > 0 && <View className="w-4 h-px bg-line" />}
          <View
            className={`w-[18px] h-[18px] shrink-0 rounded-full items-center justify-center ${
              i < at ? 'bg-primary-soft' : i === at ? 'bg-primary' : 'border border-line'
            }`}
          >
            {i < at ? <CheckIcon size={10} color="#6367FF" /> : <Text className={`text-[10px] font-bold ${i === at ? 'text-white' : 'text-mute'}`}>{i + 1}</Text>}
          </View>
          <Text className={`text-[12px] ${i < at ? 'text-primary' : i === at ? 'font-bold text-ink' : 'text-mute'}`}>{l}</Text>
        </View>
      ))}
    </View>
  );
}

function StepHeader({ at, onBack }: { at: 0 | 1 | 2; onBack: () => void }) {
  return (
    <View className="flex-row items-center gap-6 px-5 h-14 shrink-0">
      <BackButton onPress={onBack} />
      <Stepper at={at} />
    </View>
  );
}

function QHeader({ index, onBack }: { index: number; onBack: () => void }) {
  return (
    <View className="px-5">
      <View className="flex-row items-center justify-between h-14">
        <BackButton onPress={onBack} />
        <Text className="text-[14px] font-semibold text-primary tabular-nums">
          {index + 1} / {Q_STEPS.length}
        </Text>
      </View>
      <ProgressBar value={((index + 1) / Q_STEPS.length) * 100} height={4} className="mt-2" />
    </View>
  );
}

function QTitle({ type, scene, title, caption }: { type: string; scene: string; title: ReactNode; caption?: string }) {
  return (
    <View className="px-5 pt-6">
      <View className="flex-row gap-2">
        <Badge>{type}</Badge>
        <Badge tone="primary" icon={<FlagIcon />}>
          기준 장면 · {scene}
        </Badge>
      </View>
      <Text accessibilityRole="header" className="text-[24px] font-bold text-ink leading-[34px] mt-4">
        {title}
      </Text>
      {caption && <Text className="text-[14px] text-sub leading-[22px] mt-2">{caption}</Text>}
    </View>
  );
}

/** 회색 칸 안의 한 줄 입력 (라벨 + 입력) */
function InputBox({ label, value, onChange, placeholder, maxLength = 200 }: { label: ReactNode; value: string; onChange: (v: string) => void; placeholder: string; maxLength?: number }) {
  return (
    <View className="rounded-2xl bg-surface px-4 py-3.5">
      {label}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full mt-1.5 text-[16px] text-ink"
      />
    </View>
  );
}

function FriendFlow() {
  const params = useSearchParams();
  const { token } = useParams<{ token: string }>();
  // 없는 링크는 404, 만료·사용·취소된 링크는 410으로 온다.
  const invitation = useGetPeerFeedbackInvitation(token);
  const submit = useSubmitPeerFeedback(token);
  // 링크를 보낸 사람의 닉네임 (/mirror/invite에서 ?n=으로 담는다)
  const OWNER = params.get('n')?.trim() || '친구';

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
  const [title, setTitle] = useState<string | null>(null);

  const sceneTitle = SCENES[scene].title;
  const go = (s: Step) => setStep(s);
  const qIndex = Q_STEPS.indexOf(step);
  const prevQ = () => go(qIndex === 0 ? 'scene' : Q_STEPS[qIndex - 1]);
  const nextQ = () => go(qIndex === Q_STEPS.length - 1 ? 'title' : Q_STEPS[qIndex + 1]);

  const finish = (withTitle: string | null) => {
    if (submit.isPending) return;
    submit.mutate(
      buildFeedback({
        relation,
        years: YEARS.find((y) => y.value === years)!.label,
        scene: sceneTitle,
        sceneNote,
        role,
        words,
        hard,
        hardWhy,
        strength,
        scores,
        message,
        title: withTitle,
      }),
      { onSuccess: () => go('done') },
    );
  };

  const addWord = () => {
    // 단어는 쉼표로 나눠 읽으므로 쉼표는 뺀다.
    const w = (wordDraft ?? '').replace(/,/g, ' ').trim();
    if (w) {
      if (![...WORDS, ...customWords].includes(w)) setCustomWords((p) => [...p, w]);
      setWords((p) => (p.includes(w) || p.length >= 3 ? p : [...p, w]));
    }
    setWordDraft(null);
  };

  if (invitation.isError && step !== 'done') {
    return (
      <Screen footer={<Button onPress={() => router.push('/')}>메타미 둘러보기</Button>}>
        <View className="items-center px-8 pt-[200px]">
          <Img3D name="envelope" size={96} />
          <Text accessibilityRole="header" className="text-[24px] font-bold text-ink mt-4 text-center">
            이 링크는 더 쓸 수 없어요
          </Text>
          <Text className="text-[14px] text-body leading-[23px] mt-3 text-center">{`이미 답했거나, 7일이 지났거나, 취소된 링크예요.\n${OWNER}님에게 새 링크를 받아 주세요.`}</Text>
        </View>
      </Screen>
    );
  }

  if (step === 'landing') {
    return (
      <Screen bg="#E6E6FF" background={<GradientBg variant="a" />} contentClassName="min-h-full">
        <View className="flex-1 min-h-full">
          <View className="items-center pt-5">
            <Wordmark size={18} />
          </View>
          <View className="items-center px-6 pt-10">
            <View>
              <Img3D name="envelope" size={120} />
              <View
                className="absolute -right-6 -top-4 w-11 h-11 rounded-full bg-page items-center justify-center"
                style={{ boxShadow: '0 4px 12px rgba(30,30,60,0.12)' }}
              >
                <Text className="text-[16px] font-bold text-primary">{OWNER[0]}</Text>
              </View>
            </View>
            <View className="mt-8 h-8 px-3.5 rounded-full bg-page justify-center">
              <Text className="text-[12px] font-semibold text-primary">{OWNER}님의 요청</Text>
            </View>
            <Text accessibilityRole="header" className="text-[24px] font-bold text-ink leading-[34px] mt-4 text-center">
              {`${OWNER}님이 당신이 보는\n${OWNER}님을 궁금해해요`}
            </Text>
            <Text className="text-[14px] text-body leading-[23px] mt-3 text-center">{`${OWNER}님의 기록은 보여주지 않아요.\n당신이 직접 본 모습 그대로 답해주세요.`}</Text>
          </View>
          <View className="mt-auto pt-8">
            <View className="bg-page rounded-t-[28px] px-5 pt-5 pb-4">
              <View className="rounded-2xl bg-primary-soft px-4 py-3.5">
                <Text className="text-[12px] font-semibold text-primary">이렇게 답해 주세요</Text>
                <Text className="text-[16px] text-ink leading-[24px] mt-1">좋은 말만 하지 않아도 괜찮아요. 본 그대로가 가장 도움이 돼요.</Text>
              </View>
              <View className="flex-row gap-2.5 mt-3">
                {[
                  { icon: 'spy' as const, title: '이름 비공개', sub: '로그인·이름 입력 없음' },
                  { icon: 'lock3d' as const, title: '3명부터 공개', sub: '모인 결과만 전달' },
                  { icon: 'clock' as const, title: '약 3분', sub: '질문 6개' },
                ].map((f) => (
                  <View key={f.title} className="flex-1 rounded-2xl bg-surface items-center px-2 pt-4 pb-3.5">
                    <Img3D name={f.icon} size={44} />
                    <Text className="text-[14px] font-bold text-ink mt-2 text-center">{f.title}</Text>
                    <Text className="text-[10px] text-sub mt-1 text-center">{f.sub}</Text>
                  </View>
                ))}
              </View>
              <Button className="mt-3" onPress={() => go('relation')}>
                답하러 가기
              </Button>
            </View>
          </View>
        </View>
      </Screen>
    );
  }

  if (step === 'relation') {
    return (
      <Screen footer={<Button onPress={() => go('scene')}>다음</Button>}>
        <StepHeader at={0} onBack={() => go('landing')} />
        <View className="px-5 pt-6 pb-6">
          <Text accessibilityRole="header" className="text-[24px] font-bold text-ink">
            {OWNER}님과 어떤 사이인가요?
          </Text>
          <Text className="text-[14px] text-sub leading-[22px] mt-2">{OWNER}님은 ‘동아리 친구들은 이렇게 봤어요’처럼 관계별로만 볼 수 있어요.</Text>
          <View className="gap-2.5 mt-5">
            {RELATIONS.map((r) => (
              <OptionRow key={r} label={r} selected={relation === r} onPress={() => setRelation(r)} round />
            ))}
          </View>
          <Text className="text-[16px] font-bold text-ink mt-7">알고 지낸 지 얼마나 됐나요?</Text>
          <View className="mt-3">
            <Segmented options={[...YEARS]} value={years} onChange={setYears} />
          </View>
        </View>
      </Screen>
    );
  }

  if (step === 'scene') {
    return (
      <Screen footer={<Button onPress={() => go('q1')}>질문 시작하기</Button>}>
        <StepHeader at={1} onBack={() => go('relation')} />
        <View className="px-5 pt-6 pb-6">
          <Text accessibilityRole="header" className="text-[24px] font-bold text-ink leading-[34px]">
            {`${OWNER}님과 함께한 장면 하나를\n떠올려주세요`}
          </Text>
          <Text className="text-[14px] text-sub leading-[22px] mt-2">이어지는 질문은 이 장면을 기준으로 답하면 돼요. 가장 최근에 본 모습이면 충분해요.</Text>
          <View className="flex-row flex-wrap mt-5" style={{ marginLeft: -5, marginRight: -5 }}>
            {SCENES.map((s, i) => {
              const on = scene === i;
              return (
                <View key={s.title} className="w-1/2 shrink-0 px-[5px] pb-2.5">
                  <Pressable
                    onPress={() => setScene(i)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    className={`rounded-2xl px-4 py-4 ${on ? 'bg-primary' : 'bg-surface'}`}
                  >
                    <Text className={`text-[16px] font-bold ${on ? 'text-white' : 'text-ink'}`}>{s.title}</Text>
                    <Text className={`text-[12px] mt-1 ${on ? 'text-white/80' : 'text-sub'}`}>{s.sub}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
          <View className="mt-1.5">
            <InputBox
              label={
                <Text className="text-[12px] font-semibold text-ink">
                  그 장면을 한 줄로 적어도 좋아요 <Span className="font-normal text-sub">(선택)</Span>
                </Text>
              }
              value={sceneNote}
              onChange={setSceneNote}
              placeholder="예: 발표 자료 정리를 맡았을 때"
            />
          </View>
        </View>
      </Screen>
    );
  }

  if (step === 'q1' || step === 'q3') {
    const isQ1 = step === 'q1';
    const opts = isQ1 ? ROLES : HARD;
    const value = isQ1 ? role : hard;
    const set = isQ1 ? setRole : setHard;
    return (
      <Screen footer={<Button onPress={nextQ} disabled={!value}>다음</Button>}>
        <QHeader index={qIndex} onBack={prevQ} />
        <QTitle
          type="객관식"
          scene={sceneTitle}
          title={isQ1 ? `그 장면에서 ${OWNER}님은\n어떤 역할이었나요?` : `${OWNER}님이 가장 힘들어 보였던 건\n어떤 때였나요?`}
          caption={isQ1 ? '가장 가까운 하나를 골라주세요' : undefined}
        />
        <View className="px-5 pt-5 pb-6 gap-2.5">
          {opts.map((o) => (
            <OptionRow key={o} label={o} selected={value === o} onPress={() => set(o)} round />
          ))}
          {!isQ1 && (
            <View className="mt-2">
              <InputBox
                label={
                  <View className="flex-row items-center gap-1.5">
                    <MessageSquareIcon />
                    <Text className="text-[12px] font-semibold text-primary">
                      왜 그렇게 보였어요? <Span className="font-normal text-sub">(선택)</Span>
                    </Text>
                  </View>
                }
                value={hardWhy}
                onChange={setHardWhy}
                placeholder="예: 자료를 계속 다시 고치고 있었어요"
              />
            </View>
          )}
        </View>
      </Screen>
    );
  }

  if (step === 'q2') {
    return (
      <Screen footer={<Button onPress={nextQ} disabled={words.length === 0}>다음</Button>}>
        <QHeader index={qIndex} onBack={prevQ} />
        <QTitle type="복수 선택" scene={sceneTitle} title={`${OWNER}님을 떠올리면\n먼저 생각나는 단어는?`} caption="최대 3개까지 골라주세요" />
        <View className="px-5 pt-5 pb-6">
          <View className="flex-row flex-wrap gap-2">
            {[...WORDS, ...customWords].map((w) => (
              <ChoiceChip
                key={w}
                label={w}
                selected={words.includes(w)}
                onPress={() => setWords((p) => (p.includes(w) ? p.filter((x) => x !== w) : p.length < 3 ? [...p, w] : p))}
              />
            ))}
            {wordDraft === null ? (
              <ChoiceChip label="+ 직접 입력" selected={false} onPress={() => setWordDraft('')} />
            ) : (
              <View className="h-9 pl-3.5 pr-1 rounded-full bg-surface border border-primary flex-row items-center gap-1">
                <TextInput
                  autoFocus
                  value={wordDraft}
                  onChangeText={setWordDraft}
                  onSubmitEditing={addWord}
                  onBlur={() => !wordDraft.trim() && setWordDraft(null)}
                  maxLength={12}
                  placeholder="단어 입력"
                  className="w-24 text-[14px] text-ink"
                />
                <Pressable onPress={addWord} accessibilityRole="button" className="h-7 px-3 rounded-full bg-primary justify-center active:opacity-80">
                  <Text className="text-[12px] font-semibold text-white">추가</Text>
                </Pressable>
              </View>
            )}
          </View>
          <Text className="text-[12px] text-sub mt-4 tabular-nums">{words.length} / 3 선택</Text>
        </View>
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
            <Button onPress={nextQ} disabled={!value.trim()}>
              다음
            </Button>
            <TextButton className="mt-1" onPress={nextQ}>
              넘어가기
            </TextButton>
          </>
        }
      >
        <QHeader index={qIndex} onBack={prevQ} />
        <QTitle
          type="서술형"
          scene={sceneTitle}
          title={isQ4 ? `${OWNER}님이 스스로는 잘 모를 것 같은\n장점이 있다면?` : `마지막으로 ${OWNER}님에게\n한 마디 남긴다면?`}
          caption={isQ4 ? '한 줄이면 충분해요. 건너뛰어도 괜찮아요.' : '익명으로 그대로 전달돼요. 건너뛰어도 괜찮아요.'}
        />
        <View className="px-5 pt-5 pb-6">
          {!isQ4 && (
            <View className="flex-row gap-2 mb-3">
              {MESSAGE_TOPICS.map((c) => (
                <ChoiceChip
                  key={c}
                  size="sm"
                  label={c}
                  selected={value.startsWith(`${c}: `)}
                  onPress={() =>
                    set((v) => {
                      // 말머리는 하나만: 같은 칩을 다시 누르면 빼고, 다른 칩이면 바꾼다.
                      const rest = v.replace(TOPIC_PREFIX, '');
                      return v.startsWith(`${c}: `) ? rest : `${c}: ${rest}`;
                    })
                  }
                />
              ))}
            </View>
          )}
          <View className="rounded-[24px] bg-surface px-5 py-5 min-h-[180px]">
            <TextInput
              multiline
              value={value}
              onChangeText={set}
              maxLength={500}
              placeholder={isQ4 ? '예: 복잡한 걸 설명해주면 다들 바로 이해해요.' : '예: 시작이 늦어도 끝은 늘 좋더라.'}
              className="flex-1 min-h-[110px] text-[16px] text-ink leading-[26px]"
            />
            <Text className="text-right text-[12px] text-mute tabular-nums mt-2">{value.length}자</Text>
          </View>
        </View>
      </Screen>
    );
  }

  if (step === 'q5') {
    const answered = scores.filter((s) => s !== null).length;
    return (
      <Screen footer={<Button onPress={nextQ} disabled={answered < 3}>다음</Button>}>
        <QHeader index={qIndex} onBack={prevQ} />
        <View className="px-5 pt-6 pb-6">
          <View className="flex-row gap-2">
            <Badge>척도</Badge>
          </View>
          <Text accessibilityRole="header" className="text-[24px] font-bold text-ink leading-[34px] mt-4">
            이 다섯 가지는 어느 정도라고 느껴요?
          </Text>
          <Text className="text-[14px] text-sub mt-2">감으로 답해도 괜찮아요 · 3개만 골라도 돼요</Text>
          <View className="flex-row justify-between mt-5 px-1">
            <Text className="text-[10px] text-sub">1 · 전혀 아니에요</Text>
            <Text className="text-[10px] text-sub">5 · 매우 그래요</Text>
          </View>
          <View className="gap-2.5 mt-2">
            {AXES.map((a, i) => (
              <View key={a} className="rounded-2xl bg-surface px-4 pt-3.5 pb-4">
                <Text className="text-[16px] font-bold text-ink">
                  {a} <Span className="text-[12px] font-normal text-sub ml-1">{AXIS_DESC[i]}</Span>
                </Text>
                <View className="flex-row gap-2 mt-3">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const on = scores[i] === n;
                    return (
                      <Pressable
                        key={n}
                        onPress={() => setScores((s) => s.map((v, j) => (j === i ? n : v)))}
                        accessibilityRole="radio"
                        accessibilityLabel={`${a} ${n}점`}
                        accessibilityState={{ checked: on }}
                        className={`flex-1 h-10 rounded-xl items-center justify-center ${on ? 'bg-primary' : 'bg-page border border-line'}`}
                      >
                        <Text className={`text-[14px] tabular-nums ${on ? 'font-semibold text-white' : 'text-body'}`}>{n}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>
      </Screen>
    );
  }

  if (step === 'title') {
    return (
      <Screen
        footer={
          <>
            <Text className={`text-center text-[12px] mb-3 ${submit.isError ? 'text-danger' : 'text-sub'}`}>
              {submit.isError ? '답을 보내지 못했어요. 다시 눌러 주세요.' : '응답 완료를 누르면 답이 익명으로 전달돼요'}
            </Text>
            <Button onPress={() => finish(title)} disabled={!title} loading={submit.isPending && !!title}>
              응답 완료
            </Button>
            <TextButton className="mt-1" onPress={() => finish(null)} disabled={submit.isPending}>
              칭호 없이 보내기
            </TextButton>
          </>
        }
      >
        <View className="flex-row items-center h-14 px-5 shrink-0">
          <BackButton onPress={() => go('q6')} />
        </View>
        <View className="px-5 pt-4 pb-6">
          <Text className="text-[12px] font-semibold text-primary">마지막 · 칭호</Text>
          <Text accessibilityRole="header" className="text-[24px] font-bold text-ink leading-[34px] mt-2">
            {`${OWNER}님에게 칭호를\n붙여 준다면?`}
          </Text>
          <Text className="text-[14px] text-sub leading-[22px] mt-2">가장 잘 어울리는 하나를 골라주세요. 누가 골랐는지는 공개되지 않아요.</Text>
          <View className="flex-row flex-wrap mt-5" style={{ marginLeft: -5, marginRight: -5 }}>
            {TITLES.map((t) => {
              const on = title === t.label;
              return (
                <View key={t.label} className="w-1/2 shrink-0 px-[5px] pb-2.5">
                  <Pressable
                    onPress={() => setTitle(on ? null : t.label)}
                    accessibilityRole="radio"
                    accessibilityLabel={t.label}
                    accessibilityState={{ checked: on }}
                    className={`rounded-[20px] items-center px-3 pt-4 pb-4 border ${on ? 'bg-primary-soft border-primary' : 'bg-surface border-transparent'}`}
                  >
                    <View className="w-[72px] h-[72px] shrink-0 rounded-full bg-page items-center justify-center overflow-hidden">
                      <Img src={titleImage(t.label)} size={60} contentFit="contain" alt="" />
                    </View>
                    <Text className={`text-[14px] font-bold mt-2.5 text-center ${on ? 'text-primary-pressed' : 'text-ink'}`}>{t.label}</Text>
                    {on && (
                      <View className="absolute top-3 right-3 w-[22px] h-[22px] rounded-full bg-primary items-center justify-center">
                        <CheckIcon size={13} />
                      </View>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      </Screen>
    );
  }

  /* done */
  return (
    <Screen
      footer={
        <>
          <Button onPress={() => router.push('/')}>나도 메타미 시작하기</Button>
          <TextButton className="mt-1" onPress={() => window.close()}>
            창 닫기
          </TextButton>
        </>
      }
    >
      <View className="items-center px-8 pt-[200px]">
        <Img3D name="check" size={96} />
        <Text accessibilityRole="header" className="text-[24px] font-bold text-ink mt-4 text-center">
          답변을 보냈어요
        </Text>
        <Text className="text-[14px] text-body leading-[23px] mt-3 text-center">{`${OWNER}님에게는 누가 무엇을 골랐는지 공개되지 않아요.\n친구 3명 이상이 답하면 결과가 열립니다.`}</Text>
      </View>
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
