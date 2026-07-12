import type { components } from '@/shared/api';

export type MessageResponse = components['schemas']['MessageResponse'];

export type B2BReportResponse = components['schemas']['B2BReportResponse'];
export type CrisisLog = components['schemas']['CrisisLog'];
export type CrisisLogListResponse = components['schemas']['CrisisLogListResponse'];
export type SendNotificationRequest = components['schemas']['SendNotificationRequest'];
export type AdminStatsResponse = components['schemas']['AdminStatsResponse'];

export type AiCounselingSession = components['schemas']['AiCounselingSession'];
export type AiCounselingSessionResponse = components['schemas']['AiCounselingSessionResponse'];
export type CreateAiCounselingSessionRequest =
  components['schemas']['CreateAiCounselingSessionRequest'];

export type AiCounselingMessage = components['schemas']['AiCounselingMessage'];
export type AiCounselingRequest = components['schemas']['AiCounselingRequest'];
export type AiCounselingResponse = components['schemas']['AiCounselingResponse'];
export type AiCounselingHistoryResponse = components['schemas']['AiCounselingHistoryResponse'];

export interface ListB2BReportsParams {
  organization_id?: string;
  page?: number;
  size?: number;
}

export interface ListCrisisLogsParams {
  start_date: string;
  end_date: string;
  keyword_filter?: string;
  filter_stage?: 'INPUT' | 'OUTPUT';
  page?: number;
  size?: number;
}

export interface ListAiCounselingMessagesParams {
  page?: number;
  size?: number;
}
