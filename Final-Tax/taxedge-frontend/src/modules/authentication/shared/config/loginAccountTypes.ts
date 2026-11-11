import type { Role, RoleTier } from '../types/role.types';
import { getRoleProfile } from '../../services/accessControlService';

/**
 * The one login page serves every account type, and the email ending says which one:
 * "...admin@gmail.com" signs in as an admin, "...manager@gmail.com" as a manager and
 * "...agent@gmail.com" as an agent. Whether a manager or agent is CA or Loan comes from
 * their account, so the backend's role picks the exact dashboard.
 */
export const LOGIN_EMAIL_ENDINGS: Readonly<Record<RoleTier, string>> = Object.freeze({
  ADMINISTRATOR: 'admin@gmail.com',
  MANAGER: 'manager@gmail.com',
  AGENT: 'agent@gmail.com'
});

export const LOGIN_EMAIL_ENDING_MESSAGE =
  'Use your work email ending in admin@gmail.com, manager@gmail.com or agent@gmail.com.';

/** The account type an email signs in as, or null when it has none of the three endings. */
export function tierForLoginEmail(email: string): RoleTier | null {
  const normalized = email.trim().toLowerCase();
  const match = (Object.entries(LOGIN_EMAIL_ENDINGS) as [RoleTier, string][]).find(([, ending]) =>
    normalized.endsWith(ending)
  );
  return match ? match[0] : null;
}

/** True when the signed-in role belongs to the account type the email ending names. */
export function roleMatchesLoginEmail(role: Role, email: string): boolean {
  return getRoleProfile(role).tier === tierForLoginEmail(email);
}
