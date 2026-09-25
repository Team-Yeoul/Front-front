import type { MultiChoiceOption } from './MultiChoiceQuestion';
import type { ScaleOption } from './ScaleQuestion';
import type { CardGridOption } from './CardGridQuestion';
import type { ListChoiceOption } from './ListChoiceQuestion';

export type SurveyQuestion =
  | { id: string; type: 'multi'; title: string; caption?: string; max: number; options: MultiChoiceOption[] }
  | { id: string; type: 'scale'; title: string; caption?: string; options: ScaleOption[] }
  | { id: string; type: 'cardgrid'; title: string; caption?: string; options: CardGridOption[]; note?: string }
  | { id: string; type: 'list'; title: string; caption?: string; options: ListChoiceOption[] };

const iconSpan = (glyph: string) => <span className="text-[20px] font-bold">{glyph}</span>;

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'curious_about',
    type: 'multi',
    title: '요즘 나에 대해 가장 알고 싶은 건 뭐예요?',
    caption: '최대 3개까지 고를 수 있어요',
    max: 3,
    options: [
      { id: 'procrastinate', label: '내가 왜 자꾸 미루는지' },
      { id: 'strength', label: '내가 뭘 좋아하고 잘하는지' },
      { id: 'emotion_pattern', label: '내 감정 패턴이 어떤지' },
      { id: 'productivity', label: '공부나 일을 더 잘하는 방법' },
      { id: 'relationship', label: '인간관계에서의 내 모습' },
      { id: 'unsure', label: '아직 잘 모르겠어요', special: true },
    ],
  },
  {
    id: 'self_awareness',
    type: 'scale',
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
    id: 'repeating_pattern',
    type: 'multi',
    title: '요즘 반복되는 패턴이 있다면 어떤 쪽에 가까워요?',
    max: 3,
    options: [
      { id: 'plan_slip', label: '계획은 세우는데 잘 안 지켜요' },
      { id: 'hard_to_start', label: '시작하기가 어려워요' },
      { id: 'emotion_swing', label: '감정에 따라 행동이 많이 바뀌어요' },
      { id: 'unclear_want', label: '뭘 원하는지 잘 모르겠어요' },
      { id: 'direction_confused', label: '열심히는 하는데 방향이 헷갈려요' },
      { id: 'no_pattern', label: '특별한 패턴은 아직 모르겠어요', special: true },
    ],
  },
  {
    id: 'treat_me_as',
    type: 'cardgrid',
    title: '제가 당신을 어떻게 취급하는 것이 좋을까요?',
    note: '이건 나중에 설정에서 언제든 바꿀 수 있어요.',
    options: [
      { id: 'honored', label: '매우 높으신 분들을 대하듯이', icon: iconSpan('↑') },
      { id: 'friend', label: '친밀한 관계 친구처럼 대하듯이', icon: iconSpan('◡') },
      { id: 'junior', label: '아랫사람을 대하듯이', icon: iconSpan('↓') },
      { id: 'formal', label: '국어책 읽듯이', icon: iconSpan('Aa') },
    ],
  },
  {
    id: 'pacemaker_role',
    type: 'list',
    title: '제가 당신의 페이스메이커가 되어 드릴 때, 어떤 관계(태도)로 대하는 것이 편하신가요?',
    options: [
      { id: 'mentor', label: '스승과 제자처럼', description: '제가 조금 더 주도권을 갖고 이끌어주기를 원해요.' },
      { id: 'friend', label: '친한 친구처럼', description: '수평적이고 편안하게 대화하며 조언해 주길 원해요.' },
      { id: 'assistant', label: '비서나 부하직원처럼', description: '철저히 제 지시와 요구에 맞춰 서포트해 주길 원해요.' },
      { id: 'ai', label: '무감각한 AI처럼', description: '감정 빼고 국어책 읽듯 딱딱하고 객관적인 팩트만 주길 원해요.' },
    ],
  },
  {
    id: 'tone',
    type: 'list',
    title: '제가 당신에게 이야기할 때, 어떤 톤이 더 편하신가요?',
    options: [
      { id: 'warm', label: '따뜻한 위로형', description: '힘든 이야기를 할 땐 먼저 다독여주고 시작했으면 해요.' },
      { id: 'direct', label: '직설형', description: '위로보다 핵심부터 짚어주는 쪽이 더 편해요.' },
      { id: 'balanced', label: '균형형', description: '상황에 따라 알아서 톤을 맞춰주면 좋겠어요.' },
    ],
  },
  {
    id: 'explain_style',
    type: 'list',
    title: '설명은 어떤 방식이 더 편하신가요?',
    options: [
      { id: 'spoon', label: '숟가락형', description: '한 번에 하나씩, 차근차근 알려주면 좋겠어요.' },
      { id: 'all_at_once', label: '한번에형', description: '필요한 내용을 한 번에 정리해서 알려주면 좋겠어요.' },
    ],
  },
  {
    id: 'answer_length',
    type: 'list',
    title: '답변 길이는 어느 정도가 좋으신가요?',
    options: [
      { id: 'summary', label: '세 줄 요약', description: '핵심만 짧게 정리해서 알려주면 좋겠어요.' },
      { id: 'detailed', label: '자세히 풀어서', description: '배경과 맥락까지 자세히 설명해주면 좋겠어요.' },
    ],
  },
  {
    id: 'app_role',
    type: 'cardgrid',
    title: '이 앱이 당신에게 어떤 존재였으면 좋겠어요?',
    options: [
      { id: 'organizer', label: '나를 정리해주는 도구', icon: iconSpan('▤') },
      { id: 'listener', label: '나를 이해해주는 대화 상대', icon: iconSpan('◡') },
      { id: 'coach', label: '습관을 잡아주는 코치', icon: iconSpan('↑') },
      { id: 'journal', label: '감정을 돌아보게 하는 기록장', icon: iconSpan('✎') },
      { id: 'partner', label: '목표를 같이 관리해주는 파트너', icon: iconSpan('◎') },
      { id: 'unsure', label: '아직 잘 모르겠어요', icon: iconSpan('?'), special: true },
    ],
  },
];
