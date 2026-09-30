'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useUpdateNotificationSettings, userApi } from '@/entities/user';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, Img3D, TextButton } from '@/components/ui/primitives';
import { HourSlider } from '@/components/ui/HourSlider';

/** 오후 6시(18) ~ 새벽 2시(26) — 슬라이더 값은 18~26 사이 정수 시각. */
const MIN_HOUR = 18;
const MAX_HOUR = 26;

const hourLabel = (h: number) => {
  const hh = h % 24;
  if (hh === 0) return '자정';
  if (hh < 6) return `새벽 ${hh}시`;
  if (hh < 12) return `오전 ${hh}시`;
  if (hh === 12) return '낮 12시';
  return `오후 ${hh - 12}시`;
};

function NotificationPreview({ dim = false }: { dim?: boolean }) {
  return (
    <div className={`mx-auto w-[274px] h-[174px] rounded-2xl flex flex-col items-center justify-center gap-3 ${dim ? 'bg-[#F4F4F6]' : 'bg-[#EFEFF1]'}`}>
      <span className="w-[138px] h-3 rounded-full bg-[#DCDCE0]" />
      <span className="w-[190px] h-3 rounded-full bg-[#C6C6CB]" />
      <span className="w-[130px] h-3 rounded-full bg-[#C6C6CB]" />
      <div className="flex gap-6 mt-3">
        <span className={`w-[76px] h-3 rounded-full ${dim ? 'bg-[#B8B8BD]' : 'bg-[#6E6E73]'}`} />
        <span className={`w-[76px] h-3 rounded-full ${dim ? 'bg-[#8A8A8F]' : 'bg-black'}`} />
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const updateSettings = useUpdateNotificationSettings();
  const [step, setStep] = useState<'permission' | 'time'>('permission');
  const [dialog, setDialog] = useState(false);
  const [hour, setHour] = useState(22);

  const goOnboarding = () => router.push('/onboarding');

  const allow = async (enabled: boolean) => {
    setDialog(false);
    if (accessToken) {
      try {
        const current = await userApi.getNotificationSettings();
        await updateSettings.mutateAsync({ ...current, daily_question_enabled: enabled });
      } catch {
        // 알림 설정 실패는 흐름을 막지 않음
      }
    }
    if (enabled) setStep('time');
    else goOnboarding();
  };

  if (step === 'time') {
    return (
      <Screen
        footer={
          <>
            {/* 알림 시각을 저장하는 API가 아직 없어 선택값은 화면에만 반영된다. */}
            <Button variant="dark" onClick={goOnboarding}>
              이 시간에 알림 받기
            </Button>
            <TextButton className="mt-1" onClick={goOnboarding}>
              나중에 설정할게요
            </TextButton>
          </>
        }
      >
        <div className="px-5 pt-2">
          <BackButton onClick={() => setStep('permission')} />
          <h1 className="text-[22px] font-bold text-ink leading-[1.45] mt-6">
            매일 몇 시에
            <br />
            기록 알림을 드릴까요?
          </h1>
          <p className="text-[14px] text-sub mt-2">하루 3분, 이 시간에 오늘의 질문을 보내드려요</p>
          <div className="flex flex-col items-center mt-12">
            <Img3D name="alarm" size={96} />
            <p className="text-[40px] font-bold text-ink mt-5">{hourLabel(hour)}</p>
          </div>
          <div className="mt-10">
            <HourSlider min={MIN_HOUR} max={MAX_HOUR} value={hour} onChange={setHour} />
            <div className="flex justify-between text-[13px] text-sub mt-4">
              <span>{hourLabel(MIN_HOUR)}</span>
              <span>{hourLabel(22)}</span>
              <span>{hourLabel(MAX_HOUR)}</span>
            </div>
          </div>
          <div className="mt-10 rounded-2xl bg-surface px-5 py-4 flex gap-3">
            <span className="text-[14px] font-bold text-primary">TIP</span>
            <div>
              <p className="text-[15px] font-semibold text-ink">잠들기 전이 기록하기 좋아요</p>
              <p className="text-[13px] text-sub mt-1 leading-relaxed">
                하루를 되돌아보기 좋은 밤 10시를 추천해요. 알림 시간은 설정에서 언제든 바꿀 수 있어요.
              </p>
            </div>
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen
      overlay={
        dialog && (
        <div className="absolute inset-x-0 top-[300px] z-40 flex justify-center animate-pop-in">
          <div className="w-[300px] rounded-2xl bg-white/95 backdrop-blur shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden">
            <div className="px-4 pt-5 pb-4 text-center">
              <p className="text-[15px] font-semibold text-ink">‘메타미’ 에서 알림을 보내고자 합니다.</p>
              <p className="text-[12px] text-[#5A5A62] mt-2 leading-relaxed">
                경고, 사운드 및 아이콘 배지가 알림에 포함될 수 있습니다. 설정에서 이를 구성할 수 있습니다.
              </p>
            </div>
            <div className="grid grid-cols-2 border-t border-line">
              <button onClick={() => allow(false)} className="h-12 text-[15px] text-ink border-r border-line">
                허용하지 않음
              </button>
              <button onClick={() => allow(true)} className="h-12 text-[15px] font-semibold text-primary">
                허용
              </button>
            </div>
          </div>
        </div>
        )
      }
      footer={
        <>
          <Button variant={dialog ? 'gray' : 'primary'} onClick={() => setDialog(true)}>
            알림받기
          </Button>
          <TextButton className={`mt-1 ${dialog ? 'text-mute' : ''}`} onClick={goOnboarding}>
            나중에
          </TextButton>
        </>
      }
    >
      <div className="px-5 pt-3">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[14px] text-[#48484F]">
          <span className="text-[16px]">‹</span> 뒤로가기
        </button>
      </div>
      <div className={`pt-10 transition-opacity ${dialog ? 'opacity-40' : ''}`}>
        <NotificationPreview dim={dialog} />
        <h1 className="text-[20px] font-bold text-ink text-center leading-[1.5] mt-9">
          푸시 알림을 활성화하여 나를 이해하는
          <br />
          여정을 시작해보세요
        </h1>
        <p className="text-[14px] text-sub text-center leading-[1.75] mt-4">
          하루 한 번, 놓치기 쉬운 나의 감정과 생각을
          <br />
          자연스럽게 기록해보세요.
          <br />
          쌓인 답변은 나를 이해하는 인사이트로 이어져요.
          <br />
          놓치지 않으려면 알림을 활성화하세요.
        </p>
      </div>

    </Screen>
  );
}
