'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import * as systemApi from './system.http';
import type {
  ListB2BReportsParams,
  ListCrisisLogsParams,
  SendNotificationRequest,
} from '../model/types';

export const systemKeys = {
  all: ['system'] as const,
  b2bReports: (params?: ListB2BReportsParams) =>
    [...systemKeys.all, 'b2b-reports', params] as const,
  crisisLogs: (params: ListCrisisLogsParams) => [...systemKeys.all, 'crisis-logs', params] as const,
  stats: () => [...systemKeys.all, 'stats'] as const,
};

export const useListB2BReports = (params?: ListB2BReportsParams, enabled = true) =>
  useQuery({
    queryKey: systemKeys.b2bReports(params),
    queryFn: () => systemApi.listB2BReports(params),
    enabled,
  });

export const useListCrisisLogs = (params: ListCrisisLogsParams, enabled = true) =>
  useQuery({
    queryKey: systemKeys.crisisLogs(params),
    queryFn: () => systemApi.listCrisisLogs(params),
    enabled,
  });

export const useSendNotification = () =>
  useMutation({ mutationFn: (body: SendNotificationRequest) => systemApi.sendNotification(body) });

export const useGetAdminStatistics = (enabled = true) =>
  useQuery({ queryKey: systemKeys.stats(), queryFn: systemApi.getAdminStatistics, enabled });
