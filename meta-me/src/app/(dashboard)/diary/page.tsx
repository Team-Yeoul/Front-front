'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateDailyRecord, useGetTodayDailyQuestion } from '@/entities/diary';
import type { SubmitDailyRecordRequest } from '@/entities/diary';
import { userKeys, useGetMyAccount } from '@/entities/user';
import { useAuthStore } from '@/store';

type Step = 'intro' | 'question' | 'emotion' | 'scene' | 'moment' | 'review' | 'complete';

const EMOTION_CHIPS = ['편안함', '뿌듯함', '화남', '우울함', '불안', '무기력', '답답함', '감사', '기쁨', '슬픔', '설렘', '만족감'];
const ACTIVITY_CHIPS = ['공부', '업무', '운동', '요리', '휴식', '취미', '여행', '쇼핑', '게임', '독서'];
const COMPANION_CHIPS = ['혼자', '친구', '부모님', '동료', '가족', '연인'];

const FALLBACK_QUESTION = '오늘 가장 나답다고 느낀 순간은 언제였나요?';

const PAGE_BG = { backgroundImage: 'linear-gradient(to bottom, #E9EAFF, #ffffff 40%)' };

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-full text-[14px] font-medium border transition-colors ${
        selected ? 'bg-[#8287FF] text-white border-[#8287FF]' : 'bg-white text-gray-600 border-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

function StepFooter({
  onPrev,
  onNext,
  nextLabel = '다음으로',
  nextDisabled = false,
}: {
  onPrev?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex gap-2 pt-4">
      {onPrev && (
        <button
          type="button"
          onClick={onPrev}
          className="w-24 h-14 rounded-2xl border border-gray-200 text-gray-500 font-semibold text-[15px]"
        >
          이전
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className={`flex-1 h-14 rounded-2xl text-[15px] font-semibold transition-colors ${
          nextDisabled ? 'bg-gray-200 text-gray-400' : 'bg-gray-900 text-white'
        }`}
      >
        {nextLabel}
      </button>
    </div>
  );
}

export default function DiaryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const nickname = useAuthStore((s) => s.nickname);
  const { data: account } = useGetMyAccount(!!accessToken);
  const { data: questionData } = useGetTodayDailyQuestion();
  const createRecord = useCreateDailyRecord();

  const displayName = nickname || (account?.user.email ? account.user.email.split('@')[0] : '회원');

  const [step, setStep] = useState<Step>('intro');
  const [answerType, setAnswerType] = useState<'TEXT' | 'TAGS'>('TEXT');
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedCompanions, setSelectedCompanions] = useState<string[]>([]);
  const [emotionTag, setEmotionTag] = useState('');
  const [sceneDescription, setSceneDescription] = useState('');
  const [isMyselfMoment, setIsMyselfMoment] = useState<boolean | null>(null);
  const [myselfMomentDesc, setMyselfMomentDesc] = useState('');
  const [submitError, setSubmitError] = useState('');

  // 실제 백엔드가 문서화된 스펙({ question: {...} })과 다르게 필드를 평평하게
  // ({ question_text, ... }) 내려주는 경우가 있어 두 형태를 모두 지원한다.
  const rawQuestion = questionData as
    | { question?: { question_text?: string }; question_text?: string }
    | undefined;
  const fetchedQuestion = rawQuestion?.question?.question_text ?? rawQuestion?.question_text;
  const questionText = fetchedQuestion && /[가-힣]/.test(fetchedQuestion) ? fetchedQuestion : FALLBACK_QUESTION;

  const makeToggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (tag: string) => {
    setter((tags) => (tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]));
  };
  const toggleEmotion = makeToggle(setSelectedEmotions);
  const toggleActivity = makeToggle(setSelectedActivities);
  const toggleCompanion = makeToggle(setSelectedCompanions);

  const handleSubmit = () => {
    setSubmitError('');
    const body: SubmitDailyRecordRequest = {
      answer_type: answerType,
      user_answer: answerType === 'TEXT' ? userAnswer : undefined,
      user_answer_tags:
        answerType === 'TAGS' ? [...selectedEmotions, ...selectedActivities, ...selectedCompanions] : undefined,
      emotion_tag: emotionTag,
      scene_description: sceneDescription,
      is_myself_moment: !!isMyselfMoment,
      myself_moment_desc: isMyselfMoment ? myselfMomentDesc : undefined,
    };
    createRecord.mutate(body, {
      onSuccess: () => {
        // 기록 깊이가 객관화 정확도(%)에 반영되므로 메인 페이지의 프로필/정확도 캐시도 갱신
        queryClient.invalidateQueries({ queryKey: userKeys.profile() });
        queryClient.invalidateQueries({ queryKey: userKeys.accuracy() });
        setStep('complete');
      },
      onError: () => setSubmitError('기록 저장에 실패했어요. 다시 시도해주세요.'),
    });
  };

  if (step === 'intro') {
    return (
      <div className="flex flex-col h-full px-5 pt-8 pb-6" style={PAGE_BG}>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Group.png" alt="질문" width={72} height={66} className="mb-6" />
          <p className="text-[18px] font-bold text-gray-900 leading-snug">
            안녕하세요, {displayName}님
            <br />
            오늘의 나를 기록해볼까요?
          </p>
          <p className="text-[13px] text-gray-400 mt-4 leading-relaxed">
            최근 사람들 반응을 자주 언급했어요
            <br />
            오늘도 그런 순간이 있었나요?
          </p>
        </div>
        <StepFooter onNext={() => setStep('question')} nextLabel="오늘 기록하기" />
      </div>
    );
  }

  if (step === 'question') {
    const nextDisabled =
      answerType === 'TEXT'
        ? userAnswer.trim().length === 0
        : selectedEmotions.length === 0 || selectedActivities.length === 0 || selectedCompanions.length === 0;
    return (
      <div className="flex flex-col h-full px-5 pt-6 pb-6" style={PAGE_BG}>
        <p className="text-[22px] font-bold text-gray-900 leading-snug mb-6">{questionText}</p>

        <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
          <button
            type="button"
            onClick={() => setAnswerType('TEXT')}
            className={`flex-1 h-11 rounded-lg text-[14px] font-medium transition-colors ${
              answerType === 'TEXT' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
            }`}
          >
            텍스트
          </button>
          <button
            type="button"
            onClick={() => setAnswerType('TAGS')}
            className={`flex-1 h-11 rounded-lg text-[14px] font-medium transition-colors ${
              answerType === 'TAGS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
            }`}
          >
            태그
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {answerType === 'TEXT' ? (
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="이곳에 편안하고 자유롭게 적어보세요"
              className="w-full h-52 border border-gray-200 rounded-2xl p-5 text-[15px] text-gray-900 outline-none placeholder:text-gray-300 resize-none"
            />
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-[14px] font-semibold text-gray-700 mb-2.5">오늘 감정을 느꼈나요?</p>
                <div className="flex flex-wrap gap-2.5">
                  {EMOTION_CHIPS.map((c) => (
                    <Chip key={c} label={c} selected={selectedEmotions.includes(c)} onClick={() => toggleEmotion(c)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-gray-700 mb-2.5">가장 기억에 남는 활동은 무엇인가요?</p>
                <div className="flex flex-wrap gap-2.5">
                  {ACTIVITY_CHIPS.map((c) => (
                    <Chip key={c} label={c} selected={selectedActivities.includes(c)} onClick={() => toggleActivity(c)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-gray-700 mb-2.5">누구랑 함께했나요?</p>
                <div className="flex flex-wrap gap-2.5">
                  {COMPANION_CHIPS.map((c) => (
                    <Chip key={c} label={c} selected={selectedCompanions.includes(c)} onClick={() => toggleCompanion(c)} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <StepFooter onPrev={() => setStep('intro')} onNext={() => setStep('emotion')} nextDisabled={nextDisabled} />
      </div>
    );
  }

  if (step === 'emotion') {
    return (
      <div className="flex flex-col h-full px-5 pt-6 pb-6" style={PAGE_BG}>
        <p className="text-[22px] font-bold text-gray-900 leading-snug mb-6">지금 감정을 한 단어로 표현해주세요</p>

        <textarea
          value={emotionTag}
          onChange={(e) => setEmotionTag(e.target.value)}
          placeholder="지금 마음을 한 단어로 적어보세요"
          className="w-full h-20 border border-gray-200 rounded-2xl p-5 text-[15px] text-gray-900 outline-none placeholder:text-gray-300 resize-none mb-6"
        />

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-wrap gap-2.5">
            {EMOTION_CHIPS.map((c) => (
              <Chip key={c} label={c} selected={emotionTag === c} onClick={() => setEmotionTag(c)} />
            ))}
          </div>
        </div>

        <StepFooter
          onPrev={() => setStep('question')}
          onNext={() => setStep('scene')}
          nextDisabled={emotionTag.trim().length === 0}
        />
      </div>
    );
  }

  if (step === 'scene') {
    return (
      <div className="flex flex-col h-full px-5 pt-6 pb-6" style={PAGE_BG}>
        <p className="text-[22px] font-bold text-gray-900 leading-snug mb-6">
          오늘 하신 활동 중 가장 선명하게 기억나는 장면은?
        </p>
        <textarea
          value={sceneDescription}
          onChange={(e) => setSceneDescription(e.target.value)}
          placeholder={'선명한 장면을 설명해주세요. 예를 들면:\n"오늘 팀장님이 갑자기 나를 불러서 칭찬을 했다"'}
          className="w-full flex-1 border border-gray-200 rounded-2xl p-5 text-[15px] text-gray-900 outline-none placeholder:text-gray-300 resize-none"
        />
        <StepFooter
          onPrev={() => setStep('emotion')}
          onNext={() => setStep('moment')}
          nextDisabled={sceneDescription.trim().length === 0}
        />
      </div>
    );
  }

  if (step === 'moment') {
    const nextDisabled = isMyselfMoment === null || (isMyselfMoment && myselfMomentDesc.trim().length === 0);
    return (
      <div className="flex flex-col h-full px-5 pt-6 pb-6" style={PAGE_BG}>
        <p className="text-[22px] font-bold text-gray-900 leading-snug mb-6">
          오늘 돌아보았을 때 나답다고 느낀 순간이 있었나요?
        </p>

        <div className="flex gap-2.5 mb-5">
          <button
            type="button"
            onClick={() => setIsMyselfMoment(true)}
            className={`flex-1 h-14 rounded-xl text-[15px] font-semibold border transition-colors ${
              isMyselfMoment === true ? 'bg-[#8287FF] text-white border-[#8287FF]' : 'bg-white border-gray-200 text-gray-500'
            }`}
          >
            있었어요!
          </button>
          <button
            type="button"
            onClick={() => setIsMyselfMoment(false)}
            className={`flex-1 h-14 rounded-xl text-[15px] font-semibold border transition-colors ${
              isMyselfMoment === false ? 'bg-[#8287FF] text-white border-[#8287FF]' : 'bg-white border-gray-200 text-gray-500'
            }`}
          >
            없었어요
          </button>
        </div>

        {isMyselfMoment && (
          <textarea
            value={myselfMomentDesc}
            onChange={(e) => setMyselfMomentDesc(e.target.value)}
            placeholder="어떤 순간이었는지 들려주세요"
            className="w-full flex-1 border border-gray-200 rounded-2xl p-5 text-[15px] text-gray-900 outline-none placeholder:text-gray-300 resize-none"
          />
        )}
        {!isMyselfMoment && <div className="flex-1" />}

        <StepFooter
          onPrev={() => setStep('scene')}
          onNext={() => setStep('review')}
          nextLabel="저장하기"
          nextDisabled={nextDisabled}
        />
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="flex flex-col h-full px-5 pt-6 pb-6" style={PAGE_BG}>
        <p className="text-[22px] font-bold text-gray-900 leading-snug mb-6">
          나답다고 느꼈던 그 순간을 공유해봐요!
        </p>
        <div className="flex-1 bg-gray-50 rounded-2xl p-5 overflow-y-auto">
          <p className="text-[13px] text-gray-400 mb-1">오늘의 감정</p>
          <p className="text-[15px] font-semibold text-gray-900 mb-4">{emotionTag}</p>
          <p className="text-[13px] text-gray-400 mb-1">기억나는 장면</p>
          <p className="text-[14px] text-gray-700 mb-4 leading-relaxed">{sceneDescription}</p>
          {isMyselfMoment && (
            <>
              <p className="text-[13px] text-gray-400 mb-1">나다움을 느낀 순간</p>
              <p className="text-[14px] text-gray-700 leading-relaxed">{myselfMomentDesc}</p>
            </>
          )}
        </div>
        {submitError && <p className="text-[13px] text-red-500 mt-3">{submitError}</p>}
        <StepFooter
          onPrev={() => setStep('moment')}
          onNext={handleSubmit}
          nextLabel={createRecord.isPending ? '저장 중...' : '이어가기'}
          nextDisabled={createRecord.isPending}
        />
      </div>
    );
  }

  const todayLabel = new Date().toLocaleDateString('sv-SE').replaceAll('-', '.');
  const daySummary = [sceneDescription, isMyselfMoment ? myselfMomentDesc : ''].filter(Boolean).join('\n\n');

  return (
    <div className="flex flex-col h-full px-5 pt-8 pb-6" style={PAGE_BG}>
      <p className="text-[13px] text-gray-400 mb-2">{todayLabel}</p>
      <p className="text-[22px] font-bold text-gray-900 leading-snug mb-6">
        오늘의 기록 완료.
        <br />
        오늘 하루도 수고 많으셨어요!
      </p>

      <div className="bg-[#8287FF] rounded-2xl px-5 py-5 flex mb-7">
        <div className="flex-1">
          <p className="text-[12px] text-white/70 mb-1">기록 깊이</p>
          <p className="text-[20px] font-bold text-white">+12XP</p>
        </div>
        <div className="w-px bg-white/20 mx-2" />
        <div className="flex-1">
          <p className="text-[12px] text-white/70 mb-1">객관화 정확도</p>
          <p className="text-[20px] font-bold text-white">+1%</p>
        </div>
      </div>

      <p className="text-[15px] font-semibold text-gray-900 mb-3">{displayName}님의 오늘 하루는 이랬어요.</p>
      <div className="flex-1 bg-gray-50 rounded-2xl p-5 overflow-y-auto mb-6">
        {daySummary ? (
          <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-line">{daySummary}</p>
        ) : (
          <p className="text-[14px] text-gray-300">여기에 간략하게 내용 넣기</p>
        )}
      </div>

      <div className="flex flex-col gap-2.5 pt-4">
        <button
          type="button"
          onClick={() => router.push('/objectify')}
          className="w-full h-14 rounded-2xl bg-[#8287FF] text-white text-[15px] font-semibold"
        >
          거울에 비춰보기
        </button>
        <button
          type="button"
          onClick={() => router.push('/main')}
          className="w-full h-14 rounded-2xl bg-gray-900 text-white text-[15px] font-semibold"
        >
          완료하기
        </button>
      </div>
    </div>
  );
}
