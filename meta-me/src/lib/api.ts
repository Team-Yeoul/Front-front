import type { AuthResponse, LoginRequest, SignupRequest, OnboardingRequest, OnboardingResponse } from '@/types';

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
