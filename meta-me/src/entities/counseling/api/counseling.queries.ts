
import { useMutation, useQueries, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type { CounselingSession, MessageFeedbackRequest, TempChatSaveMode } from '../model/types';
import { ApiError } from '@/shared/api';
import * as counselingApi from './counseling.http';

export const counselingKeys = {
  all: ['counseling'] as const,
  sessions: () => [...counselingKeys.all, 'sessions'] as const,
  conversation: (sessionId: string) => [...counselingKeys.all, 'conversation', sessionId] as const,
  branches: (sessionId: string) => [...counselingKeys.all, 'branches', sessionId] as const,
  feedback: (sessionId: string, messageId: string) => [...counselingKeys.all, 'feedback', sessionId, messageId] as const,
  sideThread: (sessionId: string, sideThreadId: string) => [...counselingKeys.all, 'side-thread', sessionId, sideThreadId] as const,
  tempChat: (sessionId: string, tempChatId: string) => [...counselingKeys.all, 'temp-chat', sessionId, tempChatId] as const,
};

/** 세션 정보와 기본 브랜치의 메시지를 함께 불러온다. 세션 정보를 이미 알면(목록 응답) 세션 조회는 건너뛴다. */
async function getConversation(sessionId: string, known?: CounselingSession) {
  const session = known ?? (await counselingApi.getSession(sessionId));
  const { messages } = await counselingApi.listMessages(sessionId, session.active_branch_id);
  return { session, messages };
}

export type CounselingConversation = Awaited<ReturnType<typeof getConversation>>;

export const useCounselingSessions = (enabled = true) =>
  useQuery({
    queryKey: counselingKeys.sessions(),
    queryFn: async () => (await counselingApi.listSessions()).sessions ?? [],
    enabled,
  });

export const useCounselingConversation = (sessionId: string | null, enabled = true) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: counselingKeys.conversation(sessionId ?? ''),
    queryFn: () =>
      getConversation(
        sessionId!,
        queryClient.getQueryData<CounselingSession[]>(counselingKeys.sessions())?.find((s) => s.session_id === sessionId),
      ),
    enabled: enabled && !!sessionId,
  });
};

// 모듈 수준에 두어야 결과가 바뀔 때만 새 배열을 돌려준다(useMemo 의존성으로 쓸 수 있다).
const pickConversations = (results: UseQueryResult<CounselingConversation>[]) =>
  results.map(({ data, isSuccess, isError }) => ({ data, isSuccess, isError }));

export const useCounselingConversations = (sessions: CounselingSession[]) =>
  useQueries({
    queries: sessions.map((s) => ({
      queryKey: counselingKeys.conversation(s.session_id),
      queryFn: () => getConversation(s.session_id, s),
    })),
    combine: pickConversations,
  });

/** 세션 목록과 해당 대화를 함께 새로 고친다. 제목 변경·브랜치 전환·메시지 수정처럼 대화 화면이 바뀌는 작업 뒤에 쓴다. */
function useInvalidateSession() {
  const queryClient = useQueryClient();
  return (sessionId: string) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: counselingKeys.sessions() }),
      queryClient.invalidateQueries({ queryKey: counselingKeys.conversation(sessionId) }),
      queryClient.invalidateQueries({ queryKey: counselingKeys.branches(sessionId) }),
    ]);
}

// ── 세션 ─────────────────────────────────────────────────────────────
export const useUpdateSessionTitle = () => {
  const invalidate = useInvalidateSession();
  return useMutation({
    mutationFn: ({ sessionId, title }: { sessionId: string; title: string }) => counselingApi.updateSession(sessionId, { title }),
    onSuccess: (_, { sessionId }) => invalidate(sessionId),
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // 이미 지워진 세션(404)도 지운 것으로 본다. 그래야 아래에서 남은 캐시를 지우고 목록을 새로 받는다.
    mutationFn: (sessionId: string) =>
      counselingApi.deleteSession(sessionId).catch((err) => {
        if (err instanceof ApiError && err.status === 404) return;
        throw err;
      }),
    onSuccess: (_, sessionId) => {
      queryClient.removeQueries({ queryKey: counselingKeys.conversation(sessionId) });
      queryClient.removeQueries({ queryKey: counselingKeys.branches(sessionId) });
      return queryClient.invalidateQueries({ queryKey: counselingKeys.sessions() });
    },
  });
};

// ── 메시지 ───────────────────────────────────────────────────────────
export const useReviseMessage = () => {
  const invalidate = useInvalidateSession();
  return useMutation({
    mutationFn: ({ sessionId, messageId, content }: { sessionId: string; messageId: string; content: string }) =>
      counselingApi.reviseMessage(sessionId, messageId, { content }),
    onSuccess: (_, { sessionId }) => invalidate(sessionId),
  });
};

/** 답변을 다시 만든다. 서버가 새 브랜치에 저장하므로 세션(활성 브랜치)과 브랜치 목록을 새로 고친다. */
export const useRegenerateReply = () => {
  const invalidate = useInvalidateSession();
  return useMutation({
    mutationFn: ({ sessionId, messageId, branchId }: { sessionId: string; messageId: string; branchId: string }) =>
      counselingApi.regenerateReply(sessionId, messageId, branchId),
    onSuccess: (_, { sessionId }) => invalidate(sessionId),
  });
};

// ── AI 답변 피드백 ───────────────────────────────────────────────────
/** 남긴 피드백이 없으면 서버가 404를 주므로, 그 경우는 null로 돌려준다. */
export const useMessageFeedback = (sessionId: string, messageId: string, enabled = true) =>
  useQuery({
    queryKey: counselingKeys.feedback(sessionId, messageId),
    queryFn: () =>
      counselingApi.getFeedback(sessionId, messageId).catch((err) => {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }),
    enabled: enabled && !!sessionId && !!messageId,
  });

export const useSaveFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, messageId, body }: { sessionId: string; messageId: string; body: MessageFeedbackRequest }) =>
      counselingApi.saveFeedback(sessionId, messageId, body),
    onSuccess: (data, { sessionId, messageId }) => queryClient.setQueryData(counselingKeys.feedback(sessionId, messageId), data),
  });
};

export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, messageId }: { sessionId: string; messageId: string }) => counselingApi.deleteFeedback(sessionId, messageId),
    onSuccess: (_, { sessionId, messageId }) => queryClient.setQueryData(counselingKeys.feedback(sessionId, messageId), null),
  });
};

// ── 브랜치 ───────────────────────────────────────────────────────────
export const useBranches = (sessionId: string | null, enabled = true) =>
  useQuery({
    queryKey: counselingKeys.branches(sessionId ?? ''),
    queryFn: () => counselingApi.listBranches(sessionId!),
    enabled: enabled && !!sessionId,
  });

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, forkMessageId }: { sessionId: string; forkMessageId: string }) =>
      counselingApi.createBranch(sessionId, forkMessageId),
    onSuccess: (_, { sessionId }) => queryClient.invalidateQueries({ queryKey: counselingKeys.branches(sessionId) }),
  });
};

export const useActivateBranch = () => {
  const invalidate = useInvalidateSession();
  return useMutation({
    mutationFn: ({ sessionId, branchId }: { sessionId: string; branchId: string }) => counselingApi.activateBranch(sessionId, branchId),
    onSuccess: (_, { sessionId }) => invalidate(sessionId),
  });
};

// ── 사이드 스레드 ────────────────────────────────────────────────────
export const useSideThreadMessages = (sessionId: string, sideThreadId: string | null, enabled = true) =>
  useQuery({
    queryKey: counselingKeys.sideThread(sessionId, sideThreadId ?? ''),
    queryFn: async () => (await counselingApi.listSideThreadMessages(sessionId, sideThreadId!)).messages ?? [],
    enabled: enabled && !!sessionId && !!sideThreadId,
  });

export const useCreateSideThread = () =>
  useMutation({
    mutationFn: ({ sessionId, branchId, anchorMessageId }: { sessionId: string; branchId: string; anchorMessageId: string }) =>
      counselingApi.createSideThread(sessionId, branchId, anchorMessageId),
  });

export const useSendSideThreadMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, sideThreadId, content }: { sessionId: string; sideThreadId: string; content: string }) =>
      counselingApi.sendSideThreadMessage(sessionId, sideThreadId, content),
    onSettled: (_, __, { sessionId, sideThreadId }) =>
      queryClient.invalidateQueries({ queryKey: counselingKeys.sideThread(sessionId, sideThreadId) }),
  });
};

// ── 임시 채팅 ────────────────────────────────────────────────────────
export const useTempChat = (sessionId: string, tempChatId: string | null, enabled = true) =>
  useQuery({
    queryKey: counselingKeys.tempChat(sessionId, tempChatId ?? ''),
    queryFn: () => counselingApi.getTempChat(sessionId, tempChatId!),
    enabled: enabled && !!sessionId && !!tempChatId,
  });

export const useStartTempChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, branchId, anchorMessageId }: { sessionId: string; branchId: string; anchorMessageId: string }) =>
      counselingApi.startTempChat(sessionId, branchId, anchorMessageId),
    onSuccess: (data, { sessionId }) => {
      if (data.temp_chat_id) queryClient.setQueryData(counselingKeys.tempChat(sessionId, data.temp_chat_id), data);
    },
  });
};

export const useSendTempChatMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, tempChatId, content }: { sessionId: string; tempChatId: string; content: string }) =>
      counselingApi.sendTempChatMessage(sessionId, tempChatId, content),
    onSettled: (_, __, { sessionId, tempChatId }) =>
      queryClient.invalidateQueries({ queryKey: counselingKeys.tempChat(sessionId, tempChatId) }),
  });
};

/** 임시 채팅을 사이드 스레드(SIDE_THREAD)나 새 브랜치(NEW_BRANCH)로 저장한다. */
export const useSaveTempChat = () => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateSession();
  return useMutation({
    mutationFn: ({ sessionId, tempChatId, mode }: { sessionId: string; tempChatId: string; mode: TempChatSaveMode }) =>
      counselingApi.saveTempChat(sessionId, tempChatId, mode),
    onSuccess: (_, { sessionId, tempChatId }) => {
      queryClient.removeQueries({ queryKey: counselingKeys.tempChat(sessionId, tempChatId) });
      return invalidate(sessionId);
    },
  });
};

export const useDiscardTempChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, tempChatId }: { sessionId: string; tempChatId: string }) => counselingApi.discardTempChat(sessionId, tempChatId),
    onSuccess: (_, { sessionId, tempChatId }) => queryClient.removeQueries({ queryKey: counselingKeys.tempChat(sessionId, tempChatId) }),
  });
};
