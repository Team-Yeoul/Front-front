'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as userApi from './user.http';
import type {
  CreateNicknameRequest,
  ListMyNicknamesParams,
  LoginRequest,
  NotificationSetting,
  OnboardingRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  RefreshTokenRequest,
  SignUpRequest,
  UpdateAccountRequest,
} from '../model/types';

export const userKeys = {
  all: ['user'] as const,
  account: () => [...userKeys.all, 'account'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  accuracy: () => [...userKeys.all, 'accuracy'] as const,
  onboardingResult: () => [...userKeys.all, 'onboarding-result'] as const,
  nicknames: (params?: ListMyNicknamesParams) => [...userKeys.all, 'nicknames', params] as const,
  notificationSettings: () => [...userKeys.all, 'notification-settings'] as const,
  terms: () => [...userKeys.all, 'terms'] as const,
};

export const useLogin = () => useMutation({ mutationFn: (body: LoginRequest) => userApi.login(body) });

export const useSignup = () => useMutation({ mutationFn: (body: SignUpRequest) => userApi.signup(body) });

export const useLogout = () => useMutation({ mutationFn: userApi.logout });

export const useRefreshToken = () =>
  useMutation({ mutationFn: (body: RefreshTokenRequest) => userApi.refreshToken(body) });

export const useRequestPasswordReset = () =>
  useMutation({ mutationFn: (body: PasswordResetRequest) => userApi.requestPasswordReset(body) });

export const useConfirmPasswordReset = () =>
  useMutation({
    mutationFn: (body: PasswordResetConfirmRequest) => userApi.confirmPasswordReset(body),
  });

export const useSubmitOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OnboardingRequest) => userApi.submitOnboarding(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.onboardingResult() }),
  });
};

export const useGetOnboardingResult = (enabled = true) =>
  useQuery({
    queryKey: userKeys.onboardingResult(),
    queryFn: userApi.getOnboardingResult,
    enabled,
  });

export const useGetMyAccount = (enabled = true) =>
  useQuery({ queryKey: userKeys.account(), queryFn: userApi.getMyAccount, enabled });

export const useUpdateMyAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateAccountRequest) => userApi.updateMyAccount(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.account() }),
  });
};

export const useWithdrawAccount = () => useMutation({ mutationFn: userApi.withdrawAccount });

// 명세상 accuracy_percent·xp_delta는 정수가 아닌 number라, 화면에 42.857%처럼 찍히지 않게 여기서 반올림한다.
const roundProfile = (p: Awaited<ReturnType<typeof userApi.getMyProfile>>) =>
  p?.latest_accuracy
    ? {
        ...p,
        latest_accuracy: {
          ...p.latest_accuracy,
          accuracy_percent: Math.round(p.latest_accuracy.accuracy_percent),
          xp_delta: Math.round(p.latest_accuracy.xp_delta),
        },
      }
    : p;

export const useGetMyProfile = (enabled = true) =>
  useQuery({ queryKey: userKeys.profile(), queryFn: userApi.getMyProfile, select: roundProfile, enabled });

export const useGetMyAccuracy = (enabled = true) =>
  useQuery({ queryKey: userKeys.accuracy(), queryFn: userApi.getMyAccuracy, enabled });

export const useGetTerms = (enabled = true) =>
  useQuery({ queryKey: userKeys.terms(), queryFn: userApi.getTerms, enabled });

export const useListMyNicknames = (params?: ListMyNicknamesParams, enabled = true) =>
  useQuery({
    queryKey: userKeys.nicknames(params),
    queryFn: () => userApi.listMyNicknames(params),
    enabled,
  });

export const useCreateNickname = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: CreateNicknameRequest }) =>
      userApi.createNickname(userId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
};

export const useGetNotificationSettings = (enabled = true) =>
  useQuery({
    queryKey: userKeys.notificationSettings(),
    queryFn: userApi.getNotificationSettings,
    enabled,
  });

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: NotificationSetting) => userApi.updateNotificationSettings(body),
    // 토글이 바로 반응하도록 먼저 캐시를 바꾸고, 실패하면 되돌린다.
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: userKeys.notificationSettings() });
      const previous = queryClient.getQueryData<NotificationSetting>(userKeys.notificationSettings());
      queryClient.setQueryData(userKeys.notificationSettings(), body);
      return { previous };
    },
    onError: (_err, _body, context) => {
      if (context?.previous) queryClient.setQueryData(userKeys.notificationSettings(), context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: userKeys.notificationSettings() }),
  });
};
