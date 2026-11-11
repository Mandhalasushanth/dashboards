import { isRole, type StaffRole } from '@/modules/authentication';
import type { NewStaffInput, StaffMember } from '../shared/staff.types';
import { LOGIN_EMAIL_ENDINGS } from '@/modules/authentication';
import { emailFormat, personOrBusinessNameFormat } from './indianFormats';

type RawRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is RawRecord => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown, max = 160): string | null =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null;
const count = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0);
const timestamp = (value: unknown): string | null =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null;

/** Validates one server record; malformed entries are skipped instead of rendered. */
export function parseStaffMember(raw: unknown): StaffMember | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === 'number' ? String(raw.id) : text(raw.id, 64);
  const fullName = text(raw.fullName, 80);
  const username = text(raw.username, 254);
  if (!id || !fullName || !username || !isRole(raw.role) || raw.role === 'ADMIN') return null;
  return Object.freeze({
    id,
    fullName,
    username,
    role: raw.role as StaffRole,
    managerId: text(raw.managerId, 64),
    managerName: text(raw.managerName, 80),
    active: raw.active === true,
    openCases: count(raw.openCases),
    completedThisMonth: count(raw.completedThisMonth),
    slaPercent: Math.min(100, count(raw.slaPercent)),
    joinedAt: timestamp(raw.joinedAt) ?? new Date(0).toISOString(),
    lastLoginAt: timestamp(raw.lastLoginAt),
    passwordViewedAt: timestamp(raw.passwordViewedAt)
  });
}

export function parseStaffList(raw: unknown): StaffMember[] {
  const items = Array.isArray(raw) ? raw : isRecord(raw) && Array.isArray(raw.items) ? raw.items : [];
  return items
    .map(parseStaffMember)
    .filter((item): item is StaffMember => item !== null)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export type StaffFormErrors = Partial<Record<keyof NewStaffInput, string>>;

/** Staff passwords follow the same policy as the login: 10+ chars with upper, lower, digit and symbol. */
export function passwordPolicyError(value: string): string | null {
  if (value.length < 10) return 'Use at least 10 characters.';
  if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
    return 'Include an uppercase letter, a lowercase letter, a number and a symbol.';
  }
  return null;
}

/** When editing, pass passwordOptional so a blank password means "keep the current one". */
export function validateNewStaff(
  input: NewStaffInput,
  needsManager: boolean,
  existingUsernames: readonly string[],
  passwordOptional = false
): StaffFormErrors {
  const errors: StaffFormErrors = {};
  const name = input.fullName.trim();
  const username = input.username.trim().toLowerCase();

  if (name.length < 2) errors.fullName = 'Enter the full name.';
  else if (name.length > 80) errors.fullName = 'Keep the name to 80 characters or fewer.';
  else errors.fullName = personOrBusinessNameFormat(name) ?? undefined;

  if (!username) errors.username = 'Enter the work email used to sign in.';
  else if (existingUsernames.includes(username)) errors.username = 'An account with this email already exists.';
  else if (username.length > 64) errors.username = 'The sign-in email can be at most 64 characters.';
  else {
    // The login page decides the account type from the email ending, so a different ending could never sign in.
    const ending = needsManager ? LOGIN_EMAIL_ENDINGS.AGENT : LOGIN_EMAIL_ENDINGS.MANAGER;
    errors.username = emailFormat(username) ?? (username.endsWith(ending) ? undefined : `A ${needsManager ? 'agent' : 'manager'} email must end with ${ending} to be able to sign in.`);
  }


  if (needsManager && !input.managerId) errors.managerId = 'Choose the manager this agent reports to.';
  if (!(passwordOptional && input.password === '')) {
    errors.password = passwordPolicyError(input.password) ?? undefined;
  }

  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as StaffFormErrors;
}

