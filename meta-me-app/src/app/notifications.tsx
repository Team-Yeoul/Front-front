import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { useAuthStore } from '@/store';
import { useGetNotificationSettings, useUpdateNotificationSettings, userApi } from '@/entities/user';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, Img3D, TextButton, goBack } from '@/components/ui/primitives';
import { HourSlider } from '@/components/ui/HourSlider';
import { Text } from '@/components/ui/Text';
import { ChevronLeft } from '@/components/ui/icons';

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

function NotificationPreview() {
  return (
    <View className="self-center w-[274px] h-[174px] rounded-2xl items-center justify-center gap-3 bg-[#EFEFF1]">
      <View className="w-[138px] h-3 rounded-full bg-[#DCDCE0]" />
      <View className="w-[190px] h-3 rounded-full bg-[#C6C6CB]" />
      <View className="w-[130px] h-3 rounded-full bg-[#C6C6CB]" />
      <View className="flex-row gap-6 mt-3">
        <View className="w-[76px] h-3 rounded-full bg-[#6E6E73]" />
        <View className="w-[76px] h-3 rounded-full bg-black" />
      </View>
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

/** OS 알림 권한을 묻는다. Android 13+는 알림 채널이 있어야 권한 창이 뜬다. */
async function requestOsPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: '기록 알림',
      importance: AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

export default function NotificationsScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  // 설정 > 기록 리마인더에서 들어오면 시간만 바꾸고 설정으로 돌아간다 (온보딩으로 보내지 않음).
  const fromSettings = useLocalSearchParams<{ from?: string }>().from === 'settings';
  const { data: current } = useGetNotificationSettings(!!accessToken && fromSettings);
  const updateSettings = useUpdateNotificationSettings();
  const [step, setStep] = useState<'permission' | 'time'>(fromSettings ? 'time' : 'permission');
  const [asking, setAsking] = useState(false);
  // 사용자가 고르기 전에는, 설정에서 들어온 경우 저장된 시각을, 아니면 밤 10시를 보여준다.
  const [picked, setHour] = useState<number | null>(null);
  const hour = picked ?? toSliderHour(current?.daily_question_time) ?? 22;

  const goOnboarding = () => router.replace('/onboarding');
  const goNext = () => (fromSettings ? goBack('/settings') : goOnboarding());

  // 데일리 질문 알림 시각을 서버(daily_question_time, HH:mm)에 저장한다.
  const saveTime = async () => {
    if (accessToken) {
      try {
        const latest = await userApi.getNotificationSettings();
        await updateSettings.mutateAsync({ ...latest, daily_question_time: `${String(hour % 24).padStart(2, '0')}:00` });
      } catch {
        // 실패해도 흐름은 이어간다
      }
    }
    goNext();
  };

  const allow = async () => {
    setAsking(true);
    let enabled = false;
    try {
      enabled = await requestOsPermission();
    } catch {
      // 권한 요청이 실패하면 거절한 것으로 본다
    }
    if (accessToken) {
      try {
        const latest = await userApi.getNotificationSettings();
        await updateSettings.mutateAsync({ ...latest, push_enabled: enabled });
      } catch {
        // 알림 설정 실패는 흐름을 막지 않음
      }
    }
    setAsking(false);
    if (enabled) setStep('time');
    else goOnboarding();
  };

  if (step === 'time') {
    return (
      <Screen
        footer={
          <>
            <Button variant="dark" onPress={saveTime} disabled={updateSettings.isPending}>
              이 시간에 알림 받기
            </Button>
            <TextButton className="mt-1" onPress={goNext}>
              {fromSettings ? '취소' : '나중에 설정할게요'}
            </TextButton>
          </>
        }
      >
        <View className="px-5 pt-2">
          <BackButton onPress={() => (fromSettings ? goBack('/settings') : setStep('permission'))} />
          <Text className="text-[22px] font-bold text-ink leading-[32px] mt-6">{'매일 몇 시에\n기록 알림을 드릴까요?'}</Text>
          <Text className="text-[14px] text-sub mt-2">하루 3분, 이 시간에 오늘의 질문을 보내드려요</Text>
          <View className="items-center mt-12">
            <Img3D name="alarm" size={96} />
            <Text className="text-[40px] font-bold text-ink mt-5">{hourLabel(hour)}</Text>
          </View>
          <View className="mt-10">
            <HourSlider min={MIN_HOUR} max={MAX_HOUR} value={hour} onChange={setHour} />
            <View className="flex-row justify-between mt-4">
              <Text className="text-[13px] text-sub">{hourLabel(MIN_HOUR)}</Text>
              <Text className="text-[13px] text-sub">{hourLabel(22)}</Text>
              <Text className="text-[13px] text-sub">{hourLabel(MAX_HOUR)}</Text>
            </View>
          </View>
          <View className="mt-10 rounded-2xl bg-surface px-5 py-4 flex-row gap-3">
            <Text className="text-[14px] font-bold text-primary">TIP</Text>
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-ink">잠들기 전이 기록하기 좋아요</Text>
              <Text className="text-[13px] text-sub mt-1 leading-[20px]">
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
          <TextButton className="mt-1" onPress={goOnboarding}>
            나중에
          </TextButton>
        </>
      }
    >
      <View className="px-5 pt-3">
        <Pressable onPress={() => goBack('/')} className="flex-row items-center gap-1.5 self-start" hitSlop={8}>
          <ChevronLeft size={14} color="#48484F" />
          <Text className="text-[14px] text-[#48484F]">뒤로가기</Text>
        </Pressable>
      </View>
      <View className="pt-10">
        <NotificationPreview />
        <Text className="text-[20px] font-bold text-ink text-center leading-[30px] mt-9">
          {'푸시 알림을 활성화하여 나를 이해하는\n여정을 시작해보세요'}
        </Text>
        <Text className="text-[14px] text-sub text-center leading-[24px] mt-4">
          {'하루 한 번, 놓치기 쉬운 나의 감정과 생각을\n자연스럽게 기록해보세요.\n쌓인 답변은 나를 이해하는 인사이트로 이어져요.\n놓치지 않으려면 알림을 활성화하세요.'}
        </Text>
      </View>
    </Screen>
  );
}
