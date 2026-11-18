import type { components } from '@/shared/api';

export type MirrorMonster = components['schemas']['MirrorMonster'];
export type MonsterListResponse = components['schemas']['MonsterListResponse'];

export interface ListMirrorMonstersParams {
  page?: number;
  size?: number;
}
