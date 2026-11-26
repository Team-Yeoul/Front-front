import { apiRequest } from '@/shared/api';
import type {
  CounselingBranch,
  CounselingMessage,
  CounselingSession,
  MessageDetailResponse,
  MessageFeedbackRequest,
  MessageFeedbackResponse,
  ReviseMessageRequest,
  SendCounselingMessageResponse,
  SideThread,
  SideThreadReply,
  TempChat,
  TempChatReply,
  TempChatSaveMode,
  TempChatSaveResponse,
  UpdateSessionRequest,
} from '../model/types';

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

// ── 세션 ─────────────────────────────────────────────────────────────
const base = (sessionId: string) => `/v1/counseling-sessions/${sessionId}`;

export const updateSession = (sessionId: string, body: UpdateSessionRequest) =>
  apiRequest<void>(base(sessionId), { method: 'PUT', body });

/** 상담 세션과 그 대화 내용을 지운다(204). */
export const deleteSession = (sessionId: string) => apiRequest<void>(base(sessionId), { method: 'DELETE' });

// ── 메시지 ───────────────────────────────────────────────────────────
export const getMessage = (sessionId: string, messageId: string) =>
  apiRequest<MessageDetailResponse>(`${base(sessionId)}/messages/${messageId}`);

/** 메시지를 고친다. 새 revision이 만들어지고 활성화된다. */
export const reviseMessage = (sessionId: string, messageId: string, body: ReviseMessageRequest) =>
  apiRequest<void>(`${base(sessionId)}/messages/${messageId}`, { method: 'PUT', body });

/** AI 답변을 다시 만든다. 같은 USER 메시지를 분기 기준으로 새 브랜치에 저장된다. */
export const regenerateReply = (sessionId: string, messageId: string, branchId: string) =>
  apiRequest<CounselingMessage>(`${base(sessionId)}/messages/${messageId}/regenerate`, {
    method: 'POST',
    body: { branch_id: branchId },
  });

// ── AI 답변 피드백 ───────────────────────────────────────────────────
export const saveFeedback = (sessionId: string, messageId: string, body: MessageFeedbackRequest) =>
  apiRequest<MessageFeedbackResponse>(`${base(sessionId)}/messages/${messageId}/feedback`, { method: 'PUT', body });

export const getFeedback = (sessionId: string, messageId: string) =>
  apiRequest<MessageFeedbackResponse>(`${base(sessionId)}/messages/${messageId}/feedback`);

export const deleteFeedback = (sessionId: string, messageId: string) =>
  apiRequest<void>(`${base(sessionId)}/messages/${messageId}/feedback`, { method: 'DELETE' });

// ── 브랜치 ───────────────────────────────────────────────────────────
/** forkMessageId(USER 메시지)를 기준으로 새 브랜치를 만든다. 세션당 최대 50개. */
export const createBranch = (sessionId: string, forkMessageId: string) =>
  apiRequest<CounselingBranch>(`${base(sessionId)}/branches`, { method: 'POST', body: { fork_message_id: forkMessageId } });

export const listBranches = (sessionId: string) => apiRequest<CounselingBranch[]>(`${base(sessionId)}/branches`);

export const activateBranch = (sessionId: string, branchId: string) =>
  apiRequest<void>(`${base(sessionId)}/branches/${branchId}/activate`, { method: 'PUT' });

// ── 사이드 스레드 ────────────────────────────────────────────────────
export const createSideThread = (sessionId: string, branchId: string, anchorMessageId: string) =>
  apiRequest<SideThread>(`${base(sessionId)}/branches/${branchId}/side-threads`, {
    method: 'POST',
    body: { anchor_message_id: anchorMessageId },
  });

export const listSideThreadMessages = (sessionId: string, sideThreadId: string) =>
  apiRequest<{ messages?: CounselingMessage[] }>(`${base(sessionId)}/side-threads/${sideThreadId}/messages`);

export const sendSideThreadMessage = (sessionId: string, sideThreadId: string, content: string) =>
  apiRequest<SideThreadReply>(`${base(sessionId)}/side-threads/${sideThreadId}/messages`, {
    method: 'POST',
    body: { content },
  });

// ── 임시 채팅(최대 24시간 보관, 저장 전까지 장기 기억에 쓰지 않음) ────────
export const startTempChat = (sessionId: string, branchId: string, anchorMessageId: string) =>
  apiRequest<TempChat>(`${base(sessionId)}/branches/${branchId}/temp-chats`, {
    method: 'POST',
    body: { anchor_message_id: anchorMessageId },
  });

export const getTempChat = (sessionId: string, tempChatId: string) =>
  apiRequest<TempChat>(`${base(sessionId)}/temp-chats/${tempChatId}`);

export const discardTempChat = (sessionId: string, tempChatId: string) =>
  apiRequest<void>(`${base(sessionId)}/temp-chats/${tempChatId}`, { method: 'DELETE' });

export const sendTempChatMessage = (sessionId: string, tempChatId: string, content: string) =>
  apiRequest<TempChatReply>(`${base(sessionId)}/temp-chats/${tempChatId}/messages`, { method: 'POST', body: { content } });

export const saveTempChat = (sessionId: string, tempChatId: string, mode: TempChatSaveMode) =>
  apiRequest<TempChatSaveResponse>(`${base(sessionId)}/temp-chats/${tempChatId}/save`, { method: 'POST', body: { mode } });
