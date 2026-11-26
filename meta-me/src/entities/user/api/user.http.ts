import { apiRequest } from '@/shared/api';
import { useAuthStore } from '@/store';
import type {
  AccountResponse,
  AttendanceCheckInResponse,
  AttendanceListResponse,
  ConsentsResponse,
  AuthResponse,
  CreateNicknameRequest,
  CurrentAccuracyResponse,
  DeviceTokenResponse,
  ListAttendanceParams,
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
  PasswordResetVerifyRequest,
  RefreshTokenRequest,
  RegisterDeviceTokenRequest,
  SignUpRequest,
  TermsResponse,
  UpdateAccountRequest,
  UpdateConsentsRequest,
  UserProfileResponse,
} from '../model/types';

export const login = (body: LoginRequest) =>
  apiRequest<AuthResponse>('/v1/auth/login', { method: 'POST', body, auth: false });

export const signup = (body: SignUpRequest) =>
  apiRequest<AuthResponse>('/v1/auth/signup', { method: 'POST', body, auth: false });

/**
 * Google ID Token으로 로그인한다. 처음 쓰는 Google 계정이면 서버가 자동으로 가입시킨다.
 * is_new_user: 이번 요청으로 새로 가입했는지. 아직 API 명세에 없어 여기서만 덧붙이고, 배포 전 서버는 보내지 않는다.
 */
export const googleLogin = (idToken: string) =>
  apiRequest<AuthResponse & { is_new_user?: boolean }>('/v1/auth/google', { method: 'POST', body: { id_token: idToken }, auth: false });

export const logout = () => apiRequest<MessageResponse>('/v1/auth/logout', { method: 'POST' });

export const refreshToken = (body: RefreshTokenRequest) =>
  apiRequest<AuthResponse>('/v1/auth/token/refresh', { method: 'POST', body, auth: false });

export const requestPasswordReset = (body: PasswordResetRequest) =>
  apiRequest<MessageResponse>('/v1/auth/password-reset', { method: 'POST', body, auth: false });

/** 비밀번호를 바꾸기 전에 인증번호만 확인한다. 코드를 쓰지는 않으므로 confirm에서 같은 코드를 다시 보낸다. */
export const verifyPasswordReset = (body: PasswordResetVerifyRequest) =>
  apiRequest<MessageResponse>('/v1/auth/password-reset/verify', { method: 'POST', body, auth: false });

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

/** 오늘(Asia/Seoul 기준) 출석을 남긴다. 같은 날 여러 번 불러도 한 번만 기록된다. */
export const checkInAttendance = () =>
  apiRequest<AttendanceCheckInResponse>('/v1/users/me/attendance', { method: 'POST' });

/** 기간 안의 출석 날짜(오름차순). 기간은 최대 1년, start_date > end_date면 400. */
export const listAttendance = (params: ListAttendanceParams) =>
  apiRequest<AttendanceListResponse>('/v1/users/me/attendance', { query: params });

/** FCM/APNs 푸시 토큰을 등록한다. */
export const registerDeviceToken = (body: RegisterDeviceTokenRequest) =>
  apiRequest<DeviceTokenResponse>('/v1/users/me/device-tokens', { method: 'POST', body });

export const deleteDeviceToken = (deviceTokenId: string) =>
  apiRequest<void>(`/v1/users/me/device-tokens/${deviceTokenId}`, { method: 'DELETE' });

/** 약관·민감정보 등 동의 상태. 서버는 민감정보 동의(SENSITIVE)가 없으면 온보딩·기록 등을 403(SENSITIVE_CONSENT_REQUIRED)으로 막는다. */
export const getConsents = (asUser?: string | null) => apiRequest<ConsentsResponse>('/v1/users/me/consents', { asUser });

/**
 * 민감정보 처리 동의만 바꾼다. 서버는 /v1/users/me/consents로 SENSITIVE를 보내면 400으로 막는다.
 * 어떤 약관 버전에 동의했는지(version)가 필요해서, 서버가 알려 주는 현재 약관 버전을 먼저 읽는다.
 * 두 요청 사이에 계정이 바뀌면 다른 계정의 동의로 저장하지 않도록, 시작할 때의 계정으로만 보낸다.
 */
export const updateSensitiveConsent = async (agreed: boolean, asUser: string | null = useAuthStore.getState().userId) => {
  const { terms_version, consents } = await getConsents(asUser);
  const version = consents.find((c) => c.consent_type === 'SENSITIVE')?.terms_version || terms_version;
  return apiRequest<unknown>('/v1/users/me/consents/sensitive-info', { method: 'PUT', body: { agreed, version }, asUser });
};

/**
 * 동의를 바꾼다. 보낸 항목만 바뀐다.
 * 민감정보(SENSITIVE)는 서버가 전용 경로로만 받으므로 따로 보낸다. 나머지를 먼저 저장한 뒤 민감정보를 저장한다.
 * 요청이 여러 번으로 나뉘므로, 모두 시작할 때의 계정으로만 보낸다(도중에 계정이 바뀌면 멈춘다).
 */
export const updateConsents = async (body: UpdateConsentsRequest): Promise<void> => {
  const asUser = useAuthStore.getState().userId;
  const sensitive = body.consents.find((c) => c.consent_type === 'SENSITIVE');
  const rest = body.consents.filter((c) => c.consent_type !== 'SENSITIVE');
  if (rest.length) await apiRequest<ConsentsResponse>('/v1/users/me/consents', { method: 'PUT', body: { consents: rest }, asUser });
  if (sensitive) await updateSensitiveConsent(sensitive.agreed, asUser);
};
