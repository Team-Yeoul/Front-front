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
export async function apiRequest<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { method = 'GET', body, query, auth = true } = config;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = useAuthStore.getState().accessToken;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}${buildQueryString(query)}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as Partial<ErrorResponse>;
    throw new ApiError(res.status, errorBody);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
