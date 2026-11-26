import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { counselingApi, counselingKeys } from '@/entities/counseling';
import { ApiError } from '@/shared/api';

/**
 * 메시지는 저장됐지만 서버가 AI 답변을 만들지 못한 경우(reply_status=FAILED).
 * 세션은 이미 생겼으므로 sessionId를 함께 넘겨, 화면이 대화를 저장할 때 세션을 잃지 않게 한다.
 */
export class CounselingReplyFailed extends Error {
  /** branchId: 답을 다시 만들 때 쓸 브랜치. 저장해 두면 나중에 retry(target)로 다시 받을 수 있다. */
  constructor(
    readonly sessionId: string,
    readonly branchId: string,
  ) {
    super('AI 답변 생성에 실패했어요');
  }
}

/** 실패 이유별 안내 문구. */
export function counselingErrorText(err: unknown) {
  if (err instanceof CounselingReplyFailed || (err instanceof ApiError && err.code === 'EXTERNAL_LLM_FAILED')) {
    return 'AI가 지금 답을 만들지 못했어요. 잠시 후 답을 다시 받아 보세요.';
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
 * 답변 생성만 실패했으면(FAILED) 메시지는 이미 저장됐으므로, 같은 메시지를 다시 보내지 않고 retry()로 답만 다시 만든다.
 */
export function useCounselingChat(initialSessionId: string | null = null, title = '자유 대화') {
  const queryClient = useQueryClient();
  const ref = useRef<SessionRef | null>(null);
  const resumeId = useRef<string | null>(initialSessionId);
  // 답변 생성이 실패한 세션·브랜치. retry()가 이걸로 답만 다시 만든다.
  const failed = useRef<SessionRef | null>(null);
  // reset()마다 올린다. reset 전에 시작한 세션 요청이 늦게 끝나도 새 대화의 세션으로 쓰지 않게 한다.
  const generation = useRef(0);

  const ensureSession = useCallback(async (): Promise<SessionRef> => {
    if (ref.current) return ref.current;
    const gen = generation.current;
    // 지난 대화를 이어갈 때는 저장된 세션의 기본 브랜치를 찾아 쓴다.
    const session = resumeId.current
      ? await counselingApi.getSession(resumeId.current)
      : await counselingApi.createSession(title.slice(0, 80));
    const s = { sessionId: session.session_id, branchId: session.active_branch_id };
    // 기다리는 동안 reset됐으면 이 세션은 보낸 쪽에만 돌려주고 기억하지 않는다.
    if (gen === generation.current) {
      resumeId.current = null;
      ref.current = s;
    }
    return s;
  }, [title]);

  const send = useCallback(
    async (message: string): Promise<{ reply: string; sessionId: string }> => {
      // 새 메시지를 보내면 앞서 실패한 답변은 다시 받지 않는다.
      failed.current = null;
      const gen = generation.current;
      const post = async () => {
        const { sessionId, branchId } = await ensureSession();
        let res: Awaited<ReturnType<typeof counselingApi.sendMessage>>;
        try {
          res = await counselingApi.sendMessage(sessionId, branchId, message);
        } catch (err) {
          // AI 호출만 실패(500 EXTERNAL_LLM_FAILED)했으면 메시지는 저장됐으므로, 같은 말을 다시 보내지 않고 답만 다시 받게 한다.
          if (err instanceof ApiError && err.code === 'EXTERNAL_LLM_FAILED') {
            queryClient.invalidateQueries({ queryKey: counselingKeys.all, refetchType: 'none' });
            if (gen === generation.current) failed.current = { sessionId, branchId };
            throw new CounselingReplyFailed(sessionId, branchId);
          }
          throw err;
        }
        // 세션 목록·메시지가 바뀌었으니 지난 대화를 다시 열 때 새로 불러오게 한다(지금 화면은 다시 부르지 않는다).
        queryClient.invalidateQueries({ queryKey: counselingKeys.all, refetchType: 'none' });
        const reply = res?.assistant_message?.content;
        if (!reply) {
          if (gen === generation.current) failed.current = { sessionId, branchId };
          throw new CounselingReplyFailed(sessionId, branchId);
        }
        return { reply, sessionId };
      };
      try {
        return await post();
      } catch (err) {
        if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
          // 기다리는 동안 reset됐으면 지난 대화의 요청이다. 새 대화의 세션을 지우거나 그 세션으로 다시 보내지 않는다.
          if (gen !== generation.current) throw err;
          ref.current = null;
          resumeId.current = null;
          return post();
        }
        throw err;
      }
    },
    [ensureSession, queryClient],
  );

  /**
   * 답변 생성이 실패했을 때 USER 메시지를 다시 보내지 않고 답만 다시 만든다.
   * target을 주면(저장해 둔 실패 말풍선의 대상) 그걸로, 없으면 이 화면에서 마지막으로 실패한 답으로 다시 받는다.
   */
  const retry = useCallback(async (target?: SessionRef): Promise<{ reply: string; sessionId: string }> => {
    const f = target ?? failed.current;
    if (!f) throw new Error('다시 받을 답변이 없어요');
    const res = await counselingApi.retryReply(f.sessionId, f.branchId);
    queryClient.invalidateQueries({ queryKey: counselingKeys.all, refetchType: 'none' });
    if (!res?.content) throw new CounselingReplyFailed(f.sessionId, f.branchId);
    if (failed.current === f) failed.current = null;
    return { reply: res.content, sessionId: f.sessionId };
  }, [queryClient]);

  const reset = useCallback(() => {
    generation.current += 1;
    ref.current = null;
    resumeId.current = null;
    failed.current = null;
  }, []);

  return { send, retry, reset };
}
