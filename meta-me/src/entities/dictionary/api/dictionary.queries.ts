
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
    // 마스터 도감은 거의 바뀌지 않아 한 번 받으면 한 시간 동안 다시 받지 않는다(도감·마이페이지·홈이 함께 쓴다).
    staleTime: 60 * 60 * 1000,
    enabled,
  });
