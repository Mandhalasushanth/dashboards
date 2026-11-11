import type { StoredUser } from "../types/auth.types";
import { authService } from "./authService";
import { authStorage } from "./authStorage";
import {
  isIncompleteRegistration,
  registrationProgressService,
  type RegistrationLaunchDecision,
} from "./registrationProgressService";

/**
 * Launch-time check for a registration that was interrupted after OTP verification.
 *
 * Returns null when there is nothing to recover (the stored user is a completed customer, or there
 * is neither a placeholder session nor a verified-OTP record), so the normal launch flow runs.
 * Otherwise returns where to send the user. A placeholder session is never trusted as a login: it
 * is cleared here, and the user is resumed, sent to passcode login, or started over.
 */
export async function recoverIncompleteRegistration(
  user: StoredUser | null,
  activeMobile: string | null | undefined,
): Promise<RegistrationLaunchDecision | null> {
  if (user && !isIncompleteRegistration(user)) return null;

  const hasPlaceholderSession = Boolean(user);
  const progress = await registrationProgressService.get();
  if (!progress && !hasPlaceholderSession) return null;

  const decision = await registrationProgressService.resolveLaunch(
    (mobile) => authService.checkUser(mobile),
    user?.mobileNumber || activeMobile || undefined,
  );
  authStorage.clearSession();
  return decision;
}
