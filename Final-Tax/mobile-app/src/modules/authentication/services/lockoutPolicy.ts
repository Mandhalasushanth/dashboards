/** Mirror of the server's passcode lockout. The server is authoritative; this is the local cache. */
export const PASSCODE_MAX_FAILED_ATTEMPTS = 5;
export const PASSCODE_LOCKOUT_DURATION_MS = 15 * 60 * 1000;

/**
 * A stored lockout further away than this is not trusted (clock changed, corrupted value) and is
 * dropped so the server decides. Slightly above the longest lockout the server imposes.
 */
export const MAX_TRUSTED_LOCKOUT_MS = PASSCODE_LOCKOUT_DURATION_MS + 60 * 1000;

export type LockoutKind = "otp-verify" | "otp-resend" | "passcode";

/** Whole seconds left until `untilMs`, rounded up, never negative. */
export function secondsUntil(untilMs: number, now: number = Date.now()): number {
  return Math.max(0, Math.ceil((untilMs - now) / 1000));
}

/** "0:30", "14:32" or "1:02:03" for a number of seconds. */
export function formatCountdown(totalSeconds: number): string {
  const total = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const ss = seconds < 10 ? `0${seconds}` : String(seconds);
  if (hours > 0) {
    const mm = minutes < 10 ? `0${minutes}` : String(minutes);
    return `${hours}:${mm}:${ss}`;
  }
  return `${minutes}:${ss}`;
}

/** User-facing text for a lockout / rate limit with `remainingSeconds` left. */
export function lockoutMessage(kind: LockoutKind, remainingSeconds: number): string {
  const wait = formatCountdown(remainingSeconds);
  switch (kind) {
    case "otp-verify":
      return `Too many incorrect OTP attempts. Try again in ${wait}.`;
    case "otp-resend":
      return `Too many OTP requests. Try again in ${wait}.`;
    case "passcode":
      return `Too many incorrect passcode attempts. Try again in ${wait}.`;
  }
}
