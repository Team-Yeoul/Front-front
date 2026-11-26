/**
 * ⚠️ 임시 변환 — 서버에 새 온보딩 질문(v3 시안 10문항)이 등록되면 이 파일을 지우고
 *    app/(app)/onboarding.tsx의 buildRequest에서 toLegacyAnswers 대신 새 답(ANSWER_SLOTS)을 그대로 보내면 된다.
 *
 * 서버는 아직 예전 질문 8개(밸런스 게임)의 선택지 문구와 똑같은 답만 받는다("1번 질문의 선택지가 올바르지 않습니다").
 * 그래서 보낼 때만 새 화면의 답을 가장 뜻이 가까운 예전 선택지로 바꾼다. 예전 질문에 대응하는 새 질문이 없으면
 * (분석 방식 등) 다른 답에서 짐작하고, 그래도 없으면 기본값을 넣는다.
 */

type Answer = string | string[] | number | [number, number] | undefined;

/** 서버(예전) 질문별 선택지. 순서대로 answers "1"~"8". */
const LEGACY = {
  self_awareness: ['거의 모르겠어요', '조금 알 것 같아요', '반반이에요', '꽤 알아요', '확실히 알아요'],
  curious_about: ['내가 진짜 좋아하는 것', '내가 잘하는 것, 나의 강점', '에너지가 차오르는 순간과 빠지는 순간', '감정이 움직이는 패턴', '자꾸 미루거나 멈추는 이유'],
  repeating_pattern: ['남을 도울 때 힘이 나요', '혼자 깊이 파고들 때 즐거워요', '하고 싶은 게 많아 이것저것 시작해요', '계획은 세우는데 실행이 어려워요', '기분에 따라 하루가 크게 달라져요'],
  treat_me_as: ['정중한 존댓말', '편안한 존댓말', '친구 같은 반말', '군더더기 없이 담백하게'],
  tone: ['따뜻한 공감형', '솔직한 직언형', '근거 중심형', '질문형'],
  flow_moment: ['무언가를 만들 때', '누군가와 깊이 대화할 때', '새로운 걸 배울 때', '정리하고 계획할 때', '몸을 움직일 때'],
  writing_moment: ['아침, 하루를 시작하며', '이동 중이나 쉬는 틈에', '자기 전, 하루를 돌아보며', '마음이 움직였을 때 바로', '아직 모르겠어요'],
  want_to_see: ['내가 좋아하는 것', '나의 강점', '반복되는 흐름', '생각한 나 vs 기록 속 나'],
} as const;

/** 새 선택지 → 예전 선택지 */
const CURIOUS: Record<string, string> = {
  '내가 왜 자꾸 미루는지': '자꾸 미루거나 멈추는 이유',
  '내가 뭘 좋아하고 잘하는지': '내가 진짜 좋아하는 것',
  '내 감정 패턴이 어떤지': '감정이 움직이는 패턴',
  '공부나 일을 더 잘하는 방법': '내가 잘하는 것, 나의 강점',
  '인간관계에서의 내 모습': '에너지가 차오르는 순간과 빠지는 순간',
};
const PATTERN: Record<string, string> = {
  '계획은 세우는데 잘 안 지켜요': '계획은 세우는데 실행이 어려워요',
  '시작하기가 어려워요': '계획은 세우는데 실행이 어려워요',
  '감정에 따라 행동이 많이 바뀌어요': '기분에 따라 하루가 크게 달라져요',
  '뭘 원하는지 잘 모르겠어요': '하고 싶은 게 많아 이것저것 시작해요',
  '열심히는 하는데 방향이 헷갈려요': '하고 싶은 게 많아 이것저것 시작해요',
};
const TREAT: Record<string, string> = {
  '매우 높으신 분들을 대하듯이': '정중한 존댓말',
  '친밀한 관계 친구처럼 대하듯이': '친구 같은 반말',
  '아랫사람을 대하듯이': '편안한 존댓말',
  '국어책 읽듯이': '군더더기 없이 담백하게',
};
/** 분석 방식은 새 질문에 없어, 고른 관계(태도)로 짐작한다. */
const TONE_FROM_TREAT: Record<string, string> = {
  '매우 높으신 분들을 대하듯이': '근거 중심형',
  '친밀한 관계 친구처럼 대하듯이': '따뜻한 공감형',
  '아랫사람을 대하듯이': '솔직한 직언형',
  '국어책 읽듯이': '근거 중심형',
};
/** '시간 가는 줄 몰랐던 순간'도 새 질문에 없어, 기록이 잘 써지는 순간으로 짐작한다. */
const FLOW_FROM_WRITING: Record<string, string> = {
  '일을 끝내고 정리할 때': '정리하고 계획할 때',
  '사람을 만나고 돌아온 뒤': '누군가와 깊이 대화할 때',
};
const WRITING: Record<string, string> = {
  '잠들기 전 조용할 때': '자기 전, 하루를 돌아보며',
  '감정이 크게 흔들린 직후': '마음이 움직였을 때 바로',
  '일을 끝내고 정리할 때': '이동 중이나 쉬는 틈에',
  '사람을 만나고 돌아온 뒤': '마음이 움직였을 때 바로',
};
const WANT: Record<string, string> = {
  '감정의 흐름': '반복되는 흐름',
  '반복되는 패턴': '반복되는 흐름',
  '남이 보는 나': '생각한 나 vs 기록 속 나',
  '성장 지표': '나의 강점',
};

const list = (a: Answer) => (Array.isArray(a) ? (a as unknown[]).filter((x): x is string => typeof x === 'string') : []);
/** 여러 개 고른 답을 바꾸고 겹친 것은 하나로. 비면 기본값 하나(서버는 8문항 모두 답해야 받는다). */
const mapMany = (a: Answer, table: Record<string, string>, fallback: string, max?: number) => {
  const out = [...new Set(list(a).map((x) => table[x]).filter(Boolean))];
  return (max ? out.slice(0, max) : out).length ? (max ? out.slice(0, max) : out) : [fallback];
};

/** 새 화면의 답 → 서버(예전 질문) answers "1"~"8" */
export function toLegacyAnswers(answers: Record<string, Answer>): Record<string, string | string[]> {
  const scale = typeof answers.self_awareness === 'number' ? answers.self_awareness : 2;
  const treat = typeof answers.treat_me_as === 'string' ? answers.treat_me_as : '';
  return {
    '1': LEGACY.self_awareness[Math.max(0, Math.min(4, scale))],
    '2': mapMany(answers.curious_about, CURIOUS, LEGACY.curious_about[0], 3),
    '3': mapMany(answers.repeating_pattern, PATTERN, LEGACY.repeating_pattern[3]),
    '4': TREAT[treat] ?? LEGACY.treat_me_as[1],
    '5': TONE_FROM_TREAT[treat] ?? LEGACY.tone[0],
    '6': mapMany(answers.writing_moment, FLOW_FROM_WRITING, LEGACY.flow_moment[3]),
    '7': mapMany(answers.writing_moment, WRITING, LEGACY.writing_moment[4]),
    '8': WANT[typeof answers.want_to_see === 'string' ? answers.want_to_see : ''] ?? LEGACY.want_to_see[0],
  };
}
