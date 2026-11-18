import type { components } from '@/shared/api';

export type MonsterDetection = components['schemas']['MonsterDetection'];

/** 방금 쓴 다이어리의 결과 — 작성 화면 → 객관화 미러 → 코그니 발견 화면으로 넘긴다. */
export interface LastWrite {
  mirrorId?: string;
  original: string;
  objective?: string;
  emotions: string[];
  unlocked: MonsterDetection[];
}

// 웹에서는 sessionStorage에 두었다. 앱에서는 앱이 떠 있는 동안만 유지되면 되므로 메모리에 둔다.
let lastWrite: LastWrite | null = null;

export function saveLastWrite(v: LastWrite) {
  lastWrite = v;
}

export function readLastWrite(): LastWrite | null {
  return lastWrite;
}
