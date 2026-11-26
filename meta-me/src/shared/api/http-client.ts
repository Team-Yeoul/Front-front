import { syncAuthFromStorage, useAuthStore } from '@/store';
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
  /**
   * 이 계정으로 로그인돼 있을 때만 보낸다. 여러 요청으로 나뉜 작업이 도중에 계정이 바뀌어
   * 다른 계정으로 이어지지 않게 한다. 계정이 다르면 보내지 않고 오류를 던진다.
   */
  asUser?: string | null;
}

/**
 * Common request function every entity's api layer is built on.
 * Reads the access token from the zustand auth store, throws {@link ApiError}
 * on non-2xx responses using the backend's ErrorResponse shape.
 */
// refresh token별 진행 중인 갱신. 다른 세션(이전 계정)의 갱신 결과를 이어받지 않도록 토큰마다 따로 둔다.
const refreshing = new Map<string, Promise<boolean>>();

/**
 * 현재 refresh token으로 access token을 한 번 갱신한다. 같은 세션의 여러 요청이 동시에 401을 받아도 한 번만 시도한다.
 * 서버가 갱신을 거부하면 false, 네트워크 오류는 그대로 throw해서 일시적인 오류로 로그아웃되지 않게 한다.
 */
function refreshAccessToken(refreshToken: string | null): Promise<boolean> {
  if (!refreshToken) return Promise.resolve(false);
  const inFlight = refreshing.get(refreshToken);
  if (inFlight) return inFlight;
  const promise = (async () => {
    const res = await fetch(`${BASE_URL}/v1/auth/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      if (res.status >= 500) throw new ApiError(res.status, await res.json().catch(() => ({})));
      // 거부됐더라도 그사이 다른 세션(재로그인·다른 계정·다른 탭의 갱신)으로 바뀌었다면, 그 세션 기준으로 판단하게 맡긴다.
      return adoptNewerToken(refreshToken);
    }
    const data = (await res.json()) as components['schemas']['AuthResponse'];
    // 갱신하는 동안 로그아웃·탈퇴(또는 다른 계정 로그인)가 있었다면 그 세션을 되살리지 않는다.
    const current = useAuthStore.getState();
    if (current.refreshToken !== refreshToken) return !!current.accessToken;
    current.setAuth(data.access_token, data.refresh_token, data.user_id);
    return true;
  })().finally(() => {
    refreshing.delete(refreshToken);
  });
  refreshing.set(refreshToken, promise);
  return promise;
}

/**
 * 갱신이 거부됐을 때, 다른 탭이 같은 refresh token으로 먼저 갱신해서 폐기된 것인지 확인한다.
 * 그 탭이 새 토큰을 저장했으면 그걸 받아 쓰고 true. 저장이 조금 늦을 수 있어 한 번 더 기다려 본다.
 */
async function adoptNewerToken(usedRefreshToken: string): Promise<boolean> {
  for (const waitMs of [0, 1000]) {
    if (waitMs) await new Promise((r) => setTimeout(r, waitMs));
    await syncAuthFromStorage();
    const { refreshToken, accessToken } = useAuthStore.getState();
    if (refreshToken !== usedRefreshToken) return !!accessToken;
  }
  return false;
}

/** 요청 도중 로그아웃되거나 다른 계정으로 바뀌어, 이전 세션의 요청을 새 세션으로 이어가지 않고 중단할 때 던진다. */
function staleSessionError() {
  return new ApiError(401, { code: 'UNAUTHORIZED', message: '로그인 정보가 바뀌어 요청을 취소했습니다.' });
}

export function apiRequest<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { userId } = useAuthStore.getState();
  if (config.asUser !== undefined && config.asUser !== userId) return Promise.reject(staleSessionError());
  // 요청을 시작한 계정을 기억해 두고, 401 처리(재시도·로그아웃)는 같은 계정일 때만 한다.
  return send<T>(path, config, userId, false);
}

async function send<T>(path: string, config: RequestConfig, sessionUserId: string | null, retried: boolean): Promise<T> {
  const { method = 'GET', body, query, auth = true } = config;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const session = useAuthStore.getState();
  const token = auth ? session.accessToken : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}${buildQueryString(query)}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 로그인이 유지되는 동안 토큰이 만료되면 한 번 갱신해 재시도하고, 실패하면 로그아웃한다.
  if (res.status === 401 && auth) {
    const isSameSession = () => useAuthStore.getState().userId === sessionUserId;
    // 응답을 기다리는 사이 다른 계정으로 바뀌었다면, 이 요청을 새 계정으로 재전송하지도 새 세션을 지우지도 않는다.
    if (!isSameSession()) throw staleSessionError();

    if (!retried) {
      // 이 요청을 보낸 뒤 다른 요청(또는 다른 탭)이 이미 토큰을 갱신했다면, 다시 갱신하지 않고 새 토큰으로 재시도한다.
      // 탭마다 메모리에 토큰을 따로 들고 있어, 다른 탭이 저장한 최신 토큰을 먼저 가져온다.
      await syncAuthFromStorage();
      if (!isSameSession()) throw staleSessionError();
      const { accessToken: latest, refreshToken } = useAuthStore.getState();
      const shouldRetry = (latest && latest !== token) || (await refreshAccessToken(refreshToken));
      if (shouldRetry) {
        if (!isSameSession()) throw staleSessionError();
        return send<T>(path, config, sessionUserId, true);
      }
    }
    // 갱신이 거부됐거나 갱신한 토큰으로도 401이면 세션을 정리한다.
    // 단, 그 사이 토큰이 바뀌었다면(재로그인·다른 요청의 갱신) 지금 세션은 이 401과 무관하므로 지우지 않는다.
    const current = useAuthStore.getState();
    if (current.userId === sessionUserId && current.accessToken === token) current.clearAuth();
  }

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as Partial<ErrorResponse>;
    throw new ApiError(res.status, errorBody);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
