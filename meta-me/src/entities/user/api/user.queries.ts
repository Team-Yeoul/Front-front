
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as userApi from './user.http';
import type {
  CreateNicknameRequest,
  ListAttendanceParams,
  ListMyNicknamesParams,
  LoginRequest,
  NotificationSetting,
  OnboardingRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  PasswordResetVerifyRequest,
  RefreshTokenRequest,
  RegisterDeviceTokenRequest,
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
  attendance: (params: ListAttendanceParams) => [...userKeys.all, 'attendance', params] as const,
};

export const useLogin = () => useMutation({ mutationFn: (body: LoginRequest) => userApi.login(body) });

export const useGoogleLogin = () => useMutation({ mutationFn: (idToken: string) => userApi.googleLogin(idToken) });

export const useSignup = () => useMutation({ mutationFn: (body: SignUpRequest) => userApi.signup(body) });

export const useLogout = () => useMutation({ mutationFn: userApi.logout });

export const useRefreshToken = () =>
  useMutation({ mutationFn: (body: RefreshTokenRequest) => userApi.refreshToken(body) });

export const useRequestPasswordReset = () =>
  useMutation({ mutationFn: (body: PasswordResetRequest) => userApi.requestPasswordReset(body) });

export const useVerifyPasswordReset = () =>
  useMutation({ mutationFn: (body: PasswordResetVerifyRequest) => userApi.verifyPasswordReset(body) });

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
    // 온보딩 결과는 제출할 때만 바뀌고(제출 시 새로 받는다), 홈·도감이 탭을 옮길 때마다 다시 받지 않게 길게 둔다.
    staleTime: 30 * 60 * 1000,
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
    // 시간대·알림 설정은 이 앱에서 바꿀 때만 바뀐다(바꾸면 캐시를 바로 고친다). 날짜 계산이 이 값을 기다리지 않게 오래 둔다.
    staleTime: 30 * 60 * 1000,
    enabled,
  });

const NOTI_WRITE = ['user', 'notification-settings', 'write'] as const;

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: NOTI_WRITE,
    // 알림 설정 저장은 한 번에 하나씩 순서대로 보낸다(앞 저장이 끝나야 다음 저장이 나간다).
    scope: { id: 'notification-settings' },
    mutationFn: (body: NotificationSetting) => userApi.updateNotificationSettings(body),
    // 토글이 바로 반응하도록 먼저 캐시를 바꾸고, 실패하면 되돌린다.
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: userKeys.notificationSettings() });
      const previous = queryClient.getQueryData<NotificationSetting>(userKeys.notificationSettings());
      queryClient.setQueryData(userKeys.notificationSettings(), body);
      return { previous };
    },
    onError: (_err, _body, context) => {
      // 뒤이은 저장이 기다리고 있으면 되돌리지 않는다. 되돌리면 나중 토글 값을 덮어쓰고, 그 값이 다음 저장에 실려 나간다.
      // 이때는 onSettled에서 서버 값을 다시 읽어 맞춘다.
      if (queryClient.isMutating({ mutationKey: NOTI_WRITE }) > 1) return;
      if (context?.previous) queryClient.setQueryData(userKeys.notificationSettings(), context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: userKeys.notificationSettings() }),
  });
};

// ── 출석 ─────────────────────────────────────────────────────────────
export const useCheckInAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.checkInAttendance,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...userKeys.all, 'attendance'] }),
  });
};

export const useAttendance = (params: ListAttendanceParams, enabled = true) =>
  useQuery({ queryKey: userKeys.attendance(params), queryFn: () => userApi.listAttendance(params), enabled });

// ── 푸시 디바이스 토큰 ───────────────────────────────────────────────
export const useRegisterDeviceToken = () =>
  useMutation({ mutationFn: (body: RegisterDeviceTokenRequest) => userApi.registerDeviceToken(body) });

export const useDeleteDeviceToken = () =>
  useMutation({ mutationFn: (deviceTokenId: string) => userApi.deleteDeviceToken(deviceTokenId) });
