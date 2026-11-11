import { secureStorage } from "../../../core/storage/secureStorage";
import { MAX_TRUSTED_LOCKOUT_MS, secondsUntil } from "./lockoutPolicy";

const KEY_OTP_LOCKOUT_UNTIL = "otp_lockout_until_";

export interface OtpLockoutState {
  isLocked: boolean;
  remainingSeconds: number;
  /** Absolute epoch ms when the lock ends; 0 when not locked. */
  lockedUntil: number;
}

const NOT_LOCKED: OtpLockoutState = { isLocked: false, remainingSeconds: 0, lockedUntil: 0 };

/**
 * Device-side copy of the server's OTP verification lockout, stored as an absolute end time so it
 * survives app restarts. It only saves a pointless request and keeps the countdown accurate: the
 * server enforces the lock regardless of what is stored here.
 */
class OtpLockoutService {
  private clean(mobile: string): string {
    return (mobile || "").replace(/\D/g, "");
  }

  async check(mobile: string): Promise<OtpLockoutState> {
    const cleanMobile = this.clean(mobile);
    if (!cleanMobile) return NOT_LOCKED;

    const raw = await secureStorage.getItem(`${KEY_OTP_LOCKOUT_UNTIL}${cleanMobile}`);
    if (!raw) return NOT_LOCKED;

    const lockedUntil = parseInt(raw, 10);
    const now = Date.now();
    if (Number.isFinite(lockedUntil) && lockedUntil > now && lockedUntil - now <= MAX_TRUSTED_LOCKOUT_MS) {
      return { isLocked: true, remainingSeconds: secondsUntil(lockedUntil, now), lockedUntil };
    }

    await secureStorage.removeItem(`${KEY_OTP_LOCKOUT_UNTIL}${cleanMobile}`);
    return NOT_LOCKED;
  }

  async lockFor(mobile: string, retryAfterSeconds: number): Promise<number> {
    const lockedUntil = Date.now() + Math.max(0, retryAfterSeconds) * 1000;
    const cleanMobile = this.clean(mobile);
    if (cleanMobile) {
      await secureStorage.setItem(`${KEY_OTP_LOCKOUT_UNTIL}${cleanMobile}`, String(lockedUntil));
    }
    return lockedUntil;
  }

  async clear(mobile: string): Promise<void> {
    const cleanMobile = this.clean(mobile);
    if (cleanMobile) {
      await secureStorage.removeItem(`${KEY_OTP_LOCKOUT_UNTIL}${cleanMobile}`);
    }
  }
}

export const otpLockoutService = new OtpLockoutService();
export default otpLockoutService;
