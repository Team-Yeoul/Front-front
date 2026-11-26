import type { components } from '@/shared/api';

export type LoginRequest = components['schemas']['LoginRequest'];
export type SignUpRequest = components['schemas']['SignUpRequest'];
export type AuthResponse = components['schemas']['AuthResponse'];
export type RefreshTokenRequest = components['schemas']['RefreshTokenRequest'];
export type PasswordResetRequest = components['schemas']['PasswordResetRequest'];
export type PasswordResetConfirmRequest = components['schemas']['PasswordResetConfirmRequest'];
export type MessageResponse = components['schemas']['MessageResponse'];
/**
 * 인증번호만 확인하는 요청(POST /v1/auth/password-reset/verify). 아직 API 명세에 없어 여기서 정의한다.
 * 서버가 명세에 넣으면 components['schemas']의 타입으로 바꾼다.
 */
export type PasswordResetVerifyRequest = { email: string; code: string };

export type OnboardingRequest = components['schemas']['OnboardingRequest'];
export type OnboardingResultResponse = components['schemas']['OnboardingResultResponse'];

export type User = components['schemas']['User'];
export type AccountResponse = components['schemas']['AccountResponse'];
export type UpdateAccountRequest = components['schemas']['UpdateAccountRequest'];

export type UserProfile = components['schemas']['UserProfile'];
export type UserProfileResponse = components['schemas']['UserProfileResponse'];

export type AccuracyLog = components['schemas']['AccuracyLog'];
export type CurrentAccuracyResponse = components['schemas']['CurrentAccuracyResponse'];

export type Nickname = components['schemas']['Nickname'];
export type NicknameListResponse = components['schemas']['NicknameListResponse'];
export type NicknameResponse = components['schemas']['NicknameResponse'];
export type CreateNicknameRequest = components['schemas']['CreateNicknameRequest'];

export type NotificationSetting = components['schemas']['NotificationSetting'];
export type TermsResponse = components['schemas']['TermsResponse'];

export interface ListMyNicknamesParams {
  page?: number;
  size?: number;
  type?: 'SELF' | 'AI' | 'OTHERS';
}

export interface AttendanceCheckInResponse {
  attendance_date: string;
}

export interface AttendanceListResponse {
  dates: string[];
  timezone: string;
}

export interface ListAttendanceParams {
  /** YYYY-MM-DD. 기간은 최대 1년. */
  start_date: string;
  end_date: string;
}

export type RegisterDeviceTokenRequest = components['schemas']['RegisterDeviceTokenRequest'];
export type DeviceTokenResponse = components['schemas']['DeviceTokenResponse'];

/**
 * 약관·개인정보·민감정보·마케팅 동의 (GET/PUT /v1/users/me/consents).
 * 아직 API 명세(schema.gen)에 없어 서버 응답을 보고 직접 정의한다.
 * changed_at은 시간대 없는 UTC 시각이다(예: 2026-11-22T12:55:58.386772).
 */
export type ConsentType = 'SERVICE' | 'PRIVACY' | 'SENSITIVE' | 'MARKETING';

export interface ConsentItem {
  consent_type: ConsentType;
  agreed: boolean;
  required_for_account?: boolean;
  changed_at?: string;
  terms_version?: string;
}

export interface ConsentsResponse {
  terms_version: string;
  consents: ConsentItem[];
}

/** 보낸 항목만 바뀐다. */
export interface UpdateConsentsRequest {
  consents: { consent_type: ConsentType; agreed: boolean }[];
}
