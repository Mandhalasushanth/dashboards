/** Error codes shared with the backend contract, plus client-side transport failures. */
export type ApiErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_INACTIVE'
  | 'TOO_MANY_ATTEMPTS'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'VALIDATION_FAILED'
  | 'INVALID_RESPONSE'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

const KNOWN_CODES: ReadonlySet<string> = new Set<ApiErrorCode>([
  'INVALID_CREDENTIALS',
  'ACCOUNT_INACTIVE',
  'TOO_MANY_ATTEMPTS',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'VALIDATION_FAILED',
  'INVALID_RESPONSE',
  'NETWORK_ERROR',
  'TIMEOUT',
  'SERVER_ERROR',
  'UNKNOWN'
]);

const STATUS_FALLBACK_CODES: Readonly<Record<number, ApiErrorCode>> = Object.freeze({
  400: 'VALIDATION_FAILED',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  429: 'TOO_MANY_ATTEMPTS'
});

const DEFAULT_MESSAGES: Readonly<Record<ApiErrorCode, string>> = Object.freeze({
  INVALID_CREDENTIALS: 'Invalid username or password.',
  ACCOUNT_INACTIVE: 'Your account is inactive. Please contact your administrator.',
  TOO_MANY_ATTEMPTS: 'Too many failed sign-in attempts. Please wait and try again.',
  UNAUTHENTICATED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  VALIDATION_FAILED: 'Some details are invalid. Please review and try again.',
  INVALID_RESPONSE: 'The server returned an unexpected response. Please try again.',
  NETWORK_ERROR: 'Unable to reach the server. Check your connection and try again.',
  TIMEOUT: 'The server took too long to respond. Please try again.',
  SERVER_ERROR: 'Something went wrong on our side. Please try again shortly.',
  UNKNOWN: 'Something went wrong. Please try again.'
});

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

export function defaultMessageFor(code: ApiErrorCode): string {
  return DEFAULT_MESSAGES[code];
}

function readField(payload: unknown, field: string): string | undefined {
  if (payload && typeof payload === 'object' && field in payload) {
    const value = (payload as Record<string, unknown>)[field];
    return typeof value === 'string' && value.trim() ? value : undefined;
  }
  return undefined;
}

function resolveCode(status: number, payload: unknown): ApiErrorCode {
  const serverCode = readField(payload, 'errorCode') ?? readField(payload, 'code');
  if (serverCode && KNOWN_CODES.has(serverCode)) {
    return serverCode as ApiErrorCode;
  }
  return STATUS_FALLBACK_CODES[status] ?? (status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN');
}

/** Builds an ApiError from a non-2xx response, preferring the server's code and message. */
export function createHttpError(status: number, payload: unknown): ApiError {
  const code = resolveCode(status, payload);
  const message = status >= 500 ? defaultMessageFor(code) : readField(payload, 'message') ?? defaultMessageFor(code);
  return new ApiError(code, message, status);
}

export function createClientError(code: ApiErrorCode): ApiError {
  return new ApiError(code, defaultMessageFor(code));
}
