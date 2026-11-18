import type { components } from '@/shared/api';

export type LoginRequest = components['schemas']['LoginRequest'];
export type SignUpRequest = components['schemas']['SignUpRequest'];
export type AuthResponse = components['schemas']['AuthResponse'];
export type RefreshTokenRequest = components['schemas']['RefreshTokenRequest'];
export type PasswordResetRequest = components['schemas']['PasswordResetRequest'];
export type PasswordResetConfirmRequest = components['schemas']['PasswordResetConfirmRequest'];
export type MessageResponse = components['schemas']['MessageResponse'];

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
