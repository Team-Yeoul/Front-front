import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as memoryApi from './memory.http';

export const memoryKeys = {
  all: ['memory'] as const,
  insights: () => [...memoryKeys.all, 'insights'] as const,
};

export const useMemoryInsights = (enabled = true) =>
  useQuery({ queryKey: memoryKeys.insights(), queryFn: memoryApi.listInsights, enabled });

/** 확인·정정·삭제·철회 모두 목록이 바뀌므로 성공하면 목록을 다시 불러온다. */
function useInsightMutation<TVars>(mutationFn: (vars: TVars) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memoryKeys.insights() }),
  });
}

export const useConfirmInsight = () => useInsightMutation((insightId: string) => memoryApi.confirmInsight(insightId));

export const useCorrectInsight = () =>
  useInsightMutation(({ insightId, content }: { insightId: string; content: string }) => memoryApi.correctInsight(insightId, content));

export const useDeleteInsight = () => useInsightMutation((insightId: string) => memoryApi.deleteInsight(insightId));

export const useRetractInsight = () => useInsightMutation((insightId: string) => memoryApi.retractInsight(insightId));
