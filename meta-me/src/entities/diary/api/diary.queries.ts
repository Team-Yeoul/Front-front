import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { objectiveKeys } from '@/entities/objective/api/objective.queries';
import { ApiError } from '@/shared/api';
import * as diaryApi from './diary.http';
import type {
  CreateBettingRequest,
  CreateTriggerRequest,
  ListDailyRecordsParams,
  SubmitActualResultRequest,
  SubmitDailyRecordRequest,
  TriggerDomain,
  UpdateTailAnswerRequest,
} from '../model/types';

export const diaryKeys = {
  all: ['diary'] as const,
  // 날짜를 키에 넣어 자정이 지나면 새 질문을 받는다.
  todayQuestion: () => {
    const d = new Date();
    return [...diaryKeys.all, 'today-question', `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`] as const;
  },
  // 파라미터와 관계없이 목록 전체를 무효화할 때 쓰는 접두 키
  recordLists: () => [...diaryKeys.all, 'records'] as const,
  records: (params?: ListDailyRecordsParams) => [...diaryKeys.recordLists(), params] as const,
  record: (recordId: string) => [...diaryKeys.all, 'record', recordId] as const,
  triggerReport: (triggerId: string) => [...diaryKeys.all, 'trigger-report', triggerId] as const,
  draft: () => [...diaryKeys.all, 'draft'] as const,
  deviations: (domain?: TriggerDomain) => [...diaryKeys.all, 'deviations', domain ?? 'ALL'] as const,
};

export const useGetTodayDailyQuestion = (enabled = true) =>
  useQuery({
    queryKey: diaryKeys.todayQuestion(),
    queryFn: diaryApi.getTodayDailyQuestion,
    enabled,
    // 다시 불러올 때마다 서버가 다른 질문을 줄 수 있어, 한 번 받은 오늘 질문은 기록 저장으로 무효화되기 전까지 그대로 쓴다.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

export const useCreateTailQuestion = () =>
  useMutation({ mutationFn: (questionId: string) => diaryApi.createTailQuestion(questionId) });

export const useUpdateTailQuestionAnswer = () =>
  useMutation({
    mutationFn: ({
      questionId,
      tailId,
      body,
    }: {
      questionId: string;
      tailId: string;
      body: UpdateTailAnswerRequest;
    }) => diaryApi.updateTailQuestionAnswer(questionId, tailId, body),
  });

export const useListDailyRecords = (params?: ListDailyRecordsParams, enabled = true) =>
  useQuery({
    queryKey: diaryKeys.records(params),
    queryFn: () => diaryApi.listDailyRecords(params),
    enabled,
  });

/** 기록 목록을 페이지(1부터)씩 이어 받는다. 받은 페이지는 유지한 채 다음 페이지를 붙인다. */
export const useInfiniteDailyRecords = (size: number, enabled = true) =>
  useInfiniteQuery({
    queryKey: [...diaryKeys.recordLists(), 'infinite', size] as const,
    queryFn: ({ pageParam }) => diaryApi.listDailyRecords({ size, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last, _all, lastPage) =>
      last.records.length > 0 && lastPage < (last.page_info?.total_pages ?? 1) ? lastPage + 1 : undefined,
    enabled,
  });

export const useGetDailyRecord = (recordId: string, enabled = true) =>
  useQuery({
    queryKey: diaryKeys.record(recordId),
    queryFn: () => diaryApi.getDailyRecord(recordId),
    enabled: enabled && !!recordId,
  });

export const useCreateDailyRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SubmitDailyRecordRequest) => diaryApi.createDailyRecord(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: diaryKeys.all }),
  });
};

export const useUpdateDailyRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, body }: { recordId: string; body: SubmitDailyRecordRequest }) =>
      diaryApi.updateDailyRecord(recordId, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: diaryKeys.record(variables.recordId) });
      queryClient.invalidateQueries({ queryKey: diaryKeys.recordLists() });
      // 기록 상세는 객관화 목록에서 문장을 찾으므로 함께 새로 받는다.
      queryClient.invalidateQueries({ queryKey: objectiveKeys.all });
    },
  });
};

export const useDeleteDailyRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recordId: string) => diaryApi.deleteDailyRecord(recordId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: diaryKeys.all }),
  });
};

export const useCreateMetacogBetting = () =>
  useMutation({ mutationFn: (body: CreateBettingRequest) => diaryApi.createMetacogBetting(body) });

export const useSubmitMetacogBettingResult = () =>
  useMutation({
    mutationFn: ({
      bettingId,
      body,
    }: {
      bettingId: string;
      body: SubmitActualResultRequest;
    }) => diaryApi.submitMetacogBettingResult(bettingId, body),
  });

export const useCreateMetacogTrigger = () =>
  useMutation({ mutationFn: (body: CreateTriggerRequest) => diaryApi.createMetacogTrigger(body) });

export const useGetMetacogTriggerReport = (triggerId: string, enabled = true) =>
  useQuery({
    queryKey: diaryKeys.triggerReport(triggerId),
    queryFn: () => diaryApi.getMetacogTriggerReport(triggerId),
    enabled: enabled && !!triggerId,
  });

export const useSubmitMetacogTriggerResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      triggerId,
      body,
    }: {
      triggerId: string;
      body: SubmitActualResultRequest;
    }) => diaryApi.submitMetacogTriggerResult(triggerId, body),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: diaryKeys.triggerReport(variables.triggerId) }),
  });
};

// ── 임시저장 ─────────────────────────────────────────────────────────
/** 임시저장본. 없으면(404) null. */
export const useDiaryDraft = (enabled = true) =>
  useQuery({
    queryKey: diaryKeys.draft(),
    queryFn: () =>
      diaryApi.getDiaryDraft().catch((err) => {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }),
    enabled,
  });

/**
 * 임시저장. revision은 캐시에 있는 마지막 값을 자동으로 쓴다(없으면 0).
 * 409(다른 기기가 먼저 저장)면 최신 임시저장본을 다시 불러오도록 캐시를 무효화하고 에러를 그대로 던진다.
 */
export const useSaveDiaryDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: SubmitDailyRecordRequest) => {
      const current = queryClient.getQueryData<Awaited<ReturnType<typeof diaryApi.getDiaryDraft>> | null>(diaryKeys.draft());
      return diaryApi.saveDiaryDraft(content, current?.revision ?? 0);
    },
    onSuccess: (data) => queryClient.setQueryData(diaryKeys.draft(), data),
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) queryClient.invalidateQueries({ queryKey: diaryKeys.draft() });
    },
  });
};

export const useDeleteDiaryDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (revision: number) => diaryApi.deleteDiaryDraft(revision),
    onSuccess: () => queryClient.setQueryData(diaryKeys.draft(), null),
    onError: () => queryClient.invalidateQueries({ queryKey: diaryKeys.draft() }),
  });
};

/** 임시저장본을 기록으로 발행한다. 성공하면 임시저장본은 서버에서 지워진다. */
export const usePublishDiaryDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (revision: number) => diaryApi.publishDiaryDraft(revision),
    onSuccess: () => {
      queryClient.setQueryData(diaryKeys.draft(), null);
      // 기록을 새로 만든 것과 같으므로 useCreateDailyRecord처럼 diary 전체를 새로 고친다.
      return queryClient.invalidateQueries({ queryKey: diaryKeys.all });
    },
    onError: () => queryClient.invalidateQueries({ queryKey: diaryKeys.draft() }),
  });
};

// ── 메타인지 편차 ────────────────────────────────────────────────────
export const useMetacogDeviations = (domain?: TriggerDomain, enabled = true) =>
  useQuery({
    queryKey: diaryKeys.deviations(domain),
    queryFn: () => diaryApi.getMetacogDeviations(domain),
    enabled,
  });
