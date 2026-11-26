'use client';

import { StatusView } from '@/components/ui/states';
import { router } from '@/lib/router';
import { useAuthStore } from '@/store';
import { useGetMyProfile, useGetOnboardingResult, useListMyNicknames } from '@/entities/user';
import { useListMirrorMonsters, type MirrorMonster } from '@/entities/dictionary';
import { useListPeerFeedback } from '@/entities/peer-feedback';
import { Screen } from '@/components/ui/Screen';
import { BackButton, Button, CogniImg, ProgressBar, TextButton, goBack } from '@/components/ui/primitives';
import { LockIcon } from '@/components/ui/icons';
import { Img, View } from '@/components/ui/rn';
import { Text } from '@/components/ui/Text';
import { CATEGORY_LABEL, PLACEHOLDER_FIRST_COGNI_ID, fromFirstCogni, hasCogniImage, iconOf, monsterName } from '@/lib/onboardingCogni';
import { TITLES, parseFeedback, tally } from '@/lib/peerFeedback';
import { useMe } from '@/hooks/useMe';
import { useTheme } from '@/lib/theme';

const UNLOCK = 80;

interface Mirror {
  eyebrow: string;
  title: string;
  desc: string;
  /** 서버·기기 그림 주소. 없으면 그림 칸을 그리지 않는다. */
  image?: string;
  /** 웹에 든 칭호 그림(앱 require 번호 자리, '/images/…'). CogniImg 대신 그대로 그린다. */
  bundled?: boolean;
  highlight?: boolean;
}

function MirrorRow({ m }: { m: Mirror }) {
  return (
    <View className={`flex-row items-center gap-3.5 rounded-[20px] px-4 py-4 ${m.highlight ? 'bg-primary-soft' : 'bg-surface'}`}>
      {m.image !== undefined && (
        <View className="w-12 h-12 rounded-full bg-page items-center justify-center overflow-hidden shrink-0">
          {m.bundled ? <Img src={m.image} size={40} contentFit="contain" /> : <CogniImg src={m.image} size={40} />}
        </View>
      )}
      <View className="flex-1 min-w-0">
        <Text className="text-[12px] text-sub">{m.eyebrow}</Text>
        <Text className="text-[16px] font-bold text-ink">{m.title}</Text>
        {m.desc ? (
          <Text numberOfLines={2} className="text-[12px] text-text-3 mt-0.5">
            {m.desc}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/**
 * 나의 별명 (13l): AI가 붙여준 별명을 크게, 아래에 '3개의 거울'(내가 고른 · AI가 본 · 친구가 본 칭호)을 둔다.
 * 별명은 도감 칭호를 고르는 방식이라 monster_id로 마스터 도감에서 칭호를 찾는다.
 */
export default function NicknameScreen() {
  const { bg } = useTheme();
  const token = useAuthStore((s) => s.accessToken);
  const { data: profile } = useGetMyProfile(!!token);
  const accuracy = profile?.latest_accuracy?.accuracy_percent ?? 0;
  const { data: ai } = useListMyNicknames({ type: 'AI', size: 1 }, !!token);
  const { data: self } = useListMyNicknames({ type: 'SELF', size: 1 }, !!token);
  const { data: others } = useListMyNicknames({ type: 'OTHERS', size: 20 }, !!token);
  const { data: monsters, isError: monstersFailed, refetch: refetchMonsters, isFetching: monstersFetching } = useListMirrorMonsters({ size: 100 }, !!token);
  const { data: peer } = useListPeerFeedback({ size: 100 }, !!token);
  // 온보딩 첫 코그니는 그림이 없어도 이름·설명은 보여 준다. useCollection은 그림 없는 코그니를 빼므로 쓰지 않고 직접 읽는다.
  const { data: onboarding } = useGetOnboardingResult(!!token);
  const { cognis: local } = useMe();
  const firstCogni = onboarding?.first_cogni
    ? fromFirstCogni(onboarding.first_cogni).cogni
    : local.find((c) => c.source === 'onboarding' && c.id !== PLACEHOLDER_FIRST_COGNI_ID);

  const byId = new Map((monsters?.monsters ?? []).map((m) => [m.monster_id, m]));
  const titleOf = (m?: MirrorMonster) => (m ? monsterName(m) : undefined);
  const aiNick = ai?.nicknames?.[0];
  const aiMonster = aiNick ? byId.get(aiNick.monster_id) : undefined;
  const unlocked = !!aiNick;

  const mirrors: Mirror[] = [];
  const selfNick = self?.nicknames?.[0];
  const selfMonster = selfNick ? byId.get(selfNick.monster_id) : undefined;
  if (selfNick && selfMonster) {
    mirrors.push({ eyebrow: '내가 생각한 나 · 스스로 고른 칭호', title: titleOf(selfMonster) ?? '', desc: selfNick.reason, image: iconOf(selfMonster) });
  } else if (firstCogni) {
    // 스스로 고른 칭호가 없으면 온보딩 답으로 만난 첫 코그니를 '내가 생각한 나'로 둔다. 그림이 없으면 그림 칸만 비운다.
    mirrors.push({
      eyebrow: '내가 생각한 나 · 온보딩 답',
      title: firstCogni.name,
      desc: firstCogni.desc,
      image: hasCogniImage(firstCogni.image) ? firstCogni.image : undefined,
    });
  }
  if (aiNick && aiMonster) {
    mirrors.push({ eyebrow: 'AI가 본 나 · 기록 기반', title: titleOf(aiMonster) ?? '', desc: aiNick.reason, image: iconOf(aiMonster), highlight: true });
  }
  // 친구가 붙인 별명(OTHERS)이 있으면 가장 많이 받은 것, 없으면 타인 평가에서 고른 칭호를 쓴다.
  const otherTop = tally((others?.nicknames ?? []).map((n) => n.monster_id))[0];
  const otherMonster = otherTop ? byId.get(otherTop[0]) : undefined;
  const peerTop = tally((peer?.feedbacks ?? []).map((f) => parseFeedback(f).title))[0];
  if (otherTop && otherMonster) {
    const reason = others?.nicknames?.find((n) => n.monster_id === otherTop[0])?.reason ?? '';
    mirrors.push({ eyebrow: `타인이 본 나 · 친구 ${otherTop[1]}명이 고름`, title: titleOf(otherMonster) ?? '', desc: `“${reason}”`, image: iconOf(otherMonster) });
  } else if (peerTop) {
    // 칭호 그림은 웹 주소('/images/…')여야 그릴 수 있다. 그 밖의 값(앱 require 번호)이면 그림 칸을 비운다.
    const image: unknown = TITLES.find((t) => t.label === peerTop[0])?.image;
    mirrors.push({
      eyebrow: `타인이 본 나 · 친구 ${peerTop[1]}명이 고름`,
      title: peerTop[0],
      desc: '친구들이 타인 평가에서 고른 칭호예요',
      image: typeof image === 'string' ? image : undefined,
      bundled: true,
    });
  }

  // 앱 Share.share 자리: 기기 공유 창이 있으면 쓰고, 없으면 문구를 복사한다.
  const share = async () => {
    const title = titleOf(aiMonster);
    if (!title) return;
    const message = `메타미가 붙여준 내 별명은 '${title}'`;
    try {
      if (typeof navigator.share === 'function') await navigator.share({ title: '나의 별명', text: message });
      else await navigator.clipboard?.writeText(message);
    } catch {
      // 공유를 취소한 경우는 무시
    }
  };

  return (
    <Screen
      footer={
        <>
          {unlocked ? <Button onPress={share}>별명 공유하기</Button> : <Button onPress={() => router.push('/diary/chat')}>기록하러 가기</Button>}
          <TextButton className="mt-1" onPress={() => router.push('/mirror/invite')}>
            친구에게 칭호 받기
          </TextButton>
        </>
      }
    >
      <View className="h-14 shrink-0 flex-row items-center justify-center px-5">
        <View className="absolute left-5">
          <BackButton onPress={() => goBack('/mypage')} />
        </View>
        <Text accessibilityRole="header" className="text-[16px] font-semibold text-ink">
          마이페이지
        </Text>
      </View>
      <View className="px-5 pt-3 pb-6">
        <View className="rounded-[24px] bg-yellow-soft px-6 pt-6 pb-7 items-center">
          <Text className="text-[12px] font-bold text-gold text-center">{unlocked ? `정확도 ${UNLOCK}% 달성 · 별명 열림` : `정확도 ${UNLOCK}% 달성 시 열려요`}</Text>
          {unlocked && aiMonster ? (
            <>
              {iconOf(aiMonster) && (
                <View className="mt-4">
                  <CogniImg src={iconOf(aiMonster)!} size={110} />
                </View>
              )}
              <View className="mt-3 h-7 px-3 rounded-full bg-page justify-center">
                <Text className="text-[12px] font-semibold text-primary">도감 칭호 · {CATEGORY_LABEL[aiMonster.category] ?? '패턴'}</Text>
              </View>
              <Text className="text-[24px] font-bold text-ink mt-3 text-center">{titleOf(aiMonster)}</Text>
              {aiNick?.reason ? <Text className="text-[14px] text-gold leading-[22px] mt-2 text-center">{aiNick.reason}</Text> : null}
            </>
          ) : (
            <>
              {unlocked && monstersFailed && !monsters ? (
                <StatusView compact kind="error" title="별명을 불러오지 못했어요" onRetry={() => refetchMonsters()} retrying={monstersFetching} className="pt-5 pb-1" />
              ) : (
                <>
                  <View className="w-[88px] h-[88px] shrink-0 rounded-full bg-page/70 items-center justify-center mt-5">
                    <LockIcon size={30} />
                  </View>
                  <Text className="text-[24px] font-bold text-ink mt-4">{!unlocked ? '???' : monsters ? '별명을 찾지 못했어요' : '별명을 불러오는 중...'}</Text>
                </>
              )}
              <View className="flex-row items-center gap-3 self-stretch mt-5">
                <View className="flex-1">
                  <ProgressBar value={(accuracy / UNLOCK) * 100} track={bg('#F1E6B8')} fill="#E5B92E" height={6} />
                </View>
                <Text className="text-[12px] font-semibold text-gold shrink-0 tabular-nums">
                  {accuracy} / {UNLOCK}%
                </Text>
              </View>
              <Text className="text-[14px] text-gold leading-[22px] mt-3 text-center">기록이 쌓여 나의 문장이 정확해질수록 별명에 가까워져요.</Text>
            </>
          )}
        </View>

        <Text accessibilityRole="header" className="text-[20px] font-bold text-ink mt-7">
          {mirrors.length}개의 거울
        </Text>
        <Text className="text-[12px] text-sub mt-1">세 칭호가 서로 다를수록 나를 더 많이 알 수 있어요</Text>
        <View className="gap-2.5 mt-4">
          {mirrors.map((m) => (
            <MirrorRow key={m.eyebrow} m={m} />
          ))}
          {mirrors.length === 0 && <Text className="text-[14px] text-sub text-center py-6">기록과 친구 답이 모이면 여기에 칭호가 쌓여요</Text>}
        </View>
      </View>
    </Screen>
  );
}
