import { useMemo } from 'react';
import { useCounselingConversation, useCounselingConversations, useCounselingSessions } from '@/entities/counseling';
import { sessionToChat } from '@/lib/serverChats';
import { ApiError } from '@/shared/api';
import { useAuthStore } from '@/store';
import { useMe } from './useMe';

/**
 * 지난 대화 목록: 이 기기에 저장한 대화 + 서버에만 있는 상담 세션(다른 기기·브라우저, API로 만든 세션).
 * 같은 세션이 기기에도 있으면 기기 쪽을 쓴다. 기기 쪽에는 서버에 없는 AI 첫 질문까지 남아 있다.
 * 서버 목록을 못 불러오면 기기 대화만 보여준다.
 */
export function useChatHistory() {
  const { chats: local } = useMe();
  const token = useAuthStore((s) => s.accessToken);
  const sessions = useCounselingSessions(!!token);

  const serverOnly = useMemo(() => {
    const known = new Set(local.map((c) => c.sessionId).filter(Boolean));
    return (sessions.data ?? []).filter((s) => !known.has(s.session_id));
  }, [local, sessions.data]);
  const conversations = useCounselingConversations(serverOnly);

  const chats = useMemo(
    () =>
      [
        ...local,
        // 메시지를 불러오는 중인 세션도 목록에는 보여준다. 비어 있는 세션(메시지 0개)과 불러오지 못한 세션은 뺀다.
        ...serverOnly
          .map((s, i) => ({ chat: sessionToChat(s, conversations[i]?.data), state: conversations[i] }))
          .filter(({ chat, state }) => !state?.isError && (!state?.isSuccess || chat.messages.length > 0))
          .map(({ chat }) => chat),
      ].sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [local, serverOnly, conversations],
  );

  // 서버 목록이나 일부 세션의 메시지를 못 불러왔으면 화면에서 알린다.
  const failed = sessions.isError || conversations.some((c) => c.isError);

  return { chats, loading: sessions.isLoading, failed };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 지난 대화 하나. 이 기기에 없으면 id를 서버 세션 id로 보고 불러온다. */
export function useChat(id: string | null) {
  const { chats: local } = useMe();
  const token = useAuthStore((s) => s.accessToken);
  const found = id ? local.find((c) => c.id === id || c.sessionId === id) : undefined;
  // 기기 대화 id(chat-…, ask-…)는 서버에 물어볼 필요가 없다. 세션 id(UUID)일 때만 불러온다.
  const conversation = useCounselingConversation(id, !!token && !found && !!id && UUID.test(id));

  const chat = useMemo(
    () => found ?? (conversation.data ? sessionToChat(conversation.data.session, conversation.data) : undefined),
    [found, conversation.data],
  );
  // 세션이 없거나(404) 내 것이 아니면(403) '찾을 수 없음', 그 밖의 실패는 다시 시도할 수 있게 구분한다.
  const err = conversation.error;
  const notFound = err instanceof ApiError && (err.status === 403 || err.status === 404);
  return { chat, loading: conversation.isLoading, failed: !!err && !notFound, retry: conversation.refetch };
}
