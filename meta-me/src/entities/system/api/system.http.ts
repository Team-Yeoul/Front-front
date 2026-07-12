import { apiRequest } from '@/shared/api';
import type {
  AdminStatsResponse,
  AiCounselingHistoryResponse,
  AiCounselingRequest,
  AiCounselingResponse,
  AiCounselingSessionResponse,
  B2BReportResponse,
  CreateAiCounselingSessionRequest,
  CrisisLogListResponse,
  ListAiCounselingMessagesParams,
  ListB2BReportsParams,
  ListCrisisLogsParams,
  MessageResponse,
  SendNotificationRequest,
} from '../model/types';

export const listB2BReports = (params?: ListB2BReportsParams) =>
  apiRequest<B2BReportResponse>('/v1/admin/b2b/reports', { query: params });

export const listCrisisLogs = (params: ListCrisisLogsParams) =>
  apiRequest<CrisisLogListResponse>('/v1/admin/crisis-logs', { query: params });

export const sendNotification = (body: SendNotificationRequest) =>
  apiRequest<MessageResponse>('/v1/admin/notifications', { method: 'POST', body });

export const getAdminStatistics = () => apiRequest<AdminStatsResponse>('/v1/admin/stats');

export const createAiCounselingSession = (body: CreateAiCounselingSessionRequest) =>
  apiRequest<AiCounselingSessionResponse>('/v1/ai-counseling/sessions', {
    method: 'POST',
    body,
  });

export const createAiCounselingMessage = (body: AiCounselingRequest) =>
  apiRequest<AiCounselingResponse>('/v1/ai-counseling/messages', { method: 'POST', body });

export const listAiCounselingMessages = (
  sessionId: string,
  params?: ListAiCounselingMessagesParams,
) =>
  apiRequest<AiCounselingHistoryResponse>(
    `/v1/ai-counseling/sessions/${sessionId}/messages`,
    { query: params },
  );
