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

const KEY = 'metame:last-write';

export function saveLastWrite(v: LastWrite) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(v));
  } catch {}
}

export function readLastWrite(): LastWrite | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LastWrite) : null;
  } catch {
    return null;
  }
}
