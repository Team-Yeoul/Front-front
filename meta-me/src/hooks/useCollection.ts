import { useAuthStore, type CollectedCogni } from '@/store';
import { useListMyMonsters } from '@/entities/collection';
import { useGetMyProfile, useGetOnboardingResult } from '@/entities/user';
import { CATEGORY_LABEL, fromFirstCogni, pickOnboardingCogniFromProfile } from '@/lib/onboardingCogni';
import { useMe } from './useMe';

/** 내가 모은 코그니 = 이 기기에 저장된 것(온보딩·객관화) + 서버 도감(/v1/users/me/monsters). 발견 순서대로. */
export function useCollection(): CollectedCogni[] {
  const token = useAuthStore((s) => s.accessToken);
  const { cognis: local } = useMe();
  const { data } = useListMyMonsters({ size: 100 }, !!token);

  // 첫 코그니는 기기에 저장된다. 다른 기기라 없으면 서버가 배정한 first_cogni를 쓰고,
  // 그것도 없으면(백엔드 구현 전·기존 계정) 서버 프로필의 온보딩 답으로 다시 고른다.
  const hasFirst = local.some((c) => c.source === 'onboarding');
  const { data: result, isPending } = useGetOnboardingResult(!!token && !hasFirst);
  const { data: profile } = useGetMyProfile(!!token && !hasFirst && !isPending && !result?.first_cogni);
  const restored = result?.first_cogni
    ? fromFirstCogni(result.first_cogni)
    : profile?.profile && pickOnboardingCogniFromProfile(profile.profile);
  const cognis = hasFirst || !restored ? local : [{ ...restored.cogni, foundAt: '' }, ...local];

  const fromServer: CollectedCogni[] = (data?.monsters ?? []).map((um) => ({
    id: um.monster.monster_id,
    name: um.current_title || um.monster.stage_titles?.[0] || um.monster.monster_code,
    desc: um.monster.monster_description,
    category: CATEGORY_LABEL[um.monster.category] ?? '패턴',
    image: um.monster.icon_url || '/v2/mascot-glasses.png',
    foundAt: '',
    source: 'mirror',
  }));

  const seen = new Set(cognis.map((c) => c.id));
  return [...cognis, ...fromServer.filter((c) => !seen.has(c.id))];
}
