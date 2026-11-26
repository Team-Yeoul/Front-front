/** v3 온보딩 질문 형식 */
export type OnboardingQuestion =
  // 한 문장 쓰기. '잘 모르겠어요'로 넘길 수 있다.
  | { id: string; kind: 'sentence'; badge: string; title: string; caption: string; placeholder: string }
  // 단계 슬라이더. 가운데 단계에서 시작한다.
  | { id: string; kind: 'scale'; badge: string; title: string; caption: string; steps: string[]; ends: [string, string, string]; tip?: { title: string; body: string } }
  // 체크 리스트(여러 개). max가 있으면 남은 개수를 알려 준다.
  | { id: string; kind: 'multi'; badge: string; title: string; caption?: string; max?: number; options: string[] }
  // 체크 리스트(하나). 설명이 붙는다.
  | { id: string; kind: 'single'; badge: string; title: string; caption?: string; options: { label: string; description?: string }[] }
  // 2×2 카드(하나).
  | { id: string; kind: 'cards'; badge: string; title: string; caption?: string; note?: string; options: { label: string; description?: string }[] }
  // 24시간 원형 다이얼로 시작~끝 시각 고르기. 값은 분(0~1439) [시작, 끝].
  | { id: string; kind: 'timeRange'; badge: string; title: string; caption: string };

/**
 * v3 시안의 온보딩 10문항.
 * - id는 기기에서 첫 코그니를 고를 때(lib/onboardingCogni)도 쓴다: curious_about · repeating_pattern · my_one_sentence.
 * - 서버에는 필수 필드(self_strength · others_feedback · favorite_thing)를 이 답들로 채워 보내고,
 *   전체 답은 answers에 화면 순서대로 "1"~"10" 키로 함께 보낸다(app/(app)/onboarding.tsx의 buildRequest).
 */
export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'my_one_sentence',
    kind: 'sentence',
    badge: '주관식',
    title: '당신은 스스로를 한 문장으로 설명할 수 있나요?',
    caption: '정답은 없어요. 지금 떠오르는 문장이면 충분해요',
    placeholder: '계획은 잘 세우는데, 시작 앞에서 오래 머무는 사람.',
  },
  {
    id: 'self_awareness',
    kind: 'scale',
    badge: '척도',
    title: '평소에 스스로를 얼마나 잘 알고 있다고 느끼세요?',
    caption: '가장 가까운 쪽을 골라주세요',
    steps: ['전혀 몰라요', '잘 모르는 편이에요', '보통이에요', '꽤 아는 편이에요', '잘 알아요'],
    ends: ['전혀 몰라요', '보통', '잘 알아요'],
    tip: { title: '정답은 없어요', body: '요즘 실제로 필요하다고 느끼는 만큼 골라주세요. 리포트에서 기록과 함께 비교해 드려요.' },
  },
  {
    id: 'curious_about',
    kind: 'multi',
    badge: '복수 선택',
    title: '요즘 나에 대해 가장 알고 싶은 건 뭐예요?',
    caption: '최대 3개까지 골라주세요',
    max: 3,
    options: ['내가 왜 자꾸 미루는지', '내가 뭘 좋아하고 잘하는지', '내 감정 패턴이 어떤지', '공부나 일을 더 잘하는 방법', '인간관계에서의 내 모습'],
  },
  {
    id: 'repeating_pattern',
    kind: 'multi',
    badge: '복수 선택',
    title: '요즘 반복되는 패턴이 있다면 어떤 쪽에 가까워요?',
    options: ['계획은 세우는데 잘 안 지켜요', '시작하기가 어려워요', '감정에 따라 행동이 많이 바뀌어요', '뭘 원하는지 잘 모르겠어요', '열심히는 하는데 방향이 헷갈려요'],
  },
  {
    id: 'treat_me_as',
    kind: 'cards',
    badge: '단일 선택',
    title: '제가 당신의 페이스메이커가 되어 드릴 때, 어떤 관계(태도)로 대하는 것이 편하신가요?',
    caption: '편하게 느껴지는 관계 하나를 골라주세요',
    note: '이건 나중에 설정에서 언제든 바꿀 수 있어요.',
    options: [{ label: '매우 높으신 분들을 대하듯이' }, { label: '친밀한 관계 친구처럼 대하듯이' }, { label: '아랫사람을 대하듯이' }, { label: '국어책 읽듯이' }],
  },
  {
    id: 'others_feedback',
    kind: 'single',
    badge: '단일 선택',
    title: '남한테 자주 듣는 말 하나를 골라주세요',
    caption: '가장 자주 듣는 말 하나를 골라주세요',
    options: [
      { label: '“생각이 깊다”', description: '말하기 전에 오래 생각하고 신중하게 판단해요' },
      { label: '“같이 있으면 편하다”', description: '상대를 배려하고 분위기를 부드럽게 만들어요' },
      { label: '“추진력이 있다”', description: '정하면 바로 움직이고 끝까지 밀고 나가요' },
      { label: '“엉뚱하고 독특하다”', description: '남들이 생각 못 한 아이디어를 자주 내요' },
    ],
  },
  {
    id: 'self_strength',
    kind: 'cards',
    badge: '단일 선택',
    title: '내가 생각하는 내 장점 하나를 골라주세요',
    caption: '가장 자신 있는 것 하나를 골라주세요',
    options: [
      { label: '공감력', description: '다른 사람의 감정을 잘 알아차려요' },
      { label: '끈기', description: '한 번 시작한 일은 끝까지 해내요' },
      { label: '분석력', description: '상황을 차근차근 따져보고 판단해요' },
      { label: '창의력', description: '새로운 아이디어를 잘 떠올려요' },
    ],
  },
  {
    id: 'alone_time',
    kind: 'timeRange',
    badge: '척도',
    title: '하루 중 혼자 있는 시간은\n주로 언제인가요?',
    caption: '두 손잡이를 끌어 시작과 끝을 맞춰주세요',
  },
  {
    id: 'writing_moment',
    kind: 'multi',
    badge: '복수 선택',
    title: '기록이 잘 써지는 순간은 언제인가요?',
    caption: '해당하는 것을 모두 골라주세요',
    options: ['잠들기 전 조용할 때', '감정이 크게 흔들린 직후', '일을 끝내고 정리할 때', '사람을 만나고 돌아온 뒤'],
  },
  {
    id: 'want_to_see',
    kind: 'cards',
    badge: '단일 선택',
    title: '기록이 쌓이면 무엇을 가장 먼저 보고 싶나요?',
    caption: '가장 가까운 것 하나를 골라주세요',
    options: [
      { label: '감정의 흐름', description: '하루하루 달라지는 기분의 변화' },
      { label: '반복되는 패턴', description: '자주 떠올리는 생각과 습관' },
      { label: '남이 보는 나', description: '친구가 본 나와 내가 본 나의 차이' },
      { label: '성장 지표', description: '기록이 쌓이며 달라진 점' },
    ],
  },
];

/** 혼자 있는 시간 기본값: 밤 9시 ~ 아침 7시 (분) */
export const DEFAULT_ALONE_TIME: [number, number] = [21 * 60, 7 * 60];
