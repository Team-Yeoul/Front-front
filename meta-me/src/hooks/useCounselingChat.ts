import { useCallback, useRef } from 'react';
import { counselingApi } from '@/entities/counseling';
import { ApiError } from '@/shared/api';

/** 메시지는 저장됐지만 서버가 AI 답변을 만들지 못한 경우(reply_status=FAILED). */
export class CounselingReplyFailed extends Error {
  constructor() {
    super('AI 답변 생성에 실패했어요');
  }
}

/** 실패 이유별 안내 문구. */
export function counselingErrorText(err: unknown) {
  if (err instanceof CounselingReplyFailed || (err instanceof ApiError && err.code === 'EXTERNAL_LLM_FAILED')) {
    return 'AI가 지금 답을 만들지 못했어요. 잠시 후 다시 보내 주세요.';
  }
  if (err instanceof ApiError && err.status === 429) return '메시지를 너무 빨리 보냈어요. 잠시 후 다시 보내 주세요.';
  return '지금은 답을 가져오지 못했어요. 잠시 후 다시 이야기해 주세요.';
}

interface SessionRef {
  sessionId: string;
  branchId: string;
}

/**
 * AI 상담 대화 (/v1/counseling-sessions).
 * 첫 메시지 전에 세션을 만들고(기본 브랜치가 함께 생긴다), 이후엔 같은 세션·브랜치로 보낸다.
 * 서버가 USER 메시지를 저장하면서 AI 답변까지 만들어 돌려준다.
 * 세션이 없어졌거나(404) 내 것이 아니면(403) 새 세션으로 한 번 다시 보낸다.
 */
export function useCounselingChat(initialSessionId: string | null = null, title = '자유 대화') {
  const ref = useRef<SessionRef | null>(null);
  const resumeId = useRef<string | null>(initialSessionId);

  const ensureSession = useCallback(async (): Promise<SessionRef> => {
    if (ref.current) return ref.current;
    // 지난 대화를 이어갈 때는 저장된 세션의 기본 브랜치를 찾아 쓴다.
    const session = resumeId.current
      ? await counselingApi.getSession(resumeId.current)
      : await counselingApi.createSession(title.slice(0, 80));
    resumeId.current = null;
    ref.current = { sessionId: session.session_id, branchId: session.active_branch_id };
    return ref.current;
  }, [title]);

  const send = useCallback(
    async (message: string): Promise<{ reply: string; sessionId: string }> => {
      const post = async () => {
        const { sessionId, branchId } = await ensureSession();
        const res = await counselingApi.sendMessage(sessionId, branchId, message);
        const reply = res?.assistant_message?.content;
        if (!reply) throw new CounselingReplyFailed();
        return { reply, sessionId };
      };
      try {
        return await post();
      } catch (err) {
        if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
          ref.current = null;
          resumeId.current = null;
          return post();
        }
        throw err;
      }
    },
    [ensureSession],
  );

  const reset = useCallback(() => {
    ref.current = null;
    resumeId.current = null;
  }, []);

  return { send, reset };
}
