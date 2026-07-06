'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as systemApi from './system.http';
import type {
  AiCounselingRequest,
  CreateAiCounselingSessionRequest,
  ListAiCounselingMessagesParams,
  ListB2BReportsParams,
  ListCrisisLogsParams,
  SendNotificationRequest,
} from '../model/types';

export const systemKeys = {
  all: ['system'] as const,
  b2bReports: (params?: ListB2BReportsParams) =>
    [...systemKeys.all, 'b2b-reports', params] as const,
  crisisLogs: (params: ListCrisisLogsParams) => [...systemKeys.all, 'crisis-logs', params] as const,
  stats: () => [...systemKeys.all, 'stats'] as const,
  aiCounselingMessages: (sessionId: string, params?: ListAiCounselingMessagesParams) =>
    [...systemKeys.all, 'ai-counseling-messages', sessionId, params] as const,
};

export const useListB2BReports = (params?: ListB2BReportsParams, enabled = true) =>
  useQuery({
    queryKey: systemKeys.b2bReports(params),
    queryFn: () => systemApi.listB2BReports(params),
    enabled,
  });

export const useListCrisisLogs = (params: ListCrisisLogsParams, enabled = true) =>
  useQuery({
    queryKey: systemKeys.crisisLogs(params),
    queryFn: () => systemApi.listCrisisLogs(params),
    enabled,
  });

export const useSendNotification = () =>
  useMutation({ mutationFn: (body: SendNotificationRequest) => systemApi.sendNotification(body) });

export const useGetAdminStatistics = (enabled = true) =>
  useQuery({ queryKey: systemKeys.stats(), queryFn: systemApi.getAdminStatistics, enabled });

export const useCreateAiCounselingSession = () =>
  useMutation({
    mutationFn: (body: CreateAiCounselingSessionRequest) =>
      systemApi.createAiCounselingSession(body),
  });

export const useCreateAiCounselingMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AiCounselingRequest) => systemApi.createAiCounselingMessage(body),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: [...systemKeys.all, 'ai-counseling-messages', variables.session_id],
      }),
  });
};

export const useListAiCounselingMessages = (
  sessionId: string,
  params?: ListAiCounselingMessagesParams,
  enabled = true,
) =>
  useQuery({
    queryKey: systemKeys.aiCounselingMessages(sessionId, params),
    queryFn: () => systemApi.listAiCounselingMessages(sessionId, params),
    enabled: enabled && !!sessionId,
  });
