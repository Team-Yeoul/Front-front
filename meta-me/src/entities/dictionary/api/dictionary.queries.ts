'use client';

import { useQuery } from '@tanstack/react-query';
import * as dictionaryApi from './dictionary.http';
import type { ListMirrorMonstersParams } from '../model/types';

export const dictionaryKeys = {
  all: ['dictionary'] as const,
  mirrorMonsters: (params?: ListMirrorMonstersParams) =>
    [...dictionaryKeys.all, 'mirror-monsters', params] as const,
};

export const useListMirrorMonsters = (params?: ListMirrorMonstersParams, enabled = true) =>
  useQuery({
    queryKey: dictionaryKeys.mirrorMonsters(params),
    queryFn: () => dictionaryApi.listMirrorMonsters(params),
    enabled,
  });
