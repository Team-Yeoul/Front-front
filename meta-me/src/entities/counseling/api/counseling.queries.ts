'use client';

import { useQueries, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type { CounselingSession } from '../model/types';
import * as counselingApi from './counseling.http';

export const counselingKeys = {
  all: ['counseling'] as const,
  sessions: () => [...counselingKeys.all, 'sessions'] as const,
  conversation: (sessionId: string) => [...counselingKeys.all, 'conversation', sessionId] as const,
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
