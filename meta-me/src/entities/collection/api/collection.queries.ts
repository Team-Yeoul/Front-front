
import { useQuery } from '@tanstack/react-query';
import * as collectionApi from './collection.http';
import type { ListMyMonstersParams } from '../model/types';

export const collectionKeys = {
  all: ['collection'] as const,
  myMonsters: (params?: ListMyMonstersParams) =>
    [...collectionKeys.all, 'my-monsters', params] as const,
};

export const useListMyMonsters = (params?: ListMyMonstersParams, enabled = true) =>
  useQuery({
    queryKey: collectionKeys.myMonsters(params),
    queryFn: () => collectionApi.listMyMonsters(params),
    enabled,
  });
