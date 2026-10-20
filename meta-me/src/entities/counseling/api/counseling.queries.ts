'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import * as counselingApi from './counseling.http';

export const counselingKeys = {
  all: ['counseling'] as const,
  sessions: () => [...counselingKeys.all, 'sessions'] as const,
  conversation: (sessionId: string) => [...counselingKeys.all, 'conversation', sessionId] as const,
};

/** 세션 정보와 기본 브랜치의 메시지를 함께 불러온다. */
async function getConversation(sessionId: string) {
  const session = await counselingApi.getSession(sessionId);
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

export const useCounselingConversation = (sessionId: string | null, enabled = true) =>
  useQuery({
    queryKey: counselingKeys.conversation(sessionId ?? ''),
    queryFn: () => getConversation(sessionId!),
    enabled: enabled && !!sessionId,
  });

export const useCounselingConversations = (sessionIds: string[]) =>
  useQueries({
    queries: sessionIds.map((id) => ({
      queryKey: counselingKeys.conversation(id),
      queryFn: () => getConversation(id),
    })),
  });
