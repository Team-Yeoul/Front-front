import type { CounselingConversation, CounselingSession } from '@/entities/counseling';
import type { SavedChat } from '@/store';

// AskSheet가 만드는 분석 질문 세션의 제목과 메시지 머리말. 서버 세션을 다시 읽을 때 이 모양으로 종류를 구분한다.
const ANALYSIS_TITLE_SUFFIX = ' 분석 질문';
export const analysisSessionTitle = (context: string) => `${context}${ANALYSIS_TITLE_SUFFIX}`;
export const analysisMessage = (context: string, question: string) => `[${context} 분석에 대한 질문] ${question}`;

// 대화 탭이 기기에서 먼저 건넨 질문을 다음 답과 함께 보낼 때 쓰는 머리말. 다시 읽을 때 질문과 답으로 나눈다.
const ASKED_PREFIX = '(메타미가 먼저 물은 질문: ';
export const withAskedQuestion = (question: string, answer: string) => `${ASKED_PREFIX}${question})\n${answer}`;
/**
 * 질문을 붙여도 maxLength(서버 메시지 상한) 안에 들면 붙이고, 넘치면 답만 보낸다.
 * 답은 입력칸에서 이미 상한 안으로 받았으므로, 질문 맥락 때문에 서버가 메시지를 거절하지 않게 한다.
 */
export const withAskedQuestionWithin = (question: string, answer: string, maxLength: number) => {
  const full = withAskedQuestion(question, answer);
  return full.length <= maxLength ? full : answer;
};
/** 분석 질문 입력칸이 받을 수 있는 글자 수(머리말을 붙여도 maxLength를 넘지 않게) */
export const analysisQuestionMaxLength = (context: string, maxLength: number) => maxLength - analysisMessage(context, '').length;
/** withAskedQuestion으로 보낸 글 → [질문, 답]. 머리말이 없으면 null */
function splitAsked(content: string): [string, string] | null {
  if (!content.startsWith(ASKED_PREFIX)) return null;
  const end = content.indexOf(')\n', ASKED_PREFIX.length);
  return end < 0 ? null : [content.slice(ASKED_PREFIX.length, end), content.slice(end + 2)];
}

// 서버 시각(LocalDateTime)은 시간대 표시 없이 UTC로 온다. 그대로 Date에 넣으면 기기 시간으로 읽혀 9시간 어긋난다.
// 소수점 아래가 9자리까지 오는데 Safari는 3자리까지만 읽으므로 잘라낸다.
// 값이 없거나 읽을 수 없으면 null을 돌려준다(목록 전체가 깨지지 않게).
function toIso(t: string | null | undefined) {
  if (!t) return null;
  const ms = t.replace(/(\.\d{3})\d+/, '$1');
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(ms) ? ms : `${ms}Z`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function kindOf(session: CounselingSession): Pick<SavedChat, 'kind' | 'context'> {
  if (session.title?.endsWith(ANALYSIS_TITLE_SUFFIX)) {
    return { kind: 'analysis', context: session.title.slice(0, -ANALYSIS_TITLE_SUFFIX.length) || undefined };
  }
  return { kind: 'free' };
}

/** 서버에만 있는 상담 세션(다른 기기·브라우저, API로 만든 세션)을 지난 대화 항목 모양으로 바꾼다. id는 세션 id를 쓴다. */
export function sessionToChat(session: CounselingSession, conversation?: CounselingConversation): SavedChat {
  const { kind, context } = kindOf(session);
  const prefix = context ? analysisMessage(context, '') : null;
  const messages = [...(conversation?.messages ?? [])]
    .sort((a, b) => (toIso(a.created_at) ?? '').localeCompare(toIso(b.created_at) ?? ''))
    .flatMap((m) => {
      if (m.role !== 'USER') return [{ role: 'ai' as const, text: m.content }];
      if (prefix && m.content.startsWith(prefix)) return [{ role: 'user' as const, text: m.content.slice(prefix.length) }];
      // 기기에서 먼저 건넨 질문이 붙은 답은 메타미의 질문과 내 답으로 나눠 보여 준다.
      const asked = splitAsked(m.content);
      return asked
        ? [
            { role: 'ai' as const, text: asked[0] },
            { role: 'user' as const, text: asked[1] },
          ]
        : [{ role: 'user' as const, text: m.content }];
    });
  const startedAt = toIso(session.created_at) ?? toIso(session.updated_at) ?? new Date(0).toISOString();
  return {
    id: session.session_id,
    kind,
    context,
    sessionId: session.session_id,
    startedAt,
    endedAt: toIso(session.updated_at) ?? startedAt,
    messages,
  };
}
