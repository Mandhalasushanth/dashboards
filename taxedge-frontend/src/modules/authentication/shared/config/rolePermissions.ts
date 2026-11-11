import { PERMISSIONS } from '../types/permission.types';
import { ROLES, type Role } from '../types/role.types';
import type { SessionUser } from '../types/session.types';

/**
 * What each role may do. The backend login returns only the role, so the session's permissions come from
 * here: the administrator gets the admin workspace, managers and agents the staff workspace of their team.
 */
export const ROLE_PERMISSION_SETS: Readonly<Record<Role, readonly string[]>> = Object.freeze({
  ADMIN: [PERMISSIONS.ADMIN_DASHBOARD_VIEW, 'USER_MANAGEMENT', 'CA_OPERATIONS_VIEW', 'LOAN_OPERATIONS_VIEW'],
  CA_MANAGER: [PERMISSIONS.STAFF_DASHBOARD_VIEW, 'CA_OPERATIONS_VIEW', 'CA_CASE_ASSIGN', 'TEAM_OVERSIGHT'],
  CA_AGENT: [PERMISSIONS.STAFF_DASHBOARD_VIEW, 'CA_OPERATIONS_VIEW', 'CA_CASE_UPDATE'],
  LOAN_MANAGER: [PERMISSIONS.STAFF_DASHBOARD_VIEW, 'LOAN_OPERATIONS_VIEW', 'LOAN_CASE_ASSIGN', 'TEAM_OVERSIGHT'],
  LOAN_AGENT: [PERMISSIONS.STAFF_DASHBOARD_VIEW, 'LOAN_OPERATIONS_VIEW', 'LOAN_CASE_UPDATE']
});

/** Plain-language names for the "Access granted" card; unknown codes fall back to the humanised code. */
export const PERMISSION_LABELS: Readonly<Record<string, string>> = Object.freeze({
  ADMIN_DASHBOARD_VIEW: 'Admin workspace',
  STAFF_DASHBOARD_VIEW: 'Staff workspace',
  USER_MANAGEMENT: 'Manage managers & agents',
  CA_OPERATIONS_VIEW: 'CA applications',
  LOAN_OPERATIONS_VIEW: 'Loan applications',
  CA_CASE_ASSIGN: 'Verify & assign CA work',
  LOAN_CASE_ASSIGN: 'Verify & assign loan work',
  TEAM_OVERSIGHT: 'Team workload',
  CA_CASE_UPDATE: 'Work on assigned CA cases',
  LOAN_CASE_UPDATE: 'Work on assigned loan cases'
});

const isRole = (value: unknown): value is Role => typeof value === 'string' && (ROLES as readonly string[]).includes(value);

/**
 * The session for a successful POST /auth/login. An unknown role is refused rather than treated as admin,
 * and "Signed in" is the moment of this sign-in (the backend's timestamps describe the account record).
 */
export function sessionUserFromLogin(data: Readonly<Record<string, unknown>>, typedUsername: string): SessionUser {
  if (!isRole(data.role)) {
    throw new Error('This account has no dashboard role. Contact your administrator.');
  }
  const username = String(data.username || data.email || typedUsername).trim().toLowerCase();
  return Object.freeze({
    id: (data.id ?? username) as number | string,
    username,
    displayName: String(data.fullName || username),
    role: data.role,
    permissions: Object.freeze([...ROLE_PERMISSION_SETS[data.role]]),
    lastLoginAt: new Date().toISOString()
  });
}
