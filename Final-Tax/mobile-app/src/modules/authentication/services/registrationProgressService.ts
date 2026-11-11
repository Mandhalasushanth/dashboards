import { secureStorage } from "../../../core/storage/secureStorage";
import type { StoredUser } from "../types/auth.types";

const KEY_REGISTRATION_PROGRESS = "registration_progress";

/**
 * Upper bound on how long a verified-but-unregistered number may be resumed. The server's proof
 * (30 minutes by default, `finsolz.registration-proof.ttl`) normally ends it sooner; the proof's
 * own expiry time is what decides.
 */
export const REGISTRATION_RESUME_WINDOW_MS = 30 * 60 * 1000;

/** Tolerated device-clock skew when judging a stored timestamp. */
const CLOCK_SKEW_MS = 5 * 60 * 1000;

export interface RegistrationProgress {
  mobile: string;
  /** OTP verified for a number that has no customer record yet: profile and passcode are still to do. */
  stage: "OTP_VERIFIED";
  verifiedAt: number;
  /** The server-issued single-use proof that must accompany registration. Never log it. */
  proof: string;
  /** Epoch ms at which the server stops accepting the proof. */
  proofExpiresAt: number;
}

/** What the app should do at launch for a user who may be part-way through registration. */
export type RegistrationLaunchDecision =
  | { kind: "RESUME_PROFILE"; mobile: string }
  | { kind: "PASSCODE_LOGIN"; mobile: string }
  | { kind: "RESTART" };

/**
 * True for a user record that is only the placeholder created when an OTP was verified for a new
 * number (no customer id, no profile, no passcode). Mirrors the completeness rule in the auth store.
 */
export function isIncompleteRegistration(user: StoredUser | null | undefined): boolean {
  if (!user) return false;
  const complete = Boolean(
    user.registrationCompleted ||
      user.profileCompleted ||
      (user.customerId && user.customerId.trim() !== "") ||
      (user.passcode && user.passcode.length === 6),
  );
  return !complete;
}

/**
 * Remembers, on the device, that a new number passed OTP verification so a restart can resume the
 * registration form. It is only a hint: at launch it is checked against the backend (is there a
 * customer for this number yet?) and against an expiry, and it never grants a logged-in session.
 */
class RegistrationProgressService {
  async markOtpVerified(mobile: string, proof: string, expiresInSeconds?: number): Promise<void> {
    const clean = (mobile || "").replace(/\D/g, "");
    if (!clean || !proof) return;
    const verifiedAt = Date.now();
    const ttlMs = expiresInSeconds && expiresInSeconds > 0 ? expiresInSeconds * 1000 : REGISTRATION_RESUME_WINDOW_MS;
    const progress: RegistrationProgress = {
      mobile: clean,
      stage: "OTP_VERIFIED",
      verifiedAt,
      proof,
      proofExpiresAt: verifiedAt + Math.min(ttlMs, REGISTRATION_RESUME_WINDOW_MS),
    };
    await secureStorage.setItem(KEY_REGISTRATION_PROGRESS, JSON.stringify(progress));
  }

  /** The registration proof for this number, if one is stored and still within its lifetime. */
  async getProof(mobile: string): Promise<string | null> {
    const progress = await this.get();
    const clean = (mobile || "").replace(/\D/g, "");
    return progress && progress.mobile === clean ? progress.proof : null;
  }

  /** The stored progress, or null when absent, malformed, expired or from the future (clock change). */
  async get(): Promise<RegistrationProgress | null> {
    const raw = await secureStorage.getItem(KEY_REGISTRATION_PROGRESS);
    if (!raw) return null;

    let parsed: Partial<RegistrationProgress> | null = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    const now = Date.now();
    const valid =
      parsed !== null &&
      parsed.stage === "OTP_VERIFIED" &&
      typeof parsed.mobile === "string" &&
      /^\d{10}$/.test(parsed.mobile) &&
      typeof parsed.verifiedAt === "number" &&
      typeof parsed.proof === "string" &&
      parsed.proof.length > 0 &&
      typeof parsed.proofExpiresAt === "number" &&
      parsed.verifiedAt <= now + CLOCK_SKEW_MS &&
      now - parsed.verifiedAt <= REGISTRATION_RESUME_WINDOW_MS &&
      now < parsed.proofExpiresAt;
    if (!valid || !parsed) {
      await this.clear();
      return null;
    }
    return {
      mobile: parsed.mobile as string,
      stage: "OTP_VERIFIED",
      verifiedAt: parsed.verifiedAt as number,
      proof: parsed.proof as string,
      proofExpiresAt: parsed.proofExpiresAt as number,
    };
  }

  async clear(): Promise<void> {
    await secureStorage.removeItem(KEY_REGISTRATION_PROGRESS);
  }

  /**
   * Decides where a launch with no completed login should go.
   * - backend already has a customer for the number -> normal passcode login
   * - no customer, and a fresh OTP verification on record -> resume the profile/passcode form
   * - anything else (no record, expired, backend unreachable) -> start over; nothing is trusted
   */
  async resolveLaunch(
    checkCustomerExists: (mobile: string) => Promise<{ success: boolean; customerExists: boolean }>,
    fallbackMobile?: string,
  ): Promise<RegistrationLaunchDecision> {
    const progress = await this.get();
    const mobile = progress?.mobile || (fallbackMobile || "").replace(/\D/g, "");
    if (!/^\d{10}$/.test(mobile)) return { kind: "RESTART" };

    let lookup: { success: boolean; customerExists: boolean };
    try {
      lookup = await checkCustomerExists(mobile);
    } catch {
      return { kind: "RESTART" };
    }
    if (!lookup.success) return { kind: "RESTART" };

    if (lookup.customerExists) {
      await this.clear();
      return { kind: "PASSCODE_LOGIN", mobile };
    }
    if (progress) return { kind: "RESUME_PROFILE", mobile };
    return { kind: "RESTART" };
  }
}

export const registrationProgressService = new RegistrationProgressService();
export default registrationProgressService;
