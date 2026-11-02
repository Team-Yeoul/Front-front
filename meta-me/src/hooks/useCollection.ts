import { useAuthStore, type CollectedCogni } from '@/store';
import { useListMyMonsters } from '@/entities/collection';
import { useGetMyProfile, useGetOnboardingResult } from '@/entities/user';
import { CATEGORY_LABEL, fromFirstCogni, pickOnboardingCogniFromProfile } from '@/lib/onboardingCogni';
import { useMe } from './useMe';

/**
 * 내가 모은 코그니 = 이 기기에 저장된 것(온보딩·객관화) + 서버 도감(/v1/users/me/monsters). 발견 순서대로.
 * 이름·그림 등은 서버 값을 우선한다. 기기에는 모을 때의 값이 그대로 남아 있어 칭호가 바뀌면 어긋나기 때문이다.
 */
export function useCollection(): CollectedCogni[] {
  const token = useAuthStore((s) => s.accessToken);
  const { cognis: local } = useMe();
  const { data } = useListMyMonsters({ size: 100 }, !!token);

  // 첫 코그니는 서버가 배정한 first_cogni를 우선한다. 기기에 저장된 첫 코그니는
  // 제출 응답이 늦어 답으로 고른 임시 코그니일 수 있으므로 서버 것으로 바꾼다.
  const { data: result, isPending } = useGetOnboardingResult(!!token);
  const serverFirst = result?.first_cogni && fromFirstCogni(result.first_cogni).cogni;
  const localFirst = local.find((c) => c.source === 'onboarding');
  // 서버도 기기도 첫 코그니가 없으면(백엔드 구현 전·기존 계정) 서버 프로필의 온보딩 답으로 다시 고른다.
  const { data: profile } = useGetMyProfile(!!token && !isPending && !serverFirst && !localFirst);
  const first: CollectedCogni | undefined = serverFirst
    ? { ...serverFirst, foundAt: localFirst?.foundAt ?? '' }
    : (localFirst ?? (profile?.profile && { ...pickOnboardingCogniFromProfile(profile.profile).cogni, foundAt: '' }));
  const cognis = [...(first ? [first] : []), ...local.filter((c) => c.source !== 'onboarding' && c.id !== first?.id)];

  const fromServer: CollectedCogni[] = (data?.monsters ?? []).map((um) => ({
    id: um.monster.monster_id,
    name: um.current_title || um.monster.stage_titles?.[0] || um.monster.monster_code,
    desc: um.monster.monster_description,
    category: CATEGORY_LABEL[um.monster.category] ?? '패턴',
    image: um.monster.icon_url || '/v2/mascot-glasses.png',
    foundAt: '',
    source: 'mirror',
  }));
  const byId = new Map(fromServer.map((c) => [c.id, c]));

  // 서버 도감에 있는 코그니는 이름·설명·분류·그림을 서버 값으로 맞춘다. 발견 시각·출처·근거 문구는 기기 값을 둔다.
  const merged = cognis.map((c) => {
    const s = byId.get(c.id);
    return s ? { ...c, name: s.name, desc: s.desc, category: s.category, image: s.image } : c;
  });
  const seen = new Set(merged.map((c) => c.id));
  return [...merged, ...fromServer.filter((c) => !seen.has(c.id))];
}
