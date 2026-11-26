import type { components } from '@/shared/api';

export type MessageResponse = components['schemas']['MessageResponse'];

export type DailyQuestion = components['schemas']['DailyQuestion'];
export type DailyQuestionResponse = components['schemas']['DailyQuestionResponse'];

export type TailQuestion = components['schemas']['TailQuestion'];
export type TailQuestionResponse = components['schemas']['TailQuestionResponse'];
export type UpdateTailAnswerRequest = components['schemas']['UpdateTailAnswerRequest'];

export type DailyRecord = components['schemas']['DailyRecord'];
export type DailyRecordResponse = components['schemas']['DailyRecordResponse'];
export type DailyRecordListResponse = components['schemas']['DailyRecordListResponse'];
export type SubmitDailyRecordRequest = components['schemas']['SubmitDailyRecordRequest'];

export type MetacogBetting = components['schemas']['MetacogBetting'];
export type BettingResponse = components['schemas']['BettingResponse'];
export type CreateBettingRequest = components['schemas']['CreateBettingRequest'];

export type MetacogTrigger = components['schemas']['MetacogTrigger'];
export type TriggerAnalysisResponse = components['schemas']['TriggerAnalysisResponse'];
export type CreateTriggerRequest = components['schemas']['CreateTriggerRequest'];

export type SubmitActualResultRequest = components['schemas']['SubmitActualResultRequest'];

export interface ListDailyRecordsParams {
  start_date?: string;
  end_date?: string;
  page?: number;
  size?: number;
}

export type DiaryDraft = components['schemas']['DiaryDraft'];

export type TriggerDomain = 'STUDY' | 'WORK' | 'HOBBY' | 'RELATION';
export type TriggerDeviationsResponse = components['schemas']['TriggerDeviationsResponse'];
