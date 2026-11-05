import type { Asset3D } from '@/components/ui/primitives';

export type OnboardingQuestion =
  | { id: string; kind: 'sentence'; icon: Asset3D; title: string; caption: string }
  | { id: string; kind: 'scale'; icon: Asset3D; title: string; options: { label: string; description: string }[] }
  // custom: 주면 선택지 아래에 직접 적는 칸을 두고, 그 placeholder로 쓴다.
  | { id: string; kind: 'multi'; icon: Asset3D; title: string; caption?: string; max?: number; soft?: boolean; custom?: string; options: string[] }
  | { id: string; kind: 'list'; icon: Asset3D; title: string; options: { label: string; description: string }[] }
  | { id: string; kind: 'cards'; icon: Asset3D; title: string; caption?: string; glyphs?: string[]; options: { label: string; description?: string }[]; accent?: 'solid' | 'soft' };

const SENTENCE_CAPTION = '정답은 없어요. 지금 떠오르는 문장이면 충분해요';

/**
 * 온보딩은 두 묶음으로 진행한다(진행 표시도 묶음마다 따로 센다).
 * 1) 소개 문장 4개: id가 온보딩 API 필드 이름과 같다.
 * 2) 설문 8개: 소개 중 '잘 모르겠습니다.'를 누르면 이어서 답한다. 답은 API answers에 이 순서대로 "1"~"8" 키로 보낸다
 *    (서버 BalanceGame과 순서·선택지 문구가 같아야 한다).
 */
export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  { id: 'my_one_sentence', kind: 'sentence', icon: 'pen', title: '당신을 한문장으로 소개해주세요', caption: SENTENCE_CAPTION },
  { id: 'self_strength', kind: 'sentence', icon: 'pen', title: '당신의 강점을 간단히 소개해주세요', caption: SENTENCE_CAPTION },
  { id: 'others_feedback', kind: 'sentence', icon: 'pen', title: '당신이 생각하는 ‘남이 보는 나’를 간단히 소개해주세요', caption: SENTENCE_CAPTION },
  { id: 'favorite_thing', kind: 'sentence', icon: 'pen', title: '당신이 좋아하는 것을 간단히 소개해주세요', caption: SENTENCE_CAPTION },
  {
    id: 'self_awareness',
    kind: 'scale',
    icon: 'bulb',
    title: '내가 뭘 좋아하고 잘하는지,\n얼마나 알고 있다고 느끼세요?',
    options: [
      { label: '거의 모르겠어요', description: '좋아하는 것과 잘하는 것을 아직 찾아가는 중이라고 기억해 둘게요.' },
      { label: '조금 알 것 같아요', description: '어렴풋이 짐작은 가지만 확신은 적은 편이라고 기억해 둘게요.' },
      { label: '반반이에요', description: '기분이나 환경에 따라 자기 이해가 흔들리는 편이라고 기억해 둘게요.' },
      { label: '꽤 알아요', description: '기본적인 성향은 파악하고 있는 편이라고 기억해 둘게요.' },
      { label: '확실히 알아요', description: '스스로에 대한 이해가 이미 뚜렷한 편이라고 기억해 둘게요.' },
    ],
  },
  {
    id: 'curious_about',
    kind: 'multi',
    icon: 'spring',
    title: '기록을 통해 가장 알고 싶은 나는\n어떤 모습인가요?',
    caption: '최대 3개까지 고를 수 있어요',
    max: 3,
    options: ['내가 진짜 좋아하는 것', '내가 잘하는 것, 나의 강점', '에너지가 차오르는 순간과 빠지는 순간', '감정이 움직이는 패턴', '자꾸 미루거나 멈추는 이유'],
  },
  {
    id: 'repeating_pattern',
    kind: 'multi',
    icon: 'gem',
    title: '요즘 나에게서 자주 보이는 모습이 있나요?',
    options: ['남을 도울 때 힘이 나요', '혼자 깊이 파고들 때 즐거워요', '하고 싶은 게 많아 이것저것 시작해요', '계획은 세우는데 실행이 어려워요', '기분에 따라 하루가 크게 달라져요'],
  },
  {
    id: 'treat_me_as',
    kind: 'cards',
    icon: 'flower',
    title: '메타미가 어떤 말투로 이야기하면 편하세요?',
    glyphs: ['↑', '✓', '↓', 'Aa'],
    accent: 'solid',
    options: [{ label: '정중한 존댓말' }, { label: '편안한 존댓말' }, { label: '친구 같은 반말' }, { label: '군더더기 없이 담백하게' }],
  },
  {
    id: 'tone',
    kind: 'list',
    icon: 'magnifier',
    title: '기록을 분석해 드릴 때,\n어떤 방식이 와닿으세요?',
    options: [
      { label: '따뜻한 공감형', description: '그날 많이 지쳤겠어요. 그래도 끝까지 해낸 게 보여요.' },
      { label: '솔직한 직언형', description: '이번 주엔 하고 싶은 일보다 해야 할 일만 적혀 있어요.' },
      { label: '근거 중심형', description: "최근 2주 기록 중 70%에서 '만들 때' 기분이 좋았어요." },
      { label: '질문형', description: '그때 왜 그렇게 즐거웠는지 한 줄로 적어 볼까요?' },
    ],
  },
  {
    id: 'flow_moment',
    kind: 'multi',
    icon: 'chat',
    title: '최근 시간 가는 줄 몰랐던 순간이 있었나요?',
    caption: '여러 개 골라도 되고, 직접 적어도 좋아요. 첫 분석의 단서가 돼요.',
    custom: '직접 적기',
    options: ['무언가를 만들 때', '누군가와 깊이 대화할 때', '새로운 걸 배울 때', '정리하고 계획할 때', '몸을 움직일 때'],
  },
  {
    id: 'writing_moment',
    kind: 'multi',
    icon: 'alarm',
    title: '언제 기록하는 게 가장 편하세요?',
    caption: '고른 시간에 가볍게 알려 드릴게요.',
    soft: true,
    options: ['아침, 하루를 시작하며', '이동 중이나 쉬는 틈에', '자기 전, 하루를 돌아보며', '마음이 움직였을 때 바로', '아직 모르겠어요'],
  },
  {
    id: 'want_to_see',
    kind: 'cards',
    icon: 'bars',
    title: '기록이 쌓이면 무엇을 가장 먼저 보고 싶나요?',
    caption: '하나만 골라주세요',
    accent: 'soft',
    options: [
      { label: '내가 좋아하는 것', description: '기분이 좋아지는 순간의 공통점' },
      { label: '나의 강점', description: '기록 속에서 반복되는 잘하는 것' },
      { label: '반복되는 흐름', description: '감정과 에너지가 오르내리는 패턴' },
      { label: '생각한 나 vs 기록 속 나', description: '1번에 쓴 문장과 실제 기록 비교' },
    ],
  },
];
