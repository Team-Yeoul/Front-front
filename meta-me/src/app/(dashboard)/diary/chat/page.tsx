'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useCreateTailQuestion,
  useGetTodayDailyQuestion,
  useUpdateTailQuestionAnswer,
} from '@/entities/diary';
import { useGetMyProfile } from '@/entities/user';
import { useSaveTodayRecord } from '@/hooks/useSaveTodayRecord';
import { useAuthStore } from '@/store';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, ChevronLeft, Img3D, ProgressBar, TextButton } from '@/components/ui/primitives';
import { AiBubble, Composer, OutlineChip, TypingBubble, UserBubble } from '@/components/ui/chat';
import { AccuracyDonut } from '@/components/ui/AccuracyDonut';
import { useMe } from '@/hooks/useMe';

type Mode = 'AI' | 'FREE';
type TurnKey = 'main' | 'tail1' | 'emotion' | 'yesno' | 'tail2' | 'summary';

interface Msg {
  id: string;
  role: 'ai' | 'user';
  badge?: string;
  text: string;
  kind?: 'emotion' | 'yesno' | 'chips';
}

const QUESTION_TYPE_LABEL: Record<string, string> = {
  TIME_CONTEXT: '시간 맥락',
  GROWTH_CONTEXT: '성장 맥락',
  DISCOVERY_CONTEXT: '발견 맥락',
};

const FALLBACK_QUESTION = '오늘 하루는 어떤 장면으로 남았나요?';
const FALLBACK_TAIL_1 = '그 장면을 조금 더 자세히 들려줄 수 있나요? 그렇게 느낀 이유까지 알려주세요.';
const FALLBACK_TAIL_2 = '이 조합, 어떤 상황이었나요?';
const EMOTION_CHIPS = ['몰입', '조급함', '뿌듯함', '지침', '무던함', '편안함', '설렘', '답답함'];

let uid = 0;
const nextId = () => `m${++uid}`;

export default function DiaryChatPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { nickname } = useMe();
  const { data: questionData } = useGetTodayDailyQuestion(!!accessToken);
  const { data: profile, refetch: refetchProfile } = useGetMyProfile(!!accessToken);
  const createTailQuestion = useCreateTailQuestion();
  const updateTailAnswer = useUpdateTailQuestionAnswer();
  const createRecord = useSaveTodayRecord();

  const [phase, setPhase] = useState<'intro' | 'chat' | 'done'>('intro');
  const [mode, setMode] = useState<Mode>('AI');
  const [freeText, setFreeText] = useState('');
  const [turn, setTurn] = useState<TurnKey>('main');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [emotions, setEmotions] = useState<string[]>([]);
  const [yesNo, setYesNo] = useState<'yes' | 'no' | null>(null);
  const [accuracy, setAccuracy] = useState<{ before: number; after: number }>({ before: 0, after: 0 });
  const [finding, setFinding] = useState('');
  const [startedAt] = useState(() => new Date());

  const answers = useRef({ main: '', tail1: '', tail2: '', myselfMoment: '' });
  const questionIdRef = useRef<string | null>(null);
  const tail1IdRef = useRef<string | null>(null);
  const tail2IdRef = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, turn]);

  useEffect(() => {
    if (turn !== 'summary') return;
    const t = setTimeout(() => setPhase('done'), 2600);
    return () => clearTimeout(t);
  }, [turn]);

  useEffect(() => {
    // 실제 정확도를 기준으로 삼는다(값이 없으면 0).
    const current = profile?.latest_accuracy?.accuracy_percent ?? 0;
    setAccuracy({ before: current, after: current });
  }, [accessToken, profile]);

  const rawQuestion = questionData?.question.question_text;
  const questionText = rawQuestion && /[가-힣]/.test(rawQuestion) ? rawQuestion : FALLBACK_QUESTION;
  const questionBadge = QUESTION_TYPE_LABEL[questionData?.question.question_type ?? ''];
  questionIdRef.current = questionData?.question.question_id ?? null;
  // 메인 질문이 이미 '나다운 순간'을 물었다면 예/아니오 턴에서 같은 걸 다시 묻지 않는다.
  const mainAsksMyselfMoment = questionText.includes('나답');
  const totalTurns = mainAsksMyselfMoment ? 4 : 5;
  const turnNumber: Record<TurnKey, number> = { main: 1, tail1: 2, emotion: 3, yesno: 4, tail2: totalTurns, summary: totalTurns };

  const today = new Date();
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일`;
  const h = startedAt.getHours();
  const timeLabel = `오늘 · ${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${String(startedAt.getMinutes()).padStart(2, '0')}`;

  const appendAi = (text: string, badge?: string, kind?: Msg['kind']) =>
    setMessages((m) => [...m, { id: nextId(), role: 'ai', badge, text, kind }]);
  const appendUser = (text: string) => setMessages((m) => [...m, { id: nextId(), role: 'user', text }]);

  const askTail = async (ref: React.MutableRefObject<string | null>, fallback: string) => {
    setTyping(true);
    let text = fallback;
    try {
      if (questionIdRef.current) {
        const res = await createTailQuestion.mutateAsync(questionIdRef.current);
        ref.current = res.tail_question.tail_id;
        if (res.tail_question.question_text && /[가-힣]/.test(res.tail_question.question_text)) text = res.tail_question.question_text;
      }
    } catch {
      // 실패해도 대화는 이어감
    }
    setTyping(false);
    return text;
  };

  const begin = () => {
    setPhase('chat');
    appendAi(questionText, questionBadge);
  };

  const goTail1 = async () => {
    const text = await askTail(tail1IdRef, FALLBACK_TAIL_1);
    appendAi(text, '시간 맥락');
    setTurn('tail1');
  };

  const goEmotion = () => {
    appendAi('지금 감정을 태그로 골라줄래요? 여러 개도 괜찮아요.', undefined, 'emotion');
    setTurn('emotion');
  };

  const goYesNo = () => {
    appendAi('오늘 나답다고 느낀 순간이 있었나요?', undefined, 'yesno');
    setTurn('yesno');
  };

  const goTail2 = async () => {
    const fallback = emotions.length >= 2 ? `${emotions[0]}과 ${emotions[1]}이 같이 왔네요. ${FALLBACK_TAIL_2}` : FALLBACK_TAIL_2;
    const text = await askTail(tail2IdRef, fallback);
    appendAi(text, `자동 추가 · 태그 ${emotions.length}개`);
    setTurn('tail2');
  };

  const finish = async (lastAnswer: string) => {
    setTyping(true);
    let after = accuracy.before;
    try {
      if (tail1IdRef.current && questionIdRef.current) {
        await updateTailAnswer.mutateAsync({
          questionId: questionIdRef.current,
          tailId: tail1IdRef.current,
          body: { user_answer: answers.current.tail1 || '패스' },
        });
      }
      if (tail2IdRef.current && questionIdRef.current) {
        await updateTailAnswer.mutateAsync({
          questionId: questionIdRef.current,
          tailId: tail2IdRef.current,
          body: { user_answer: lastAnswer || '패스' },
        });
      }
      await createRecord.mutateAsync({
        answer_type: 'TEXT',
        user_answer: answers.current.main,
        emotion_tag: emotions.join(', ') || '기록함',
        scene_description: answers.current.tail1 || answers.current.main,
        is_myself_moment: !!answers.current.myselfMoment,
        myself_moment_desc: answers.current.myselfMoment || undefined,
      });
      const refreshed = await refetchProfile();
      if (refreshed.data?.latest_accuracy?.accuracy_percent != null) after = refreshed.data.latest_accuracy.accuracy_percent;
    } catch {
      // 실패해도 완료 화면은 보여줌
    }
    setTyping(false);
    setAccuracy((a) => ({ ...a, after }));
    setFinding(emotions.length > 0 ? `오늘은 '${emotions.join(', ')}'을(를) 느꼈다고 기록했어요.` : '오늘 기록을 바탕으로 문장을 업데이트해둘게요.');
    setTurn('summary');
  };

  const send = async () => {
    const text = input.trim();
    if (turn === 'main' && text) {
      answers.current.main = text;
      if (mainAsksMyselfMoment) answers.current.myselfMoment = text;
      appendUser(text);
      setInput('');
      await goTail1();
    } else if (turn === 'tail1' && text) {
      answers.current.tail1 = text;
      appendUser(text);
      setInput('');
      goEmotion();
    } else if (turn === 'emotion' && emotions.length > 0) {
      setMessages((m) => [...m, { id: nextId(), role: 'user', text: emotions.join(', '), kind: 'chips' }]);
      if (mainAsksMyselfMoment) await goTail2();
      else goYesNo();
    } else if (turn === 'yesno' && yesNo) {
      if (yesNo === 'yes' && !text) return;
      answers.current.myselfMoment = yesNo === 'yes' ? text : '';
      appendUser(yesNo === 'yes' ? text : '잘 모르겠어요');
      setInput('');
      await goTail2();
    } else if (turn === 'tail2' && text) {
      answers.current.tail2 = text;
      appendUser(text);
      setInput('');
      await finish(text);
    }
  };

  const skip = async () => {
    if (turn === 'main') {
      answers.current.main = '오늘은 특별히 떠오르는 게 없어요';
      appendUser('건너뛰기');
      await goTail1();
    } else if (turn === 'tail1') {
      appendUser('건너뛰기');
      goEmotion();
    } else if (turn === 'tail2') {
      appendUser('건너뛰기');
      await finish('');
    }
  };

  const submitFree = async () => {
    const text = freeText.trim();
    if (!text) return;
    try {
      await createRecord.mutateAsync({
        answer_type: 'TEXT',
        user_answer: text,
        emotion_tag: '자유 기록',
        scene_description: text,
        is_myself_moment: false,
      });
    } catch {
      // 실패해도 완료 화면은 보여줌
    }
    setFinding('자유롭게 남겨주신 기록, 잘 저장해뒀어요.');
    setPhase('done');
  };

  /* ── 인트로 ── */
  if (phase === 'intro') {
    return (
      <Screen
        footer={
          <Composer
            value={mode === 'FREE' ? freeText : ''}
            onChange={setFreeText}
            onSend={mode === 'AI' ? begin : submitFree}
            sendEnabled={mode === 'AI' || freeText.trim().length > 0}
            placeholder={mode === 'AI' ? '첫 질문을 기다리는 중' : '오늘을 자유롭게 적어보세요'}
            chips={
              <>
                <button
                  onClick={() => setMode('AI')}
                  className={`h-8 px-3 rounded-full flex items-center gap-1.5 text-[13px] ${mode === 'AI' ? 'bg-white font-semibold text-ink' : 'text-sub'}`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-[radial-gradient(circle_at_35%_30%,#B7B9FF,#6367FF)]" />
                  AI 질문
                </button>
                <button
                  onClick={() => setMode('FREE')}
                  className={`h-8 px-3 rounded-full text-[13px] ${mode === 'FREE' ? 'bg-white font-semibold text-ink' : 'text-sub'}`}
                >
                  자유 기록
                </button>
              </>
            }
          />
        }
      >
        <div className="relative flex items-center justify-center h-14 px-5">
          <BackButton className="absolute left-5" />
          <span className="text-[14px] text-[#48484F]">
            {dateLabel} {weekday}요일
          </span>
        </div>
        <div className="flex flex-col items-center pt-[110px]">
          <Img3D name="star-pink" size={210} />
          <h1 className="text-[22px] font-bold text-ink text-center leading-[1.5] mt-9 whitespace-pre-line">
            {`${nickname ? `${nickname}님, ` : ''}${questionText.replace(/^오늘 하루는 /, '오늘 하루는\n')}`}
          </h1>
        </div>
      </Screen>
    );
  }

  /* ── 완료 ── */
  if (phase === 'done') {
    return (
      <Screen
        footer={
          <>
            <Button className="shadow-[0_8px_24px_rgba(99,103,255,0.3)]" onClick={() => router.push('/report/sentence')}>
              오늘의 문장 보기 <span className="text-[18px] font-normal">›</span>
            </Button>
            <TextButton className="mt-1" onClick={() => router.push('/diary/streak')}>
              연속 기록 보기
            </TextButton>
          </>
        }
      >
        <div className="flex justify-end px-5 h-14 items-center">
          <button onClick={() => router.push('/main')} className="text-[15px] text-sub">
            닫기
          </button>
        </div>
        <div className="flex flex-col items-center">
          <Img3D name="check" size={96} />
          <h1 className="text-[24px] font-bold text-ink mt-3">오늘 기록 완료</h1>
          <p className="text-[14px] text-sub mt-2">{mode === 'FREE' ? '오늘 기록이 저장됐어요.' : `${totalTurns}개 질문에 답했어요. 문장이 조금 더 정확해졌습니다.`}</p>
          <div className="mt-8">
            <AccuracyDonut percent={accuracy.after} delta={Math.max(0, accuracy.after - accuracy.before)} />
          </div>
        </div>
        <div className="mx-5 mt-8 rounded-3xl bg-white px-5 py-5 shadow-[0_6px_24px_rgba(26,26,30,0.06)]">
          <p className="text-[12px] font-semibold text-primary">오늘 발견한 것</p>
          <p className="text-[17px] font-bold text-ink leading-snug mt-2">{finding}</p>
          {emotions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {emotions.map((e) => (
                <span key={e} className="h-8 px-3.5 rounded-full bg-surface-2 text-[13px] font-semibold text-primary inline-flex items-center">
                  {e}
                </span>
              ))}
            </div>
          )}
        </div>
      </Screen>
    );
  }

  /* ── 대화 ── */
  const lastAiId = [...messages].reverse().find((m) => m.role === 'ai')?.id;
  const composerDisabled = typing || turn === 'summary';
  const canSend =
    turn === 'emotion' ? emotions.length > 0 : turn === 'yesno' ? yesNo === 'no' || (yesNo === 'yes' && input.trim().length > 0) : input.trim().length > 0;

  return (
    <Screen
      bodyRef={listRef}
      footer={
          <Composer
            value={turn === 'emotion' ? emotions.join(', ') : turn === 'yesno' && yesNo !== 'yes' ? '' : input}
            onChange={setInput}
            onSend={() => canSend && send()}
            sendEnabled={canSend}
            placeholder={turn === 'yesno' && yesNo === 'yes' ? '어떤 순간이었나요?' : turn === 'emotion' ? '위에서 감정을 골라주세요' : '답을 적어보세요'}
            disabled={composerDisabled}
            disabledLabel="metame가 질문을 쓰는 중이에요"
            disabledHint="질문이 도착하면 입력창이 열려요"
            chips={
              <>
                <OutlineChip onClick={() => turn !== 'emotion' && goEmotion()}>태그로 답하기</OutlineChip>
                {(turn === 'main' || turn === 'tail1' || turn === 'tail2') && <OutlineChip onClick={skip}>건너뛰기</OutlineChip>}
              </>
            }
          />
      }
    >
      <div className="sticky top-0 z-10 flex items-center justify-between h-14 px-5 bg-surface-2">
        <button onClick={() => router.push('/main')} aria-label="나가기">
          <ChevronLeft size={20} />
        </button>
        <span className="text-[14px] font-semibold text-ink">오늘의 대화 · {dateLabel}</span>
        <span className="text-[13px] font-semibold text-primary w-8 text-right">
          {turnNumber[turn]} / {totalTurns}
        </span>
      </div>

      <div className="px-4 pt-2 pb-4 flex flex-col gap-4">
        <p className="text-center text-[12px] text-mute">{timeLabel}</p>
        {messages.map((m) =>
          m.role === 'user' ? (
            m.kind === 'chips' ? (
              <div key={m.id} className="flex justify-end flex-wrap gap-2 pl-12">
                {m.text.split(', ').map((e) => (
                  <span key={e} className="h-9 px-4 rounded-full bg-primary text-white text-[14px] font-semibold inline-flex items-center">
                    {e}
                  </span>
                ))}
              </div>
            ) : (
              <UserBubble key={m.id}>{m.text}</UserBubble>
            )
          ) : (
            <AiBubble
              key={m.id}
              badge={m.badge}
              footer={
                m.kind === 'emotion' ? (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {EMOTION_CHIPS.map((e) => {
                        const on = emotions.includes(e);
                        return (
                          <button
                            key={e}
                            disabled={m.id !== lastAiId || turn !== 'emotion'}
                            onClick={() => setEmotions((prev) => (on ? prev.filter((x) => x !== e) : [...prev, e]))}
                            className={`h-9 px-3.5 rounded-full text-[14px] ${on ? 'bg-primary text-white font-semibold' : 'bg-surface-2 text-[#48484F]'}`}
                          >
                            {e}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[12px] text-mute mt-3">
                      {emotions.length}개 선택됨{turn === 'emotion' ? ' · 아래에서 보내기' : ''}
                    </p>
                  </div>
                ) : m.kind === 'yesno' ? (
                  <div className="flex gap-2 mt-3">
                    {(['yes', 'no'] as const).map((v) => (
                      <button
                        key={v}
                        disabled={turn !== 'yesno'}
                        onClick={() => setYesNo(v)}
                        className={`h-11 px-5 rounded-xl text-[14px] font-semibold ${
                          yesNo === v ? 'border-2 border-primary text-primary bg-white' : 'bg-surface-2 text-sub'
                        }`}
                      >
                        {v === 'yes' ? '있었어요' : '잘 모르겠어요'}
                      </button>
                    ))}
                  </div>
                ) : undefined
              }
            >
              {m.text}
            </AiBubble>
          ),
        )}
        {typing && <TypingBubble />}
        {turn === 'summary' && (
          <div className="rounded-3xl bg-surface-2 px-5 py-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-bold text-ink">오늘 기록 정리됨</span>
              <span className="text-[13px] font-semibold text-primary">
                정확도 {accuracy.before}% → {accuracy.after}%
              </span>
            </div>
            <ProgressBar value={accuracy.after} className="mt-3" track="#DCDDFB" height={6} />
            <p className="text-[13px] text-[#48484F] mt-3">{finding}</p>
          </div>
        )}
      </div>
    </Screen>
  );
}
