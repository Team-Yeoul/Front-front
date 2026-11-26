import { apiRequest } from '@/shared/api';
import type {
  BettingResponse,
  CreateBettingRequest,
  CreateTriggerRequest,
  DailyQuestion,
  DiaryDraft,
  DailyRecordListResponse,
  DailyRecordResponse,
  ListDailyRecordsParams,
  MessageResponse,
  SubmitActualResultRequest,
  SubmitDailyRecordRequest,
  TailQuestionResponse,
  TriggerAnalysisResponse,
  TriggerDeviationsResponse,
  TriggerDomain,
  UpdateTailAnswerRequest,
} from '../model/types';

/**
 * 명세상 응답은 { question: DailyQuestion }이지만, 배포 서버가 다른 모양(질문 객체 그대로,
 * { data: ... } 감싸기, 빈 응답)으로 줄 때도 화면이 죽지 않도록 여기서 한 번 정리한다.
 * 질문을 찾지 못하면 question은 null이고, 화면은 기본 질문을 쓴다.
 */
function pickQuestion(raw: unknown): DailyQuestion | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (o.question && typeof o.question === 'object') return o.question as DailyQuestion;
  if (typeof o.question_text === 'string') return o as unknown as DailyQuestion;
  if (o.data) return pickQuestion(o.data);
  return null;
}

export const getTodayDailyQuestion = async (): Promise<{ question: DailyQuestion | null }> => {
  const raw = await apiRequest<unknown>('/v1/daily-questions/today');
  const question = pickQuestion(raw);
  if (!question) console.warn('[daily-questions/today] 예상과 다른 응답 형식', raw);
  return { question };
};

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

// ── 임시저장(사용자당 1개, revision으로 낙관적 잠금) ─────────────────────
/** 임시저장본. 없으면 서버가 404를 준다. */
export const getDiaryDraft = () => apiRequest<DiaryDraft>('/v1/daily-records/draft');

/** 처음 저장할 때는 revision=0, 이후엔 마지막으로 받은 revision을 보낸다. 다른 기기가 먼저 저장했으면 409 DRAFT_CONFLICT. */
export const saveDiaryDraft = (content: SubmitDailyRecordRequest, revision: number) =>
  apiRequest<DiaryDraft>('/v1/daily-records/draft', { method: 'PUT', body: { content, revision } });

export const deleteDiaryDraft = (revision: number) =>
  apiRequest<void>('/v1/daily-records/draft', { method: 'DELETE', query: { revision } });

/** 임시저장본으로 데일리 기록을 만들고(POST /v1/daily-records와 같음) 임시저장본은 지운다. */
export const publishDiaryDraft = (revision: number) =>
  apiRequest<DailyRecordResponse>('/v1/daily-records/draft/publish', { method: 'POST', body: { revision } });

/** 완료된 트리거의 영역별 편차 누적과 패턴. domain을 빼면 전체 영역. */
export const getMetacogDeviations = (domain?: TriggerDomain) =>
  apiRequest<TriggerDeviationsResponse>('/v1/metacog-triggers/deviations', { query: { domain } });
