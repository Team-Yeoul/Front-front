
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as objectiveApi from './objective.http';
import type { CreateObjectiveMirrorRequest, ListObjectiveMirrorsParams, ObjectiveMirror } from '../model/types';

export const objectiveKeys = {
  all: ['objective'] as const,
  mirrors: (params?: ListObjectiveMirrorsParams) =>
    [...objectiveKeys.all, 'mirrors', params] as const,
  mirror: (mirrorId: string) => [...objectiveKeys.all, 'mirror', mirrorId] as const,
  recordLatestMirror: (recordId: string) => [...objectiveKeys.all, 'record-latest-mirror', recordId] as const,
};

export const useListObjectiveMirrors = (params?: ListObjectiveMirrorsParams, enabled = true) =>
  useQuery({
    queryKey: objectiveKeys.mirrors(params),
    queryFn: () => objectiveApi.listObjectiveMirrors(params),
    enabled,
  });

export const useGetObjectiveMirror = (mirrorId: string, enabled = true) =>
  useQuery({
    queryKey: objectiveKeys.mirror(mirrorId),
    queryFn: () => objectiveApi.getObjectiveMirror(mirrorId),
    enabled: enabled && !!mirrorId,
  });

export const useCreateObjectiveMirror = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateObjectiveMirrorRequest) => objectiveApi.createObjectiveMirror(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: objectiveKeys.all }),
  });
};

/**
 * 한 기록의 가장 최근 객관화. 목록 API는 기록으로 거를 수 없고 최신순이라, 그 기록의 객관화가 나올 때까지 다음 페이지를 받는다.
 * 찾은 페이지에서 멈추고, 끝까지 없으면 null.
 */
export const useRecordLatestMirror = (recordId: string | undefined, enabled = true) =>
  useQuery({
    queryKey: objectiveKeys.recordLatestMirror(recordId ?? ''),
    queryFn: async (): Promise<ObjectiveMirror | null> => {
      for (let page = 1; ; page++) {
        const res = await objectiveApi.listObjectiveMirrors({ page, size: 100 });
        const found = (res.mirrors ?? []).filter((m) => m.record_id === recordId).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0];
        if (found) return found;
        if (page >= (res.page_info?.total_pages ?? 1) || !res.mirrors?.length) return null;
      }
    },
    enabled: enabled && !!recordId,
  });
