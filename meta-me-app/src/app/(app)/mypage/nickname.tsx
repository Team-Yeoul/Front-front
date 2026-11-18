import { View } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store';
import { useGetMyProfile, useListMyNicknames } from '@/entities/user';
import { useListMirrorMonsters } from '@/entities/dictionary';
import { Screen } from '@/components/ui/Screen';
import { Button, ProgressBar, TextButton, TopBar } from '@/components/ui/primitives';
import { LockIcon } from '@/components/ui/icons';
import { Text } from '@/components/ui/Text';

const UNLOCK = 80;

/**
 * 나의 별명: AI가 붙여준 별명(nickname_type=AI)을 보여준다. 별명은 도감 칭호를 고르는 방식이라
 * monster_id로 도감 마스터 목록에서 칭호(stage_titles[0])를 찾는다. 아직 없으면 정확도 80% 목표를 보여준다.
 */
export default function NicknameScreen() {
  const token = useAuthStore((s) => s.accessToken);
  const { data: profile } = useGetMyProfile(!!token);
  const accuracy = profile?.latest_accuracy?.accuracy_percent ?? 0;
  const { data: nicknames } = useListMyNicknames({ type: 'AI', size: 1 }, !!token);
  const aiNickname = nicknames?.nicknames[0];
  const { data: monsters } = useListMirrorMonsters({ size: 100 }, !!aiNickname);
  const monster = monsters?.monsters.find((m) => m.monster_id === aiNickname?.monster_id);
  const title = monster ? monster.stage_titles?.[0] || monster.monster_code : null;
  const unlocked = !!aiNickname;
  const sentence = profile?.profile.ai_first_sentence;

  return (
    <Screen
      footer={
        <>
          <Button variant="dark" onPress={() => router.push('/diary/chat')}>
            {unlocked ? '기록 이어가기' : '기록하러 가기'}
          </Button>
          <TextButton className="mt-1" onPress={() => router.dismissTo('/mypage')}>
            마이페이지로
          </TextButton>
        </>
      }
    >
      <TopBar title="나의 별명" backHref="/mypage" />
      <View className="px-5 pt-3">
        <View className="rounded-3xl bg-yellow-soft px-6 py-6">
          <Text className="text-[12px] font-bold text-gold">{unlocked ? '별명이 생겼어요' : `정확도 ${UNLOCK}% 달성 시 열려요`}</Text>
          {unlocked ? (
            <>
              <Text className="text-[28px] font-bold text-ink mt-2">{title ?? '별명을 불러오는 중...'}</Text>
              {!!aiNickname?.reason && <Text className="text-[14px] text-gold leading-[24px] mt-3">{aiNickname.reason}</Text>}
            </>
          ) : (
            <View className="flex-row items-center gap-2 mt-3">
              <LockIcon size={22} />
              <Text className="text-[24px] font-bold text-ink">???</Text>
            </View>
          )}
          {!unlocked && (
            <>
              <View className="flex-row items-center gap-3 mt-5">
                <View className="flex-1">
                  <ProgressBar value={(accuracy / UNLOCK) * 100} track="#F1E6B8" fill="#E5B92E" height={6} />
                </View>
                <Text className="font-mono text-[13px] font-semibold text-gold">
                  {accuracy} / {UNLOCK}%
                </Text>
              </View>
              <Text className="text-[14px] text-gold leading-[24px] mt-4">기록이 쌓여 나의 문장이 정확해질수록 별명에 가까워져요.</Text>
            </>
          )}
        </View>
        <View className="mt-5 rounded-3xl bg-card border border-line px-5 py-5">
          <Text className="text-[12px] font-semibold text-sub">지금 나의 문장</Text>
          <Text className={`text-[15px] leading-[26px] mt-2.5 ${sentence ? 'text-ink' : 'text-sub'}`}>{sentence || '아직 나의 문장이 없어요'}</Text>
        </View>
      </View>
    </Screen>
  );
}
