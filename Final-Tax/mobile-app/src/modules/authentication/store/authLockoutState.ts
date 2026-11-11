import type { AuthFlowState, AuthState } from "../types/auth.types";

interface OtpRefusal {
  message?: string;
  code?: string;
  retryAfterSeconds?: number;
  lockedUntil?: number;
}

/**
 * State changes for a refused OTP request or verification.
 * - A verification lockout is shown by the live countdown once a code form is on screen; on the
 *   mobile-number step there is no such form, so the error banner carries the message instead.
 * - A resend rate limit restarts the resend timer at the server's retry time.
 */
export function otpRefusalPatch(flow: AuthFlowState, res: OtpRefusal, fallback: string): Partial<AuthState> {
  if (res.code === "OTP_LOCKED" && res.lockedUntil !== undefined) {
    return {
      otpLockoutUntil: res.lockedUntil,
      error: flow === "ENTER_MOBILE" ? res.message || fallback : null,
    };
  }
  if (res.code === "OTP_RESEND_LIMITED" && res.retryAfterSeconds !== undefined) {
    return { otpTimer: res.retryAfterSeconds, canResendOTP: false, error: res.message || fallback };
  }
  return { error: res.message || fallback };
}

/**
 * Clears what the login screens *show* about past failures: the error banner, the lockout
 * countdowns and any half-typed passcode. It deliberately does not touch the stored lockout
 * (device cache or server): a genuine lockout is re-read from there when the passcode screen
 * is next shown, while a stale one has already expired and is dropped by that same read.
 */
export function loginPresentationResetPatch(): Partial<AuthState> {
  return { error: null, otpLockoutUntil: null, passcodeLockoutUntil: null, passcode: "" };
}

/** State changes for a failed passcode login: a lockout is shown by the countdown, not the banner. */
export function passcodeFailurePatch(
  res: { error?: string; lockedUntil?: number },
  fallback: string,
): Partial<AuthState> {
  if (res.lockedUntil !== undefined) {
    return { passcodeLockoutUntil: res.lockedUntil, error: null };
  }
  return { error: res.error || fallback };
}
