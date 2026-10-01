import { apiRequest } from '@/shared/api';
import type { CounselingMessage, CounselingSession, SendCounselingMessageResponse } from '../model/types';

export const createSession = (title: string) =>
  apiRequest<CounselingSession>('/v1/counseling-sessions', { method: 'POST', body: { title } });

export const getSession = (sessionId: string) => apiRequest<CounselingSession>(`/v1/counseling-sessions/${sessionId}`);

export const listSessions = () => apiRequest<{ sessions: CounselingSession[] }>('/v1/counseling-sessions');

/** USER 메시지를 저장하고 AI 답변을 생성한다(generate_reply 기본값 true). */
export const sendMessage = (sessionId: string, branchId: string, content: string) =>
  apiRequest<SendCounselingMessageResponse>(`/v1/counseling-sessions/${sessionId}/messages`, {
    method: 'POST',
    body: { branch_id: branchId, role: 'USER', content },
  });

/** 직전 AI 답변 생성이 실패했을 때 다시 생성한다. */
export const retryReply = (sessionId: string, branchId: string) =>
  apiRequest<CounselingMessage>(`/v1/counseling-sessions/${sessionId}/messages/reply`, {
    method: 'POST',
    body: { branch_id: branchId },
  });

// 백엔드가 이 쿼리 파라미터를 camelCase(branchId)로 받는다.
export const listMessages = (sessionId: string, branchId: string) =>
  apiRequest<{ messages: CounselingMessage[] }>(`/v1/counseling-sessions/${sessionId}/messages`, { query: { branchId } });
