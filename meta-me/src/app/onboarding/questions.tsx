import type { Asset3D } from '@/components/ui/primitives';

export type OnboardingQuestion =
  | { id: string; kind: 'sentence'; icon: Asset3D; title: string; caption: string }
  | { id: string; kind: 'scale'; icon: Asset3D; title: string; options: { label: string; description: string }[] }
  | { id: string; kind: 'multi'; icon: Asset3D; title: string; caption?: string; max?: number; soft?: boolean; options: string[] }
  | { id: string; kind: 'list'; icon: Asset3D; title: string; options: { label: string; description: string }[] }
  | { id: string; kind: 'cards'; icon: Asset3D; title: string; caption?: string; glyphs?: string[]; options: { label: string; description?: string }[]; accent?: 'solid' | 'soft' }
  | { id: string; kind: 'hours'; icon: Asset3D; title: string };

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'my_one_sentence',
    kind: 'sentence',
    icon: 'pen',
    title: '자신을 한 문장으로 소개할 수 있나요?',
    caption: '정답은 없어요. 지금 떠오르는 문장이면 충분해요',
  },
  {
    id: 'self_awareness',
    kind: 'scale',
    icon: 'bulb',
    title: '평소에 스스로를 얼마나 잘 알고 있다고 느끼세요?',
    options: [
      { label: '알고 싶은데 정리가 안 돼요', description: '스스로를 알고 싶은 마음은 크지만 아직 언어로 정리되지 않은 편이라고 기억해 둘게요.' },
      { label: '잘 모르겠어요', description: '스스로에 대한 확신이 아직 적은 편이라고 기억해 둘게요.' },
      { label: '상황에 따라 달라요', description: '기분이나 환경에 따라 자기 이해가 흔들리는 편이라고 기억해 둘게요.' },
      { label: '어느 정도는 알아요', description: '기본적인 성향은 파악하고 있는 편이라고 기억해 둘게요.' },
      { label: '꽤 잘 아는 편이에요', description: '스스로에 대한 이해가 이미 뚜렷한 편이라고 기억해 둘게요.' },
    ],
  },
  {
    id: 'curious_about',
    kind: 'multi',
    icon: 'spring',
    title: '요즘 나에 대해 가장 알고 싶은 건 뭐예요?',
    caption: '최대 3개까지 고를 수 있어요',
    max: 3,
    options: ['내가 왜 자꾸 미루는지', '내가 뭘 좋아하고 잘하는지', '내 감정 패턴이 어떤지', '공부나 일을 더 잘하는 방법', '인간관계에서의 내 모습', '아직 잘 모르겠어요'],
  },
  {
    id: 'repeating_pattern',
    kind: 'multi',
    icon: 'gem',
    title: '요즘 반복되는 패턴이 있다면 어떤 쪽에 가까워요?',
    max: 3,
    options: ['계획은 세우는데 잘 안 지켜요', '시작하기가 어려워요', '감정에 따라 행동이 많이 바뀌어요', '뭘 원하는지 잘 모르겠어요', '열심히는 하는데 방향이 헷갈려요', '특별한 패턴은 아직 모르겠어요'],
  },
  {
    id: 'treat_me_as',
    kind: 'cards',
    icon: 'flower',
    title: '제가 당신을 어떻게 취급하는 것이 좋을까요?',
    glyphs: ['↑', '✓', '↓', 'Aa'],
    accent: 'solid',
    options: [{ label: '매우 높으신 분들을 대하듯이' }, { label: '친밀한 관계 친구처럼 대하듯이' }, { label: '아랫사람을 대하듯이' }, { label: '국어책 읽듯이' }],
  },
  {
    id: 'pacemaker_role',
    kind: 'list',
    icon: 'magnifier',
    title: '제가 당신의 페이스메이커가 되어 드릴 때, 어떤 관계(태도)로 대하는 것이 편하신가요?',
    options: [
      { label: '스승과 제자처럼', description: '제가 조금 더 주도권을 잡고 이끌어주기를 원해요.' },
      { label: '친한 친구처럼', description: '수평적이고 편안하게 대화하며 조언해 주길 원해요.' },
      { label: '비서나 부하직원처럼', description: '철저히 제 지시와 요구에 맞춰 서포트해 주길 원해요.' },
      { label: '무감각한 AI처럼', description: '감정 빼고 국어책 읽듯 딱딱하고 객관적인 팩트만 주길 원해요.' },
    ],
  },
  {
    id: 'tone',
    kind: 'cards',
    icon: 'chat',
    title: '피드백을 드릴 때, 어떤 톤앤매너로 말씀드리는 게 마음에 와닿으시나요?',
    caption: '카드를 눌러 실제 말투를 확인해 보세요',
    glyphs: ['✓', '!', '▦', '~'],
    accent: 'solid',
    options: [
      { label: '따뜻한 위로형', description: '"많이 힘드셨겠어요. 천천히 같이 해결해 봐요" (공감 위주)' },
      { label: '뼈 때리는 팩폭형', description: '"지금 이 부분이 문제입니다. 정신 차리셔야 합니다" (직설적 냉정함)' },
      { label: '차분한 분석형', description: '"원인은 두 가지예요. 하나씩 정리해 볼게요" (논리 위주)' },
      { label: '가벼운 수다형', description: '"그럴 수 있죠~ 일단 한숨 돌리고 가요" (편안한 톤)' },
    ],
  },
  { id: 'alone_hours', kind: 'hours', icon: 'mug', title: '하루 중 혼자 있는 시간이\n얼마나 필요한가요?' },
  {
    id: 'writing_moment',
    kind: 'multi',
    icon: 'alarm',
    title: '기록이 잘 써지는 순간은 언제인가요?',
    caption: '여러 개 골라도 괜찮아요',
    soft: true,
    options: ['잠들기 전 조용할 때', '감정이 크게 흔들린 직후', '일을 끝내고 정리할 때', '사람을 만나고 돌아온 뒤', '아직 잘 모르겠어요'],
  },
  {
    id: 'want_to_see',
    kind: 'cards',
    icon: 'bars',
    title: '기록이 쌓이면 무엇을 가장 먼저 보고 싶나요?',
    caption: '하나만 골라주세요',
    accent: 'soft',
    options: [
      { label: '감정의 흐름', description: '언제 무너지고 회복되는지' },
      { label: '반복되는 패턴', description: '같은 상황이 몇 번 왔는지' },
      { label: '남이 보는 나', description: '내 생각과 얼마나 다른지' },
      { label: '성장 지표', description: '문장이 얼마나 정확해졌는지' },
    ],
  },
];
