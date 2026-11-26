'use client';

import { useState } from 'react';
import { router } from '@/lib/router';
import { useAuthStore } from '@/store';
import { useGetMyProfile, useListMyNicknames } from '@/entities/user';
import { useListDailyRecords } from '@/entities/diary';
import { Screen } from '@/components/ui/Screen';
import { ProgressBar } from '@/components/ui/primitives';
import { ChevronRight, GearIcon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/states';
import { Pressable, View } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';
import { useMe } from '@/hooks/useMe';
import { useCollection } from '@/hooks/useCollection';
import { useSensitiveConsent } from '@/hooks/useSensitiveConsent';
import { useTheme } from '@/lib/theme';

const NICKNAME_UNLOCK = 80;
const CARD_SHADOW = { boxShadow: '0 2px 12px rgba(30,30,60,0.04)' } as const;

function SectionLabel({ children }: { children: string }) {
  return <Text className="text-[12px] text-sub px-1 mt-7 mb-2.5">{children}</Text>;
}

function Header() {
  return (
    <View className="h-14 shrink-0 flex-row items-center justify-center px-5">
      <Text accessibilityRole="header" className="text-[16px] font-semibold text-ink">
        마이페이지
      </Text>
      <Pressable
        onPress={() => router.push('/settings')}
        accessibilityRole="button"
        accessibilityLabel="설정"
        className="absolute right-5 w-11 h-11 rounded-full bg-page items-center justify-center"
        style={{ boxShadow: '0 2px 10px rgba(30,30,60,0.08)' }}
      >
        <GearIcon size={20} />
      </Pressable>
    </View>
  );
}

/** 마이페이지 (5a): 프로필 · 숫자 요약 · 나의 문장 · 도감 */
export default function MyPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: profile } = useGetMyProfile(!!accessToken);
  // 마이페이지는 동의를 철회해도 설정·탈퇴로 가는 길이라 감싸지 않는다. 대신 기록 수·AI 문장·정확도·AI 별명은 동의가 있을 때만 받고 보여 준다.
  const { agreed } = useSensitiveConsent();
  const { data: records } = useListDailyRecords({ size: 1 }, !!accessToken && agreed);
  const { data: aiNick } = useListMyNicknames({ type: 'AI', size: 1 }, !!accessToken && agreed);
  const me = useMe();
  const collection = useCollection();
  // 기록 일차 계산 기준 시각. 렌더마다 바뀌지 않게 화면이 뜰 때 한 번 잡는다.
  const [now] = useState(() => Date.now());
  const { fg } = useTheme();

  // 마이페이지 로딩 (16c)
  if (!profile) {
    return (
      <Screen inTabs bg="#F6F6F9">
        <Header />
        <View className="px-5 pb-6 items-center" accessibilityLabel="마이페이지 불러오는 중">
          <Skeleton onSurface className="w-[120px] h-[120px] rounded-full mt-5" />
          <Skeleton onSurface className="w-[100px] h-6 mt-5" />
          <Skeleton onSurface className="w-[150px] h-3.5 mt-2.5" />
          <View className="self-stretch">
            <Skeleton onSurface className="h-[84px] mt-6 rounded-[20px]" />
            <Skeleton onSurface className="h-[170px] mt-12 rounded-[20px]" />
            <Skeleton onSurface className="h-[80px] mt-12 rounded-[20px]" />
          </View>
        </View>
      </Screen>
    );
  }

  const email = profile.user?.email ?? '';
  const handle = email ? email.split('@')[0] : '';
  const name = me.nickname || profile.user?.username || handle || '나';
  const days = profile.user?.created_at ? Math.max(1, Math.ceil((now - new Date(profile.user.created_at).getTime()) / 86400000)) : 1;
  const level = Math.max(1, Math.floor(days / 20) + 1);
  const recordDays = records?.page_info?.total_elements ?? 0;
  const accuracy = profile.latest_accuracy?.accuracy_percent ?? 0;
  const sentence = agreed ? profile.profile?.ai_first_sentence || me.mySentence : undefined;
  const unlocked = agreed && (aiNick?.nicknames?.length ?? 0) > 0;
  // 한글 세 글자 이름(성+이름)은 이름 첫 글자를, 그 밖에는 첫 글자를 동그라미에 쓴다.
  const initial = /^[가-힣]{3}$/.test(name) ? name[1] : name[0];

  return (
    <Screen inTabs bg="#F6F6F9">
      <Header />
      <View className="px-5 pb-6">
        <View className="items-center pt-5">
          <Pressable onPress={() => router.push('/settings/profile')} accessibilityRole="button" accessibilityLabel="프로필 편집">
            <View className="w-[120px] h-[120px] shrink-0 rounded-full border-[3px] border-primary bg-primary-soft items-center justify-center">
              {/* 디자인 시스템 글자 크기 상한(24)을 넘는 이니셜 장식이라 lineHeight만 맞춘다. */}
              <Text className="text-[24px] font-bold text-primary" style={{ fontSize: 44, lineHeight: '52px' }}>
                {initial}
              </Text>
            </View>
            <View className="absolute right-0 bottom-1 w-9 h-9 rounded-full bg-page items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(30,30,60,0.15)' }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" fill="#6367FF" />
              </svg>
            </View>
          </Pressable>
          <Text className="text-[24px] font-bold text-ink mt-4">{name}</Text>
          <Text className="text-[14px] text-sub mt-1">
            {handle && `@${handle} · `}기록 {days}일차
          </Text>
        </View>

        <View className="mt-6 rounded-[20px] bg-page flex-row py-4" style={CARD_SHADOW}>
          {[
            { label: '레벨', value: `Lv.${String(level).padStart(2, '0')}` },
            { label: '모은 도감', value: `${collection.length}장` },
            { label: '기록한 날', value: agreed ? `${recordDays}일` : '-' },
          ].map((s, i) => (
            <View key={s.label} className={`flex-1 items-center ${i > 0 ? 'border-l border-surface-2' : ''}`}>
              <Text className="text-[18px] font-semibold tabular-nums text-ink">{s.value}</Text>
              <Text className="text-[12px] text-sub mt-1">{s.label}</Text>
            </View>
          ))}
        </View>

        <SectionLabel>나의 문장</SectionLabel>
        <View className="rounded-[20px] bg-page px-5 py-5" style={CARD_SHADOW}>
          <View className="flex-row items-center justify-between">
            <Pressable onPress={() => router.push('/report/sentence')} accessibilityRole="link" hitSlop={6}>
              <Text className="text-[16px] font-bold text-ink">지금까지 알게 된 나 ›</Text>
            </Pressable>
            <Text className="text-[12px] font-semibold text-primary tabular-nums">정확도 {agreed ? `${accuracy}%` : '-'}</Text>
          </View>
          <Text className={`text-[16px] leading-[26px] mt-3 ${sentence ? 'text-ink' : 'text-sub'}`}>
            {sentence || (agreed ? '아직 나의 문장이 없어요. 기록이 쌓이면 만들어져요.' : '민감정보 처리 동의를 하면 나의 문장을 볼 수 있어요.')}
          </Text>
          <ProgressBar value={agreed ? accuracy : 0} className="mt-4" height={6} />
          <Pressable onPress={() => router.push('/mypage/nickname')} accessibilityRole="link" className="flex-row items-center gap-2 mt-3">
            <View className={`h-7 px-2.5 rounded-full justify-center ${unlocked ? 'bg-yellow-soft' : 'bg-surface-2'}`}>
              <Text className={`text-[12px] font-semibold ${unlocked ? 'text-gold' : 'text-body'}`}>{unlocked ? '나의 별명 열림' : '나의 별명 잠김'}</Text>
            </View>
            <Text className="text-[12px] text-sub">{unlocked ? '눌러서 보기' : `${NICKNAME_UNLOCK}% 달성 시 열려요`}</Text>
          </Pressable>
        </View>

        <SectionLabel>도감</SectionLabel>
        <Pressable
          onPress={() => router.push('/dogam')}
          accessibilityRole="button"
          className="flex-row items-center gap-4 rounded-[20px] bg-page px-4 py-4 active:opacity-80"
          style={CARD_SHADOW}
        >
          <View className="w-12 h-12 shrink-0 rounded-2xl bg-primary-soft items-center justify-center">
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 3h10a2 2 0 0 1 2 2v16l-3-2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="#6367FF" />
              <path d="M14 3v8l2-1.5 2 1.5V5" fill="#C9CAFF" />
            </svg>
          </View>
          <View className="flex-1">
            <Text className="text-[16px] font-bold text-ink">코그니 도감</Text>
            <Text className="text-[12px] text-sub mt-0.5">{collection.length}장 모았어요</Text>
          </View>
          <ChevronRight size={18} color={fg('#C4C4CC')} />
        </Pressable>
      </View>
    </Screen>
  );
}
