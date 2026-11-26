import { useSyncExternalStore } from 'react';

/**
 * 답을 기다리는 대화(기기 대화 id). 탭을 떠난 뒤 도착한 답은 사라진 화면이 저장된 대화에 직접 쓰므로,
 * 그 저장이 끝나기 전에 같은 대화를 이어 열면 이어 쓴 내용이 늦게 온 답의 저장에 덮인다.
 * 그래서 답이 저장될 때까지 같은 대화는 이어 열지 않고 기다리게 한다.
 */
const pending = new Map<string, number>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/** 대화 하나의 답 요청과 그 뒤의 저장까지를 기다리는 동안으로 표시한다. */
export async function trackReply<T>(chatId: string, run: () => Promise<T>): Promise<T> {
  pending.set(chatId, (pending.get(chatId) ?? 0) + 1);
  notify();
  try {
    return await run();
  } finally {
    const n = (pending.get(chatId) ?? 1) - 1;
    if (n > 0) pending.set(chatId, n);
    else pending.delete(chatId);
    notify();
  }
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/** 이 대화가 답을 기다리는 중인지 */
export function useReplyPending(chatId: string | null | undefined) {
  return useSyncExternalStore(subscribe, () => !!chatId && pending.has(chatId));
}
