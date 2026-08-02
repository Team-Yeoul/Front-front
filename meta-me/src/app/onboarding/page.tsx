'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubmitOnboarding } from '@/entities/user';

type Step = 'notification' | 'description' | 'done' | 'day0';

export default function OnboardingPage() {
  const router = useRouter();
  const submitOnboarding = useSubmitOnboarding();
  const [step, setStep] = useState<Step>('notification');
  const [myOneSentence, setMyOneSentence] = useState('');
  const [selfStrength, setSelfStrength] = useState('');
  const [othersFeedback, setOthersFeedback] = useState('');
  const [favoriteThing, setFavoriteThing] = useState('');
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [aiSentence, setAiSentence] = useState('');
  const [submitError, setSubmitError] = useState('');
  const hasText =
    myOneSentence.trim().length > 0 &&
    selfStrength.trim().length > 0 &&
    othersFeedback.trim().length > 0 &&
    favoriteThing.trim().length > 0;

  useEffect(() => {
    if (step !== 'done') return;
    const t = setTimeout(() => setStep('day0'), 2200);
    return () => clearTimeout(t);
  }, [step]);

  const handleDescriptionSubmit = () => {
    if (!hasText || submitOnboarding.isPending) return;
    setSubmitError('');
    submitOnboarding.mutate(
      {
        my_one_sentence: myOneSentence,
        self_strength: selfStrength,
        others_feedback: othersFeedback,
        favorite_thing: favoriteThing,
      },
      {
        onSuccess: (res) => {
          if (res.ai_first_sentence && /[가-힣]/.test(res.ai_first_sentence)) {
            setAiSentence(res.ai_first_sentence);
          }
          setStep('done');
        },
        onError: () => setSubmitError('제출에 실패했어요. 다시 시도해주세요.'),
      },
    );
  };

  // ── 알림 권한 ──
  if (step === 'notification') {
    return (
      <div className="relative flex flex-col h-full bg-white">
        {/* 뒤로가기 */}
        <button className="px-5 pt-6 pb-2 text-sm text-blue-500 text-left flex items-center gap-0.5">
          <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
            <path d="M7 1L1 6.5L7 12" stroke="#3478F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="ml-1">뒤로가기</span>
        </button>

        <div className="flex-1 overflow-y-auto px-6">
          {/* 플레이스홀더 프리뷰 */}
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
            처음 한 번, 놓치지 않도록 나의 감정과 생각을 탐색하는데 사운드 및 아이콘
            배지가 알림에 포함될 수 있습니다. 설정에서 이를 구성할 수 있습니다.
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

        {/* iOS 스타일 권한 다이얼로그 */}
        {showPermissionDialog && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center px-10 z-50">
            <div className="bg-white rounded-2xl overflow-hidden w-full">
              <div className="px-5 pt-6 pb-5 text-center">
                <p className="text-[14px] font-semibold text-gray-900 mb-2 leading-snug">
                  &lsquo;MetaMe&rsquo; 에서 알림을 보내고자 합니다.
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

  // ── 자기소개 ──
  if (step === 'description') {
    return (
      <div className="flex flex-col h-full bg-white">
        <button
          onClick={() => setStep('notification')}
          className="px-5 pt-6 pb-2 w-fit focus:outline-none"
          aria-label="뒤로"
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            <path d="M8.5 1.5L1.5 8L8.5 14.5" stroke="#1C1C1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex-1 overflow-y-auto px-6 pt-4">
          <p className="text-[13px] text-gray-400 mb-5 leading-snug">
            생각보다 우리는 스스로를 정확히 모를 수도 있어요
          </p>
          <h2 className="text-[24px] font-bold text-gray-900 leading-[1.4] mb-7">
            당신은 스스로를<br />한 문장으로 설명할<br />수 있나요?
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[13px] font-medium text-gray-700 mb-1.5 block">
                나를 한 문장으로 설명한다면?
              </label>
              <input
                type="text"
                value={myOneSentence}
                onChange={e => setMyOneSentence(e.target.value)}
                placeholder="나는 몰입할 때 가장 나다운 사람입니다"
                className="w-full h-[52px] rounded-xl px-4 text-[15px] text-gray-900 outline-none placeholder:text-gray-300 bg-gray-50 border border-gray-200"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-gray-700 mb-1.5 block">
                내가 생각하는 나의 장점은?
              </label>
              <input
                type="text"
                value={selfStrength}
                onChange={e => setSelfStrength(e.target.value)}
                placeholder="새로운 것을 빨리 이해합니다"
                className="w-full h-[52px] rounded-xl px-4 text-[15px] text-gray-900 outline-none placeholder:text-gray-300 bg-gray-50 border border-gray-200"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-gray-700 mb-1.5 block">
                남에게 자주 듣는 말은?
              </label>
              <input
                type="text"
                value={othersFeedback}
                onChange={e => setOthersFeedback(e.target.value)}
                placeholder="설명을 잘한다는 말을 들어요"
                className="w-full h-[52px] rounded-xl px-4 text-[15px] text-gray-900 outline-none placeholder:text-gray-300 bg-gray-50 border border-gray-200"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-gray-700 mb-1.5 block">
                내가 좋아한다고 생각하는 것은?
              </label>
              <input
                type="text"
                value={favoriteThing}
                onChange={e => setFavoriteThing(e.target.value)}
                placeholder="프로그래밍과 문제 해결"
                className="w-full h-[52px] rounded-xl px-4 text-[15px] text-gray-900 outline-none placeholder:text-gray-300 bg-gray-50 border border-gray-200"
              />
            </div>
          </div>
        </div>

        <div className="px-6 pb-14 pt-4 flex flex-col gap-4 shrink-0">
          {submitError && <p className="text-[13px] text-red-500 -mt-2">{submitError}</p>}
          <button
            onClick={handleDescriptionSubmit}
            disabled={submitOnboarding.isPending}
            className={`w-full h-14 rounded-2xl text-base font-semibold text-white transition-colors focus:outline-none ${hasText && !submitOnboarding.isPending ? 'bg-gray-900' : 'bg-gray-300 cursor-default'}`}
          >
            {submitOnboarding.isPending ? '분석 중...' : '입력완료'}
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

  // ── Day 0 ──
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 flex items-center justify-center">
        <span className="text-[36px] font-bold text-gray-900">Day 0</span>
      </div>
      <div className="px-6 pb-14">
        <button
          onClick={() => router.push('/main')}
          className="w-full h-14 bg-gray-900 text-white rounded-2xl text-base font-semibold focus:outline-none"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
