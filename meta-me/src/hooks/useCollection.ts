import { useAuthStore, type CollectedCogni } from '@/store';
import { useListMyMonsters } from '@/entities/collection';
import { useMe } from './useMe';

const CATEGORY_LABEL: Record<string, string> = {
  COGNITIVE: '사고 · 인지 패턴',
  EMOTIONAL: '감정 반응 패턴',
  BEHAVIORAL: '행동 패턴',
  RELATIONAL: '대인관계 패턴',
  GROWTH: '성장 패턴',
  SITUATIONAL: '상황 패턴',
};

/** 내가 모은 코그니 = 이 기기에 저장된 것(온보딩·객관화) + 서버 도감(/v1/users/me/monsters). 발견 순서대로. */
export function useCollection(): CollectedCogni[] {
  const token = useAuthStore((s) => s.accessToken);
  const { cognis } = useMe();
  const { data } = useListMyMonsters({ size: 100 }, !!token);

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
