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

type OnboardingCogni = Omit<CollectedCogni, 'foundAt' | 'id' | 'source'> & { no: number; features: string[] };

/**
 * 서버가 first_cogni를 주지 않을 때(백엔드 구현 전·기존 계정) 쓰는 임시 첫 코그니 후보.
 * 서버 구현이 끝나면 지운다.
 * 캐릭터 그림이 아직 두 장뿐이라 그림은 나눠 쓴다.
 */
export const ONBOARDING_COGNIS = {
  planner: {
    no: 1,
    name: '꼼꼼한 설계자',
    desc: '계획을 먼저 세워야 마음이 놓이는 패턴',
    category: '행동 · 습관 패턴',
    image: '/v2/cogni-headphone.png',
    features: ['계획을 먼저 세워야 마음이 놓여요', '시작 전에 준비가 길어지곤 해요', '마감이 보이면 확 몰입해요'],
  },
  starter: {
    no: 2,
    name: '신중한 출발자',
    desc: '첫 발을 떼기까지 오래 고민하는 패턴',
    category: '행동 · 습관 패턴',
    image: '/v2/cogni-headphone.png',
    features: ['완벽하게 하고 싶어서 시작이 늦어져요', '해야 할 일을 자꾸 뒤로 미루게 돼요', '한번 시작하면 끝까지 붙잡아요'],
  },
  wave: {
    no: 3,
    name: '감정 파도타기',
    desc: '그날의 기분이 하루의 방향을 정하는 패턴',
    category: '감정 패턴',
    image: '/v2/cogni-headphone.png',
    features: ['기분에 따라 하루의 속도가 달라져요', '감정을 느끼는 폭이 넓은 편이에요', '마음이 정리되면 다시 힘이 나요'],
  },
  explorer: {
    no: 4,
    name: '길 찾는 탐험가',
    desc: '원하는 방향을 찾아 이것저것 시도하는 패턴',
    category: '성장 패턴',
    image: '/v2/mascot-glasses.png',
    features: ['열심히 하지만 방향이 자주 헷갈려요', '내가 진짜 원하는 걸 찾고 있어요', '새로운 걸 시도하는 데 거리낌이 없어요'],
  },
  observer: {
    no: 5,
    name: '조용한 관찰자',
    desc: '스스로를 한 걸음 떨어져 지켜보는 패턴',
    category: '인지 패턴',
    image: '/v2/mascot-glasses.png',
    features: ['나를 알고 싶은 마음이 커요', '섣불리 결론 내리지 않고 지켜봐요', '기록이 쌓일수록 더 선명해져요'],
  },
} satisfies Record<string, OnboardingCogni>;

type CogniKey = keyof typeof ONBOARDING_COGNIS;

/** 반복 패턴 답(가중치 2)과 알고 싶은 것 답(가중치 1)이 가리키는 코그니. */
const PATTERN_TO_COGNI: Record<string, CogniKey> = {
  '계획은 세우는데 잘 안 지켜요': 'planner',
  '시작하기가 어려워요': 'starter',
  '감정에 따라 행동이 많이 바뀌어요': 'wave',
  '뭘 원하는지 잘 모르겠어요': 'explorer',
  '열심히는 하는데 방향이 헷갈려요': 'explorer',
  '특별한 패턴은 아직 모르겠어요': 'observer',
};
const CURIOUS_TO_COGNI: Record<string, CogniKey> = {
  '내가 왜 자꾸 미루는지': 'starter',
  '내가 뭘 좋아하고 잘하는지': 'explorer',
  '내 감정 패턴이 어떤지': 'wave',
  '공부나 일을 더 잘하는 방법': 'planner',
  '인간관계에서의 내 모습': 'observer',
  '아직 잘 모르겠어요': 'observer',
};

/** 직접 쓴 한 문장에 들어 있으면 그 코그니를 가리키는 단어(어간). 단어 하나마다 가중치 2. */
const KEYWORDS: Record<CogniKey, string[]> = {
  planner: ['계획', '준비', '정리', '마감', '꼼꼼', '체계', '목표', '일정', '루틴', '효율'],
  starter: ['미루', '미뤄', '시작', '귀찮', '게으', '망설', '신중', '완벽', '걱정', '고민'],
  wave: ['기분', '감정', '우울', '불안', '짜증', '화가', '화나', '눈물', '예민', '스트레스'],
  explorer: ['원하', '좋아하', '꿈', '방향', '진로', '도전', '새로운', '호기심', '탐험', '여행'],
  observer: ['관찰', '생각이 많', '조용', '혼자', '내향', '차분', '궁금', '알고 싶', '돌아보', '사람들'],
};

const asList = (a: unknown) => (Array.isArray(a) ? (a as string[]) : []);

/**
 * 온보딩 답으로 첫 코그니를 고른다. 직접 쓴 한 문장의 단어(2) · 반복 패턴 답(2) · 알고 싶은 것 답(1)을 더한다.
 * 점수가 같으면 한 문장, 먼저 고른 답 순으로 따르고, 단서가 없으면 관찰자.
 */
export function pickOnboardingCogni(answers: Record<string, unknown>): FoundCogni {
  const score = new Map<CogniKey, number>();
  const add = (key: CogniKey | undefined, w: number) => key && score.set(key, (score.get(key) ?? 0) + w);
  const sentence = typeof answers.my_one_sentence === 'string' ? answers.my_one_sentence : '';
  for (const [key, words] of Object.entries(KEYWORDS) as [CogniKey, string[]][])
    words.filter((w) => sentence.includes(w)).forEach(() => add(key, 2));
  asList(answers.repeating_pattern).forEach((p) => add(PATTERN_TO_COGNI[p], 2));
  asList(answers.curious_about).forEach((c) => add(CURIOUS_TO_COGNI[c], 1));

  // Map은 넣은 순서를 지키므로, 같은 점수면 먼저 고른 답의 코그니가 남는다.
  let best: CogniKey = 'observer';
  let bestScore = 0;
  for (const [key, s] of score) if (s > bestScore) [best, bestScore] = [key, s];

  const { no, ...rest } = ONBOARDING_COGNIS[best];
  // 다시 온보딩해도 도감에 하나만 남도록 id는 온보딩 코그니 하나로 유지한다.
  const cogni: Omit<CollectedCogni, 'foundAt'> & { features: string[] } = { id: 'onboarding-first', source: 'onboarding', ...rest };
  return { cogni, label: `No.${String(no).padStart(2, '0')} · ${cogni.category}` };
}

/**
 * 서버 프로필로 첫 코그니를 다시 고른다. 기기에 저장된 코그니가 없을 때(다른 기기·브라우저) 쓴다.
 * 온보딩 제출 때 반복 패턴 답은 others_feedback에, 알고 싶은 것 답은 favorite_thing에 ', '로 이어 보낸다.
 */
export function pickOnboardingCogniFromProfile(profile: { others_feedback: string; favorite_thing: string }) {
  const split = (s: string) => s.split(', ').filter(Boolean);
  return pickOnboardingCogni({
    repeating_pattern: split(profile.others_feedback),
    curious_about: split(profile.favorite_thing),
  });
}

/** 서버가 배정한 첫 코그니. 서버 도감과 겹치지 않도록 id는 monster_id를 쓴다. */
export function fromFirstCogni(fc: FirstCogni): FoundCogni {
  const category = CATEGORY_LABEL[fc.category] ?? '패턴';
  const cogni = {
    id: fc.monster_id,
    name: fc.name,
    desc: fc.description,
    category,
    image: fc.icon_url || '/v2/mascot-glasses.png',
    source: 'onboarding' as const,
    // AI 배정에 실패하면 근거 문구가 비어 오므로 설명으로 대신한다.
    features: fc.features?.length ? fc.features : [fc.description],
  };
  return { cogni, label: category };
}
