import { apiRequest } from '@/shared/api';
import type { ListMyMonstersParams, UserMonsterListResponse } from '../model/types';

export const listMyMonsters = (params?: ListMyMonstersParams) =>
  apiRequest<UserMonsterListResponse>('/v1/users/me/monsters', { query: params });
