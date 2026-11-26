import type { components } from '@/shared/api';

export type BrainStructure = components['schemas']['BrainStructure'];
export type BrainStructureResponse = components['schemas']['BrainStructureResponse'];
export type GenerateWeeklyBrainStructureRequest =
  components['schemas']['GenerateWeeklyBrainStructureRequest'];
export type ShareLinkResponse = components['schemas']['ShareLinkResponse'];

export type Quest = components['schemas']['Quest'];
export type QuestResponse = components['schemas']['QuestResponse'];
export type QuestListResponse = components['schemas']['QuestListResponse'];
export type CreateQuestCompletionRequest = components['schemas']['CreateQuestCompletionRequest'];

export type Report = components['schemas']['Report'];
export type ReportResponse = components['schemas']['ReportResponse'];
export type ReportListResponse = components['schemas']['ReportListResponse'];
export type GenerateReportRequest = components['schemas']['GenerateReportRequest'];

/** 생성·목록 조회에 함께 쓰는 리포트 유형(WEEKLY · MONTHLY · LIFETIME) */
export type ReportType = GenerateReportRequest['report_type'];

export interface ListQuestsParams {
  page?: number;
  size?: number;
}

export interface ListReportsParams {
  report_type?: ReportType;
  page?: number;
  size?: number;
}
