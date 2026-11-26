'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useCreateTailQuestion, useGetTodayDailyQuestion, useUpdateTailQuestionAnswer } from '@/entities/diary';
import { useGetMyAccount, useGetMyProfile } from '@/entities/user';
import { TodayRecordExistsError, useSaveTodayRecord, useTodayRecord } from '@/hooks/useSaveTodayRecord';
import { TodayRecordExists } from '@/components/ui/TodayRecordExists';
import { useAuthStore } from '@/store';
import { useMe } from '@/hooks/useMe';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { LinearGradient, Pressable, ScrollView, View, scrollToEnd } from '@/components/ui/rn';
import { AiMessage, ChatBackdrop, GlassBack, GlassCircle, PillComposer, QuickChip, TypingMessage, UserMessage } from '@/components/ui/chatV3';
import { PencilIcon } from '@/components/ui/chatIcons';
import { ChatIntro } from '@/components/chat/ChatIntro';
import { router } from '@/lib/router';
import { withSensitiveGate } from '@/components/SensitiveGate';

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
// 메인 질문이 장면을 묻지 않을 때도 있어서 '그 장면' 같은 지시어 없이 묻는다.
const FALLBACK_TAIL_1 = '방금 이야기를 조금 더 자세히 들려줄 수 있나요? 그렇게 느낀 이유까지 알려주세요.';
const FALLBACK_TAIL_2 = '이 조합, 어떤 상황이었나요?';
// 명세상 최대 길이: user_answer 2000자, scene_description 1000자
const MAX_ANSWER = 2000;
const MAX_SCENE = 1000;
const EMOTION_CHIPS = ['몰입', '조급함', '뿌듯함', '지침', '무던함', '편안함', '설렘', '답답함'];
/** 직접 쓰기(기록 B) 경로 */
const WRITE_HREF = '/diary/write';

// 답이 '모르겠음', 'ㅋㅋ'처럼 내용이 거의 없으면 한 번 더 쉽게 다시 묻는다.
const RETRY_PROMPT: Partial<Record<TurnKey, string>> = {
  main: '괜찮아요, 거창하지 않아도 돼요. 오늘 있었던 일 하나만 떠올려볼까요? 점심에 먹은 것, 누군가와 나눈 대화처럼 작은 것도 좋아요.',
  tail1: '떠오르지 않아도 괜찮아요. 그때 기분이 어땠는지 한 단어로만 말해줘도 돼요. 어렵다면 건너뛰어도 괜찮아요.',
  tail2: '딱 떠오르지 않으면 비슷했던 순간 아무거나 괜찮아요. 어렵다면 건너뛰어도 돼요.',
};
const VAGUE_PATTERN = /(모르겠|몰라|모름|몰루|글쎄|기억\s*(이\s*)?안|생각\s*(이\s*)?안|딱히|별거\s*없|없음|없어|없는데|그냥)/;
const isVagueAnswer = (raw: string) => {
  const t = raw.replace(/[\s.,!?~…·'"()\-]/g, '');
  if (t.length < 2) return true;
  // 완성형 글자나 알파벳이 없으면(ㅋㅋ, ㅁㄴㅇㄹ, 이모지만) 내용이 없는 답으로 본다.
  if (!/[가-힣a-zA-Z0-9]/.test(t)) return true;
  if (/^(.)\1+$/.test(t)) return true;
  return t.length <= 20 && VAGUE_PATTERN.test(t);
};

let uid = 0;
const nextId = () => `m${++uid}`;

// 기록 화면을 기록에 남기지 않도록 홈 탭으로 바꿔 간다.
const toMain = () => router.dismissTo('/main');

function DiaryChatScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const me = useMe();
  const { data: account } = useGetMyAccount(!!accessToken && !me.nickname);
  const displayName = me.nickname || account?.user?.username || account?.user?.email?.split('@')[0];
  const { data: fetchedQuestion, isPending: questionPending } = useGetTodayDailyQuestion(!!accessToken);
  // 이 화면에 들어와 처음 받은 질문을 끝까지 쓴다(저장 후 무효화로 다시 불러와도 문구가 바뀌지 않게).
  const [questionData, setQuestionData] = useState(fetchedQuestion);
  if (fetchedQuestion && !questionData) setQuestionData(fetchedQuestion);
  // 질문을 불러오는 동안에는 대화를 시작하지 않는다(기본 문구로 시작했다가 실제 질문으로 바뀌지 않게).
  const questionLoading = !!accessToken && questionPending;
  const { data: profile, refetch: refetchProfile } = useGetMyProfile(!!accessToken);
  const createTailQuestion = useCreateTailQuestion();
  const updateTailAnswer = useUpdateTailQuestionAnswer();
  const createRecord = useSaveTodayRecord();
  const todayRecord = useTodayRecord();
  // 저장 시점에 409로 오늘 기록이 있다는 걸 알게 된 경우(undefined = 해당 없음)
  const [existingId, setExistingId] = useState<string | null | undefined>(undefined);

  const [phase, setPhase] = useState<'intro' | 'chat'>('intro');
  const [turn, setTurn] = useState<TurnKey>('main');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [emotions, setEmotions] = useState<string[]>([]);
  const [yesNo, setYesNo] = useState<'yes' | 'no' | null>(null);
  const [accuracy, setAccuracy] = useState<{ before: number; after: number }>({ before: 0, after: 0 });
  const [finding, setFinding] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [startedAt] = useState(() => new Date());

  const answers = useRef({ main: '', tail1: '', tail2: '', myselfMoment: '' });
  const tail1IdRef = useRef<string | null>(null);
  const tail2IdRef = useRef<string | null>(null);
  const tail1Saved = useRef(false);
  // 턴마다 다시 묻기는 한 번만 한다(두 번째도 모호하면 그대로 받고 넘어간다).
  const retried = useRef<Partial<Record<TurnKey, boolean>>>({});
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToEnd(listRef.current);
  }, [messages, typing, turn]);

  // 기록 전 정확도를 처음 한 번만 잡아 둔다. 저장 후 프로필을 다시 불러와도 before가 덮어써지지 않게 한다.
  const [baselineSet, setBaselineSet] = useState(false);
  if (!baselineSet && profile) {
    setBaselineSet(true);
    const current = profile.latest_accuracy?.accuracy_percent ?? 0;
    setAccuracy({ before: current, after: current });
  }

  const rawQuestion = questionData?.question?.question_text;
  const questionText = rawQuestion && /[가-힣]/.test(rawQuestion) ? rawQuestion : FALLBACK_QUESTION;
  const questionBadge = QUESTION_TYPE_LABEL[questionData?.question?.question_type ?? ''];
  // 처음 받은 질문을 끝까지 쓰므로 값이 바뀌지 않아 그대로 읽는다.
  const questionId = questionData?.question?.question_id ?? null;
  // 메인 질문이 이미 '나다운 순간'을 물었다면 예/아니오 턴에서 같은 걸 다시 묻지 않는다.
  const mainAsksMyselfMoment = questionText.includes('나답');

  const today = new Date();
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일`;
  const h = startedAt.getHours();
  const timeLabel = `오늘 · ${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${String(startedAt.getMinutes()).padStart(2, '0')}`;

  const appendAi = (text: string, badge?: string, kind?: Msg['kind']) => setMessages((m) => [...m, { id: nextId(), role: 'ai', badge, text, kind }]);
  const appendUser = (text: string) => setMessages((m) => [...m, { id: nextId(), role: 'user', text }]);

  const askTail = async (ref: RefObject<string | null>, fallback: string) => {
    setTyping(true);
    let text = fallback;
    try {
      if (questionId) {
        const res = await createTailQuestion.mutateAsync(questionId);
        const tq = res?.tail_question;
        ref.current = tq?.tail_id ?? null;
        if (tq?.question_text && /[가-힣]/.test(tq.question_text)) text = tq.question_text;
      }
    } catch {
      // 실패해도 대화는 이어감
    }
    setTyping(false);
    return text;
  };

  const goTail1 = async () => {
    const text = await askTail(tail1IdRef, FALLBACK_TAIL_1);
    // 꼬리 질문 응답에는 질문 유형이 없어서, 이어 묻는 메인 질문의 맥락 배지를 그대로 쓴다.
    appendAi(text, questionBadge);
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
    // 감정 칩은 모두 받침으로 끝나서 '과/이'로 고정해도 된다.
    const fallback =
      emotions.length >= 2 ? `${emotions[0]}과 ${emotions[1]}이 같이 왔네요. ${FALLBACK_TAIL_2}` : `'${emotions[0]}' 감정이 든 순간, 어떤 상황이었나요?`;
    const text = await askTail(tail2IdRef, fallback);
    appendAi(text);
    setTurn('tail2');
  };

  // '다르게 물어봐줘': 꼬리 질문을 새로 받아 다시 묻는다.
  const reask = async () => {
    if (turn === 'tail1') appendAi(await askTail(tail1IdRef, FALLBACK_TAIL_1), questionBadge);
    else if (turn === 'tail2') appendAi(await askTail(tail2IdRef, FALLBACK_TAIL_2));
  };

  const finish = async () => {
    setTyping(true);
    setSaveFailed(false);
    let after = accuracy.before;
    // 꼬리 질문 답변은 부가 정보라 실패해도 기록 저장은 계속한다. 건너뛴 답은 보내지 않는다.
    const tails: [string | null, string][] = [
      [tail1Saved.current ? null : tail1IdRef.current, answers.current.tail1],
      [tail2IdRef.current, answers.current.tail2],
    ];
    for (const [tailId, answer] of tails) {
      if (!tailId || !answer || !questionId) continue;
      try {
        await updateTailAnswer.mutateAsync({ questionId, tailId, body: { user_answer: answer } });
      } catch {
        // 무시
      }
    }
    try {
      const res = await createRecord.mutateAsync({
        answer_type: 'TEXT',
        user_answer: answers.current.main,
        emotion_tag: emotions.join(', '),
        scene_description: (answers.current.tail1 || answers.current.main).slice(0, MAX_SCENE),
        is_myself_moment: !!answers.current.myselfMoment,
        myself_moment_desc: answers.current.myselfMoment ? answers.current.myselfMoment.slice(0, MAX_SCENE) : undefined,
      });
      setSavedId(res?.record?.record_id ?? null);
    } catch (err) {
      setTyping(false);
      if (err instanceof TodayRecordExistsError) {
        setExistingId(err.recordId);
        return;
      }
      // 저장에 실패하면 완료로 안내하지 않고 다시 시도하게 한다. 답변은 그대로 남아 있다.
      setSaveFailed(true);
      return;
    }
    try {
      const refreshed = await refetchProfile();
      if (refreshed.data?.latest_accuracy?.accuracy_percent != null) after = refreshed.data.latest_accuracy.accuracy_percent;
    } catch {
      // 정확도 갱신 실패는 표시만 이전 값으로 둔다.
    }
    setTyping(false);
    setAccuracy((a) => ({ ...a, after }));
    setFinding(emotions.length > 0 ? `오늘은 ${emotions.join(', ')}` : '오늘의 장면을 남겼어요');
    setTurn('summary');
  };

  // 모호한 답이면 다시 묻고 true를 돌려준다. 이미 한 번 다시 물었으면 그대로 진행한다.
  const retryIfVague = (text: string) => {
    const prompt = RETRY_PROMPT[turn];
    if (!prompt || retried.current[turn] || !isVagueAnswer(text)) return false;
    retried.current[turn] = true;
    appendUser(text);
    setInput('');
    appendAi(prompt);
    return true;
  };

  const answerMain = async (text: string) => {
    answers.current.main = text;
    if (mainAsksMyselfMoment) answers.current.myselfMoment = text;
    appendUser(text);
    setInput('');
    await goTail1();
  };

  const send = async () => {
    const text = input.trim();
    if ((turn === 'main' || turn === 'tail1' || turn === 'tail2') && text && retryIfVague(text)) return;
    if (turn === 'main' && text) {
      await answerMain(text);
    } else if (turn === 'tail1' && text) {
      answers.current.tail1 = text;
      appendUser(text);
      setInput('');
      // 다음 꼬리 질문을 만들 때 서버가 이 답을 참고할 수 있도록 바로 저장한다(실패해도 finish에서 다시 보낸다).
      if (tail1IdRef.current && questionId) {
        updateTailAnswer
          .mutateAsync({ questionId, tailId: tail1IdRef.current, body: { user_answer: text } })
          .then(() => (tail1Saved.current = true))
          .catch(() => {});
      }
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
      await finish();
    }
  };

  // 메인 질문의 답은 기록의 본문(필수)이라 건너뛸 수 없다. 꼬리 질문만 건너뛸 수 있다.
  const skip = async () => {
    if (turn === 'tail1') {
      appendUser('건너뛰기');
      goEmotion();
    } else if (turn === 'tail2') {
      appendUser('건너뛰기');
      await finish();
    }
  };

  /** 첫 화면에서 대화로 넘어간다. 첫 화면 입력칸에 쓴 말이 있으면 그걸 첫 질문의 답으로 바로 보낸다. */
  const begin = (firstAnswer?: string) => {
    setPhase('chat');
    appendAi(questionText, questionBadge);
    if (firstAnswer?.trim()) void answerMain(firstAnswer.trim());
  };

  if (existingId !== undefined) return <TodayRecordExists recordId={existingId} />;
  // 이미 오늘 기록이 있으면 대화를 시작하기 전에 수정으로 안내한다.
  if (phase === 'intro' && todayRecord.record) return <TodayRecordExists recordId={todayRecord.record.record_id} />;

  /* ── 첫 화면 (4c) ── */
  if (phase === 'intro') {
    return (
      <ChatIntro
        name={displayName}
        onBack={() => (router.canGoBack() ? router.back() : toMain())}
        onTopic={() => begin()}
        onSend={(t) => begin(t)}
        disabled={questionLoading}
        maxLength={MAX_ANSWER}
      />
    );
  }

  /* ── 대화 (4a · 4b) ── */
  const lastAiId = [...messages].reverse().find((m) => m.role === 'ai')?.id;
  const done = turn === 'summary';
  const composerDisabled = typing || saveFailed;
  const canSend =
    turn === 'emotion' ? emotions.length > 0 : turn === 'yesno' ? yesNo === 'no' || (yesNo === 'yes' && input.trim().length > 0) : input.trim().length > 0;
  const delta = Math.max(0, accuracy.after - accuracy.before);

  return (
    <Screen
      bg="#F1EFF8"
      background={<ChatBackdrop />}
      // 새 메시지마다 맨 아래로 내려야 해서 스크롤은 이 화면이 직접 갖는다.
      scroll={false}
      footerClassName="px-5 pt-2"
      footer={
        done ? (
          <Pressable onPress={() => router.push('/diary/streak')} accessibilityRole="button">
            <LinearGradient
              colors={['#8A6BFF', '#6367FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(99,103,255,0.3)' }}
            >
              <Text className="text-[16px] font-bold text-white">오늘 기록 완료</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <View className="gap-3">
            {!typing && (turn === 'tail1' || turn === 'tail2') && (
              <ScrollView horizontal className="-mx-5" contentContainerClassName="px-5 gap-2 py-1">
                {turn === 'tail1' && <QuickChip onPress={goEmotion}>태그로 답하기</QuickChip>}
                <QuickChip onPress={skip}>건너뛰기</QuickChip>
                <QuickChip onPress={reask}>다르게 물어봐줘</QuickChip>
              </ScrollView>
            )}
            <PillComposer
              value={turn === 'emotion' ? emotions.join(', ') : turn === 'yesno' && yesNo !== 'yes' ? '' : input}
              onChange={setInput}
              onSend={() => canSend && send()}
              sendEnabled={canSend}
              readOnly={turn === 'emotion' || (turn === 'yesno' && yesNo !== 'yes')}
              placeholder={
                typing
                  ? '메타미가 질문을 쓰는 중이에요'
                  : turn === 'yesno' && yesNo === 'yes'
                    ? '어떤 순간이었나요?'
                    : turn === 'emotion'
                      ? '위에서 감정을 골라주세요'
                      : turn === 'yesno'
                        ? '위에서 골라주세요'
                        : '답을 적어보세요'
              }
              disabled={composerDisabled}
              maxLength={turn === 'tail1' ? MAX_SCENE : MAX_ANSWER}
            />
          </View>
        )
      }
    >
      <View className="h-[52px] shrink-0 flex-row items-center justify-between px-5">
        <GlassBack onPress={toMain} />
        <View className="absolute left-0 right-0 items-center" pointerEvents="none">
          <Text className="text-[16px] font-bold text-ink">오늘의 대화</Text>
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <View className="w-[7px] h-[7px] shrink-0 rounded-full bg-[#34C759]" />
            <Text className="text-[12px] text-text-4">{dateLabel} · 3분 남짓</Text>
          </View>
        </View>
        <GlassCircle onPress={() => router.push(WRITE_HREF)} label="직접 쓰기로 바꾸기">
          <PencilIcon />
        </GlassCircle>
      </View>

      <ScrollView ref={listRef} className="flex-1 min-h-0" contentContainerClassName="px-5 pt-4 pb-4 gap-4">
        <View className="self-center rounded-full bg-page/60 px-3 py-1">
          <Text className="text-[12px] text-text-4">{timeLabel}</Text>
        </View>
        {messages.map((m) =>
          m.role === 'user' ? (
            m.kind === 'chips' ? (
              <View key={m.id} className="items-end gap-1.5 pl-12">
                <View className="flex-row justify-end flex-wrap gap-1.5">
                  {m.text.split(', ').map((e) => (
                    <View key={e} className="h-7 px-3 rounded-full bg-primary items-center justify-center">
                      <Text className="text-white text-[12px] font-semibold">{e}</Text>
                    </View>
                  ))}
                </View>
                <Text className="text-[12px] text-sub">감정 태그 {m.text.split(', ').length}개</Text>
              </View>
            ) : (
              <UserMessage key={m.id}>{m.text}</UserMessage>
            )
          ) : (
            <AiMessage
              key={m.id}
              badge={m.badge}
              footer={
                m.kind === 'emotion' ? (
                  <View className="mt-3">
                    <View className="flex-row flex-wrap gap-1.5">
                      {EMOTION_CHIPS.map((e) => {
                        const on = emotions.includes(e);
                        // 보낸 뒤 다음 질문을 기다리는 동안(typing)에도 잠가, 보낸 감정과 저장할 감정이 달라지지 않게 한다.
                        const disabled = m.id !== lastAiId || turn !== 'emotion' || typing;
                        return (
                          <Pressable
                            key={e}
                            disabled={disabled}
                            onPress={() => setEmotions((prev) => (on ? prev.filter((x) => x !== e) : [...prev, e]))}
                            accessibilityRole="button"
                            accessibilityState={{ selected: on, disabled }}
                            className={`h-8 shrink-0 px-3.5 rounded-full items-center justify-center ${on ? 'bg-primary-soft' : 'bg-surface'}`}
                          >
                            <Text className={`text-[12px] font-semibold ${on ? 'text-primary-pressed' : 'text-text-3'}`}>{e}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Text className="text-[12px] text-mute mt-3">
                      {emotions.length}개 선택됨{turn === 'emotion' ? ' · 아래에서 보내기' : ''}
                    </Text>
                  </View>
                ) : m.kind === 'yesno' ? (
                  <View className="flex-row gap-2 mt-3">
                    {(['yes', 'no'] as const).map((v) => (
                      <Pressable
                        key={v}
                        disabled={turn !== 'yesno' || typing}
                        onPress={() => setYesNo(v)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: yesNo === v, disabled: turn !== 'yesno' || typing }}
                        className={`flex-1 h-10 rounded-xl items-center justify-center ${yesNo === v ? 'bg-primary' : 'bg-surface'}`}
                      >
                        <Text className={`text-[14px] ${yesNo === v ? 'text-white font-bold' : 'text-text-4'}`}>{v === 'yes' ? '있었어요' : '잘 모르겠어요'}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : undefined
              }
            >
              {m.text}
            </AiMessage>
          ),
        )}
        {typing && <TypingMessage />}
        {saveFailed && (
          <AiMessage
            footer={
              <Pressable onPress={finish} accessibilityRole="button" className="mt-3 h-10 rounded-xl bg-primary items-center justify-center">
                <Text className="text-[14px] font-bold text-white">다시 저장하기</Text>
              </Pressable>
            }
          >
            기록을 저장하지 못했어요. 답변은 그대로 남아 있으니 다시 시도해 주세요.
          </AiMessage>
        )}
        {done && (
          <>
            <AiMessage
              footer={
                <View className="mt-3 flex-row gap-2">
                  <View className="flex-1 rounded-xl bg-surface px-3 py-3">
                    <Text className="text-[12px] text-text-4">나의 문장 정확도</Text>
                    <View className="mt-0.5 flex-row items-baseline gap-1">
                      <Text className="text-[18px] font-semibold tabular-nums text-ink">{accuracy.after}%</Text>
                      {delta > 0 && <Text className="text-[12px] font-bold text-primary tabular-nums">▲ {delta}%p</Text>}
                    </View>
                  </View>
                  <View className="flex-1 rounded-xl bg-surface px-3 py-3">
                    <Text className="text-[12px] text-text-4">오늘 남긴 감정</Text>
                    <Text className="mt-0.5 text-[14px] leading-[20px] font-semibold text-ink">{finding}</Text>
                  </View>
                </View>
              }
            >
              오늘 이야기 고마워요. 오늘 대화는 여기까지예요.
            </AiMessage>
            <View className="flex-row flex-wrap gap-2 pl-11">
              <QuickChip onPress={() => router.push('/chat')}>더 얘기할래요</QuickChip>
              {savedId && <QuickChip onPress={() => router.push({ pathname: '/diary/[id]', params: { id: savedId } })}>오늘 정리 보기</QuickChip>}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

// 민감정보 처리 동의를 철회했거나 동의 기록이 없으면 화면 대신 동의 화면을 보여 준다.
export default withSensitiveGate(DiaryChatScreen);
