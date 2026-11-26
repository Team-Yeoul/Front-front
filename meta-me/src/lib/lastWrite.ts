import type { components } from '@/shared/api';
import { useAuthStore } from '@/store';

export type MonsterDetection = components['schemas']['MonsterDetection'];

/** 방금 쓴 다이어리의 결과 — 작성 화면 → 객관화 미러 → 코그니 발견 화면으로 넘긴다. */
export interface LastWrite {
  mirrorId?: string;
  original: string;
  /** 오늘의 한 장면 (객관화 결과의 '사실' 칸) */
  scene?: string;
  objective?: string;
  emotions: string[];
  unlocked: MonsterDetection[];
}

// 웹에서는 sessionStorage에 두었다. 앱에서는 앱이 떠 있는 동안만 유지되면 되므로 메모리에 둔다.
// 쓴 계정을 함께 적어 두고, 로그아웃하거나 다른 계정으로 바뀌면 지워서 다음 계정에 보이지 않게 한다.
let lastWrite: { userId: string; value: LastWrite } | null = null;

// 로그인 회차. 로그아웃·로그인·계정 변경 때만 올리고, 같은 세션의 토큰 갱신에는 그대로 둔다.
// 같은 계정으로 로그아웃했다가 다시 로그인해도 회차가 바뀌므로, 그 전에 시작한 저장 결과를 버릴 수 있다.
let loginGeneration = 0;

useAuthStore.subscribe((s, prev) => {
  // 로그인 여부가 바뀌었거나(로그인·로그아웃) 계정이 바뀌었을 때. 토큰만 바뀐 갱신은 해당하지 않는다.
  if (!!s.accessToken !== !!prev.accessToken || s.userId !== prev.userId) {
    loginGeneration += 1;
    lastWrite = null;
  }
});

/** 기록을 쓰기 시작할 때 부른다. 돌려받은 값을 saveLastWrite에 넘긴다. */
export function beginLastWrite() {
  const { userId } = useAuthStore.getState();
  return { userId, generation: loginGeneration };
}

/**
 * owner: beginLastWrite()로 받은 쓰기 시작 시점의 계정·로그인 회차.
 * 저장 요청을 기다리는 사이 로그아웃했거나 다른 계정(또는 같은 계정의 새 로그인)으로 바뀌었으면 결과를 남기지 않고 버린다.
 */
export function saveLastWrite(owner: ReturnType<typeof beginLastWrite>, v: LastWrite) {
  const { userId, accessToken } = useAuthStore.getState();
  if (!owner.userId || !accessToken || userId !== owner.userId || owner.generation !== loginGeneration) return;
  lastWrite = { userId: owner.userId, value: v };
}

export function readLastWrite(): LastWrite | null {
  const { userId, accessToken } = useAuthStore.getState();
  return lastWrite && accessToken && lastWrite.userId === userId ? lastWrite.value : null;
}
