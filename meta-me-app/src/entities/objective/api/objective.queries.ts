
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as objectiveApi from './objective.http';
import type { CreateObjectiveMirrorRequest, ListObjectiveMirrorsParams } from '../model/types';

export const objectiveKeys = {
  all: ['objective'] as const,
  mirrors: (params?: ListObjectiveMirrorsParams) =>
    [...objectiveKeys.all, 'mirrors', params] as const,
  mirror: (mirrorId: string) => [...objectiveKeys.all, 'mirror', mirrorId] as const,
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
