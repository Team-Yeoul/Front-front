import { useMemo } from 'react';
import { useCounselingConversation, useCounselingConversations, useCounselingSessions } from '@/entities/counseling';
import { sessionToChat } from '@/lib/serverChats';
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
  const conversations = useCounselingConversations(serverOnly.map((s) => s.session_id));

  const chats = useMemo(
    () =>
      [
        ...local,
        // 메시지를 아직 못 불러온 세션도 목록에는 보여준다. 비어 있는 세션(메시지 0개)은 뺀다.
        ...serverOnly
          .map((s, i) => ({ chat: sessionToChat(s, conversations[i]?.data), loaded: conversations[i]?.isSuccess }))
          .filter(({ chat, loaded }) => !loaded || chat.messages.length > 0)
          .map(({ chat }) => chat),
      ].sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [local, serverOnly, conversations],
  );

  return { chats, loading: sessions.isLoading };
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
  return { chat, loading: conversation.isLoading };
}
