'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useGetTodayDailyQuestion,
  useCreateTailQuestion,
  useUpdateTailQuestionAnswer,
  useCreateDailyRecord,
} from '@/entities/diary';
import { useGetMyProfile } from '@/entities/user';
import { useAuthStore } from '@/store';

type Mode = 'AI' | 'FREE';
type TurnKey = 'main' | 'tail1' | 'emotion' | 'yesno' | 'tail2' | 'done';

interface Msg {
  id: string;
  role: 'ai' | 'user';
  badge?: string;
  text: string;
}

const QUESTION_TYPE_LABEL: Record<string, string> = {
  TIME_CONTEXT: '시간 맥락',
  GROWTH_CONTEXT: '성장 맥락',
  DISCOVERY_CONTEXT: '발견 맥락',
};

const FALLBACK_QUESTION = '오늘 가장 나답다고 느낀 순간은 언제였나요?';
const FALLBACK_TAIL_1 = '그 순간을 좀 더 자세히 들려줄 수 있나요?';
const FALLBACK_TAIL_2 = '오늘 고른 감정들, 어떤 상황이었는지 조금 더 이야기해볼까요?';
const EMOTION_CHIPS = ['몰입', '조급함', '뿌듯함', '지침', '무던함', '편안함', '설렘', '답답함'];
const PATTERN_COUNT = 3;

let uid = 0;
const nextId = () => `m${++uid}`;

function AiOrb({ size = 28 }: { size?: number }) {
  return (
    <div
      className="rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        backgroundImage: 'radial-gradient(circle at 35% 30%, #FFDD8A 0%, #9195F6 42%, #6366F1 78%)',
      }}
    />
  );
}

function TypingDots() {
  return (
    <div className="flex items-end gap-2">
      <AiOrb />
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3.5 flex gap-1 shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function AccuracyGauge({ percent, delta }: { percent: number; delta: number }) {
  const SIZE = 200;
  const STROKE = 26;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const SWEEP = 0.72;
  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#E7E7F6" strokeWidth={STROKE} />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="#6366F1"
          strokeWidth={STROKE}
          strokeDasharray={`${SWEEP * CIRC} ${CIRC}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[13px] text-gray-500 mb-1.5">나의 문장 정확도</p>
        <p className="text-gray-900 leading-none">
          <span className="text-[44px] font-bold">{percent}</span>
          <span className="text-[20px] font-bold align-top">%</span>
        </p>
        <p className="text-[13px] text-[#6366F1] font-semibold mt-2">▲ {delta}%</p>
      </div>
    </div>
  );
}

function Bubble({ msg, children }: { msg: Msg; children?: React.ReactNode }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-[#6366F1] text-white rounded-2xl rounded-br-sm px-4 py-3 text-[14px] leading-relaxed whitespace-pre-line">
          {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <AiOrb />
      <div className="max-w-[82%] flex flex-col gap-2.5">
        <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3.5 shadow-sm">
          {msg.badge && (
            <span className="inline-block text-[11px] font-semibold text-[#8A6D00] bg-[#FDE9A8] px-2.5 py-1 rounded-full mb-2">
              {msg.badge}
            </span>
          )}
          <p className="text-[14px] text-gray-900 leading-relaxed whitespace-pre-line">{msg.text}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function DiaryPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: questionData } = useGetTodayDailyQuestion(!!accessToken);
  const { data: profile, refetch: refetchProfile } = useGetMyProfile(!!accessToken);
  const createTailQuestion = useCreateTailQuestion();
  const updateTailAnswer = useUpdateTailQuestionAnswer();
  const createRecord = useCreateDailyRecord();

  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<Mode>('AI');
  const [freeText, setFreeText] = useState('');

  const [turn, setTurn] = useState<TurnKey>('main');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [yesNoChoice, setYesNoChoice] = useState<'yes' | 'no' | null>(null);
  const [saving, setSaving] = useState(false);
  const [accuracyBefore, setAccuracyBefore] = useState(12);
  const [accuracyAfter, setAccuracyAfter] = useState(14);
  const [finalNote, setFinalNote] = useState('');

  const answers = useRef({ main: '', tail1: '', tail2: '' });
  const questionIdRef = useRef<string | null>(null);
  const tail1IdRef = useRef<string | null>(null);
  const tail2IdRef = useRef<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (profile?.latest_accuracy?.accuracy_percent != null) {
      setAccuracyBefore(profile.latest_accuracy.accuracy_percent);
      setAccuracyAfter(profile.latest_accuracy.accuracy_percent + 2);
    }
  }, [profile]);

  const rawQuestion = questionData?.question.question_text;
  const questionText = rawQuestion && /[가-힣]/.test(rawQuestion) ? rawQuestion : FALLBACK_QUESTION;
  const questionBadge = QUESTION_TYPE_LABEL[questionData?.question.question_type ?? ''] ?? '오늘의 질문';
  questionIdRef.current = questionData?.question.question_id ?? null;

  const today = new Date();
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일`;
  const nickname = '소희';

  const turnNumber: Record<TurnKey, number> = { main: 1, tail1: 2, emotion: 3, yesno: 4, tail2: 5, done: 5 };

  const appendAi = (badge: string | undefined, text: string) => {
    setMessages((m) => [...m, { id: nextId(), role: 'ai', badge, text }]);
  };
  const appendUser = (text: string) => {
    setMessages((m) => [...m, { id: nextId(), role: 'user', text }]);
  };

  const beginChat = () => {
    setStarted(true);
    appendAi(questionBadge, questionText);
  };

  const goTail1 = async () => {
    setTyping(true);
    let text = FALLBACK_TAIL_1;
    try {
      if (questionIdRef.current) {
        const res = await createTailQuestion.mutateAsync(questionIdRef.current);
        tail1IdRef.current = res.tail_question.tail_id;
        if (res.tail_question.question_text) text = res.tail_question.question_text;
      }
    } catch {
      // 실패해도 대화는 이어감
    }
    setTyping(false);
    appendAi('시간 맥락', text);
    setTurn('tail1');
  };

  const goEmotion = () => {
    appendAi(undefined, '지금 감정을 태그로 골라줄래요? 여러 개도 괜찮아요.');
    setTurn('emotion');
  };

  const goYesNo = () => {
    appendAi(undefined, '오늘 나답다고 느낀 순간이 있었나요?');
    setTurn('yesno');
  };

  const goTail2 = async () => {
    setTyping(true);
    let text = FALLBACK_TAIL_2;
    try {
      if (questionIdRef.current) {
        const res = await createTailQuestion.mutateAsync(questionIdRef.current);
        tail2IdRef.current = res.tail_question.tail_id;
        if (res.tail_question.question_text) text = res.tail_question.question_text;
      }
    } catch {
      // 실패해도 대화는 이어감
    }
    setTyping(false);
    appendAi(`자동 추가 · 태그 ${selectedEmotions.length}개`, text);
    setTurn('tail2');
  };

  const finish = async (lastAnswer: string) => {
    setSaving(true);
    setTyping(true);
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
        emotion_tag: selectedEmotions.join(', ') || '기록함',
        scene_description: answers.current.tail1 || answers.current.main,
        is_myself_moment: yesNoChoice === 'yes',
        myself_moment_desc: yesNoChoice === 'yes' ? inputText : undefined,
      });
      const refreshed = await refetchProfile();
      if (refreshed.data?.latest_accuracy?.accuracy_percent != null) {
        setAccuracyAfter(refreshed.data.latest_accuracy.accuracy_percent);
      }
    } catch {
      // 실패해도 완료 화면은 보여줌
    }
    setTyping(false);
    setFinalNote(
      selectedEmotions.length > 0
        ? `'${selectedEmotions[0]}' — ${PATTERN_COUNT}번째로 반복된 패턴이에요.`
        : '오늘 기록을 바탕으로 문장을 업데이트해둘게요.',
    );
    setTurn('done');
    setSaving(false);
  };

  const handleSend = async () => {
    if (turn === 'main') {
      const text = inputText.trim();
      if (!text) return;
      answers.current.main = text;
      appendUser(text);
      setInputText('');
      await goTail1();
      return;
    }
    if (turn === 'tail1') {
      const text = inputText.trim();
      if (!text) return;
      answers.current.tail1 = text;
      appendUser(text);
      setInputText('');
      goEmotion();
      return;
    }
    if (turn === 'emotion') {
      if (selectedEmotions.length === 0) return;
      appendUser(selectedEmotions.join(', '));
      goYesNo();
      return;
    }
    if (turn === 'yesno') {
      if (yesNoChoice === null) return;
      const text = yesNoChoice === 'yes' ? inputText.trim() : '';
      if (yesNoChoice === 'yes' && !text) return;
      appendUser(yesNoChoice === 'yes' ? `있었어요 — ${text}` : '잘 모르겠어요');
      setInputText('');
      await goTail2();
      return;
    }
    if (turn === 'tail2') {
      const text = inputText.trim();
      if (!text) return;
      answers.current.tail2 = text;
      appendUser(text);
      setInputText('');
      await finish(text);
    }
  };

  const skipTurn = async () => {
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
    setSaving(true);
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
    setSaving(false);
    setFinalNote('자유롭게 남겨주신 기록, 잘 저장해뒀어요.');
    setStarted(true);
    setTurn('done');
  };

  // ── 완료 화면 ──
  if (turn === 'done') {
    const delta = Math.max(0, accuracyAfter - accuracyBefore);
    return (
      <div className="flex flex-col h-full bg-[#F4F3FA] px-6 pt-6 pb-6">
        <button onClick={() => router.push('/main')} className="self-end text-[13px] text-gray-400">
          닫기
        </button>

        <div className="flex flex-col items-center mt-2 mb-2">
          <div className="w-11 h-11 rounded-full bg-[#6366F1] flex items-center justify-center mb-4">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <path d="M1 7l5.5 5.5L17 1.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-[21px] font-bold text-gray-900 mb-2">오늘 기록 완료</p>
          <p className="text-[13px] text-gray-500 text-center leading-relaxed">
            5개 질문에 답했어요. 문장이 조금 더 정확해졌습니다.
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <AccuracyGauge percent={accuracyAfter} delta={delta} />
        </div>

        <div className="bg-white rounded-2xl px-5 py-5 mb-5 shadow-sm">
          <p className="text-[12px] font-semibold text-[#6366F1] mb-2">오늘 발견한 것</p>
          <p className="text-[14px] font-semibold text-gray-900 leading-relaxed mb-3">{finalNote}</p>
          {selectedEmotions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedEmotions.map((tag) => (
                <span key={tag} className="text-[12px] font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => router.push('/objectify')}
          className="w-full h-14 bg-[#6366F1] text-white rounded-2xl text-[15px] font-semibold mb-3"
        >
          오늘의 문장 보기 ›
        </button>
        <button onClick={() => router.push('/main')} className="text-[13px] text-gray-400 text-center">
          홈으로
        </button>
      </div>
    );
  }

  // ── 시작 화면 ──
  if (!started) {
    return (
      <div
        className="flex flex-col h-full px-6 pt-6 pb-6"
        style={{ backgroundImage: 'linear-gradient(160deg, #F3E7D6 0%, #ECE9F6 45%, #DADFFB 100%)' }}
      >
        <div className="flex items-center mb-4">
          <button onClick={() => router.push('/main')} className="w-7 h-7 flex items-center justify-center -ml-1">
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M7 1L1 7l6 6" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="flex-1 text-center text-[13px] text-gray-500 -ml-7">{dateLabel} {['일','월','화','수','목','금','토'][today.getDay()]}요일</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
          <div
            className="w-[170px] h-[170px] rounded-full"
            style={{ backgroundImage: 'radial-gradient(circle at 38% 32%, #FFDD8A 0%, #8B90F5 45%, #5457E8 80%)' }}
          />
          <p className="text-[19px] font-bold text-gray-900 leading-snug">
            {nickname}님, 오늘 하루는
            <br />
            어떤 장면으로 남았나요?
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur rounded-2xl p-3">
          {mode === 'FREE' ? (
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="오늘 하루를 자유롭게 적어보세요"
              className="w-full h-24 bg-transparent outline-none text-[14px] text-gray-900 placeholder:text-gray-400 resize-none mb-2"
            />
          ) : (
            <p className="text-[13px] text-gray-400 px-1 py-3">
              {questionData ? '질문이 도착했어요' : '첫 질문을 기다리는 중'}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('AI')}
              className={`flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-full transition-colors ${
                mode === 'AI' ? 'bg-[#6366F1] text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current" /> AI 질문
            </button>
            <button
              onClick={() => setMode('FREE')}
              className={`text-[12px] font-medium px-3 py-2 rounded-full transition-colors ${
                mode === 'FREE' ? 'bg-[#6366F1] text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              자유 기록
            </button>
            <button
              onClick={mode === 'FREE' ? submitFree : beginChat}
              disabled={mode === 'FREE' ? !freeText.trim() || saving : false}
              className="ml-auto w-10 h-10 rounded-full bg-[#6366F1] text-white flex items-center justify-center shrink-0 disabled:opacity-40"
              aria-label="보내기"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 19V5M5 12l7-7 7 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 대화 화면 ──
  const canSend =
    turn === 'main' || turn === 'tail1' || turn === 'tail2'
      ? inputText.trim().length > 0
      : turn === 'emotion'
        ? selectedEmotions.length > 0
        : yesNoChoice === 'yes'
          ? inputText.trim().length > 0
          : yesNoChoice === 'no';

  return (
    <div className="flex flex-col h-full bg-[#F4F3FA]">
      <div className="flex items-center justify-between px-5 pt-6 pb-3">
        <button onClick={() => router.push('/main')} className="w-7 h-7 flex items-center justify-center -ml-1">
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M7 1L1 7l6 6" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-[13px] font-medium text-gray-600">오늘의 대화 · {dateLabel}</span>
        <span className="text-[12px] font-semibold text-[#6366F1] w-8 text-right">{turnNumber[turn]}/5</span>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-4">
        {messages.map((m) => (
          <Bubble key={m.id} msg={m}>
            {m.role === 'ai' && turn === 'emotion' && m.id === messages[messages.length - 1]?.id && (
              <div className="flex flex-wrap gap-2 mt-3">
                {EMOTION_CHIPS.map((c) => {
                  const selected = selectedEmotions.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        setSelectedEmotions((cur) =>
                          cur.includes(c) ? cur.filter((x) => x !== c) : cur.length >= 3 ? cur : [...cur, c],
                        )
                      }
                      className={`text-[13px] font-medium px-3.5 py-2 rounded-full border transition-colors ${
                        selected ? 'bg-[#6366F1] text-white border-[#6366F1]' : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
                <p className="w-full text-[11px] text-gray-400 mt-1">
                  {selectedEmotions.length}개 선택됨 · 아래에서 보내기
                </p>
              </div>
            )}
            {m.role === 'ai' && turn === 'yesno' && m.id === messages[messages.length - 1]?.id && (
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setYesNoChoice('yes')}
                  className={`flex-1 h-11 rounded-xl text-[13px] font-semibold border transition-colors ${
                    yesNoChoice === 'yes' ? 'border-[#6366F1] text-[#6366F1]' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  있었어요
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setYesNoChoice('no');
                    setInputText('');
                  }}
                  className={`flex-1 h-11 rounded-xl text-[13px] font-semibold border transition-colors ${
                    yesNoChoice === 'no' ? 'border-[#6366F1] text-[#6366F1]' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  잘 모르겠어요
                </button>
              </div>
            )}
          </Bubble>
        ))}
        {typing && <TypingDots />}
      </div>

      <div className="px-5 pb-6 pt-2 bg-[#F4F3FA]">
        <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-sm">
          <input
            value={turn === 'yesno' && yesNoChoice !== 'yes' ? '' : inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={turn === 'emotion' || (turn === 'yesno' && yesNoChoice !== 'yes')}
            placeholder={
              turn === 'emotion'
                ? '위에서 감정을 선택해주세요'
                : turn === 'yesno' && yesNoChoice !== 'yes'
                  ? '선택지를 골라주세요'
                  : turn === 'yesno'
                    ? '어떤 순간이었는지 적어보세요'
                    : '답을 적어보세요'
            }
            className="flex-1 text-[14px] outline-none placeholder:text-gray-300 disabled:bg-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!canSend || saving}
            className="w-9 h-9 rounded-full bg-[#6366F1] text-white flex items-center justify-center shrink-0 disabled:opacity-40"
            aria-label="보내기"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 19V5M5 12l7-7 7 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {(turn === 'main' || turn === 'tail1' || turn === 'tail2') && (
          <button onClick={skipTurn} className="text-[12px] text-gray-400 mt-2.5 ml-1">
            건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}
