'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useGetNotificationSettings, useUpdateNotificationSettings, userApi } from '@/entities/user';
import { router } from '@/lib/router';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, TextButton, goBack } from '@/components/ui/primitives';
import { LogoMark } from '@/components/ui/brand';
import { HourSlider } from '@/components/ui/HourSlider';
import { Text } from '@/components/ui/Text';
import { Img, LinearGradient, View, asset } from '@/components/ui/rn';
import { useTheme } from '@/lib/theme';

/** 오후 4시(16) ~ 새벽 2시(26) — 슬라이더 값은 16~26 사이 정수 시각. */
const MIN_HOUR = 16;
const MAX_HOUR = 26;

const hourLabel = (h: number) => {
  const hh = h % 24;
  if (hh === 0) return '자정';
  if (hh < 6) return `새벽 ${hh}시`;
  if (hh < 12) return `오전 ${hh}시`;
  if (hh === 12) return '낮 12시';
  return `오후 ${hh - 12}시`;
};

/** 폰 화면 위로 '오늘의 질문' 알림이 떠 있는 미리보기. 아래쪽은 화면 바탕색으로 흐려진다. */
function NotificationPreview() {
  const { bg } = useTheme();
  return (
    <View className="mt-[27px] h-[460px] shrink-0 overflow-hidden">
      <View className="absolute left-[52px] right-[52px] top-0 bottom-0 rounded-t-[40px] border-[6px] border-b-0 bg-page" style={{ borderColor: bg('#F1F2F6') }}>
        <View className="gap-2.5 px-[18px] pt-[96px]">
          {[0, 1, 2].map((i) => (
            <View key={i} className="h-14 shrink-0 rounded-[14px] bg-surface flex-row items-center gap-3 px-3.5">
              <View className="w-7 h-7 shrink-0 rounded-lg bg-page" />
              <View className="gap-[7px]">
                <View className="w-[151px] h-2 shrink-0 rounded-full bg-border" />
                <View className="w-[101px] h-2 shrink-0 rounded-full" style={{ backgroundColor: bg('#ECEDF2') }} />
              </View>
            </View>
          ))}
        </View>
      </View>
      <View
        className="absolute left-6 right-6 top-[26px] h-[68px] rounded-[18px] bg-page flex-row items-center gap-3 px-4"
        style={{ boxShadow: '0 12px 32px rgba(30,30,60,0.14), 0 0 0 0.5px rgba(30,30,60,0.06)' }}
      >
        <View className="w-10 h-10 shrink-0 rounded-[11px] bg-primary items-center justify-center">
          <LogoMark size={26} color="#FFFFFF" />
        </View>
        <View className="flex-1 min-w-0">
          <View className="flex-row items-baseline justify-between">
            <Text className="text-[14px] font-bold text-ink">오늘의 질문이 도착했어요</Text>
            <Text className="text-[12px] text-mute">지금</Text>
          </View>
          <Text className="text-[12px] text-text-3 mt-0.5" numberOfLines={1}>
            “오늘 하루는 어떤 장면으로 남았나요?”
          </Text>
        </View>
      </View>
      <LinearGradient
        pointerEvents="none"
        colors={[`${bg('#FFFFFF')}00`, bg('#FFFFFF')]}
        locations={[0, 0.9]}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 160 }}
      />
    </View>
  );
}

/** 서버 "HH:mm" → 슬라이더 시각(18~26). 범위 밖이면 null. */
const toSliderHour = (time?: string | null) => {
  const h = Number(time?.split(':')[0]);
  if (!time || Number.isNaN(h)) return null;
  const v = h < 6 ? h + 24 : h;
  return v >= MIN_HOUR && v <= MAX_HOUR ? v : null;
};

/**
 * 브라우저 알림 권한을 묻는다(앱 expo-notifications 자리).
 * 알림을 지원하지 않는 브라우저(홈 화면에 추가하지 않은 iOS Safari 등)는 거절한 것으로 본다.
 */
async function requestOsPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}

function NotificationsScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  // 설정 > 기록 리마인더에서 들어오면 시간만 바꾸고 설정으로 돌아간다 (온보딩으로 보내지 않음).
  const fromSettings = useSearchParams().get('from') === 'settings';
  const { data: current } = useGetNotificationSettings(!!accessToken && fromSettings);
  const updateSettings = useUpdateNotificationSettings();
  const [step, setStep] = useState<'permission' | 'time'>(fromSettings ? 'time' : 'permission');
  const [asking, setAsking] = useState(false);
  // 사용자가 고르기 전에는, 설정에서 들어온 경우 저장된 시각을, 아니면 밤 10시를 보여준다.
  const [picked, setHour] = useState<number | null>(null);
  const hour = picked ?? toSliderHour(current?.daily_question_time) ?? 22;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // 진행 중인 저장·권한 요청의 번호. 사용자가 취소·뒤로·나중에를 누르거나 화면을 떠나면 올려서,
  // 늦게 끝난 요청이 그 뒤 화면에서 다시 이동하지 않게 한다.
  const op = useRef(0);
  const abandon = useCallback(() => {
    op.current++;
    setSaving(false);
    setAsking(false);
  }, []);
  // 앱 useFocusEffect 자리: 화면을 떠나면(언마운트) 진행 중인 요청을 버린다.
  useEffect(() => abandon, [abandon]);

  const goOnboarding = () => router.replace('/onboarding');
  const goNext = () => (fromSettings ? goBack('/settings') : goOnboarding());
  const leave = (to: () => void) => () => {
    abandon();
    to();
  };

  // 데일리 질문 알림 시각을 서버(daily_question_time, HH:mm)에 저장한다.
  // 설정에서 들어온 경우 저장에 실패하면 화면에 남아 다시 시도하게 하고, 온보딩 중에는 흐름을 막지 않는다.
  const saveTime = async () => {
    if (saving) return;
    const id = ++op.current;
    setError('');
    setSaving(true);
    let ok = true;
    if (accessToken) {
      try {
        const latest = await userApi.getNotificationSettings();
        if (op.current !== id) return;
        await updateSettings.mutateAsync({ ...latest, daily_question_time: `${String(hour % 24).padStart(2, '0')}:00` });
      } catch {
        ok = false;
      }
    }
    if (op.current !== id) return;
    setSaving(false);
    if (!ok && fromSettings) {
      setError('알림 시간을 저장하지 못했어요. 다시 시도해 주세요.');
      return;
    }
    goNext();
  };

  const allow = async () => {
    const id = ++op.current;
    setAsking(true);
    let enabled = false;
    try {
      enabled = await requestOsPermission();
    } catch {
      // 권한 요청이 실패하면 거절한 것으로 본다
    }
    if (op.current !== id) return;
    if (accessToken) {
      try {
        const latest = await userApi.getNotificationSettings();
        if (op.current !== id) return;
        await updateSettings.mutateAsync({ ...latest, push_enabled: enabled });
      } catch {
        // 알림 설정 실패는 흐름을 막지 않음
      }
    }
    if (op.current !== id) return;
    setAsking(false);
    if (enabled) setStep('time');
    else goOnboarding();
  };

  if (step === 'time') {
    return (
      <Screen
        footer={
          <>
            {!!error && <Text className="text-[12px] text-danger text-center mb-2">{error}</Text>}
            <Button onPress={saveTime} loading={saving}>
              {error ? '다시 시도' : '이 시간에 알림 받기'}
            </Button>
            <TextButton className="mt-1" onPress={leave(goNext)}>
              {fromSettings ? '취소' : '나중에 설정할게요'}
            </TextButton>
          </>
        }
      >
        <View className="px-6 pt-2">
          <BackButton onPress={leave(() => (fromSettings ? goBack('/settings') : setStep('permission')))} />
          <Text className="text-[24px] font-bold text-ink leading-[34px] tracking-tight mt-8">{'매일 몇 시에\n기록 알림을 드릴까요?'}</Text>
          <Text className="text-[16px] text-text-4 mt-2">하루 3분, 이 시간에 오늘의 질문을 보내드려요</Text>
          <View className="items-center mt-[52px]">
            <Img src={asset('v2/clock-3d.png')} width={112} height={112} contentFit="contain" />
            <Text className="text-[24px] font-bold text-ink tracking-tight mt-6">{hourLabel(hour)}</Text>
          </View>
          <View className="mt-8">
            <HourSlider min={MIN_HOUR} max={MAX_HOUR} value={hour} onChange={setHour} />
            <View className="flex-row justify-between mt-3">
              <Text className="text-[14px] text-sub">{hourLabel(MIN_HOUR)}</Text>
              <Text className="text-[14px] text-sub">{hourLabel((MIN_HOUR + MAX_HOUR) / 2)}</Text>
              <Text className="text-[14px] text-sub">{hourLabel(MAX_HOUR)}</Text>
            </View>
          </View>
          <View className="mt-9 rounded-2xl bg-surface px-5 py-[18px] flex-row gap-2.5">
            <Text className="text-[16px] font-bold text-primary">TIP</Text>
            <View className="flex-1">
              <Text className="text-[16px] font-bold text-ink">잠들기 전이 기록하기 좋아요</Text>
              <Text className="text-[12px] text-text-4 mt-1 leading-[19px]">
                하루를 되돌아보기 좋은 밤 10시를 추천해요. 알림 시간은 설정에서 언제든 바꿀 수 있어요.
              </Text>
            </View>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <>
          <Button onPress={allow} disabled={asking}>
            알림받기
          </Button>
          <TextButton className="mt-1" onPress={leave(goOnboarding)}>
            나중에
          </TextButton>
        </>
      }
    >
      <View className="px-6 pt-2">
        <BackButton onPress={leave(() => goBack('/'))} />
      </View>
      <View className="px-6 mt-6">
        <Text className="text-[24px] font-bold text-ink text-center leading-[35px] tracking-tight">{'오늘의 질문을 놓치지 않도록\n알림을 허용해 주세요'}</Text>
        <Text className="text-[16px] text-sub text-center leading-[26px] mt-3">{'하루 한 번, 데일리 질문과 리포트 미 소식을\n알림으로 알려드릴게요.'}</Text>
      </View>
      <NotificationPreview />
    </Screen>
  );
}

export default function NotificationsPage() {
  // useSearchParams를 쓰는 화면은 Suspense로 감싸야 한다(Next).
  return (
    <Suspense>
      <NotificationsScreen />
    </Suspense>
  );
}
