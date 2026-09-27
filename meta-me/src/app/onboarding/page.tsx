'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubmitOnboarding } from '@/entities/user';
import type { OnboardingRequest } from '@/entities/user';
import { SplashSlide } from './_components/SplashSlide';
import { MultiChoiceQuestion } from './_components/MultiChoiceQuestion';
import { ScaleQuestion } from './_components/ScaleQuestion';
import { CardGridQuestion } from './_components/CardGridQuestion';
import { ListChoiceQuestion } from './_components/ListChoiceQuestion';
import { SURVEY_QUESTIONS } from './_components/surveyQuestions';

type Step = 'intro' | 'survey' | 'notification' | 'description' | 'done' | 'sentenceChange' | 'day0' | 'day1';

type QuestionKey = keyof OnboardingRequest;
type SurveyAnswer = string[] | number | string;

const INTRO_SLIDES = [
  { heading: <>안녕하세요.<br />처음부터 무거운 질문은<br />하지 않을게요.</> },
  {
    eyebrow: 'METAME',
    heading: (
      <>
        앞으로 당신을 더 잘 이해해서
        <br />
        도와드릴 수 있도록,
        <br />
        가볍게 3가지만 골라주세요.
      </>
    ),
    body: '약 2분 · 9개 질문',
  },
  { heading: <>잘 모르겠으면&ldquo;아직 모르겠어요&rdquo;를 골라도 괜찮아요.</> },
];

const QUESTIONS: { key: QuestionKey; title: React.ReactNode; caption: string }[] = [
  {
    key: 'my_one_sentence',
    title: <>당신은 스스로를<br />한 문장으로 설명할<br />수 있나요?</>,
    caption: '생각보다 우리는 스스로를 정확히 모를 수도 있어요',
  },
  {
    key: 'self_strength',
    title: <>당신이 생각하는<br />당신의 장점은<br />무엇인가요?</>,
    caption: '스스로를 조금 더 들여다볼까요',
  },
  {
    key: 'others_feedback',
    title: <>다른 사람들에게<br />자주 듣는 말이<br />있다면?</>,
    caption: '남들이 보는 나도 나를 이루는 한 조각이에요',
  },
  {
    key: 'favorite_thing',
    title: <>당신이 좋아한다고<br />생각하는 것은<br />무엇인가요?</>,
    caption: '거의 다 왔어요',
  },
];

function isSurveyAnswerValid(q: (typeof SURVEY_QUESTIONS)[number], answer: SurveyAnswer | undefined) {
  if (q.type === 'multi') return Array.isArray(answer) && answer.length > 0;
  if (q.type === 'scale') return typeof answer === 'number';
  return typeof answer === 'string' && answer.length > 0;
}

export default function OnboardingPage() {
  const router = useRouter();
  const submitOnboardingMutation = useSubmitOnboarding();
  const [step, setStep] = useState<Step>('intro');
  const [introIndex, setIntroIndex] = useState(0);
  const [surveyIndex, setSurveyIndex] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, SurveyAnswer>>({});
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingRequest>>({});
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [aiSentence, setAiSentence] = useState('');
  const [accuracyPercent, setAccuracyPercent] = useState(12);
  const loading = submitOnboardingMutation.isPending;

  const question = QUESTIONS[qIndex];
  const currentAnswer = answers[question.key] ?? '';
  const hasText = currentAnswer.trim().length > 0;

  useEffect(() => {
    if (step !== 'done') return;
    const t = setTimeout(() => setStep('sentenceChange'), 2200);
    return () => clearTimeout(t);
  }, [step]);

  const handleQuestionSubmit = async () => {
    if (!hasText || loading) return;

    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(qIndex + 1);
      return;
    }

    try {
      const res = await submitOnboardingMutation.mutateAsync(answers as OnboardingRequest);
      if (res.ai_first_sentence && /[가-힣]/.test(res.ai_first_sentence)) {
        setAiSentence(res.ai_first_sentence);
      }
      if (typeof res.accuracy_percent === 'number') {
        setAccuracyPercent(res.accuracy_percent);
      }
    } catch {
      // 실패해도 다음 단계로 진행
    } finally {
      setStep('done');
    }
  };

  // ── 인트로 스플래시 ──
  if (step === 'intro') {
    const slide = INTRO_SLIDES[introIndex];
    const goNext = () => {
      if (introIndex < INTRO_SLIDES.length - 1) {
        setIntroIndex(introIndex + 1);
      } else {
        setStep('survey');
      }
    };
    return (
      <SplashSlide
        eyebrow={slide.eyebrow}
        heading={slide.heading}
        body={slide.body}
        chip={
          introIndex === INTRO_SLIDES.length - 1 ? (
            <span className="inline-block text-[13px] font-semibold text-gray-900 bg-[#FFE9A8] px-4 py-2 rounded-full">
              아직 모르겠어요
            </span>
          ) : undefined
        }
        ctaLabel={introIndex === INTRO_SLIDES.length - 1 ? '첫 질문 보기' : undefined}
        align="left"
        onNext={goNext}
        onSkip={() => setStep('notification')}
        dotIndex={introIndex}
        dotCount={INTRO_SLIDES.length}
      />
    );
  }

  // ── 9문항 설문 ──
  if (step === 'survey') {
    const q = SURVEY_QUESTIONS[surveyIndex];
    const answer = surveyAnswers[q.id];
    const valid = isSurveyAnswerValid(q, answer);
    const setAnswer = (value: SurveyAnswer) => setSurveyAnswers((prev) => ({ ...prev, [q.id]: value }));

    const goNext = () => {
      if (surveyIndex < SURVEY_QUESTIONS.length - 1) {
        setSurveyIndex(surveyIndex + 1);
      } else {
        setStep('notification');
      }
    };

    return (
      <div className="flex flex-col h-full bg-white">
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <button
            onClick={() => (surveyIndex > 0 ? setSurveyIndex(surveyIndex - 1) : setStep('intro'))}
            className="w-8 h-8 flex items-center justify-center -ml-2"
            aria-label="뒤로"
          >
            <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
              <path d="M8 1.5L1.5 7.5L8 13.5" stroke="#1C1C1E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="text-[12px] text-gray-300">
            {surveyIndex + 1} / {SURVEY_QUESTIONS.length}
          </span>
        </div>

        <div className="px-6 pb-2 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-[#8287FF] transition-all"
              style={{ width: `${((surveyIndex + 1) / SURVEY_QUESTIONS.length) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-[#8287FF] shrink-0">
            {Math.round(((surveyIndex + 1) / SURVEY_QUESTIONS.length) * 100)}%
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-4">
          <h2 className="text-[19px] font-bold text-gray-900 leading-[1.4] mb-1.5">{q.title}</h2>
          {q.caption && <p className="text-[13px] text-gray-400 mb-5">{q.caption}</p>}
          {!q.caption && <div className="mb-5" />}

          {q.type === 'multi' && (
            <MultiChoiceQuestion
              options={q.options}
              max={q.max}
              selected={(answer as string[]) ?? []}
              onChange={setAnswer}
            />
          )}
          {q.type === 'scale' && (
            <ScaleQuestion
              options={q.options}
              selected={typeof answer === 'number' ? answer : null}
              onChange={setAnswer}
            />
          )}
          {q.type === 'cardgrid' && (
            <CardGridQuestion
              options={q.options}
              selected={(answer as string) ?? ''}
              onChange={setAnswer}
              note={q.note}
            />
          )}
          {q.type === 'list' && (
            <ListChoiceQuestion options={q.options} selected={(answer as string) ?? ''} onChange={setAnswer} />
          )}

          {surveyIndex === SURVEY_QUESTIONS.length - 1 && (
            <div className="bg-gray-50 rounded-2xl px-4 py-4 mt-6">
              <p className="text-[12px] text-gray-400 mb-2.5">지금까지 고른 것</p>
              <div className="flex flex-wrap gap-2">
                {SURVEY_QUESTIONS.flatMap((sq) => {
                  const a = surveyAnswers[sq.id];
                  if (a === undefined || (Array.isArray(a) && a.length === 0)) return [];
                  const labels =
                    sq.type === 'multi'
                      ? (a as string[]).map((id) => sq.options.find((o) => o.id === id)?.label).filter(Boolean)
                      : sq.type === 'scale'
                        ? [sq.options[a as number]?.label]
                        : [sq.options.find((o) => o.id === a)?.label];
                  return labels.filter((l): l is string => !!l);
                }).map((label, i) => (
                  <span key={`${label}-${i}`} className="text-[12px] text-gray-600 bg-white px-3 py-1.5 rounded-full">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-10 pt-3 flex flex-col gap-3">
          <button
            onClick={goNext}
            disabled={!valid}
            className={`w-full h-14 rounded-2xl text-base font-semibold text-white transition-colors ${
              valid ? 'bg-gray-900' : 'bg-gray-300'
            }`}
          >
            {surveyIndex === SURVEY_QUESTIONS.length - 1 ? '메타미 시작하기' : `다음 (${surveyIndex + 1}/${SURVEY_QUESTIONS.length})`}
          </button>
          <button onClick={() => setStep('notification')} className="text-sm text-gray-400 text-center">
            넘어가기
          </button>
        </div>
      </div>
    );
  }

  // ── 알림 권한 ──
  if (step === 'notification') {
    return (
      <div className="relative flex flex-col h-full bg-white">
        <button
          onClick={() => setStep('survey')}
          className="px-5 pt-6 pb-2 text-sm text-blue-500 text-left flex items-center gap-0.5"
        >
          <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
            <path d="M7 1L1 6.5L7 12" stroke="#3478F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="ml-1">뒤로가기</span>
        </button>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="mt-2 mb-7 bg-gray-100 rounded-2xl h-48 p-5 flex flex-col gap-3">
            <div className="h-2.5 rounded-full bg-gray-300 w-3/4" />
            <div className="h-2.5 rounded-full bg-gray-300 w-1/2" />
            <div className="flex gap-2 mt-2">
              <div className="h-8 rounded-lg bg-gray-300 w-24" />
              <div className="h-8 rounded-lg bg-gray-300 w-16" />
            </div>
          </div>

          <h2 className="text-[22px] font-bold text-gray-900 leading-[1.45] mb-4">
            푸시 알림을 활성화하여 나를 이해하는 여정을 시작해보세요
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            하루 한 번, 놓치기 쉬운 나의 감정과 생각을 자연스럽게 기록해보세요.
            쌓인 답변은 나를 이해하는 인사이트로 이어져요. 놓치지 않으려면 알림을 활성화하세요.
          </p>
        </div>

        <div className="px-6 pb-14 flex flex-col gap-4">
          <button
            onClick={() => setShowPermissionDialog(true)}
            className="w-full h-14 bg-gray-900 text-white rounded-2xl text-base font-semibold focus:outline-none"
          >
            알림받기
          </button>
          <button
            onClick={() => setStep('description')}
            className="text-sm text-gray-400 text-center focus:outline-none"
          >
            나중에
          </button>
        </div>

        {showPermissionDialog && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center px-10 z-50">
            <div className="bg-white rounded-2xl overflow-hidden w-full">
              <div className="px-5 pt-6 pb-5 text-center">
                <p className="text-[14px] font-semibold text-gray-900 mb-2 leading-snug">
                  &lsquo;메타미&rsquo; 에서 알림을 보내고자 합니다.
                </p>
                <p className="text-[12px] text-gray-500 leading-relaxed">
                  경고, 사운드 및 아이콘 배지가 알림에 포함될 수 있습니다.
                  설정에서 이를 구성할 수 있습니다.
                </p>
              </div>
              <div className="border-t border-gray-200 flex">
                <button
                  onClick={() => { setShowPermissionDialog(false); setStep('description'); }}
                  className="flex-1 py-3.5 text-[14px] text-blue-500 border-r border-gray-200 focus:outline-none"
                >
                  허용하지 않음
                </button>
                <button
                  onClick={() => { setShowPermissionDialog(false); setStep('description'); }}
                  className="flex-1 py-3.5 text-[14px] text-blue-500 font-semibold focus:outline-none"
                >
                  허용
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── 자기소개 (4문항, 실제 API 제출) ──
  if (step === 'description') {
    return (
      <div className="flex flex-col h-full bg-white">
        <button
          onClick={() => (qIndex > 0 ? setQIndex(qIndex - 1) : setStep('notification'))}
          className="px-5 pt-6 pb-2 w-fit focus:outline-none"
          aria-label="뒤로"
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            <path d="M8.5 1.5L1.5 8L8.5 14.5" stroke="#1C1C1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex-1 px-6 pt-4">
          <p className="text-[13px] text-gray-400 mb-5 leading-snug">
            {question.caption}
          </p>
          <h2 className="text-[24px] font-bold text-gray-900 leading-[1.4] mb-9">
            {question.title}
          </h2>
          <input
            type="text"
            value={currentAnswer}
            onChange={e => setAnswers(a => ({ ...a, [question.key]: e.target.value }))}
            placeholder="내용을 입력하세요"
            className={`w-full h-[52px] rounded-xl px-4 text-[15px] text-gray-900 outline-none placeholder:text-gray-300 transition-colors ${
              hasText
                ? 'bg-white border-2 border-gray-900'
                : 'bg-gray-50 border border-gray-200'
            }`}
          />
        </div>

        <div className="px-6 pb-14 flex flex-col gap-4">
          <button
            onClick={handleQuestionSubmit}
            disabled={loading}
            className={`w-full h-14 rounded-2xl text-base font-semibold text-white transition-colors focus:outline-none ${hasText && !loading ? 'bg-gray-900' : 'bg-gray-300 cursor-default'}`}
          >
            {loading ? '분석 중...' : qIndex < QUESTIONS.length - 1 ? '다음' : '입력완료'}
          </button>
          <button
            onClick={() => setStep('done')}
            className="text-sm text-gray-400 text-center focus:outline-none"
          >
            넘어가기
          </button>
        </div>
      </div>
    );
  }

  // ── 완료 메시지 ──
  if (step === 'done') {
    return (
      <div className="flex flex-col h-full bg-white px-6 justify-center">
        <p className="text-sm text-gray-400 mb-3 leading-snug">
          당신보다 우리는 스스로를 정확히 알 수도 있어요
        </p>
        <h2 className="text-[22px] font-bold text-gray-900 leading-[1.55]">
          {aiSentence || (
            <>
              그래서 이 앱이 존재해요.<br />
              당신을 더 잘 이해할 수<br />
              있도록 도와줄게요.
            </>
          )}
        </h2>
        <p className="text-gray-300 mt-6">;</p>
      </div>
    );
  }

  // ── 그 문장은 오늘부터 바뀝니다 ──
  if (step === 'sentenceChange') {
    return (
      <SplashSlide
        heading={
          <>
            그 문장은 오늘부터 바뀝니다.
            <br />
            당신을 더 잘 이해할 수 있도록
            <br />
            도와줄게요
          </>
        }
        onNext={() => setStep('day0')}
        dotIndex={0}
        dotCount={3}
      />
    );
  }

  // ── Day 0 ──
  if (step === 'day0') {
    return (
      <SplashSlide
        heading="Day 0"
        body="당신이 스스로 쓴 첫 문장이 저장됐어요"
        onNext={() => setStep('day1')}
        dotIndex={1}
        dotCount={3}
      />
    );
  }

  // ── Day 1 ──
  return (
    <SplashSlide
      heading="Day 1"
      body={
        <>
          오늘부터 쌓이는 기록이
          <br />
          당신의 한 문장을 정확하게 만듭니다
        </>
      }
      chip={
        <span className="inline-block text-[13px] font-medium text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded-full">
          정확도 {accuracyPercent}%에서 출발합니다
        </span>
      }
      ctaLabel="여정 시작하기"
      onNext={() => router.push('/main')}
      dotIndex={2}
      dotCount={3}
    />
  );
}
