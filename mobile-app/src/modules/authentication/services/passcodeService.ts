import { secureStorage } from "../../../core/storage/secureStorage";
import { apiClient } from "../../../core/api/apiClient";
import { tokenManager } from "../../../core/authentication/tokenManager";
import { authStorage } from "./authStorage";
import type { DevUser } from "../types/auth.types";
import type { CustomerLoginResponse } from "./authApi";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { ApiError } from "../../../core/api/apiError";
import {
  MAX_TRUSTED_LOCKOUT_MS,
  PASSCODE_LOCKOUT_DURATION_MS,
  PASSCODE_MAX_FAILED_ATTEMPTS,
  lockoutMessage,
  secondsUntil,
} from "./lockoutPolicy";

const KEY_PREFIX = "passcode_";
const KEY_FAILED_ATTEMPTS = "passcode_failed_attempts_";
const KEY_LOCKOUT_UNTIL = "passcode_lockout_until_";

const MAX_FAILED_ATTEMPTS = PASSCODE_MAX_FAILED_ATTEMPTS;
const LOCKOUT_DURATION_MS = PASSCODE_LOCKOUT_DURATION_MS;

export interface PasscodeVerificationResult {
  success: boolean;
  error?: string;
  isLockedOut?: boolean;
  lockoutRemainingSeconds?: number;
  /** Epoch ms at which the lockout ends (set together with `isLockedOut`). */
  lockedUntil?: number;
  user?: DevUser;
  token?: string;
}

/** What `POST /customer/login` said about a passcode. */
type BackendLoginOutcome =
  | { kind: "success"; result: PasscodeVerificationResult }
  | { kind: "locked"; result: PasscodeVerificationResult }
  | { kind: "rejected"; remainingAttempts?: number };

class PasscodeService {
  private clean(mobile: string): string {
    return (mobile || "").replace(/\D/g, "");
  }

  /**
   * Check if a lockout is currently active for this mobile number
   */
  async checkLockout(mobile: string): Promise<{ isLocked: boolean; remainingSeconds: number; lockedUntil: number }> {
    const cleanMobile = this.clean(mobile);
    if (!cleanMobile) return { isLocked: false, remainingSeconds: 0, lockedUntil: 0 };

    const lockoutStr = await secureStorage.getItem(`${KEY_LOCKOUT_UNTIL}${cleanMobile}`);
    if (!lockoutStr) return { isLocked: false, remainingSeconds: 0, lockedUntil: 0 };

    const lockoutUntil = parseInt(lockoutStr, 10);
    const now = Date.now();
    // A lock further away than any the server imposes means the clock moved or the value is bad:
    // drop it and let the server decide.
    if (Number.isFinite(lockoutUntil) && lockoutUntil > now && lockoutUntil - now <= MAX_TRUSTED_LOCKOUT_MS) {
      return { isLocked: true, remainingSeconds: secondsUntil(lockoutUntil, now), lockedUntil: lockoutUntil };
    }

    // Lockout expired; clear lockout record
    await secureStorage.removeItem(`${KEY_LOCKOUT_UNTIL}${cleanMobile}`);
    await secureStorage.removeItem(`${KEY_FAILED_ATTEMPTS}${cleanMobile}`);
    return { isLocked: false, remainingSeconds: 0, lockedUntil: 0 };
  }

  /** Remembers a lockout the server imposed so the countdown survives an app restart. */
  private async lockFor(cleanMobile: string, retryAfterSeconds: number): Promise<number> {
    const lockedUntil = Date.now() + Math.max(0, retryAfterSeconds) * 1000;
    await secureStorage.setItem(`${KEY_LOCKOUT_UNTIL}${cleanMobile}`, String(lockedUntil));
    await secureStorage.setItem(`${KEY_FAILED_ATTEMPTS}${cleanMobile}`, String(MAX_FAILED_ATTEMPTS));
    return lockedUntil;
  }

  /**
   * Record a failed passcode attempt and trigger lockout if limit reached
   */
  async recordFailedAttempt(mobile: string): Promise<{ isLocked: boolean; remainingSeconds: number; lockedUntil: number; remainingAttempts: number }> {
    const cleanMobile = this.clean(mobile);
    const attemptsStr = await secureStorage.getItem(`${KEY_FAILED_ATTEMPTS}${cleanMobile}`);
    const attempts = (attemptsStr ? parseInt(attemptsStr, 10) : 0) + 1;

    if (attempts >= MAX_FAILED_ATTEMPTS) {
      const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      await secureStorage.setItem(`${KEY_LOCKOUT_UNTIL}${cleanMobile}`, String(lockedUntil));
      await secureStorage.setItem(`${KEY_FAILED_ATTEMPTS}${cleanMobile}`, String(attempts));
      return {
        isLocked: true,
        remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
        lockedUntil,
        remainingAttempts: 0,
      };
    }

    await secureStorage.setItem(`${KEY_FAILED_ATTEMPTS}${cleanMobile}`, String(attempts));
    return { isLocked: false, remainingSeconds: 0, lockedUntil: 0, remainingAttempts: MAX_FAILED_ATTEMPTS - attempts };
  }

  /**
   * Reset failed attempt counters on successful passcode entry
   */
  async resetFailedAttempts(mobile: string): Promise<void> {
    const cleanMobile = this.clean(mobile);
    await secureStorage.removeItem(`${KEY_FAILED_ATTEMPTS}${cleanMobile}`);
    await secureStorage.removeItem(`${KEY_LOCKOUT_UNTIL}${cleanMobile}`);
  }

  /**
   * Check whether a passcode is configured in SecureStore for this mobile number
   */
  async hasPasscode(mobile: string): Promise<boolean> {
    const cleanMobile = this.clean(mobile);
    if (!cleanMobile) return false;
    const stored = await secureStorage.getItem(`${KEY_PREFIX}${cleanMobile}`);
    return Boolean(stored && stored.length === 6);
  }

  /**
   * Save passcode securely in SecureStore (never in AsyncStorage)
   */
  async setPasscode(mobile: string, passcode: string): Promise<boolean> {
    const cleanMobile = this.clean(mobile);
    const cleanPasscode = (passcode || "").replace(/\D/g, "");
    if (cleanMobile.length !== 10 || cleanPasscode.length !== 6) {
      return false;
    }
    await secureStorage.setItem(`${KEY_PREFIX}${cleanMobile}`, cleanPasscode);
    await this.resetFailedAttempts(cleanMobile);
    return true;
  }

  /**
   * Remove passcode from SecureStore
   */
  async removePasscode(mobile: string): Promise<void> {
    const cleanMobile = this.clean(mobile);
    if (cleanMobile) {
      await secureStorage.removeItem(`${KEY_PREFIX}${cleanMobile}`);
      await secureStorage.removeItem(`${KEY_FAILED_ATTEMPTS}${cleanMobile}`);
      await secureStorage.removeItem(`${KEY_LOCKOUT_UNTIL}${cleanMobile}`);
    }
  }

  /** Stores the access and refresh tokens from a login response, when present. */
  private async persistAuthTokens(response?: { accessToken?: string; refreshToken?: string } | null): Promise<void> {
    if (response?.accessToken) {
      await tokenManager.setAccessToken(response.accessToken);
    }
    if (response?.refreshToken) {
      await tokenManager.setRefreshToken(response.refreshToken);
    }
  }

  /** Fire-and-forget re-login after an offline unlock, so backend tokens stay fresh. */
  private refreshSessionInBackground(cleanMobile: string, cleanPasscode: string): void {
    apiClient
      .post<CustomerLoginResponse>("/customer/login", {
        mobileNumber: cleanMobile,
        password: cleanPasscode,
      })
      .then(async (response) => {
        await this.persistAuthTokens(response);
      })
      .catch((err) => {
        logger.debug("[PasscodeService] Background session refresh failed", { error: getErrorMessage(err) });
      });
  }

  /**
   * Authenticates against `POST /customer/login`. On success stores tokens and the passcode
   * for future offline unlocks; returns null when the backend rejects or is unreachable.
   */
  private async loginWithBackend(
    cleanMobile: string,
    cleanPasscode: string
  ): Promise<BackendLoginOutcome | null> {
    try {
      const response = await apiClient.post<CustomerLoginResponse>("/customer/login", {
        mobileNumber: cleanMobile,
        password: cleanPasscode,
      });

      if (response && (response.accessToken || response.custId)) {
        // Backend authentication succeeded
        await this.persistAuthTokens(response);

        // Save passcode locally in SecureStore for subsequent quick unlocks
        await this.setPasscode(cleanMobile, cleanPasscode);
        await this.resetFailedAttempts(cleanMobile);

        const devUser: DevUser = {
          customerId: response.custId || "",
          mobileNumber: response.mobileNumber || cleanMobile,
          name: response.name || "",
          email: `${cleanMobile}@finsolz.in`,
          customerType: "Individual",
          registrationCompleted: true,
        };

        return {
          kind: "success",
          result: {
            success: true,
            token: response.accessToken,
            user: devUser,
          },
        };
      }
    } catch (apiError) {
      if (apiError instanceof ApiError && apiError.statusCode === 429) {
        // The server has locked this account: honour its duration, not a local guess.
        const retryAfter = apiError.retryAfterSeconds ?? Math.ceil(LOCKOUT_DURATION_MS / 1000);
        const lockedUntil = await this.lockFor(cleanMobile, retryAfter);
        return {
          kind: "locked",
          result: {
            success: false,
            isLockedOut: true,
            lockoutRemainingSeconds: retryAfter,
            lockedUntil,
            error: lockoutMessage("passcode", retryAfter),
          },
        };
      }
      if (apiError instanceof ApiError && apiError.statusCode === 401) {
        return { kind: "rejected", remainingAttempts: apiError.remainingAttempts };
      }
      // Network error or other failure: fall through, the caller treats it as a failed attempt
    }

    return null;
  }

  /**
   * Verify passcode:
   * First checks lockout state.
   * If local passcode matches OR backend POST /customer/login succeeds, authorizes session.
   */
  async verifyPasscode(mobile: string, passcode: string): Promise<PasscodeVerificationResult> {
    const cleanMobile = this.clean(mobile);
    const cleanPasscode = (passcode || "").replace(/\D/g, "");

    if (cleanMobile.length !== 10) {
      return { success: false, error: "Please enter a valid 10-digit mobile number" };
    }
    if (cleanPasscode.length !== 6) {
      return { success: false, error: "Passcode must be exactly 6 numeric digits" };
    }

    // 1. Lockout check
    const lockout = await this.checkLockout(cleanMobile);
    if (lockout.isLocked) {
      return {
        success: false,
        isLockedOut: true,
        lockoutRemainingSeconds: lockout.remainingSeconds,
        lockedUntil: lockout.lockedUntil,
        error: lockoutMessage("passcode", lockout.remainingSeconds),
      };
    }

    // 2. Check local SecureStore passcode first (fast, secure, offline-first unlock)
    const localPasscode = await secureStorage.getItem(`${KEY_PREFIX}${cleanMobile}`);
    if (localPasscode && localPasscode === cleanPasscode) {
      await this.resetFailedAttempts(cleanMobile);
      const user = authStorage.getUserByMobile(cleanMobile);
      const existingToken = await tokenManager.getAccessToken();

      // Refresh backend session in background if possible
      this.refreshSessionInBackground(cleanMobile, cleanPasscode);

      return {
        success: true,
        token: existingToken || undefined,
        user: user || undefined,
      };
    }

    // 3. If not matched locally or first time on device, authenticate with backend POST /customer/login
    const backendResult = await this.loginWithBackend(cleanMobile, cleanPasscode);
    if (backendResult?.kind === "success" || backendResult?.kind === "locked") {
      return backendResult.result;
    }

    // Passcode incorrect
    const attemptInfo = await this.recordFailedAttempt(cleanMobile);
    if (attemptInfo.isLocked) {
      return {
        success: false,
        isLockedOut: true,
        lockoutRemainingSeconds: attemptInfo.remainingSeconds,
        lockedUntil: attemptInfo.lockedUntil,
        error: lockoutMessage("passcode", attemptInfo.remainingSeconds),
      };
    }

    // The server's count is authoritative when it reports one.
    const remaining =
      backendResult?.kind === "rejected" && backendResult.remainingAttempts !== undefined
        ? backendResult.remainingAttempts
        : attemptInfo.remainingAttempts;
    return {
      success: false,
      error: `Incorrect passcode. ${remaining} attempt(s) remaining.`,
    };
  }
}

export const passcodeService = new PasscodeService();
export default passcodeService;
