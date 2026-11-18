import { useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { Link, router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useAuthStore } from '@/store';
import { useGetMyProfile } from '@/entities/user';
import { Screen } from '@/components/ui/Screen';
import { CogniImg, ProgressBar } from '@/components/ui/primitives';
import { ChevronLeft, ChevronRight, GearIcon } from '@/components/ui/icons';
import { Sheet } from '@/components/ui/overlays';
import { MyTabs } from '@/components/ui/MyTabs';
import { Text } from '@/components/ui/Text';
import { useMe } from '@/hooks/useMe';
import { latestIndex, useCollection } from '@/hooks/useCollection';

const NICKNAME_UNLOCK = 80;

export default function MyPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: profile } = useGetMyProfile(!!accessToken);
  const me = useMe();
  const collection = useCollection();
  const { width, height } = useWindowDimensions();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [shownIdx, setShownIdx] = useState<number | null>(null);
  const [collectionOpen, setCollectionOpen] = useState(false);

  const email = profile?.user.email ?? '';
  const handle = email ? email.split('@')[0] : '';
  const name = me.nickname || profile?.user.username || handle || '나';
  const days = profile ? Math.max(1, Math.ceil((now.getTime() - new Date(profile.user.created_at).getTime()) / 86400000)) : 1;
  const level = Math.max(1, Math.floor(days / 20) + 1);
  const accuracy = profile?.latest_accuracy?.accuracy_percent ?? 0;
  const delta = profile?.latest_accuracy?.xp_delta ?? 0;
  const sentence = profile?.profile.ai_first_sentence || me.mySentence;
  const lv = `Lv.${String(level).padStart(2, '0')}`;
  // 기본은 가장 최근에 모은 코그니, '내가 모은 코그니'에서 고르면 그 코그니를 보여준다.
  const idx = shownIdx ?? latestIndex(collection);
  const character = collection[idx];
  const isThisMonth = month === now.getMonth() + 1;
  // 3열 격자: 시트 좌우 여백(20×2)과 칸 사이 간격(12×2)을 뺀 너비를 셋으로 나눈다.
  const cell = (width - 40 - 24) / 3;

  return (
    <Screen inTabs>
      <Sheet
        open={collectionOpen}
        onClose={() => setCollectionOpen(false)}
        closeButton
        title="내가 모은 코그니"
        sub={<Text className="text-[13px] text-sub">{collection.length}마리</Text>}
      >
        <ScrollView className="px-5 pt-4" style={{ maxHeight: height * 0.6 }} contentContainerClassName="pb-6" showsVerticalScrollIndicator={false}>
          {collection.length === 0 ? (
            <Text className="text-center text-[14px] text-sub py-10">아직 모은 코그니가 없어요</Text>
          ) : (
            <View className="flex-row flex-wrap gap-3">
              {collection.map((c, i) => (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    setShownIdx(i);
                    setCollectionOpen(false);
                  }}
                  accessibilityRole="button"
                  style={{ width: cell }}
                  className={`rounded-2xl px-2 pt-3 pb-3 items-center border ${i === idx ? 'border-primary bg-primary-soft' : 'border-line bg-white'}`}
                >
                  <CogniImg src={c.image} size={64} />
                  <Text className="text-[12px] font-semibold text-ink mt-2 text-center leading-[15px]">{c.name}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <Pressable
            onPress={() => {
              setCollectionOpen(false);
              router.push('/dogam');
            }}
            accessibilityRole="button"
            className="w-full h-11 mt-4 items-center justify-center"
          >
            <Text className="text-[14px] font-semibold text-primary">도감에서 보기 ›</Text>
          </Pressable>
        </ScrollView>
      </Sheet>

      <View className="flex-row items-center justify-center h-14 px-5">
        <Text className="text-[16px] font-semibold text-ink">마이페이지</Text>
        <Link href="/settings" asChild>
          <Pressable className="absolute right-5 w-9 h-9 rounded-full bg-surface-2 items-center justify-center" accessibilityLabel="설정">
            <GearIcon size={18} />
          </Pressable>
        </Link>
      </View>

      <View className="flex-row items-center gap-4 px-5 pt-2 pb-5">
        <View className="w-16 h-16 rounded-full bg-surface-2 items-center justify-center overflow-hidden">
          {character && <CogniImg src={character.image} size={52} />}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-[20px] font-bold text-ink">{name}</Text>
            <View className="h-6 px-2 rounded-md bg-yellow justify-center">
              <Text className="text-[12px] font-bold text-ink">{lv}</Text>
            </View>
          </View>
          <Text className="text-[13px] text-sub mt-1">
            {handle && `@${handle} · `}기록 {days}일차
          </Text>
        </View>
      </View>

      <MyTabs active="month" />

      <View className="bg-surface-2 px-5 pt-12 pb-5">
        <View className="flex-row items-center justify-center gap-7">
          <Pressable onPress={() => setMonth((m) => (m === 1 ? 12 : m - 1))} accessibilityLabel="이전 달" hitSlop={8}>
            <ChevronLeft size={18} />
          </Pressable>
          <View className="h-8 px-4 rounded-full bg-white justify-center">
            <Text className="text-[14px] font-bold text-ink">{month}월</Text>
          </View>
          <Pressable
            onPress={() => setMonth((m) => Math.min(now.getMonth() + 1, m + 1))}
            disabled={isThisMonth}
            accessibilityLabel="다음 달"
            hitSlop={8}
          >
            <ChevronRight size={18} color={isThisMonth ? '#C9CBFF' : '#6367FF'} />
          </Pressable>
        </View>
        <Text className="text-[20px] font-bold text-ink text-center mt-5">이번 달, 나를 {accuracy}%만큼 알았어요</Text>
        <View className="mt-5 rounded-2xl bg-white flex-row py-3.5 mx-1">
          {[
            { label: '이번 달 레벨', value: lv, cls: 'text-primary' },
            { label: '모은 도감', value: `${collection.length}장`, cls: 'text-ink' },
            { label: '정확도 변화', value: `▲ ${delta}%`, cls: 'text-ink' },
          ].map((s, i) => (
            <View key={s.label} className={`flex-1 items-center ${i > 0 ? 'border-l border-line' : ''}`}>
              <Text className="text-[12px] text-sub">{s.label}</Text>
              <Text className={`text-[18px] font-bold mt-1 ${s.cls}`}>{s.value}</Text>
            </View>
          ))}
        </View>

        <View className="justify-center items-center mt-9 mb-3 min-h-[180px]">
          {character ? (
            <View className="items-center">
              <CogniImg src={character.image} size={170} />
              <Text className="mt-2 text-[13px] font-semibold text-[#48484F]">{character.name}</Text>
            </View>
          ) : (
            <Text className="text-[14px] text-sub">아직 모은 코그니가 없어요</Text>
          )}
          <View className="absolute right-2 top-2 gap-3">
            <Pressable
              onPress={() => setCollectionOpen(true)}
              className="w-9 h-9 rounded-full bg-primary items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="내가 모은 코그니"
            >
              <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                <Path d="M7 17L17 7M9 7h8v8" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/mypage/nickname')}
          accessibilityRole="button"
          className="w-full rounded-3xl bg-white px-5 py-5 active:opacity-80"
          style={{ boxShadow: '0 6px 24px rgba(26,26,30,0.06)' }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-[16px] font-bold text-ink">나의 문장</Text>
            <Text className="text-[13px] font-semibold text-primary">정확도 {accuracy}%</Text>
          </View>
          <Text className={`text-[15px] leading-[26px] mt-3 ${sentence ? 'text-ink' : 'text-sub'}`}>
            {sentence || '아직 나의 문장이 없어요. 기록이 쌓이면 만들어져요.'}
          </Text>
          <ProgressBar value={accuracy} className="mt-4" height={6} />
          <View className="flex-row items-center gap-2 mt-3">
            <View className="h-7 px-2.5 rounded-full bg-surface-2 justify-center">
              <Text className="text-[12px] text-[#48484F]">🔒 나의 별명</Text>
            </View>
            <Text className="text-[12px] text-sub">{NICKNAME_UNLOCK}% 달성 시 열려요</Text>
          </View>
        </Pressable>
      </View>
    </Screen>
  );
}
