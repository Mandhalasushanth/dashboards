import { ApiError, defaultMessageFor, type ApiErrorCode } from '@/core/api';
import type { AuthenticationGateway, LoginCredentials } from '../shared/types/authentication.types';
import type { SessionUser } from '../shared/types/session.types';
import { DEMO_ACCOUNTS, ROLE_PERMISSIONS, type DemoAccount } from './demoAccounts';
import { deriveDisplayNameFromUsername } from '../shared/utils/displayNameUtils';

/**
 * DEVELOPMENT ONLY. Mirrors the backend contract (hash check, inactive accounts, lockout,
 * error codes) so the UI can be exercised before the API exists.
 */
/** Sign-in only, so the "Signing in…" state can be seen; session checks answer immediately. */
const SIMULATED_SIGN_IN_LATENCY_MS = 400;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60_000;
const SESSION_STORAGE_KEY = 'taxedge.demo.session';
const TIMING_EQUALIZER_SALT = 'timing-equalizer';

interface FailureRecord {
  readonly count: number;
  readonly lockedUntil: number;
}

const failures = new Map<string, FailureRecord>();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function fail(code: ApiErrorCode, status: number): never {
  throw new ApiError(code, defaultMessageFor(code), status);
}

async function hashPassword(salt: string, password: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${password}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

const ACCOUNT_OVERRIDES_STORAGE_KEY = 'taxedge.demo.account.overrides';

interface StoredAccountOverride {
  username?: string;
  passwordHash?: string;
  salt?: string;
}

function readAccountOverrides(): Record<string, StoredAccountOverride> {
  try {
    const raw = window.sessionStorage.getItem(ACCOUNT_OVERRIDES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredAccountOverride>) : {};
  } catch {
    return {};
  }
}

function writeAccountOverrides(overrides: Record<string, StoredAccountOverride>): void {
  try {
    window.sessionStorage.setItem(ACCOUNT_OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // Storage can be unavailable in private mode
  }
}

function toSessionUser(account: DemoAccount): SessionUser {
  return Object.freeze({
    id: account.id,
    username: account.username,
    displayName: account.displayName,
    role: account.role,
    permissions: account.permissions,
    lastLoginAt: new Date().toISOString()
  });
}

/**
 * Staff accounts the administrator manages in Admin → Managers / Agents (admin/dev/demoStaffStore).
 * Read straight from that store's storage key so this module stays independent of the admin module.
 */
const ADMIN_STAFF_STORAGE_KEY = 'taxedge.demo.adminStaff.v3';

interface StoredStaffAccount {
  readonly username: string;
  readonly fullName: string;
  readonly role: DemoAccount['role'];
  readonly active: boolean;
  readonly salt?: string;
  readonly passwordHash?: string;
}

function readAdminStaff(): readonly StoredStaffAccount[] {
  try {
    const raw = window.localStorage.getItem(ADMIN_STAFF_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as StoredStaffAccount[]) : [];
  } catch {
    return [];
  }
}

/** Index offset keeps admin-managed accounts' ids apart from the built-in admin account. */
const ADMIN_STAFF_ID_OFFSET = 1000;

/** A manager or agent login exists only once the administrator has created it with a password. */
function findAdminManagedAccount(normalized: string): DemoAccount | undefined {
  const staff = readAdminStaff();
  const index = staff.findIndex((member) => member.username?.trim().toLowerCase() === normalized);
  const record = index === -1 ? undefined : staff[index];
  if (!record?.passwordHash || !record.salt) {
    return undefined;
  }
  return {
    id: ADMIN_STAFF_ID_OFFSET + index,
    username: normalized,
    displayName: record.fullName,
    role: record.role,
    active: record.active === true,
    salt: record.salt,
    passwordHash: record.passwordHash,
    permissions: ROLE_PERMISSIONS[record.role] ?? []
  };
}

/** The administrator is the only built-in login; everyone else signs in with what the admin created. */
function findAccount(username: string): DemoAccount | undefined {
  const normalized = username.trim().toLowerCase();
  return findSeedAccount(normalized) ?? findAdminManagedAccount(normalized);
}

function findSeedAccount(username: string): DemoAccount | undefined {
  try {
    const overrides = readAccountOverrides();
    const normalized = username.trim().toLowerCase();

    const matched = DEMO_ACCOUNTS.find((baseAccount) => {
      const override = overrides[String(baseAccount.id)];
      const effectiveUsername = (override?.username ?? baseAccount.username).trim().toLowerCase();
      return effectiveUsername === normalized || baseAccount.username.trim().toLowerCase() === normalized;
    });

    if (!matched) {
      return undefined;
    }

    const override = overrides[String(matched.id)];
    return {
      ...matched,
      username: override?.username ?? matched.username,
      displayName: deriveDisplayNameFromUsername(override?.username ?? matched.username),
      passwordHash: override?.passwordHash ?? matched.passwordHash,
      salt: override?.salt ?? matched.salt
    };
  } catch (err) {
    console.error('Error finding demo account:', err);
    return undefined;
  }
}

export async function verifyUserPassword(username: string, password: string): Promise<boolean> {
  const account = findAccount(username);
  if (!account) {
    return false;
  }
  const computedHash = await hashPassword(account.salt, password);
  return computedHash === account.passwordHash;
}

export async function updateAccountCredentials(
  userId: number | string,
  updates: { newUsername?: string; newPassword?: string }
): Promise<SessionUser> {
  const overrides = readAccountOverrides();
  const baseAccount = DEMO_ACCOUNTS.find((account) => String(account.id) === String(userId));
  if (!baseAccount) {
    throw new Error('Account not found');
  }

  const existingOverride = overrides[String(userId)] ?? {};
  const salt = existingOverride.salt ?? baseAccount.salt;
  let passwordHash = existingOverride.passwordHash ?? baseAccount.passwordHash;

  if (updates.newPassword) {
    passwordHash = await hashPassword(salt, updates.newPassword);
  }

  const newUsername = updates.newUsername?.trim().toLowerCase() || existingOverride.username || baseAccount.username;
  const newDisplayName = deriveDisplayNameFromUsername(newUsername);

  overrides[String(userId)] = {
    ...existingOverride,
    username: newUsername,
    passwordHash,
    salt
  };
  writeAccountOverrides(overrides);

  const updatedUser: SessionUser = Object.freeze({
    id: baseAccount.id,
    username: newUsername,
    displayName: newDisplayName,
    role: baseAccount.role,
    permissions: baseAccount.permissions,
    lastLoginAt: new Date().toISOString()
  });

  writeStoredSession(updatedUser);
  return updatedUser;
}

function assertNotLocked(username: string): void {
  const record = failures.get(username);
  if (record && record.lockedUntil > Date.now()) {
    fail('TOO_MANY_ATTEMPTS', 429);
  }
}

function recordFailure(username: string): void {
  const count = (failures.get(username)?.count ?? 0) + 1;
  const lockedUntil = count >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0;
  failures.set(username, { count: lockedUntil ? 0 : count, lockedUntil });
}

function readStoredSession(): SessionUser | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

function writeStoredSession(user: SessionUser | null): void {
  try {
    if (user) {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable (private mode); the demo session then lasts until reload.
  }
}

export const demoAuthenticationGateway: AuthenticationGateway = Object.freeze({
  async login({ username, password }: LoginCredentials) {
    await delay(SIMULATED_SIGN_IN_LATENCY_MS);
    assertNotLocked(username);

    const account = findAccount(username);
    const computedHash = await hashPassword(account?.salt ?? TIMING_EQUALIZER_SALT, password);
    if (!account || computedHash !== account.passwordHash) {
      recordFailure(username);
      return fail('INVALID_CREDENTIALS', 401);
    }

    failures.delete(username);
    if (!account.active) {
      return fail('ACCOUNT_INACTIVE', 403);
    }

    const user = toSessionUser(account);
    writeStoredSession(user);
    return user;
  },

  async fetchSession() {
    const stored = readStoredSession();
    const account = stored ? findAccount(stored.username) : undefined;
    // Re-validate against the seed data, as the backend re-checks the account on every request.
    if (!stored || !account?.active) {
      writeStoredSession(null);
      return null;
    }
    // Always refresh session displayName from account username dynamically
    const refreshedUser: SessionUser = Object.freeze({
      ...stored,
      username: account.username,
      displayName: deriveDisplayNameFromUsername(account.username),
      role: account.role,
      permissions: account.permissions
    });
    writeStoredSession(refreshedUser);
    return refreshedUser;
  },

  async logout() {
    writeStoredSession(null);
  },

  async verifyPassword(username: string, password: string) {
    return verifyUserPassword(username, password);
  },

  async updateCredentials(userId: string, updates: { newUsername?: string; newPassword?: string }) {
    return updateAccountCredentials(userId, updates);
  }
});
