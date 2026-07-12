import { apiRequest } from '@/shared/api';
import type { ListMirrorMonstersParams, MonsterListResponse } from '../model/types';

export const listMirrorMonsters = (params?: ListMirrorMonstersParams) =>
  apiRequest<MonsterListResponse>('/v1/mirror-monsters', { query: params });
