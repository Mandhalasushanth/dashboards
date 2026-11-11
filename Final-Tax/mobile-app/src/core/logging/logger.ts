export type LogLevel = "debug" | "info" | "warn" | "error";

const SENSITIVE_KEY_REGEX =
  /^(password|passcode|newpasscode|oldpasscode|otp|otpcode|accesstoken|refreshtoken|token|authorization|pan|aadhaar|adhar|accountnumber|bankaccount|cardnumber|cvv|secret|cookie|pin)$/i;

const JWT_REGEX =
  /^eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+$/;

const BEARER_REGEX = /^Bearer\s+[A-Za-z0-9\-._~+/]+=*/i;

/**
 * Recursively sanitizes any value, masking PII, passwords, OTPs, tokens, PAN, Aadhaar, etc.
 * Handles circular references, Errors, Arrays, and nested objects.
 */
export function sanitizeLogPayload(value: unknown, seen = new WeakSet<object>(), depth = 0): unknown {
  if (depth > 8) {
    return "[MAX_DEPTH_REACHED]";
  }

  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    if (BEARER_REGEX.test(value)) {
      return "Bearer [REDACTED]";
    }
    if (JWT_REGEX.test(value)) {
      return "[JWT_REDACTED]";
    }
    return value;
  }

  if (typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return "[CIRCULAR]";
  }
  seen.add(value);

  if (value instanceof Error) {
    const errorObj: Record<string, unknown> = {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
    for (const key of Object.getOwnPropertyNames(value)) {
      if (!errorObj[key]) {
        errorObj[key] = (value as unknown as Record<string, unknown>)[key];
      }
    }
    return sanitizeLogPayload(errorObj, seen, depth + 1);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogPayload(item, seen, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    if (SENSITIVE_KEY_REGEX.test(key)) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = sanitizeLogPayload(val, seen, depth + 1);
    }
  }

  return sanitized;
}

class LoggerService {
  private isDevelopment = process.env.NODE_ENV !== "production";

  debug(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      const sanitized = args.map((arg) => sanitizeLogPayload(arg));
      console.log(`[DEBUG] ${message}`, ...sanitized);
    }
  }

  info(message: string, ...args: unknown[]): void {
    const sanitized = args.map((arg) => sanitizeLogPayload(arg));
    console.log(`[INFO] ${message}`, ...sanitized);
  }

  warn(message: string, ...args: unknown[]): void {
    const sanitized = args.map((arg) => sanitizeLogPayload(arg));
    console.warn(`[WARN] ${message}`, ...sanitized);
  }

  error(message: string, error?: unknown, ...args: unknown[]): void {
    const sanitizedError = error !== undefined ? sanitizeLogPayload(error) : undefined;
    const sanitizedArgs = args.map((arg) => sanitizeLogPayload(arg));
    if (sanitizedError !== undefined) {
      console.error(`[ERROR] ${message}`, sanitizedError, ...sanitizedArgs);
    } else {
      console.error(`[ERROR] ${message}`, ...sanitizedArgs);
    }
  }
}

export const logger = new LoggerService();
export default logger;

