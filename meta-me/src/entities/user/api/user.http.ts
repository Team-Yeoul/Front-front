import { apiRequest } from '@/shared/api';
import type {
  AccountResponse,
  AuthResponse,
  CreateNicknameRequest,
  CurrentAccuracyResponse,
  ListMyNicknamesParams,
  LoginRequest,
  MessageResponse,
  NicknameListResponse,
  NicknameResponse,
  NotificationSetting,
  OnboardingRequest,
  OnboardingResultResponse,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  RefreshTokenRequest,
  SignUpRequest,
  TermsResponse,
  UpdateAccountRequest,
  UserProfileResponse,
} from '../model/types';

export const login = (body: LoginRequest) =>
  apiRequest<AuthResponse>('/v1/auth/login', { method: 'POST', body, auth: false });

export const signup = (body: SignUpRequest) =>
  apiRequest<AuthResponse>('/v1/auth/signup', { method: 'POST', body, auth: false });

/** Google ID Token으로 로그인한다. 처음 쓰는 Google 계정이면 서버가 자동으로 가입시킨다. */
export const googleLogin = (idToken: string) =>
  apiRequest<AuthResponse>('/v1/auth/google', { method: 'POST', body: { id_token: idToken }, auth: false });

export const logout = () => apiRequest<MessageResponse>('/v1/auth/logout', { method: 'POST' });

export const refreshToken = (body: RefreshTokenRequest) =>
  apiRequest<AuthResponse>('/v1/auth/token/refresh', { method: 'POST', body, auth: false });

export const requestPasswordReset = (body: PasswordResetRequest) =>
  apiRequest<MessageResponse>('/v1/auth/password-reset', { method: 'POST', body, auth: false });

export const confirmPasswordReset = (body: PasswordResetConfirmRequest) =>
  apiRequest<MessageResponse>('/v1/auth/password-reset/confirm', {
    method: 'POST',
    body,
    auth: false,
  });

export const submitOnboarding = (body: OnboardingRequest) =>
  apiRequest<OnboardingResultResponse>('/v1/onboarding', { method: 'POST', body });

export const getOnboardingResult = () =>
  apiRequest<OnboardingResultResponse>('/v1/onboarding/result');

export const getMyAccount = () => apiRequest<AccountResponse>('/v1/users/me/account');

export const updateMyAccount = (body: UpdateAccountRequest) =>
  apiRequest<AccountResponse>('/v1/users/me/account', { method: 'PATCH', body });

export const withdrawAccount = () =>
  apiRequest<MessageResponse>('/v1/users/me/account', { method: 'DELETE' });

export const getMyProfile = () => apiRequest<UserProfileResponse>('/v1/users/me/profile');

export const getMyAccuracy = () =>
  apiRequest<CurrentAccuracyResponse>('/v1/users/me/accuracy');

export const getTerms = () => apiRequest<TermsResponse>('/v1/users/me/terms');

export const listMyNicknames = (params?: ListMyNicknamesParams) =>
  apiRequest<NicknameListResponse>('/v1/users/me/nicknames', { query: params });

export const createNickname = (userId: string, body: CreateNicknameRequest) =>
  apiRequest<NicknameResponse>(`/v1/users/${userId}/nicknames`, { method: 'POST', body });

export const getNotificationSettings = () =>
  apiRequest<NotificationSetting>('/v1/users/me/notification-settings');

export const updateNotificationSettings = (body: NotificationSetting) =>
  apiRequest<NotificationSetting>('/v1/users/me/notification-settings', {
    method: 'PATCH',
    body,
  });
