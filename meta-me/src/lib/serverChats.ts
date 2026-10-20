import type { CounselingConversation, CounselingSession } from '@/entities/counseling';
import type { SavedChat } from '@/store';

// AskSheet가 만드는 분석 질문 세션의 제목과 메시지 머리말. 서버 세션을 다시 읽을 때 이 모양으로 종류를 구분한다.
const ANALYSIS_TITLE_SUFFIX = ' 분석 질문';
export const analysisSessionTitle = (context: string) => `${context}${ANALYSIS_TITLE_SUFFIX}`;
export const analysisMessage = (context: string, question: string) => `[${context} 분석에 대한 질문] ${question}`;

// 서버 시각(LocalDateTime)은 시간대 표시 없이 UTC로 온다. 그대로 Date에 넣으면 기기 시간으로 읽혀 9시간 어긋난다.
// 소수점 아래가 9자리까지 오는데 Safari는 3자리까지만 읽으므로 잘라낸다.
function toIso(t: string) {
  const ms = t.replace(/(\.\d{3})\d+/, '$1');
  return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(ms) ? ms : `${ms}Z`).toISOString();
}

function kindOf(session: CounselingSession): Pick<SavedChat, 'kind' | 'context'> {
  if (session.title.endsWith(ANALYSIS_TITLE_SUFFIX)) {
    return { kind: 'analysis', context: session.title.slice(0, -ANALYSIS_TITLE_SUFFIX.length) || undefined };
  }
  return { kind: 'free' };
}

/** 서버에만 있는 상담 세션(다른 기기·브라우저, API로 만든 세션)을 지난 대화 항목 모양으로 바꾼다. id는 세션 id를 쓴다. */
export function sessionToChat(session: CounselingSession, conversation?: CounselingConversation): SavedChat {
  const { kind, context } = kindOf(session);
  const prefix = context ? analysisMessage(context, '') : null;
  const messages = [...(conversation?.messages ?? [])]
    .sort((a, b) => toIso(a.created_at).localeCompare(toIso(b.created_at)))
    .map((m) =>
      m.role === 'USER'
        ? { role: 'user' as const, text: prefix && m.content.startsWith(prefix) ? m.content.slice(prefix.length) : m.content }
        : { role: 'ai' as const, text: m.content },
    );
  return {
    id: session.session_id,
    kind,
    context,
    sessionId: session.session_id,
    startedAt: toIso(session.created_at),
    endedAt: toIso(session.updated_at),
    messages,
  };
}
