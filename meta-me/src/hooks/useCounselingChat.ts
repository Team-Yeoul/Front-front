import { useCallback, useRef } from 'react';
import { useCreateAiCounselingMessage, useCreateAiCounselingSession } from '@/entities/system';
import { ApiError } from '@/shared/api';

/** 실패 이유별 안내 문구. */
export function counselingErrorText(err: unknown) {
  if (err instanceof ApiError) {
    if (err.code === 'EXTERNAL_LLM_FAILED') return 'AI가 지금 답을 만들지 못했어요. 잠시 후 다시 보내 주세요.';
    if (err.status === 429) return '메시지를 너무 빨리 보냈어요. 잠시 후 다시 보내 주세요.';
  }
  return '지금은 답을 가져오지 못했어요. 잠시 후 다시 이야기해 주세요.';
}

/**
 * AI 상담 대화. 메시지 API는 먼저 만든 세션이 필요해서(POST /v1/ai-counseling/sessions),
 * 첫 메시지 전에 세션을 만들고 이후엔 그 세션으로 이어 보낸다.
 * 세션이 없어졌거나(404) 내 것이 아니면(403) 새 세션으로 한 번 다시 보낸다.
 */
export function useCounselingChat(initialSessionId: string | null = null, title?: string) {
  const createSession = useCreateAiCounselingSession();
  const createMessage = useCreateAiCounselingMessage();
  const sessionRef = useRef<string | null>(initialSessionId);

  const ensureSession = useCallback(async () => {
    if (sessionRef.current) return sessionRef.current;
    const res = await createSession.mutateAsync(title ? { title: title.slice(0, 80) } : {});
    sessionRef.current = res.session.session_id;
    return sessionRef.current;
  }, [createSession, title]);

  const send = useCallback(
    async (message: string): Promise<{ reply: string; sessionId: string }> => {
      const post = async () => {
        const session_id = await ensureSession();
        const res = await createMessage.mutateAsync({ session_id, message });
        // 응답 모양이 명세와 달라 AI 답을 찾지 못하면 실패로 처리한다(화면이 죽지 않게).
        const reply = res?.ai_message?.content;
        if (!reply) throw new Error('AI 답변이 비어 있어요');
        return { reply, sessionId: session_id };
      };
      try {
        return await post();
      } catch (err) {
        if (err instanceof ApiError && (err.status === 403 || err.status === 404) && sessionRef.current) {
          sessionRef.current = null;
          return post();
        }
        throw err;
      }
    },
    [createMessage, ensureSession],
  );

  const reset = useCallback(() => {
    sessionRef.current = null;
  }, []);

  return { send, reset };
}
