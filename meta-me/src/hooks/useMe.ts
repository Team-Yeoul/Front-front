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

  return { userId, ...local, patch, addCogni, saveChat };
}

/** 온보딩에서 처음 발견되는 코그니 (현재는 답과 무관하게 고정). */
export const FIRST_COGNI: Omit<CollectedCogni, 'foundAt'> = {
  id: 'onboarding-first',
  name: '꼼꼼한 설계자',
  desc: '계획을 먼저 세워야 마음이 놓이는 패턴',
  category: '행동 · 습관 패턴',
  image: '/v2/cogni-headphone.png',
  source: 'onboarding',
  features: ['계획을 먼저 세워야 마음이 놓여요', '시작 전에 준비가 길어지곤 해요', '마감이 보이면 확 몰입해요'],
};
