import type { components } from '@/shared/api';

export type MessageResponse = components['schemas']['MessageResponse'];

export type B2BReportResponse = components['schemas']['B2BReportResponse'];
export type CrisisLog = components['schemas']['CrisisLog'];
export type CrisisLogListResponse = components['schemas']['CrisisLogListResponse'];
export type SendNotificationRequest = components['schemas']['SendNotificationRequest'];
export type AdminStatsResponse = components['schemas']['AdminStatsResponse'];


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
