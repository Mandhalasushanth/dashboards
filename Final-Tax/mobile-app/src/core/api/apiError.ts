export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  code?: string;
  errors?: Record<string, string[]>;
  /** Seconds until a rate-limited / locked request may be retried (HTTP 429). */
  retryAfterSeconds?: number;
  /** Attempts left before the server locks the account, when it reports them. */
  remainingAttempts?: number;
}

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public errors?: Record<string, string[]>;
  public retryAfterSeconds?: number;
  public remainingAttempts?: number;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_SERVER_ERROR",
    errors?: Record<string, string[]>,
    limits?: { retryAfterSeconds?: number; remainingAttempts?: number },
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.retryAfterSeconds = limits?.retryAfterSeconds;
    this.remainingAttempts = limits?.remainingAttempts;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromError(err: unknown): ApiError {
    if (err instanceof ApiError) {
      return err;
    }
    if (err instanceof Error) {
      return new ApiError(err.message, 500, "UNKNOWN_ERROR");
    }
    return new ApiError("An unexpected error occurred", 500, "UNKNOWN_ERROR");
  }
}
