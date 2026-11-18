import type { components } from '@/shared/api';

export type UserMonster = components['schemas']['UserMonster'];
export type UserMonsterListResponse = components['schemas']['UserMonsterListResponse'];

export type MonsterCategory =
  | 'COGNITIVE'
  | 'EMOTIONAL'
  | 'BEHAVIORAL'
  | 'RELATIONAL'
  | 'GROWTH'
  | 'SITUATIONAL';

export type MonsterSort = 'RARITY_DESC' | 'COUNT_DESC' | 'RECENT';

export interface ListMyMonstersParams {
  page?: number;
  size?: number;
  category?: MonsterCategory;
  sort?: MonsterSort;
}
