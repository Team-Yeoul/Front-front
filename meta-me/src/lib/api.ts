import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  OnboardingRequest,
  OnboardingResponse,
  ReportStatus,
  ReportSummary,
  EmotionDetail,
  KeywordDetail,
  EnergyDetail,
  PersonaDetail,
  ActionExperimentStatus,
  ObjectifyMirrors,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const login = (body: LoginRequest) =>
  fetcher<AuthResponse>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const signup = (body: SignupRequest) =>
  fetcher<AuthResponse>('/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const submitOnboarding = (body: OnboardingRequest, token: string) =>
  fetcher<OnboardingResponse>('/v1/onboarding', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
  });

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

export const getReportStatus = (token: string) =>
  fetcher<ReportStatus>('/v1/report/status', { headers: authHeader(token) });

export const getReportSummary = (token: string) =>
  fetcher<ReportSummary>('/v1/report/summary', { headers: authHeader(token) });

export const getEmotionDetail = (token: string) =>
  fetcher<EmotionDetail>('/v1/report/emotion', { headers: authHeader(token) });

export const getKeywordDetail = (token: string) =>
  fetcher<KeywordDetail>('/v1/report/keywords', { headers: authHeader(token) });

export const getEnergyDetail = (token: string) =>
  fetcher<EnergyDetail>('/v1/report/energy', { headers: authHeader(token) });

export const getPersonaDetail = (token: string) =>
  fetcher<PersonaDetail>('/v1/report/persona', { headers: authHeader(token) });

export const getActionExperimentStatus = (token: string) =>
  fetcher<ActionExperimentStatus>('/v1/report/action', { headers: authHeader(token) });

export const getObjectifyMirrors = (token: string) =>
  fetcher<ObjectifyMirrors>('/v1/objectify/mirrors', { headers: authHeader(token) });
