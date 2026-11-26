'use client';

import { useEffect, type CSSProperties } from 'react';
import Link from 'next/link';
import { router } from '@/lib/router';
import { useAuthStore } from '@/store';
import { useGetMyAccount, useGetMyProfile, useGetOnboardingResult } from '@/entities/user';
import { isOnboardingMissing } from '@/lib/onboarding';
import { useMe } from '@/hooks/useMe';
import { useGetDailyRecord, useListDailyRecords } from '@/entities/diary';
import type { DailyRecord } from '@/entities/diary';
import { NAV_HEIGHT, navOffset } from '@/components/layout/BottomNav';
import { Screen } from '@/components/ui/Screen';
import { CogniImg } from '@/components/ui/primitives';
import { Img, LinearGradient, Pressable, ScrollView, View, useSafeAreaInsets } from '@/components/ui/rn';
import { Span, Text } from '@/components/ui/Text';
import { CheckIcon, ChevronRight, HomeBellIcon, HomeGearIcon } from '@/components/ui/icons';
import { Skeleton, Stagger } from '@/components/ui/states';
import { HomeTutorial, MASCOT, TodayQuestionSheet, useHomeIntro } from '@/components/home/overlays';
import { latestIndex, useCollection } from '@/hooks/useCollection';
import { useInbox } from '@/hooks/useInbox';
import { useStreak } from '@/lib/streak';
import { useAccountToday } from '@/hooks/useSaveTodayRecord';
import { toDateKey, todayIn } from '@/lib/date';
import { useTheme } from '@/lib/theme';
import { withSensitiveGate } from '@/components/SensitiveGate';

type DayStatus = 'done' | 'missed' | 'today' | 'pending';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const WRITE_HREF = '/diary/write';

function getWeekRange(today: Date) {
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function useWeekFlow() {
  const accessToken = useAuthStore((s) => s.accessToken);
  // 서버 recorded_date와 같은 날을 가리키도록 계정 시간대 기준 오늘을 쓴다.
  const { today } = useAccountToday();
  const { start, end } = getWeekRange(today);
  const { data } = useListDailyRecords({ start_date: toDateKey(start), end_date: toDateKey(end), size: 50 }, !!accessToken);

  // 실제 기록이 있는 날만 체크한다. 불러오기 전/실패 시에는 아무 날도 체크하지 않는다.
  const recordedDates = new Set((data?.records ?? []).map((r) => r.recorded_date));
  const todayKey = toDateKey(today);
  const todayRecord = data?.records.find((r) => r.recorded_date === todayKey);
  const days = WEEKDAYS.map((_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const dayKey = toDateKey(day);
    let status: DayStatus;
    if (dayKey === todayKey) status = recordedDates.has(dayKey) ? 'done' : 'today';
    else if (day > today) status = 'pending';
    else status = recordedDates.has(dayKey) ? 'done' : 'missed';
    return { status, date: day.getDate() };
  });
  return { days, todayRecord, loaded: !!data };
}

/** 요일 한 칸: 기록한 날은 보라 체크, 오늘은 연보라 칸 안의 흰 동그라미, 나머지는 회색 날짜. */
function DayCell({ label, date, status, isToday }: { label: string; date: number; status: DayStatus; isToday: boolean }) {
  const { fg } = useTheme();
  return (
    <View className={`flex-1 items-center gap-1.5 py-2 rounded-2xl ${isToday ? 'bg-primary-soft' : ''}`}>
      <Text className={`text-[12px] ${isToday ? 'font-bold text-primary-pressed' : 'text-mute'}`}>{label}</Text>
      {status === 'done' ? (
        <View className="w-10 h-10 shrink-0 rounded-full bg-primary items-center justify-center" accessibilityLabel={`${date}일 기록함`}>
          <CheckIcon size={16} />
        </View>
      ) : (
        <View className={`w-10 h-10 shrink-0 rounded-full items-center justify-center ${isToday ? 'bg-page' : 'bg-surface'}`}>
          <Text
            className={`text-[16px] tabular-nums ${isToday ? 'font-semibold text-ink' : status === 'pending' ? '' : 'text-mute'}`}
            style={!isToday && status === 'pending' ? { color: fg('#B4B4BE') } : undefined}
          >
            {date}
          </Text>
        </View>
      )}
    </View>
  );
}

function RecordRow({ title, date, onPress }: { title: string; date: string; onPress: () => void }) {
  const { fg } = useTheme();
  return (
    <Pressable onPress={onPress} className="w-full h-[70px] shrink-0 flex-row items-center rounded-[18px] bg-surface px-4 active:opacity-80">
      <View className="flex-1 min-w-0">
        <Text className="text-[16px] font-semibold text-ink" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-[12px] text-mute mt-1 tabular-nums">{date}</Text>
      </View>
      <ChevronRight size={18} color={fg('#A1A1AA')} />
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

const CARD_SHADOW = { boxShadow: '0 6px 20px rgba(30,30,60,0.08), 0 0 0 1px rgba(30,30,60,0.03)' };

/** 홈 로딩 (16a): 이번 주 칸 · 챌린지 카드 · 최근 기록 자리 */
function HomeSkeleton() {
  const { fg } = useTheme();
  return (
    <View className="gap-7 px-4 pt-5" accessibilityLabel="홈 불러오는 중">
      <View>
        <View className="flex-row items-end justify-between px-2">
          <View>
            <Skeleton className="w-[90px] h-4" />
            <Skeleton className="w-[130px] h-3.5 mt-2" />
          </View>
          <Skeleton className="w-[84px] h-[30px] rounded-full" />
        </View>
        <View className="mt-3 flex-row gap-1 px-1">
          {WEEKDAYS.map((w) => (
            <View key={w} className="flex-1 items-center gap-1.5 py-2">
              <Text className="text-[12px]" style={{ color: fg('#C4C4CC') }}>
                {w}
              </Text>
              <Skeleton className="w-10 h-10 rounded-full" />
            </View>
          ))}
        </View>
      </View>
      <View className="rounded-3xl bg-page dark:bg-surface px-6 pt-7 pb-6 items-center" style={CARD_SHADOW}>
        <Skeleton className="w-[180px] h-5" />
        <Skeleton className="w-[140px] h-3.5 mt-2.5" />
        <Skeleton className="w-[132px] h-[120px] mt-5 rounded-3xl" />
        <Skeleton className="w-full h-14 mt-6 rounded-2xl" style={{ alignSelf: 'stretch' }} />
        <Skeleton className="w-[120px] h-3.5 mt-5" />
      </View>
      <View>
        <View className="flex-row items-center justify-between px-2 mb-3">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-10 h-3.5" />
        </View>
        <Skeleton className="h-[70px] rounded-[18px]" style={{ alignSelf: 'stretch' }} />
      </View>
    </View>
  );
}

/** 코그니 그림 (없으면 메타미 캐릭터) */
function Character({ src, size, style }: { src?: string; size: number; style?: CSSProperties }) {
  return (
    <View className="shrink-0" style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', ...style }}>
      {src ? <CogniImg src={src} size={size} /> : <Img src={MASCOT} size={size} contentFit="contain" />}
    </View>
  );
}

// 머리 그라데이션의 맨 위 색. 웹 상태바(데스크톱 미리보기)를 이 색으로 칠해 머리 영역과 이어 보이게 한다.
// 다크는 rgba(99,103,255,0.65)를 다크 바탕(#1C1B24) 위에 겹친 색이다.
const HEADER_TOP = { light: '#8A8DFF', dark: '#4A4CB2' };

function MainScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, fg } = useTheme();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { unreadCount } = useInbox();
  const { data: profile } = useGetMyProfile(!!accessToken);
  const me = useMe();
  const { data: account } = useGetMyAccount(!!accessToken && !me.nickname);
  const displayName = me.nickname || account?.user?.username || account?.user?.email?.split('@')[0];
  const { error: onboardingError } = useGetOnboardingResult(!!accessToken && !me.onboardedAt);

  // 로그인된 채로 다시 열었는데 온보딩을 안 한 계정이면 온보딩부터 하게 한다.
  useEffect(() => {
    if (!me.onboardedAt && isOnboardingMissing(onboardingError)) router.replace('/onboarding');
  }, [me.onboardedAt, onboardingError]);

  const { today, timeZone } = useAccountToday();
  const todayIndex = today.getDay();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const { data: recent } = useListDailyRecords({ size: 3 }, !!accessToken);
  const { days, todayRecord, loaded: weekLoaded } = useWeekFlow();
  // 연속 기록일은 주를 넘어 이어지므로, 끊길 때까지 여러 페이지를 받아 센다(스트릭 화면과 같은 값).
  const { streak, loaded: streakLoaded, failed: streakFailed, retry: retryStreak } = useStreak(today, !!accessToken);
  // 기록 챌린지는 달마다 새로 시작한다(챌린지 화면과 같은 기준).
  const { data: monthData } = useListDailyRecords({ start_date: toDateKey(monthStart), end_date: toDateKey(monthEnd), size: 100 }, !!accessToken);

  const cognis = useCollection();
  // 메인 캐릭터 = 가장 최근에 모은 코그니 (온보딩 직후엔 첫 코그니). 아직 없으면 메타미 캐릭터.
  const character = cognis[latestIndex(cognis)];

  const completedToday = days[todayIndex].status === 'done';
  const monthDays = monthEnd.getDate();
  // 챌린지 일차: 이번 달 1일부터 세되, 이번 달에 가입했으면 가입한 날을 1일차로 센다(가입 첫날에 'N일차'로 보이지 않게).
  // 가입일은 기록 날짜와 같은 계정 시간대 기준 날짜로 바꿔 비교한다. 프로필을 받기 전에는 일차를 보이지 않는다.
  const joinedAt = profile?.user?.created_at;
  const challengeDay = profile
    ? (() => {
        const joined = joinedAt ? todayIn(timeZone, new Date(joinedAt)) : monthStart;
        const start = joined > monthStart ? joined : monthStart;
        return Math.max(1, Math.round((today.getTime() - start.getTime()) / 86400000) + 1);
      })()
    : null;
  const recordedThisMonth = new Set((monthData?.records ?? []).map((r) => r.recorded_date)).size;
  const summary = profile?.profile?.ai_first_sentence || me.mySentence;
  const records = recent?.records ?? [];

  const intro = useHomeIntro(!completedToday, weekLoaded);

  return (
    // 위가 진한 보라 헤더라 상태바 글자는 늘 흰색이다.
    <Screen scroll={false} statusFg="light" statusBg={isDark ? HEADER_TOP.dark : HEADER_TOP.light}>
      {/* 머리 영역: 상태바 뒤까지 연보라로 깔고 아래 모서리를 둥글게. 스크롤해도 제자리에 있다. */}
      <View
        className="shrink-0 rounded-b-[34px] overflow-hidden"
        style={{ paddingTop: insets.top, boxShadow: '0 1.2px 0 rgba(81,85,215,0.6), 0 3px 6px rgba(40,40,52,0.1)' }}
      >
        <LinearGradient
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          // 연해 보이지 않도록 프라이머리를 꽉 채운다. 다크(10a3-dk)는 바탕이 어두워 조금 낮춘다.
          colors={
            isDark
              ? ['rgba(99,103,255,0.65)', 'rgba(99,103,255,0.65)', 'rgba(99,103,255,0.7)', 'rgba(99,103,255,0.85)']
              : ['#8A8DFF', '#7C80FF', '#6E72FF', '#6367FF']
          }
          locations={[0, 0.5, 0.75, 1]}
        />
        {/* 보라 영역은 '내 한 줄 요약' 카드 아래까지 넉넉히 덮는다. */}
        <View className="px-5 pb-7">
          <View className="h-[31px] flex-row items-end justify-end gap-[18px]">
            {/* 알림 · 혜택 (10n). 안 읽은 알림이 있으면 종에 점을 찍는다(10a4). */}
            <Link href="/inbox" className="relative block" aria-label={unreadCount > 0 ? `알림, 안 읽은 알림 ${unreadCount}개` : '알림'}>
              <HomeBellIcon size={26} color="#FFFFFF" />
              {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-danger border-2 border-page" />}
            </Link>
            <Link href="/settings" className="block" aria-label="설정">
              <HomeGearIcon size={26} color="#FFFFFF" />
            </Link>
          </View>
          {/* 인사 → 한 줄 설명 순서로 나타난다. */}
          <Stagger>
            <Text className="text-[24px] font-bold tracking-tight text-white">{displayName ? `${displayName}님,` : '안녕하세요,'}</Text>
            <Text className="mt-1 text-[20px] font-medium tracking-tight text-white/90">오늘도 한 줄씩 나를 알아가요</Text>
          </Stagger>
          <View className="mt-[22px]">
            <View
              className="h-20 shrink-0 rounded-[14px] bg-page px-[18px] justify-center"
              style={{ boxShadow: '0 1px 2px rgba(40,40,52,0.12), 0 0 0 0.5px rgba(40,40,52,0.06)' }}
            >
              <Text className="text-[12px] font-medium text-text-2">내 한 줄 요약</Text>
              {summary ? (
                <Text className="mt-0.5 max-w-[274px] text-[16px] font-semibold tracking-tight" style={{ color: fg('#0F0F14') }} numberOfLines={1}>
                  {summary}
                </Text>
              ) : profile ? (
                <Text className="mt-0.5 max-w-[274px] text-[16px] font-semibold tracking-tight" style={{ color: fg('#0F0F14') }} numberOfLines={1}>
                  기록이 쌓이면 나를 한 줄로 요약해 드려요
                </Text>
              ) : (
                <Skeleton onSurface className="w-[220px] h-4 mt-1" />
              )}
            </View>
            <Character src={character?.image} size={88} style={{ position: 'absolute', right: -10, bottom: 34, transform: 'rotate(8deg)' }} />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 min-h-0" contentContainerStyle={{ paddingBottom: NAV_HEIGHT + navOffset(insets.bottom) + 16 }} showsVerticalScrollIndicator={false}>
        {!weekLoaded ? (
          <HomeSkeleton />
        ) : (
          <View className="gap-7 px-4 pt-5">
            {/* 이번 주 기록 */}
            <View>
              <View className="flex-row items-end justify-between px-2">
                <View>
                  <Text className="text-[12px] text-sub">이번 주 기록</Text>
                  <Text className="mt-0.5 text-[20px] font-bold tracking-tight text-ink">
                    {streakFailed ? (
                      '연속 기록을 불러오지 못했어요'
                    ) : !streakLoaded ? (
                      // 받기 전에는 0일('새로 시작해요')로 보이지 않게 자리만 둔다.
                      '연속 기록 확인 중…'
                    ) : streak > 0 ? (
                      <>
                        <Span className="font-bold text-primary">연속 {streak}일째</Span> 쓰는 중
                      </>
                    ) : (
                      '오늘부터 연속 기록 시작해요'
                    )}
                  </Text>
                  {streakFailed && (
                    <Pressable onPress={retryStreak} accessibilityRole="button" hitSlop={8} className="mt-1 self-start">
                      <Text className="text-[12px] font-semibold text-primary">다시 불러오기</Text>
                    </Pressable>
                  )}
                </View>
                <Link href="/challenge" className="flex flex-row items-center gap-0.5 rounded-full bg-surface px-2.5 py-1.5 shrink-0">
                  <Text className="text-[12px] font-semibold text-text-3">달성 현황</Text>
                  <ChevronRight size={14} color={fg('#52525B')} />
                </Link>
              </View>
              <View className="mt-2.5 flex-row gap-1 px-1">
                {WEEKDAYS.map((w, i) => (
                  <DayCell key={w} label={w} date={days[i].date} status={days[i].status} isToday={i === todayIndex} />
                ))}
              </View>
            </View>

            {/* 기록 챌린지 */}
            <View className="rounded-3xl bg-page dark:bg-surface px-6 pt-7 pb-2 items-center" style={CARD_SHADOW}>
              <Text className="text-[20px] font-bold tracking-tight text-ink text-center">
                {completedToday ? (
                  <>
                    오늘 기록 <Span className="font-bold text-primary">완료</Span>했어요
                  </>
                ) : challengeDay ? (
                  <>
                    기록 챌린지 <Span className="font-bold text-primary">{challengeDay}일차</Span>예요
                  </>
                ) : (
                  '기록 챌린지 진행 중이에요'
                )}
              </Text>
              <Text className="mt-1 text-[14px] text-sub">
                {monthDays}일 중 {recordedThisMonth}일 기록했어요
              </Text>
              <Character src={character?.image} size={132} style={{ marginTop: 20 }} />
              <Pressable
                onPress={() =>
                  completedToday && todayRecord ? router.push({ pathname: '/diary/[id]', params: { id: todayRecord.record_id } }) : router.push(WRITE_HREF)
                }
                accessibilityRole="button"
                // 홈 카드 안 버튼은 350×56 (사용자 지정). 좁은 화면에서는 카드 너비에 맞춘다.
                className="mt-6 w-[350px] max-w-full h-14 shrink-0 rounded-2xl bg-primary items-center justify-center active:opacity-90"
                style={{ boxShadow: '0 8px 20px rgba(99,103,255,0.28)' }}
              >
                <Text className="text-[16px] font-bold text-white">{completedToday ? '오늘 쓴 기록 보기' : '오늘 다이어리 쓰기'}</Text>
              </Pressable>
              <Link href="/challenge/info" className="h-12 flex flex-col justify-center">
                <Text className="text-[16px] font-semibold text-primary-pressed">챌린지 내용 보기</Text>
              </Link>
            </View>

            {/* 최근 기록 */}
            <View>
              <View className="flex-row items-center justify-between px-2 mb-3">
                <Text className="text-[16px] font-bold text-ink">최근 기록</Text>
                <Pressable onPress={() => router.navigate('/diary')} hitSlop={8}>
                  <Text className="text-[12px] text-mute">더보기</Text>
                </Pressable>
              </View>
              <View className="gap-2">
                {records.length > 0 ? (
                  records.map((r) => <RealRecordRow key={r.record_id} record={r} />)
                ) : (
                  <View className="rounded-[18px] bg-surface px-4 py-6 items-center">
                    <Text className="text-[14px] text-sub">아직 남긴 기록이 없어요</Text>
                    <Text className="text-[12px] text-mute mt-1">오늘의 질문에 답하면 여기에 쌓여요</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {intro.show === 'tutorial' && <HomeTutorial onClose={intro.done} />}
      {intro.show === 'question' && <TodayQuestionSheet name={displayName} streak={streak} character={character?.image} href={WRITE_HREF} onClose={intro.done} />}
    </Screen>
  );
}

// 홈은 이번 주 기록·최근 기록·연속 기록·AI 한 문장을 보여 주므로 동의가 없으면 동의 화면으로 바꾼다.
// 동의 화면에서 '나중에 할게요'는 마이페이지(설정·탈퇴 경로)로 보낸다.
export default withSensitiveGate(MainScreen, { inTabs: true });
