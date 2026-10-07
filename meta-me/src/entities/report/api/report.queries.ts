'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as reportApi from './report.http';
import type {
  CreateQuestCompletionRequest,
  GenerateReportRequest,
  GenerateWeeklyBrainStructureRequest,
  ListQuestsParams,
  ListReportsParams,
} from '../model/types';

export const reportKeys = {
  all: ['report'] as const,
  // 파라미터와 관계없이 목록 전체를 무효화할 때 쓰는 접두 키
  questLists: () => [...reportKeys.all, 'quests'] as const,
  quests: (params?: ListQuestsParams) => [...reportKeys.questLists(), params] as const,
  quest: (questId: string) => [...reportKeys.all, 'quest', questId] as const,
  reportLists: () => [...reportKeys.all, 'list'] as const,
  reports: (params?: ListReportsParams) => [...reportKeys.reportLists(), params] as const,
  report: (reportId: string) => [...reportKeys.all, 'detail', reportId] as const,
};

export const useGenerateWeeklyBrainStructure = () =>
  useMutation({
    mutationFn: (body: GenerateWeeklyBrainStructureRequest) =>
      reportApi.generateWeeklyBrainStructure(body),
  });

export const useShareBrainStructure = () =>
  useMutation({
    mutationFn: (brainStructureId: string) => reportApi.shareBrainStructure(brainStructureId),
  });

export const useListQuests = (params?: ListQuestsParams, enabled = true) =>
  useQuery({
    queryKey: reportKeys.quests(params),
    queryFn: () => reportApi.listQuests(params),
    enabled,
  });

export const useGetQuest = (questId: string, enabled = true) =>
  useQuery({
    queryKey: reportKeys.quest(questId),
    queryFn: () => reportApi.getQuest(questId),
    enabled: enabled && !!questId,
  });

export const useCompleteQuest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      questId,
      body,
    }: {
      questId: string;
      body: CreateQuestCompletionRequest;
    }) => reportApi.completeQuest(questId, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.quest(variables.questId) });
      queryClient.invalidateQueries({ queryKey: reportKeys.questLists() });
    },
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: GenerateReportRequest) => reportApi.generateReport(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reportKeys.reportLists() }),
  });
};

export const useListReports = (params?: ListReportsParams, enabled = true) =>
  useQuery({
    queryKey: reportKeys.reports(params),
    queryFn: () => reportApi.listReports(params),
    enabled,
  });

export const useGetReport = (reportId: string, enabled = true) =>
  useQuery({
    queryKey: reportKeys.report(reportId),
    queryFn: () => reportApi.getReport(reportId),
    enabled: enabled && !!reportId,
  });
