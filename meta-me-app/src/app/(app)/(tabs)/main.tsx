import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store';
import { useGetMyProfile, useGetOnboardingResult } from '@/entities/user';
import { isOnboardingMissing } from '@/lib/onboarding';
import { useMe } from '@/hooks/useMe';
import { useGetDailyRecord, useListDailyRecords } from '@/entities/diary';
import type { DailyRecord } from '@/entities/diary';
import { Screen } from '@/components/ui/Screen';
import { CogniImg, ProgressBar } from '@/components/ui/primitives';
import { Text } from '@/components/ui/Text';
import { CalendarIcon, CheckIcon, ChevronRight, ChevronUp, GearIcon, PencilIcon } from '@/components/ui/icons';
import { latestIndex, useCollection } from '@/hooks/useCollection';
import { countStreak } from '@/lib/streak';
import { toDateKey } from '@/lib/date';

type DayStatus = 'done' | 'missed' | 'today' | 'pending';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const PROMPTS = ['오늘 하루는\n어떤 장면으로 남았나요?', '오늘 가장 크게 흔들린\n감정은 뭐였나요?', '오늘 스스로를 칭찬하고\n싶은 순간이 있었나요?'];


function getWeekRange(today: Date) {
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function useWeekFlow() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const today = new Date();
  const { start, end } = getWeekRange(today);
  const { data } = useListDailyRecords({ start_date: toDateKey(start), end_date: toDateKey(end), size: 50 }, !!accessToken);

  // 실제 기록이 있는 날만 체크한다. 불러오기 전/실패 시에는 아무 날도 체크하지 않는다.
  const recordedDates = new Set((data?.records ?? []).map((r) => r.recorded_date));
  const todayKey = toDateKey(today);
  const todayRecord = data?.records.find((r) => r.recorded_date === todayKey);
  const flow = WEEKDAYS.map((_, i): DayStatus => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const dayKey = toDateKey(day);
    if (dayKey === todayKey) return recordedDates.has(dayKey) ? 'done' : 'today';
    if (day > today) return 'pending';
    return recordedDates.has(dayKey) ? 'done' : 'missed';
  });
  return { flow, todayRecord };
}

function WeekdayPill({ status, label, isToday }: { status: DayStatus; label: string; isToday: boolean }) {
  if (status === 'done') {
    return (
      <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
        <CheckIcon size={16} />
      </View>
    );
  }
  return (
    <View className="w-10 h-10 rounded-full bg-surface-2 items-center justify-center">
      <Text className={`text-[14px] ${isToday ? 'font-bold text-ink' : 'text-mute'}`}>{label}</Text>
    </View>
  );
}

function RecordRow({ title, date, onPress }: { title: string; date: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center rounded-2xl bg-card border border-line px-4 py-4 active:opacity-70">
      <View className="flex-1">
        <Text className="text-[16px] font-semibold text-ink" numberOfLines={1}>
          {title}
        </Text>
        <Text className="font-mono text-[13px] text-sub mt-1">{date}</Text>
      </View>
      <ChevronRight size={18} />
    </Pressable>
  );
}

function RealRecordRow({ record }: { record: DailyRecord }) {
  const { data } = useGetDailyRecord(record.record_id);
  const question = data?.questions?.[0];
  const rawTitle = question?.scene_description || question?.emotion_tag;
  const title = rawTitle && /[가-힣]/.test(rawTitle) ? rawTitle : '기록 보기';
  return (
    <RecordRow
      title={title}
      date={record.recorded_date.replaceAll('-', '.')}
      onPress={() => router.push({ pathname: '/diary/[id]', params: { id: record.record_id } })}
    />
  );
}

export default function MainScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: profile } = useGetMyProfile(!!accessToken);
  const { onboardedAt } = useMe();
  const { error: onboardingError } = useGetOnboardingResult(!!accessToken && !onboardedAt);

  // 로그인된 채로 다시 열었는데 온보딩을 안 한 계정이면 온보딩부터 하게 한다.
  useEffect(() => {
    if (!onboardedAt && isOnboardingMissing(onboardingError)) router.replace('/onboarding');
  }, [onboardedAt, onboardingError]);
  const { data: recent } = useListDailyRecords({ size: 3 }, !!accessToken);
  const { flow: weekFlow, todayRecord } = useWeekFlow();
  // 연속 기록일은 주를 넘어 이어지므로 이번 주가 아니라 최근 기록 전체로 센다(스트릭 화면과 같은 값).
  const { data: streakData } = useListDailyRecords({ size: 100 }, !!accessToken);
  const [stripOpen, setStripOpen] = useState(true);
  const cognis = useCollection();
  // 메인 캐릭터 = 가장 최근에 모은 코그니 (온보딩 직후엔 첫 코그니)
  const character = cognis[latestIndex(cognis)];

  const today = new Date();
  const todayIndex = today.getDay();
  const dateLabel = `${today.getMonth() + 1}월 ${today.getDate()}일 ${WEEKDAYS[todayIndex]}요일`;
  const prompt = PROMPTS[today.getDate() % PROMPTS.length];
  const completedToday = weekFlow[todayIndex] === 'done';
  const doneCount = weekFlow.filter((s) => s === 'done').length;
  const streak = countStreak((streakData?.records ?? []).map((r) => r.recorded_date), today);
  const accuracy = profile?.latest_accuracy?.accuracy_percent ?? 0;
  const weekRate = Math.round((doneCount / 7) * 100);
  const records = recent?.records ?? [];

  return (
    <Screen inTabs>
      <View className="flex-row items-center justify-between px-5 h-14">
        <Text className="text-[22px] font-bold text-ink tracking-tight">metame</Text>
        <Link href="/settings" asChild>
          <Pressable className="w-9 h-9 rounded-full bg-surface-2 items-center justify-center" accessibilityLabel="설정">
            <GearIcon size={18} />
          </Pressable>
        </Link>
      </View>

      <View className="px-5">
        <View className="flex-row justify-end">
          <Pressable onPress={() => setStripOpen((v) => !v)} className="h-7 px-3 rounded-full bg-surface-2 flex-row items-center gap-1">
            <Text className="text-[12px] font-medium text-[#48484F]">달성 현황</Text>
            <View style={stripOpen ? undefined : { transform: [{ rotate: '180deg' }] }}>
              <ChevronUp />
            </View>
          </Pressable>
        </View>
        {stripOpen && (
          <View className="flex-row items-center justify-between mt-2">
            {WEEKDAYS.map((d, i) => (
              <WeekdayPill key={d} label={d} status={weekFlow[i]} isToday={i === todayIndex} />
            ))}
            <Link href="/challenge" asChild>
              <Pressable className="w-10 h-10 rounded-full bg-surface-2 items-center justify-center" accessibilityLabel="기록 챌린지">
                <CalendarIcon />
              </Pressable>
            </Link>
          </View>
        )}
      </View>

      <View className="px-4 mt-4">
        <View className="rounded-[28px] px-5 pt-6 pb-5 overflow-hidden">
          {/* 웹은 완료 시 노랑·보라 빛 번짐(radial-gradient)을 깔았다. 앱은 같은 색감의 선형 그라데이션으로 대신한다. */}
          <LinearGradient
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            colors={completedToday ? ['#F7EFD2', '#E9E8F8', '#F1F1F7'] : ['#E4E4F8', '#ECECF4', '#EFEFF3']}
            locations={completedToday ? [0, 0.45, 1] : [0, 0.6, 1]}
            start={completedToday ? { x: 1, y: 0 } : { x: 0.5, y: 0 }}
            end={completedToday ? { x: 0, y: 1 } : { x: 0.5, y: 1 }}
          />
          <Text className="font-mono text-[13px] text-sub">{dateLabel}</Text>
          <Text className="text-[22px] font-bold text-ink leading-[32px] mt-2">{completedToday ? '오늘 기록을\n완료했어요' : prompt}</Text>
          <View className="w-[172px] h-[152px] self-center mt-3 rounded-full bg-white items-center justify-center">
            {character ? (
              <CogniImg src={character.image} size={140} />
            ) : (
              <Text className="text-[13px] text-mute text-center leading-[20px]">{'첫 코그니를\n아직 만나지 못했어요'}</Text>
            )}
            {completedToday && (
              <View className="absolute right-1 bottom-1 w-10 h-10 rounded-full bg-primary border-[3px] border-white items-center justify-center">
                <CheckIcon size={16} />
              </View>
            )}
          </View>
          {completedToday ? (
            <Pressable
              onPress={() =>
                todayRecord ? router.push({ pathname: '/diary/[id]', params: { id: todayRecord.record_id } }) : router.navigate('/diary')
              }
              className="flex-row items-center justify-between mt-4"
            >
              <View>
                <Text className="text-[13px] font-semibold text-primary">연속 {streak}일 작성 완료</Text>
                <Text className="text-[17px] font-bold text-ink mt-1">오늘 기록 다시 보기</Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-ink items-center justify-center">
                <ChevronRight size={16} color="#FFFFFF" />
              </View>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/diary/chat')}
              className="flex-row items-center gap-3 bg-white rounded-2xl px-4 py-3.5 mt-4 active:opacity-80"
              style={{ boxShadow: '0 4px 16px rgba(26,26,30,0.04)' }}
            >
              <View className="w-10 h-10 rounded-xl bg-primary-soft items-center justify-center">
                <PencilIcon />
              </View>
              <View className="flex-1">
                <Text className="text-[12px] text-sub">아직 오늘 기록하지 않았어요{streak > 0 ? ` · 연속 ${streak}일째` : ''}</Text>
                <Text className="text-[17px] font-bold text-primary mt-0.5">오늘 기록하러 가기</Text>
              </View>
              <ChevronRight size={18} color="#8E8E95" />
            </Pressable>
          )}
        </View>
      </View>

      <View className="px-4 mt-4 pb-4">
        {completedToday ? (
          <View className="rounded-3xl bg-card border border-line px-5 py-5 mb-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-[16px] font-semibold text-ink">이번 주 달성률</Text>
              <Text className="text-[24px] font-bold text-ink">{weekRate}%</Text>
            </View>
            <ProgressBar value={weekRate} className="mt-3" height={8} />
            <Text className="text-[12px] text-sub mt-2.5">
              {doneCount} / 7일 · 문장 정확도 {accuracy}%
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center justify-between px-1 mb-3">
            <Text className="text-[17px] font-bold text-ink">최근 기록</Text>
            <Pressable onPress={() => router.navigate('/diary')} hitSlop={8}>
              <Text className="text-[13px] text-sub">더보기</Text>
            </Pressable>
          </View>
        )}
        <View className="gap-2.5">
          {records.length > 0 ? (
            records.slice(0, completedToday ? 2 : 3).map((r) => <RealRecordRow key={r.record_id} record={r} />)
          ) : (
            <View className="rounded-2xl bg-card border border-dashed border-line px-4 py-6 items-center">
              <Text className="text-[14px] text-sub">아직 남긴 기록이 없어요</Text>
              <Text className="text-[12px] text-mute mt-1">오늘의 질문에 답하면 여기에 쌓여요</Text>
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}
