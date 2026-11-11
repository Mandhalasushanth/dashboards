import { environment } from '../config/environment';
import { ApiError, createClientError, createHttpError, isApiError, type ApiErrorCode } from './apiError';

/**
 * Cookie-session HTTP client. The session id lives in an HttpOnly cookie the browser sends
 * automatically; state-changing requests echo the XSRF-TOKEN cookie in the X-XSRF-TOKEN header.
 */
const XSRF_COOKIE_NAME = 'XSRF-TOKEN';
const XSRF_HEADER_NAME = 'X-XSRF-TOKEN';
const SAFE_METHODS: ReadonlySet<string> = new Set(['GET', 'HEAD', 'OPTIONS']);
const SESSION_LOSS_CODES: ReadonlySet<ApiErrorCode> = new Set<ApiErrorCode>(['UNAUTHENTICATED', 'ACCOUNT_INACTIVE']);

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type SessionLossListener = (error: ApiError) => void;

export interface RequestOptions {
  /** Set to false for calls (such as login) where a 401/403 is an expected answer, not a lost session. */
  readonly notifySessionLoss?: boolean;
}

const sessionLossListeners = new Set<SessionLossListener>();

/** Registers a callback fired when any request reports the session has ended. Returns an unsubscribe function. */
export function onSessionLoss(listener: SessionLossListener): () => void {
  sessionLossListeners.add(listener);
  return () => {
    sessionLossListeners.delete(listener);
  };
}

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const match = document.cookie.split('; ').find((entry) => entry.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

/** True once the server has issued the CSRF cookie required for state-changing requests. */
export function hasCsrfToken(): boolean {
  return readCookie(XSRF_COOKIE_NAME) !== null;
}

function buildHeaders(method: HttpMethod, hasJsonBody: boolean): Headers {
  const headers = new Headers({ Accept: 'application/json' });
  if (hasJsonBody) {
    headers.set('Content-Type', 'application/json');
  }
  const xsrfToken = SAFE_METHODS.has(method) ? null : readCookie(XSRF_COOKIE_NAME);
  if (xsrfToken) {
    headers.set(XSRF_HEADER_NAME, xsrfToken);
  }
  return headers;
}

async function parsePayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    throw createHttpError(response.status >= 400 ? response.status : 502, null);
  }
}

/** Unwraps the backend's { success, message, data } envelope when present. */
function unwrapEnvelope<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function toApiError(error: unknown, timedOut: boolean): ApiError {
  if (isApiError(error)) {
    return error;
  }
  if (timedOut) {
    return createClientError('TIMEOUT');
  }
  return createClientError('NETWORK_ERROR');
}

function notifySessionLoss(error: ApiError, options: RequestOptions): void {
  if (options.notifySessionLoss !== false && SESSION_LOSS_CODES.has(error.code)) {
    sessionLossListeners.forEach((listener) => listener(error));
  }
}

async function request<T>(method: HttpMethod, path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), environment.apiTimeoutMs);
  const hasBody = body !== undefined;
  // Multipart bodies let the browser set the boundary header itself.
  const isFormData = body instanceof FormData;

  try {
    const response = await fetch(`${environment.apiBaseUrl}${path}`, {
      method,
      credentials: 'include',
      cache: 'no-store',
      headers: buildHeaders(method, hasBody && !isFormData),
      body: isFormData ? body : hasBody ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });
    const payload = await parsePayload(response);
    if (!response.ok) {
      throw createHttpError(response.status, payload);
    }
    return unwrapEnvelope<T>(payload);
  } catch (error) {
    const apiError = toApiError(error, controller.signal.aborted);
    notifySessionLoss(apiError, options);
    throw apiError;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export const apiClient = Object.freeze({
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, body ?? {}, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, body ?? {}, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PATCH', path, body ?? {}, options),
  upload: <T>(path: string, form: FormData, options?: RequestOptions) => request<T>('POST', path, form, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, undefined, options)
});
