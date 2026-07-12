import { apiRequest } from '@/shared/api';
import type {
  BettingResponse,
  CreateBettingRequest,
  CreateTriggerRequest,
  DailyQuestionResponse,
  DailyRecordListResponse,
  DailyRecordResponse,
  ListDailyRecordsParams,
  MessageResponse,
  SubmitActualResultRequest,
  SubmitDailyRecordRequest,
  TailQuestionResponse,
  TriggerAnalysisResponse,
  UpdateTailAnswerRequest,
} from '../model/types';

export const getTodayDailyQuestion = () =>
  apiRequest<DailyQuestionResponse>('/v1/daily-questions/today');

export const createTailQuestion = (questionId: string) =>
  apiRequest<TailQuestionResponse>(`/v1/daily-questions/${questionId}/tail-questions`, {
    method: 'POST',
  });

export const updateTailQuestionAnswer = (
  questionId: string,
  tailId: string,
  body: UpdateTailAnswerRequest,
) =>
  apiRequest<TailQuestionResponse>(
    `/v1/daily-questions/${questionId}/tail-questions/${tailId}`,
    { method: 'PATCH', body },
  );

export const createDailyRecord = (body: SubmitDailyRecordRequest) =>
  apiRequest<DailyRecordResponse>('/v1/daily-records', { method: 'POST', body });

export const listDailyRecords = (params?: ListDailyRecordsParams) =>
  apiRequest<DailyRecordListResponse>('/v1/daily-records', { query: params });

export const getDailyRecord = (recordId: string) =>
  apiRequest<DailyRecordResponse>(`/v1/daily-records/${recordId}`);

export const updateDailyRecord = (recordId: string, body: SubmitDailyRecordRequest) =>
  apiRequest<DailyRecordResponse>(`/v1/daily-records/${recordId}`, {
    method: 'PATCH',
    body,
  });

export const deleteDailyRecord = (recordId: string) =>
  apiRequest<MessageResponse>(`/v1/daily-records/${recordId}`, { method: 'DELETE' });

export const createMetacogBetting = (body: CreateBettingRequest) =>
  apiRequest<BettingResponse>('/v1/metacog-bettings', { method: 'POST', body });

export const submitMetacogBettingResult = (bettingId: string, body: SubmitActualResultRequest) =>
  apiRequest<BettingResponse>(`/v1/metacog-bettings/${bettingId}/result`, {
    method: 'PATCH',
    body,
  });

export const createMetacogTrigger = (body: CreateTriggerRequest) =>
  apiRequest<TriggerAnalysisResponse>('/v1/metacog-triggers', { method: 'POST', body });

export const getMetacogTriggerReport = (triggerId: string) =>
  apiRequest<TriggerAnalysisResponse>(`/v1/metacog-triggers/${triggerId}/report`);

export const submitMetacogTriggerResult = (triggerId: string, body: SubmitActualResultRequest) =>
  apiRequest<TriggerAnalysisResponse>(`/v1/metacog-triggers/${triggerId}/result`, {
    method: 'PATCH',
    body,
  });
