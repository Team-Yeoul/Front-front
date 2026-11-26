import type { PeerFeedback } from '@/entities/peer-feedback';
import { AXES } from '@/lib/mock';

/*
 * 서버는 친구 답을 장점·아쉬운 점·인상 세 칸의 글로만 받는다.
 * 친구가 답하는 웹 화면(/feedback/[token])이 질문별 답을 "머리말: 값" 줄로 담아 보내고,
 * 앱의 결과 화면은 같은 머리말로 다시 읽어 모은다. (보내는 쪽 buildFeedback은 웹에만 있다 — 머리말을 바꾸면 양쪽 함께)
 */

export const ROLES = ['앞에서 이끌었어요', '내용을 정리하고 설명했어요', '분위기와 사람을 챙겼어요', '뒤에서 묵묵히 해냈어요', '잘 모르겠어요'];
export const HARD = ['시작하기 전, 준비가 길어질 때', '여러 사람 의견이 부딪힐 때', '계획이 갑자기 바뀔 때', '힘들어 보인 적이 없어요'];
/** 친구가 고를 수 있는 칭호와 그림 (웹 TITLES와 같은 순서·이름) */
export const TITLES = [
  { label: '든든한 해결사', image: '/images/v2/cogni-default.png' },
  { label: '메타인지 대천사장', image: '/images/feedback/cogni-meta.png' },
  { label: '견문색 장인', image: '/images/v2/cogni-default.png' },
  { label: '마감 전사', image: '/images/v2/cogni-default.png' },
  { label: '경청의 달인', image: '/images/feedback/cogni-listen.png' },
  { label: '인정 선생', image: '/images/feedback/cogni-approval.png' },
];
const SKIPPED = '답하지 않음';

const P = {
  name: '이름: ',
  relation: '관계: ',
  scene: '기준 장면: ',
  role: '그 장면에서의 역할: ',
  words: '떠오르는 단어: ',
  hard: '힘들어 보였던 때: ',
  hardWhy: '이유: ',
  scores: '점수(1–5): ',
  message: '한 마디: ',
  title: '칭호: ',
};

export interface ParsedFeedback {
  relation?: string;
  role?: string;
  words: string[];
  hard?: string;
  strength?: string;
  scores: Partial<Record<(typeof AXES)[number], number>>;
  message?: string;
  title?: string;
}

const KNOWN = Object.values(P);

/** 보낸 형식대로 다시 읽는다. 형식 이전에 받은 자유 글은 장점 칸 글만 살린다. */
export function parseFeedback(f: PeerFeedback): ParsedFeedback {
  const all = [f.strengths, f.growth_areas, f.impression].flatMap((t) => (t ?? '').split('\n')).map((l) => l.trim());
  const pick = (p: string) => all.find((l) => l.startsWith(p))?.slice(p.length).trim();
  const strength = (f.strengths ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && l !== SKIPPED && !KNOWN.some((p) => l.startsWith(p)))
    .join(' ');
  const scores: ParsedFeedback['scores'] = {};
  for (const part of pick(P.scores)?.split('·') ?? []) {
    const [axis, n] = part.trim().split(' ');
    if ((AXES as readonly string[]).includes(axis) && Number(n)) scores[axis as (typeof AXES)[number]] = Number(n);
  }
  return {
    relation: pick(P.relation)?.replace(/\s*\(.*\)$/, ''),
    role: pick(P.role),
    words: pick(P.words)?.split(',').map((w) => w.trim()).filter(Boolean) ?? [],
    hard: pick(P.hard),
    strength: strength || undefined,
    scores,
    message: pick(P.message),
    title: pick(P.title)?.split(' — ')[0],
  };
}

/** 값별 응답 수를 많은 순으로. */
export function tally(values: (string | undefined)[]) {
  const map = new Map<string, number>();
  for (const v of values) if (v) map.set(v, (map.get(v) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}
