import { apiRequest } from '@/shared/api';
import type {
  BrainStructureResponse,
  CreateQuestCompletionRequest,
  GenerateReportRequest,
  GenerateWeeklyBrainStructureRequest,
  ListQuestsParams,
  ListReportsParams,
  QuestListResponse,
  QuestResponse,
  ReportListResponse,
  ReportResponse,
  ShareLinkResponse,
} from '../model/types';

export const generateWeeklyBrainStructure = (body: GenerateWeeklyBrainStructureRequest) =>
  apiRequest<BrainStructureResponse>('/v1/brain-structures/weekly', { method: 'POST', body });

export const shareBrainStructure = (brainStructureId: string) =>
  apiRequest<ShareLinkResponse>(`/v1/brain-structures/${brainStructureId}/share`, {
    method: 'POST',
  });

export const listQuests = (params?: ListQuestsParams) =>
  apiRequest<QuestListResponse>('/v1/quests', { query: params });

export const getQuest = (questId: string) => apiRequest<QuestResponse>(`/v1/quests/${questId}`);

export const completeQuest = (questId: string, body: CreateQuestCompletionRequest) =>
  apiRequest<QuestResponse>(`/v1/quests/${questId}/completion`, { method: 'POST', body });

export const generateReport = (body: GenerateReportRequest) =>
  apiRequest<ReportResponse>('/v1/reports', { method: 'POST', body });

export const listReports = (params?: ListReportsParams) =>
  apiRequest<ReportListResponse>('/v1/reports', { query: params });

export const getReport = (reportId: string) =>
  apiRequest<ReportResponse>(`/v1/reports/${reportId}`);
