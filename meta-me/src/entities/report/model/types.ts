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

export type ReportType = 'WEEK' | 'MONTH' | 'MY_REPORT' | 'OBJECTIVE_FEEDBACK';

export interface ListQuestsParams {
  page?: number;
  size?: number;
}

export interface ListReportsParams {
  report_type?: ReportType;
  page?: number;
  size?: number;
}
