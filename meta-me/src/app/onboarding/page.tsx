'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMyAccount, useSubmitOnboarding } from '@/entities/user';
import { useAuthStore } from '@/store';
import { ApiError } from '@/shared/api';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, CheckIcon, Dots, Img3D, OptionRow, TextButton } from '@/components/ui/primitives';
import { GradientBg } from '@/components/ui/overlays';
import { AnalyzingScreen, AskFriendSheet, CogniHero, FeatureIcons } from '@/components/ui/flows';
import { HourSlider } from '@/components/ui/HourSlider';
import { FIRST_COGNI, useMe } from '@/hooks/useMe';
import { ONBOARDING_QUESTIONS, type OnboardingQuestion } from './questions';

type Phase = 'intro' | 'question' | 'analyzing' | 'result' | 'outro';
type Answer = string | string[] | number | undefined;

/* ── 인트로 / 아웃트로 슬라이드 ─────────────────────────── */

function Slide({
  variant,
  children,
  align = 'left',
  hint,
  dots,
  onNext,
  onSkip,
  cta,
}: {
  variant: 'a' | 'b' | 'c';
  children: ReactNode;
  align?: 'left' | 'center';
  hint?: string;
  dots?: [number, number];
  onNext: () => void;
  onSkip?: () => void;
  cta?: string;
}) {
  return (
    <Screen statusBg={variant === 'c' ? '#FFF6D8' : '#E6E6FF'} background={<GradientBg variant={variant} />}>
      <div className="relative h-full flex flex-col" onClick={cta ? undefined : onNext}>
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
        <div className={`flex-1 flex flex-col justify-center px-10 ${align === 'center' ? 'items-center text-center' : ''}`}>
          {children}
        </div>
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

const slideTitle = 'text-[26px] font-bold text-ink leading-[1.55]';

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
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [askOpen, setAskOpen] = useState(false);
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

  const submit = async () => {
    const byId = (id: string) => labelOf(answers[id], ONBOARDING_QUESTIONS.find((x) => x.id === id)) || '아직 모르겠어요';
    const sentence = labelOf(answers.my_one_sentence);
    if (sentence) me.patch((u) => ({ ...u, mySentence: sentence }));
    try {
      // v2 온보딩 질문은 API 필드(4개 문장)와 1:1로 맞지 않아 가장 가까운 답을 묶어서 보낸다.
      const res = await submitOnboarding.mutateAsync({
        my_one_sentence: byId('my_one_sentence'),
        self_strength: byId('self_awareness'),
        others_feedback: byId('repeating_pattern'),
        favorite_thing: byId('curious_about'),
      });
      if (typeof res.accuracy_percent === 'number') setAccuracy(res.accuracy_percent);
      setSubmitted(true);
      return true;
    } catch (err) {
      // 이미 제출된 계정(409)은 성공으로 본다. 그 외 실패는 마칠 때 한 번 더 시도한다.
      const already = err instanceof ApiError && err.code === 'ONBOARDING_ALREADY_SUBMITTED';
      if (already) setSubmitted(true);
      return already;
    }
  };

  // 온보딩에서 발견한 첫 코그니를 도감(기기 저장)에 넣는다. 메인·마이페이지 캐릭터도 이걸 쓴다.
  const discover = () => {
    me.addCogni({ ...FIRST_COGNI, foundAt: new Date().toISOString() });
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
    if (slide === 0)
      return (
        <Slide variant="a" dots={[0, 3]} hint="옆으로 밀어서 계속" onNext={go}>
          <p className="font-mono text-[12px] tracking-[0.2em] text-[#5A5A62]">METAME</p>
          <h1 className={`${slideTitle} mt-6`}>
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
        <Slide variant="b" dots={[1, 3]} hint="옆으로 밀어서 계속" onNext={go} onSkip={skip}>
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
      <Slide variant="c" dots={[2, 3]} onNext={go} onSkip={skip} cta="첫 질문 보기">
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
          <>
            <Button variant={isLast ? 'primary' : 'dark'} onClick={next} disabled={!isAnswered(q, answer)}>
              {isLast ? '답변 마치기' : `다음 (${qIndex + 1}/${total})`}
            </Button>
            {!isLast && (
              <TextButton className="mt-1" onClick={next}>
                넘어가기
              </TextButton>
            )}
          </>
        }
      >
        <div className="px-5">
          <div className="flex items-center justify-between h-14">
            <BackButton onClick={() => (qIndex === 0 ? setPhase('intro') : setQIndex(qIndex - 1))} />
            <span className="font-mono text-[13px] text-mute">
              {qIndex + 1} / {total}
            </span>
          </div>
          <div className="flex gap-2 mt-2">
            {ONBOARDING_QUESTIONS.map((x, i) => (
              <span key={x.id} className={`w-1.5 h-1.5 rounded-full ${i === qIndex ? 'bg-primary scale-125' : 'bg-[#D8D8DE]'}`} />
            ))}
          </div>
          {titleFirst && <div className="mt-8">{title}</div>}
          <div className={`flex justify-center ${titleFirst ? 'mt-8 mb-6' : 'mt-[140px] mb-8'}`}>
            <Img3D name={q.icon} size={titleFirst ? 100 : 104} />
          </div>
          {!titleFirst && title}
          <div className="mt-4 pb-4">
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
  if (phase === 'result') {
    return (
      <CogniHero
        eyebrow={displayName ? `${displayName}님의 첫 코그니는` : '나의 첫 코그니는'}
        name={
          <>
            꼼꼼한
            <br />
            설계자
          </>
        }
        character="cogni-headphone"
        category="No.01 · 행동 · 습관 패턴"
        features={[
          { icon: FeatureIcons.target, text: '계획을 먼저 세워야 마음이 놓여요' },
          { icon: FeatureIcons.clock, text: '시작 전에 준비가 길어지곤 해요' },
          { icon: FeatureIcons.bolt, text: '마감이 보이면 확 몰입해요' },
        ]}
        counterLabel="온보딩 답 10개에서 발견"
        counter="01 / 24"
        primaryLabel="여정 시작하기"
        onPrimary={() => setPhase('outro')}
        onBack={() => setPhase('question')}
        askFriend={() => setAskOpen(true)}
        overlay={
          <AskFriendSheet open={askOpen} onClose={() => setAskOpen(false)} myType={FIRST_COGNI.name} onAsk={() => router.push('/mirror/invite')} />
        }
      />
    );
  }

  /* 아웃트로 */
  const finish = async () => {
    if (!submitted) await submit();
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
      <span className="mt-6 h-9 px-4 rounded-full bg-white text-[13px] font-semibold text-primary inline-flex items-center">
        정확도 {accuracy}%에서 출발합니다
      </span>
    </Slide>
  );
}
