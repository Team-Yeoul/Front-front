'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as diaryApi from './diary.http';
import type {
  CreateBettingRequest,
  CreateTriggerRequest,
  ListDailyRecordsParams,
  SubmitActualResultRequest,
  SubmitDailyRecordRequest,
  UpdateTailAnswerRequest,
} from '../model/types';

export const diaryKeys = {
  all: ['diary'] as const,
  todayQuestion: () => [...diaryKeys.all, 'today-question'] as const,
  // 파라미터와 관계없이 목록 전체를 무효화할 때 쓰는 접두 키
  recordLists: () => [...diaryKeys.all, 'records'] as const,
  records: (params?: ListDailyRecordsParams) => [...diaryKeys.recordLists(), params] as const,
  record: (recordId: string) => [...diaryKeys.all, 'record', recordId] as const,
  triggerReport: (triggerId: string) => [...diaryKeys.all, 'trigger-report', triggerId] as const,
};

export const useGetTodayDailyQuestion = (enabled = true) =>
  useQuery({
    queryKey: diaryKeys.todayQuestion(),
    queryFn: diaryApi.getTodayDailyQuestion,
    enabled,
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
