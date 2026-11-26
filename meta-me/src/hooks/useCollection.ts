import { useAuthStore, type CollectedCogni } from '@/store';
import { useListMyMonsters } from '@/entities/collection';
import { useGetOnboardingResult } from '@/entities/user';
import { useListMirrorMonsters } from '@/entities/dictionary';
import { CATEGORY_LABEL, PLACEHOLDER_FIRST_COGNI_ID, fromFirstCogni, hasCogniImage, monsterName } from '@/lib/onboardingCogni';
import { DEFAULT_COGNI_IMAGE } from '@/components/ui/primitives';
import { useMe } from './useMe';

/**
 * 가장 최근에 모은 코그니의 위치. 비어 있으면 0.
 * 기기에 발견 시각이 있으면 그중 가장 늦은 것을 고른다.
 * 앱을 다시 설치해 시각이 하나도 없으면(서버 도감에는 획득 시각이 없다) 목록 순서를 따른다.
 * 목록은 첫 코그니 → 서버 도감 순서이므로 마지막 것이 가장 최근에 모은 코그니다.
 */
export function latestIndex(cognis: CollectedCogni[]): number {
  if (cognis.length === 0) return 0;
  if (!cognis.some((c) => c.foundAt)) return cognis.length - 1;
  let best = 0;
  cognis.forEach((c, i) => {
    if (c.foundAt && c.foundAt > (cognis[best].foundAt ?? '')) best = i;
  });
  return best;
}

/**
 * 내가 모은 코그니 =이 기기에 저장된 것(온보딩·객관화) + 서버 도감(/v1/users/me/monsters). 발견 순서대로.
 * 이름·그림 등은 서버 값을 우선한다. 기기에는 모을 때의 값이 그대로 남아 있어 칭호가 바뀌면 어긋나기 때문이다.
 */
export function useCollection(): CollectedCogni[] {
  const token = useAuthStore((s) => s.accessToken);
  const { cognis: local } = useMe();
  const { data } = useListMyMonsters({ size: 100 }, !!token);

  // 첫 코그니는 서버가 배정한 first_cogni를 쓴다. 서버가 아직 주지 않았으면 첫 코그니 없이 둔다
  // (예전에 기기에서 답으로 고른 임시 예시 코그니는 실제 코그니가 아니므로 남아 있어도 보여 주지 않는다).
  const { data: result } = useGetOnboardingResult(!!token);
  const serverFirst = result?.first_cogni && fromFirstCogni(result.first_cogni).cogni;
  const localFirst = local.find((c) => c.source === 'onboarding' && c.id !== PLACEHOLDER_FIRST_COGNI_ID);
  const first: CollectedCogni | undefined = serverFirst ? { ...serverFirst, foundAt: localFirst?.foundAt ?? '' } : localFirst;
  const cognis = [...(first ? [first] : []), ...local.filter((c) => c.source !== 'onboarding' && c.id !== first?.id)];

  // 내 도감 목록에 칭호가 비어 오는 경우가 있어(영어 monster_code만 남음) 마스터 도감의 칭호와 기기에 저장된 이름으로 채운다.
  const { data: master } = useListMirrorMonsters({ size: 100 }, !!token);
  const masterTitles = new Map((master?.monsters ?? []).map((m) => [m.monster_id, m.stage_titles]));
  const localName = new Map(cognis.map((c) => [c.id, c.name]));

  const fromServer: CollectedCogni[] = (data?.monsters ?? []).map((um) => ({
    id: um.monster.monster_id,
    // 목록에 칭호가 비어 오면 마스터 도감의 단계별 칭호를 대신 넣어, 지금 단계(title_stage)의 칭호를 고르게 한다.
    name: monsterName(
      { ...um.monster, stage_titles: um.monster.stage_titles?.length ? um.monster.stage_titles : (masterTitles.get(um.monster.monster_id) ?? []) },
      { current: um.current_title, stage: um.title_stage, fallbacks: [localName.get(um.monster.monster_id)] },
    ),
    desc: um.monster.monster_description,
    category: CATEGORY_LABEL[um.monster.category] ?? '패턴',
    image: um.monster.icon_url || DEFAULT_COGNI_IMAGE,
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
  // 그림 없는 몬스터는 내 코그니로 보여 주지 않는다(기본 그림으로 대신하지 않음).
  return [...merged, ...fromServer.filter((c) => !seen.has(c.id))].filter((c) => hasCogniImage(c.image));
}
