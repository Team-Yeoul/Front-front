import { useCallback } from 'react';
import { EMPTY_USER_LOCAL, useAuthStore, useLocalStore, type CollectedCogni, type SavedChat, type UserLocal } from '@/store';

/** 현재 로그인한 사용자의 기기 저장 데이터와 변경 함수. */
export function useMe() {
  const userId = useAuthStore((s) => s.userId);
  const local = useLocalStore((s) => (userId ? s.byUser[userId] : undefined)) ?? EMPTY_USER_LOCAL;
  const update = useLocalStore((s) => s.update);

  const patch = useCallback(
    (fn: (u: UserLocal) => UserLocal) => {
      if (userId) update(userId, fn);
    },
    [userId, update],
  );

  const addCogni = useCallback(
    (c: CollectedCogni) => patch((u) => (u.cognis.some((x) => x.id === c.id) ? u : { ...u, cognis: [...u.cognis, c] })),
    [patch],
  );

  const saveChat = useCallback(
    (chat: SavedChat) => patch((u) => ({ ...u, chats: [chat, ...u.chats.filter((c) => c.id !== chat.id)] })),
    [patch],
  );

  /** 지난 대화를 위에 고정하거나 풀기 */
  const togglePinChat = useCallback(
    (id: string) =>
      patch((u) => {
        const pinned = u.pinnedChats ?? [];
        return { ...u, pinnedChats: pinned.includes(id) ? pinned.filter((x) => x !== id) : [id, ...pinned] };
      }),
    [patch],
  );

  /** 이 기기에서 지난 대화를 지운다(고정도 함께 푼다). 서버 세션 삭제는 부르는 쪽이 먼저 한다. */
  const removeChat = useCallback(
    (id: string) => patch((u) => ({ ...u, chats: u.chats.filter((c) => c.id !== id), pinnedChats: (u.pinnedChats ?? []).filter((x) => x !== id) })),
    [patch],
  );

  return { userId, ...local, patch, addCogni, saveChat, togglePinChat, removeChat };
}
