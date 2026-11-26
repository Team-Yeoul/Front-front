import type { components } from '@/shared/api';
import type { CollectedCogni } from '@/store';

type FirstCogni = components['schemas']['FirstCogni'];
export type FoundCogni = { cogni: Omit<CollectedCogni, 'foundAt'> & { features: string[] }; label: string };

export const CATEGORY_LABEL: Record<string, string> = {
  COGNITIVE: '사고 · 인지 패턴',
  EMOTIONAL: '감정 반응 패턴',
  BEHAVIORAL: '행동 패턴',
  RELATIONAL: '대인관계 패턴',
  GROWTH: '성장 패턴',
  SITUATIONAL: '상황 패턴',
};

/**
 * 코그니 그림이 실제로 있는지. 서버 icon_url이 비었거나, 기기에 기본 그림('/v2/…' 로컬 에셋)으로 남은 코그니는 그림이 없는 것으로 본다.
 * 그림 없는 몬스터(아직 그림이 없는 종)는 보여 주지 않는다. 서버도 그런 몬스터는 배정·포획하지 않는다.
 */
export const hasCogniImage = (src?: string | null): src is string => !!src && src.trim() !== '' && !src.startsWith('/v2/');

/** 몬스터 그림 주소. 그림이 없으면 기본 그림으로 대신하지 않고 undefined를 돌려 그림 칸을 비우게 한다. */
export const iconOf = (m?: { icon_url?: string | null } | null): string | undefined => (hasCogniImage(m?.icon_url) ? m.icon_url : undefined);

/**
 * 예전에 서버가 첫 코그니를 주지 않을 때 기기에서 답으로 고르던 임시(예시) 코그니의 id.
 * 실제 코그니가 아니므로 기기에 남아 있어도 보여 주지 않는다.
 */
export const PLACEHOLDER_FIRST_COGNI_ID = 'onboarding-first';

/** 서버가 배정한 첫 코그니. 서버 도감과 겹치지 않도록 id는 monster_id를 쓴다. */
export function fromFirstCogni(fc: FirstCogni): FoundCogni {
  const category = CATEGORY_LABEL[fc.category] ?? '패턴';
  const cogni = {
    id: fc.monster_id,
    name: monsterName({ category: fc.category }, { fallbacks: [fc.name] }),
    desc: fc.description,
    category,
    image: fc.icon_url || '/v2/cogni-default.png',
    source: 'onboarding' as const,
    // AI 배정에 실패하면 근거 문구가 비어 오므로 설명으로 대신한다.
    features: fc.features?.length ? fc.features : [fc.description],
  };
  return { cogni, label: category };
}

const HANGUL = /[가-힣]/;
const CATEGORY_NAME: Record<string, string> = {
  COGNITIVE: '생각하는 코그니',
  EMOTIONAL: '감정 코그니',
  BEHAVIORAL: '습관 코그니',
  RELATIONAL: '관계 코그니',
  GROWTH: '성장 코그니',
  SITUATIONAL: '상황 코그니',
};

/** 한국어가 들어 있는 이름인지. 서버 칭호가 비면 영어 monster_code가 오므로 이걸로 거른다. */
export const isKoreanName = (s?: string | null): s is string => !!s && HANGUL.test(s);

/**
 * 서버 몬스터의 화면 이름. 현재 칭호 → 지금 단계 칭호 → 1단계 칭호 → 그 밖의 후보 순으로 한국어 이름을 고르고,
 * 모두 비었거나 영어뿐이면 분류로 지은 한국어 이름을 쓴다. 영어 monster_code는 보여주지 않는다.
 */
export function monsterName(
  m: { stage_titles?: string[] | null; category: string },
  opts: { current?: string | null; stage?: number; fallbacks?: (string | null | undefined)[] } = {},
): string {
  const titles = m.stage_titles ?? [];
  const candidates = [opts.current, opts.stage ? titles[opts.stage - 1] : undefined, titles[0], ...(opts.fallbacks ?? [])];
  return candidates.find(isKoreanName) ?? CATEGORY_NAME[m.category] ?? '코그니';
}
