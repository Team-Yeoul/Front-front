import { useAuthStore } from '@/store';
import type { components } from './schema.gen';

export type ErrorCode = components['schemas']['ErrorCode'];
export type ErrorResponse = components['schemas']['ErrorResponse'];

/** Typed error thrown by {@link apiRequest} for any non-2xx response. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode | 'UNKNOWN_ERROR';
  readonly resolution?: string;

  constructor(status: number, body: Partial<ErrorResponse>) {
    super(body.message ?? `API error: ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code ?? 'UNKNOWN_ERROR';
    this.resolution = body.resolution;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

/** Any plain object of query params, e.g. `{ page?: number; size?: number }`. */
export type QueryParams = object;

function buildQueryString(params?: QueryParams): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value !== undefined && value !== null) search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: QueryParams;
  /** Attach `Authorization: Bearer <accessToken>`. Defaults to true. */
  auth?: boolean;
}

/**
 * Common request function every entity's api layer is built on.
 * Reads the access token from the zustand auth store, throws {@link ApiError}
 * on non-2xx responses using the backend's ErrorResponse shape.
 */
let refreshing: Promise<boolean> | null = null;

/**
 * 저장된 refresh token으로 access token을 한 번 갱신한다. 동시에 여러 요청이 401을 받아도 한 번만 시도한다.
 * 서버가 갱신을 거부하면 false, 네트워크 오류는 그대로 throw해서 일시적인 오류로 로그아웃되지 않게 한다.
 */
function refreshAccessToken(): Promise<boolean> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) return false;
    const res = await fetch(`${BASE_URL}/v1/auth/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      if (res.status >= 500) throw new ApiError(res.status, await res.json().catch(() => ({})));
      return false;
    }
    const data = (await res.json()) as components['schemas']['AuthResponse'];
    // 갱신하는 동안 로그아웃·탈퇴(또는 다른 계정 로그인)가 있었다면 그 세션을 되살리지 않는다.
    const current = useAuthStore.getState();
    if (current.refreshToken !== refreshToken) return !!current.accessToken;
    current.setAuth(data.access_token, data.refresh_token, data.user_id);
    return true;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

export async function apiRequest<T>(path: string, config: RequestConfig = {}, retried = false): Promise<T> {
  const { method = 'GET', body, query, auth = true } = config;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = auth ? useAuthStore.getState().accessToken : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}${buildQueryString(query)}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 로그인이 유지되는 동안 토큰이 만료되면 한 번 갱신해 재시도하고, 실패하면 로그아웃한다.
  if (res.status === 401 && auth) {
    if (!retried) {
      // 이 요청을 보낸 뒤 다른 요청이 이미 토큰을 갱신했다면, 다시 갱신하지 않고 새 토큰으로 재시도한다.
      const latest = useAuthStore.getState().accessToken;
      if (latest && latest !== token) return apiRequest<T>(path, config, true);
      if (await refreshAccessToken()) return apiRequest<T>(path, config, true);
    }
    // 갱신이 거부됐거나, 갱신한 토큰으로도 401이면 세션을 정리한다.
    useAuthStore.getState().clearAuth();
  }

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as Partial<ErrorResponse>;
    throw new ApiError(res.status, errorBody);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
