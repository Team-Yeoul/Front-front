// v2 시안(Desktop/UX/metame-v2)의 예시 데이터.
// 백엔드 API가 아직 없는 화면(대화 기록, 타인 평가, 코그니 도감 상세, 리포트 세부 등)과
// 로그아웃 상태의 데모 화면에서 사용한다.

export const MOCK_NICKNAME = '소희';
export const MOCK_FULL_NAME = '김소희';

export interface DiaryListItem {
  id: string;
  title: string;
  date: string; // YYYY.MM.DD
  tags: string[];
  status: 'objectified' | 'draft';
}

export const MOCK_DIARIES: DiaryListItem[] = [
  { id: 'd1', title: '오늘도 다 친구탓', date: '2025.06.17', tags: ['외부 귀인', '분함'], status: 'objectified' },
  { id: 'd2', title: '엄마 때문에 화남', date: '2025.06.16', tags: ['과잉 책임'], status: 'objectified' },
  { id: 'd3', title: '회사 때문에 스트레스', date: '2025.06.15', tags: ['소진', '조급함'], status: 'objectified' },
  { id: 'd4', title: '발표 끝내고 텅 빈 기분', date: '2025.05.29', tags: ['소진'], status: 'draft' },
  { id: 'd5', title: '오랜만에 잘 잤다', date: '2025.05.27', tags: ['회복'], status: 'draft' },
];

export const MOCK_DIARY_DETAIL = {
  title: '오늘도 다 친구탓',
  date: '2025.06.17',
  meta: '화요일 · 22:14 작성',
  original: '약속에 또 늦었다. 매번 이런 식이라 진짜 지친다. 나만 시간을 지키는 것 같아서 억울했다.',
  objectified: '약속 시간이 25분 지연됐다. 기다리는 동안 인정받지 못했다는 감정이 올라왔다.',
  patterns: ['외부 귀인', '과잉 책임'],
  cogni: { name: '억울한 남탓대마왕', id: 'c1' },
};

export interface Cogni {
  id: string;
  name: string;
  shortName: string;
  desc: string;
  category: '사고/인지 패턴' | '감정 반응 패턴' | '행동 패턴' | '대인관계 패턴';
  foundAt?: string;
  locked?: { remainDays: number };
}

export const MOCK_COGNIS: Cogni[] = [
  { id: 'c1', name: '억울한 남탓대마왕', shortName: '남탓대마왕', desc: '외부 요인에 책임을 돌리는 경향', category: '사고/인지 패턴', foundAt: '26.02.25' },
  { id: 'c2', name: '돋보기', shortName: '돋보기', desc: '한 번의 경험을 전체 상황으로 확대 해석하는 패턴', category: '사고/인지 패턴', foundAt: '26.02.25' },
  { id: 'c3', name: '흑백 재판관', shortName: '흑백 재판관', desc: '중간 없이 성공과 실패로만 나누는 습관', category: '사고/인지 패턴', foundAt: '26.02.20' },
  { id: 'c4', name: '???', shortName: '???', desc: '', category: '사고/인지 패턴', locked: { remainDays: 3 } },
  { id: 'c5', name: '???', shortName: '???', desc: '', category: '사고/인지 패턴', locked: { remainDays: 7 } },
];

export const MOCK_COGNI_MOMENTS = [
  {
    date: '06.17 · 22:14',
    tag: '약속',
    title: ['친구를 기다리다', '남탓대마왕이 나타났어요'],
    quote: [
      { t: '약속에 또 늦었다. ' },
      { t: '매번', hl: true },
      { t: ' 이런 식이라 진짜 지친다. ' },
      { t: '나만', hl: true },
      { t: ' 시간을 지키는 것 같아서 억울했다.' },
    ],
    fact: '친구가 약속 시간에 25분 늦었어요.',
  },
  {
    date: '06.09 · 23:40',
    tag: '조별과제',
    title: ['혼자 발표 자료를 만들다', '남탓대마왕이 나타났어요'],
    quote: [
      { t: '팀원들이 아무것도 안 해서', hl: true },
      { t: ' 결국 ' },
      { t: '나만', hl: true },
      { t: ' 다 했다.' },
    ],
    fact: '발표 자료를 혼자 만들었고, 역할 분담은 따로 없었어요.',
  },
];

export const MOCK_REPORT = {
  weekLabel: '8월 3일 주간',
  accuracy: 76,
  accuracyDelta: 8,
  records: 12,
  streak: 5,
  aiSummary:
    '마감이 있는 일에서 몰입이 가장 깊었어요. 반대로 시작 전 준비가 길어지는 날이 세 번 있었고, 그런 날은 기록도 짧았습니다. 감정을 언어로 정리하는 능력은 지난주보다 뚜렷하게 좋아졌습니다.',
  strengths: [
    { title: '마감 앞에서 몰입', desc: '"마감이 있어서 오히려 잘 붙었다" — 8/1 기록', count: 3 },
    { title: '감정을 언어로 정리', desc: '감정 태그를 3개 이상 고른 날이 5회', count: 5 },
    { title: '혼자 있을 때 아이디어', desc: '혼자 보낸 시간 뒤 기록의 분량이 두 배', count: 2 },
  ],
  cautions: [
    { title: '시작 전 준비가 길어짐', count: 3 },
    { title: '늦은 밤 알림 확인', count: 5 },
    { title: '계획 대비 실행 이탈', count: 4 },
  ],
  interests: [
    { label: '글쓰기', count: 9 },
    { label: '러닝', count: 6 },
    { label: '전시', count: 4 },
  ],
  disinterests: [
    { label: '긴 회의', count: 7 },
    { label: '숫자 정리', count: 3 },
  ],
  energy: [
    { kind: 'booster' as const, title: '에너지 부스터', desc: '아침 러닝 · 혼자 쓰는 시간' },
    { kind: 'vampire' as const, title: '에너지 뱀파이어', desc: '늦은 밤 알림 확인 · 5회' },
    { kind: 'blackhole' as const, title: '에너지 블랙홀', desc: '목적 없는 스크롤 · 평균 42분' },
  ],
  weekly: [
    { label: '7월 2주', value: 65 },
    { label: '3주', value: 68 },
    { label: '4주', value: 72 },
    { label: '이번 주', value: 76 },
  ],
  findings: [
    { title: '마감이 생기면 몰입하지만, 마감이 없으면 준비 단계에서 멈춰요.', desc: '이번 주 기록 12개 중 7개에서 같은 흐름이 반복됐습니다.' },
    { title: '밤에 남긴 기록은 낮보다 감정 표현이 두 배 많았어요.' },
  ],
};

export const AXES = ['표현력', '주도성', '공감', '추진력', '차분함'] as const;

export const MOCK_COMPARE = {
  headline: ['설명은 잘하지만', '스스로는 못한다고 믿는 사람'],
  self: [52, 60, 86, 70, 74],
  others: [84, 64, 78, 72, 66],
  matches: ['공감 86 / 78', '차분함 74 / 66'],
  matchDesc: '감정을 잘 알아차리고, 혼자 몰입할 때 결과가 좋다는 평가가 양쪽에서 같았어요.',
  gap: { axis: '표현력', self: 52, others: 84 },
};

export const MOCK_SENTENCE = {
  current: '마감이 다가올수록 몰입하고, 혼자 있을 때 생각이 정리되는 사람.',
  accuracy: 76,
  history: [
    { week: '7월 3주', text: '마감이 다가올수록 몰입하고, 혼자 있을 때 생각이 정리되는 사람.', accuracy: 76 },
    { week: '7월 1주', text: '마감 앞에서 집중이 올라오는 사람.', accuracy: 68 },
    { week: '6월 4주', text: '계획은 잘 세우는데, 시작 앞에서 오래 머무는 사람.', accuracy: 52 },
  ],
};

export interface ChatSummary {
  id: string;
  question: string;
  preview: string;
  time: string;
  group: string;
  kind: '자유 대화' | '분석 질문';
  tags: string[];
}

export const MOCK_CHATS: ChatSummary[] = [
  { id: 't1', question: '요즘 가장 자주 떠오르는 사람이 있나요?', preview: '동아리 선배요. 같이 프로젝트를 하는데, 제가 준비한 걸 보여주기가…', time: '22:40', group: '오늘', kind: '자유 대화', tags: ['망설임'] },
  { id: 't2', question: '왜 준비가 길어지는 게 약점이에요?', preview: '준비가 길었던 3일은 실제로 시작한 시간이 평소보다 늦었고…', time: '21:12', group: '어제', kind: '분석 질문', tags: ['강점 / 약점'] },
  { id: 't3', question: '오늘 가장 오래 머문 감정은 뭐였나요?', preview: '억울함이요. 내가 다 했는데 아무도 모를 것 같아서.', time: '23:05', group: '8월 1일 · 금', kind: '자유 대화', tags: ['억울함'] },
  { id: 't4', question: '마감 몰입은 어떤 기록에서 나왔어요?', preview: '8월 1일, 4일 기록에서 마감 직전 기록 분량이 두 배였어요.', time: '20:18', group: '8월 1일 · 금', kind: '분석 질문', tags: [] },
];

export const MOCK_CHAT_THREAD = [
  { role: 'ai' as const, text: '요즘 가장 자주 떠오르는 사람이 있나요? 떠오르는 대로 편하게 이야기해 주세요.' },
  { role: 'user' as const, text: '동아리 선배요. 같이 프로젝트를 하는데, 제가 준비한 걸 보여주기가 자꾸 망설여져요.' },
  { role: 'ai' as const, text: '보여주기 전에 어떤 생각이 먼저 드는지 궁금해요. 평가받는 느낌에 가까운가요, 아직 덜 됐다는 느낌에 가까운가요?' },
  { role: 'user' as const, text: '덜 됐다는 쪽이요. 완성하고 보여주고 싶어요.' },
];

export const MOCK_FRIENDS_RESULT = {
  relation: '동아리 · 같은 반',
  q1: {
    title: '그 장면에서 어떤 역할이었나요?',
    items: [
      { label: '내용을 정리하고 설명했어요', pct: 60 },
      { label: '뒤에서 묵묵히 해냈어요', pct: 20 },
      { label: '앞에서 이끌었어요', pct: 20 },
      { label: '분위기와 사람을 챙겼어요', pct: 0 },
    ],
  },
  q2: [
    { label: '말을 잘하는', pct: 80, top: true },
    { label: '꼼꼼한', pct: 80, top: true },
    { label: '책임감 있는', pct: 60 },
    { label: '걱정이 많은', pct: 40 },
    { label: '차분한', pct: 20 },
    { label: '솔직한', pct: 20 },
  ],
  q3: {
    title: '가장 힘들어 보였던 때',
    items: [
      { label: '시작하기 전, 준비가 길어질 때', pct: 60 },
      { label: '계획이 갑자기 바뀔 때', pct: 20 },
      { label: '여러 사람 의견이 부딪힐 때', pct: 20 },
    ],
  },
  vote: [
    { label: '설명 장인', pct: 80 },
    { label: '감정 레이더', pct: 60 },
    { label: '마감 스퍼터', pct: 40 },
  ],
  q4: ['복잡한 걸 설명해주면 다들 바로 이해해요.', '맡은 건 끝까지 챙겨요. 티를 안 낼 뿐이에요.'],
  q6: ['시작이 늦어도 끝은 늘 좋더라. 너무 걱정하지 마', '설명 들으면 항상 정리가 돼요.'],
};

export const TYPE_OPTIONS = [
  { key: 'A', label: '설명 장인', desc: '어려운 걸 쉽게 풀어서 말해줘요', pct: 80 },
  { key: 'B', label: '감정 레이더', desc: '분위기와 기분을 먼저 알아채요', pct: 60 },
  { key: 'C', label: '마감 스퍼터', desc: '마감이 다가오면 확 몰입해요', pct: 40 },
  { key: 'D', label: '조용한 추진력', desc: '말없이 끝까지 해내요', pct: 20 },
];

/** "2025.06.17" → { y, m, d } */
export const splitDotDate = (s: string) => {
  const [y, m, d] = s.split('.');
  return { y, m, d };
};
