import { useEffect, useRef, useState, type ComponentRef, type RefObject } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useCreateTailQuestion, useGetTodayDailyQuestion, useUpdateTailQuestionAnswer } from '@/entities/diary';
import { useGetMyProfile } from '@/entities/user';
import { TodayRecordExistsError, useSaveTodayRecord, useTodayRecord } from '@/hooks/useSaveTodayRecord';
import { TodayRecordExists } from '@/components/ui/TodayRecordExists';
import { useAuthStore } from '@/store';
import { SensitiveGate } from '@/components/SensitiveGate';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, Img3D, ProgressBar, TextButton } from '@/components/ui/primitives';
import { ChevronLeft } from '@/components/ui/icons';
import { AiAvatar, AiBubble, Composer, OutlineChip, TypingBubble, UserBubble } from '@/components/ui/chat';
import { AccuracyDonut } from '@/components/ui/AccuracyDonut';
import { Text } from '@/components/ui/Text';
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
// 메인 질문이 장면을 묻지 않을 때도 있어서 '그 장면' 같은 지시어 없이 묻는다.
const FALLBACK_TAIL_1 = '방금 이야기를 조금 더 자세히 들려줄 수 있나요? 그렇게 느낀 이유까지 알려주세요.';
const FALLBACK_TAIL_2 = '이 조합, 어떤 상황이었나요?';
// 명세상 최대 길이: user_answer 2000자, scene_description 1000자
const MAX_ANSWER = 2000;
const MAX_SCENE = 1000;
const EMOTION_CHIPS = ['몰입', '조급함', '뿌듯함', '지침', '무던함', '편안함', '설렘', '답답함'];

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

// 웹은 /main으로 push했다. 앱은 기록 화면을 스택에 남기지 않도록 홈 탭까지 되돌아간다.
const toMain = () => router.dismissTo('/main');

function DiaryChat() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { nickname } = useMe();
  const { data: fetchedQuestion, isPending: questionPending } = useGetTodayDailyQuestion(!!accessToken);
  // 이 화면에 들어와 처음 받은 질문을 끝까지 쓴다(저장 후 무효화로 다시 불러와도 문구가 바뀌지 않게).
  const [questionData, setQuestionData] = useState(fetchedQuestion);
  if (fetchedQuestion && !questionData) setQuestionData(fetchedQuestion);
  // 질문을 불러오는 동안 기본 문구를 띄웠다가 실제 질문으로 바뀌지 않게 한다(실패하면 기본 문구를 쓴다).
  const questionLoading = !!accessToken && questionPending;
  const { data: profile, refetch: refetchProfile } = useGetMyProfile(!!accessToken);
  const createTailQuestion = useCreateTailQuestion();
  const updateTailAnswer = useUpdateTailQuestionAnswer();
  const createRecord = useSaveTodayRecord();
  const todayRecord = useTodayRecord();
  // 저장 시점에 409로 오늘 기록이 있다는 걸 알게 된 경우(undefined = 해당 없음)
  const [existingId, setExistingId] = useState<string | null | undefined>(undefined);

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
  const [saveFailed, setSaveFailed] = useState(false);
  const [freeError, setFreeError] = useState('');
  const [startedAt] = useState(() => new Date());

  const answers = useRef({ main: '', tail1: '', tail2: '', myselfMoment: '' });
  const tail1IdRef = useRef<string | null>(null);
  const tail2IdRef = useRef<string | null>(null);
  const tail1Saved = useRef(false);
  // 턴마다 다시 묻기는 한 번만 한다(두 번째도 모호하면 그대로 받고 넘어간다).
  const retried = useRef<Partial<Record<TurnKey, boolean>>>({});
  const listRef = useRef<ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages, typing, turn]);

  useEffect(() => {
    if (turn !== 'summary') return;
    const t = setTimeout(() => setPhase('done'), 2600);
    return () => clearTimeout(t);
  }, [turn]);

  // 기록 전 정확도를 처음 한 번만 잡아 둔다. 저장 후 프로필을 다시 불러와도 before가 덮어써지지 않게 한다.
  // (웹은 ref + effect였다. 앱 lint 규칙에 맞춰 렌더 중에 state로 한 번만 맞춘다.)
  const [baselineSet, setBaselineSet] = useState(false);
  if (!baselineSet && profile) {
    setBaselineSet(true);
    const current = profile.latest_accuracy?.accuracy_percent ?? 0;
    setAccuracy({ before: current, after: current });
  }

  const rawQuestion = questionData?.question?.question_text;
  const questionText = rawQuestion && /[가-힣]/.test(rawQuestion) ? rawQuestion : FALLBACK_QUESTION;
  const questionBadge = QUESTION_TYPE_LABEL[questionData?.question?.question_type ?? ''];
  // 웹은 ref에 담았다. 처음 받은 질문을 끝까지 쓰므로 값이 바뀌지 않아 그대로 읽는다.
  const questionId = questionData?.question?.question_id ?? null;
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

  const begin = () => {
    setPhase('chat');
    appendAi(questionText, questionBadge);
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
      emotions.length >= 2
        ? `${emotions[0]}과 ${emotions[1]}이 같이 왔네요. ${FALLBACK_TAIL_2}`
        : `'${emotions[0]}' 감정이 든 순간, 어떤 상황이었나요?`;
    const text = await askTail(tail2IdRef, fallback);
    appendAi(text, `자동 추가 · 태그 ${emotions.length}개`);
    setTurn('tail2');
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
      await createRecord.mutateAsync({
        answer_type: 'TEXT',
        user_answer: answers.current.main,
        emotion_tag: emotions.join(', '),
        scene_description: (answers.current.tail1 || answers.current.main).slice(0, MAX_SCENE),
        is_myself_moment: !!answers.current.myselfMoment,
        myself_moment_desc: answers.current.myselfMoment ? answers.current.myselfMoment.slice(0, MAX_SCENE) : undefined,
      });
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
    setFinding(emotions.length > 0 ? `오늘은 '${emotions.join(', ')}'을(를) 느꼈다고 기록했어요.` : '오늘 기록을 바탕으로 문장을 업데이트해둘게요.');
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

  const send = async () => {
    const text = input.trim();
    if ((turn === 'main' || turn === 'tail1' || turn === 'tail2') && text && retryIfVague(text)) return;
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

  const submitFree = async () => {
    const text = freeText.trim();
    if (!text || createRecord.isPending) return;
    setFreeError('');
    try {
      await createRecord.mutateAsync({
        answer_type: 'TEXT',
        user_answer: text,
        emotion_tag: '자유 기록',
        scene_description: text.slice(0, MAX_SCENE),
        is_myself_moment: false,
      });
    } catch (err) {
      if (err instanceof TodayRecordExistsError) setExistingId(err.recordId);
      else setFreeError('기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    setFinding('자유롭게 남겨주신 기록, 잘 저장해뒀어요.');
    setPhase('done');
  };

  if (existingId !== undefined) return <TodayRecordExists recordId={existingId} />;
  // 이미 오늘 기록이 있으면 대화를 시작하기 전에 수정으로 안내한다(저장 후 완료 화면에서는 보여주지 않는다).
  if (phase === 'intro' && todayRecord.record) return <TodayRecordExists recordId={todayRecord.record.record_id} />;

  /* ── 인트로 ── */
  if (phase === 'intro') {
    return (
      <Screen
        footer={
          <Composer
            value={mode === 'FREE' ? freeText : ''}
            onChange={setFreeText}
            onSend={mode === 'AI' ? begin : submitFree}
            sendEnabled={mode === 'AI' ? !questionLoading : freeText.trim().length > 0 && !createRecord.isPending}
            maxLength={MAX_ANSWER}
            placeholder={mode === 'AI' ? '첫 질문을 기다리는 중' : '오늘을 자유롭게 적어보세요'}
            chips={
              <>
                <Pressable
                  onPress={() => setMode('AI')}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: mode === 'AI' }}
                  className={`h-8 px-3 rounded-full flex-row items-center gap-1.5 ${mode === 'AI' ? 'bg-white' : ''}`}
                >
                  <AiAvatar size={14} />
                  <Text className={`text-[13px] ${mode === 'AI' ? 'font-semibold text-ink' : 'text-sub'}`}>AI 질문</Text>
                </Pressable>
                <Pressable
                  onPress={() => setMode('FREE')}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: mode === 'FREE' }}
                  className={`h-8 px-3 rounded-full justify-center ${mode === 'FREE' ? 'bg-white' : ''}`}
                >
                  <Text className={`text-[13px] ${mode === 'FREE' ? 'font-semibold text-ink' : 'text-sub'}`}>자유 기록</Text>
                </Pressable>
              </>
            }
          />
        }
      >
        <View className="flex-row items-center justify-center h-14 px-5">
          <BackButton href="/main" className="absolute left-5" />
          <View className="items-center">
            <Text className="text-[15px] font-semibold text-ink">오늘의 기록</Text>
            <Text className="text-[12px] text-sub mt-0.5">
              {dateLabel} {weekday}요일
            </Text>
          </View>
        </View>
        <View className="items-center pt-[110px] px-5">
          <Img3D name="star-pink" size={210} />
          <Text className="text-[22px] font-bold text-ink text-center leading-[33px] mt-9">
            {questionLoading ? ' ' : `${nickname ? `${nickname}님, ` : ''}${questionText.replace(/^오늘 하루는 /, '오늘 하루는\n')}`}
          </Text>
          {mode === 'FREE' && !!freeError && <Text className="text-[13px] text-danger mt-4">{freeError}</Text>}
        </View>
      </Screen>
    );
  }

  /* ── 완료 ── */
  if (phase === 'done') {
    return (
      <Screen
        footer={
          <>
            <Button
              style={{ boxShadow: '0 8px 24px rgba(99,103,255,0.3)' }}
              onPress={() => router.push('/report/sentence')}
            >
              <Text className="text-[16px] font-semibold text-white">오늘의 문장 보기</Text>
              <Text className="text-[18px] text-white">›</Text>
            </Button>
            <TextButton className="mt-1" onPress={() => router.push('/diary/streak')}>
              연속 기록 보기
            </TextButton>
          </>
        }
      >
        <View className="flex-row justify-end px-5 h-14 items-center">
          <Pressable onPress={toMain} accessibilityRole="button" hitSlop={8}>
            <Text className="text-[15px] text-sub">닫기</Text>
          </Pressable>
        </View>
        <View className="items-center">
          <Img3D name="check" size={96} />
          <Text className="text-[24px] font-bold text-ink mt-3">오늘 기록 완료</Text>
          <Text className="text-[14px] text-sub mt-2">
            {mode === 'FREE' ? '오늘 기록이 저장됐어요.' : `${totalTurns}개 질문에 답했어요. 문장이 조금 더 정확해졌습니다.`}
          </Text>
          <View className="mt-8">
            <AccuracyDonut percent={accuracy.after} delta={Math.max(0, accuracy.after - accuracy.before)} />
          </View>
        </View>
        <View className="mx-5 mt-8 mb-4 rounded-3xl bg-white px-5 py-5" style={{ boxShadow: '0 6px 24px rgba(26,26,30,0.06)' }}>
          <Text className="text-[12px] font-semibold text-primary">오늘 발견한 것</Text>
          <Text className="text-[17px] font-bold text-ink leading-[23px] mt-2">{finding}</Text>
          {emotions.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-4">
              {emotions.map((e) => (
                <View key={e} className="h-8 px-3.5 rounded-full bg-surface-2 justify-center">
                  <Text className="text-[13px] font-semibold text-primary">{e}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Screen>
    );
  }

  /* ── 대화 ── */
  const lastAiId = [...messages].reverse().find((m) => m.role === 'ai')?.id;
  const composerDisabled = typing || turn === 'summary' || saveFailed;
  const canSend =
    turn === 'emotion' ? emotions.length > 0 : turn === 'yesno' ? yesNo === 'no' || (yesNo === 'yes' && input.trim().length > 0) : input.trim().length > 0;

  return (
    <Screen
      // 새 메시지마다 맨 아래로 내려야 해서 스크롤은 이 화면이 직접 갖는다(웹 bodyRef 대신).
      scroll={false}
      footer={
        <Composer
          value={turn === 'emotion' ? emotions.join(', ') : turn === 'yesno' && yesNo !== 'yes' ? '' : input}
          onChange={setInput}
          onSend={() => canSend && send()}
          sendEnabled={canSend}
          placeholder={turn === 'yesno' && yesNo === 'yes' ? '어떤 순간이었나요?' : turn === 'emotion' ? '위에서 감정을 골라주세요' : '답을 적어보세요'}
          disabled={composerDisabled}
          maxLength={turn === 'tail1' ? MAX_SCENE : MAX_ANSWER}
          disabledLabel="metame가 질문을 쓰는 중이에요"
          disabledHint="질문이 도착하면 입력창이 열려요"
          chips={
            <>
              {turn === 'tail1' && <OutlineChip onPress={goEmotion}>태그로 답하기</OutlineChip>}
              {(turn === 'tail1' || turn === 'tail2') && <OutlineChip onPress={skip}>건너뛰기</OutlineChip>}
            </>
          }
        />
      }
    >
      <View className="flex-row items-center justify-between h-14 px-5 bg-surface-2">
        <Pressable onPress={toMain} accessibilityRole="button" accessibilityLabel="나가기" hitSlop={8} className="w-8">
          <ChevronLeft size={20} />
        </Pressable>
        <Text className="text-[14px] font-semibold text-ink">오늘의 기록 · {dateLabel}</Text>
        <Text className="text-[13px] font-semibold text-primary w-8 text-right">
          {turnNumber[turn]} / {totalTurns}
        </Text>
      </View>

      <ScrollView
        ref={listRef}
        className="flex-1"
        contentContainerClassName="px-4 pt-2 pb-4 gap-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      >
        <Text className="text-center text-[12px] text-mute">{timeLabel}</Text>
        {messages.map((m) =>
          m.role === 'user' ? (
            m.kind === 'chips' ? (
              <View key={m.id} className="flex-row justify-end flex-wrap gap-2 pl-12">
                {m.text.split(', ').map((e) => (
                  <View key={e} className="h-9 px-4 rounded-full bg-primary justify-center">
                    <Text className="text-white text-[14px] font-semibold">{e}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <UserBubble key={m.id}>{m.text}</UserBubble>
            )
          ) : (
            <AiBubble
              key={m.id}
              badge={m.badge}
              footer={
                m.kind === 'emotion' ? (
                  <View className="mt-3">
                    <View className="flex-row flex-wrap gap-2">
                      {EMOTION_CHIPS.map((e) => {
                        const on = emotions.includes(e);
                        return (
                          <Pressable
                            key={e}
                            disabled={m.id !== lastAiId || turn !== 'emotion'}
                            onPress={() => setEmotions((prev) => (on ? prev.filter((x) => x !== e) : [...prev, e]))}
                            accessibilityRole="button"
                            accessibilityState={{ selected: on }}
                            className={`h-9 px-3.5 rounded-full justify-center ${on ? 'bg-primary' : 'bg-surface-2'}`}
                          >
                            <Text className={`text-[14px] ${on ? 'text-white font-semibold' : 'text-[#48484F]'}`}>{e}</Text>
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
                        disabled={turn !== 'yesno'}
                        onPress={() => setYesNo(v)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: yesNo === v }}
                        className={`h-11 px-5 rounded-xl justify-center ${yesNo === v ? 'border-2 border-primary bg-white' : 'bg-surface-2'}`}
                      >
                        <Text className={`text-[14px] font-semibold ${yesNo === v ? 'text-primary' : 'text-sub'}`}>
                          {v === 'yes' ? '있었어요' : '잘 모르겠어요'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : undefined
              }
            >
              {m.text}
            </AiBubble>
          ),
        )}
        {typing && <TypingBubble />}
        {saveFailed && (
          <Animated.View entering={FadeIn.duration(300)} className="rounded-3xl bg-surface-2 px-5 py-5 items-center">
            <Text className="text-[15px] font-bold text-ink">기록을 저장하지 못했어요</Text>
            <Text className="text-[13px] text-sub mt-1">답변은 그대로 남아 있어요. 다시 시도해 주세요.</Text>
            <Button className="mt-4" onPress={finish}>
              다시 시도
            </Button>
          </Animated.View>
        )}
        {turn === 'summary' && (
          <Animated.View entering={FadeIn.duration(300)} className="rounded-3xl bg-surface-2 px-5 py-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-[16px] font-bold text-ink">오늘 기록 정리됨</Text>
              <Text className="text-[13px] font-semibold text-primary">
                정확도 {accuracy.before}% → {accuracy.after}%
              </Text>
            </View>
            <ProgressBar value={accuracy.after} className="mt-3" track="#DCDDFB" height={6} />
            <Text className="text-[13px] text-[#48484F] mt-3">{finding}</Text>
          </Animated.View>
        )}
      </ScrollView>
    </Screen>
  );
}

export default function DiaryChatScreen() {
  return (
    <SensitiveGate>
      <DiaryChat />
    </SensitiveGate>
  );
}
