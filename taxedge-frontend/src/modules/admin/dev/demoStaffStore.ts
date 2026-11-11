import { ApiError } from '@/core/api';
import { openPassword, sealPassword, type PasswordCipher } from './demoPasswordVault';
import { ROLE_DOMAIN, TIER_ROLES, type NewStaffInput, type StaffMember, type StaffTier, type UpdateStaffInput } from '../shared/staff.types';

/**
 * DEVELOPMENT ONLY. Managers and agents the administrator creates, kept in this browser's localStorage
 * while the backend is unavailable. It starts empty: there are no predefined staff. Loaded through a dynamic import guarded by `import.meta.env.DEV`; excluded from production.
 *
 * Passwords an administrator sets are stored only as a salted SHA-256 hash (the real backend uses a slow
 * hash such as BCrypt). The demo sign-in reads these records from the same storage key, so accounts
 * created or edited here can sign in. Hashes are never returned to the page.
 */
export const DEMO_STAFF_STORAGE_KEY = 'taxedge.demo.adminStaff.v3';
const STORAGE_KEY = DEMO_STAFF_STORAGE_KEY;

// Staff created under the previous key are cleared so every browser starts with no managers or agents.
try {
  window.localStorage.removeItem('taxedge.demo.adminStaff.v2');
} catch {
  // ignore
}

/** What is persisted: the public record plus the password hash, when one has been set. */
type StoredStaff = StaffMember & { readonly salt?: string; readonly passwordHash?: string; readonly passwordCipher?: PasswordCipher };

async function hashPassword(salt: string, password: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${password}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Sign-in checks the hash; the sealed copy exists only so the administrator can view the password. */
async function credentialFor(password: string): Promise<{ salt: string; passwordHash: string; passwordCipher: PasswordCipher }> {
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return { salt, passwordHash: await hashPassword(salt, password), passwordCipher: await sealPassword(password) };
}

/** Strips credential fields so they never leave the store. */
function toPublic({ salt: _salt, passwordHash: _hash, passwordCipher: _cipher, ...member }: StoredStaff): StaffMember {
  return member;
}

function load(): StoredStaff[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredStaff[]) : [];
  } catch {
    return [];
  }
}

function persist(items: StoredStaff[]): StoredStaff[] {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked: keep working in memory for this page view.
  }
  return items;
}

const fail = (message: string): never => {
  throw new ApiError('VALIDATION_FAILED', message, 409);
};

export const demoStaffStore = Object.freeze({
  async list(tier: StaffTier): Promise<StaffMember[]> {
    return load().filter((member) => TIER_ROLES[tier].includes(member.role)).map(toPublic);
  },

  async create(input: NewStaffInput): Promise<StaffMember> {
    const items = load();
    const username = input.username.trim().toLowerCase();
    if (items.some((member) => member.username === username)) fail('An account with this email already exists.');
    const manager = input.managerId ? items.find((member) => member.id === input.managerId) : undefined;
    const prefix = input.role.endsWith('MANAGER') ? 'MGR' : 'AGT';
    const created: StoredStaff = {
      ...(await credentialFor(input.password)),
      id: `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      fullName: input.fullName.trim(),
      username,
      role: input.role,
      managerId: manager?.id ?? null,
      managerName: manager?.fullName ?? null,
      active: true,
      openCases: 0,
      completedThisMonth: 0,
      slaPercent: 0,
      joinedAt: new Date().toISOString(),
      lastLoginAt: null
    };
    persist([...items, created]);
    return toPublic(created);
  },

  async update(id: string, input: UpdateStaffInput): Promise<StaffMember> {
    const items = load();
    const current = items.find((member) => member.id === id) ?? fail('This account no longer exists.');
    const username = input.username.trim().toLowerCase();
    if (items.some((member) => member.id !== id && member.username === username)) fail('An account with this email already exists.');
    const hasActiveAgents = items.some((member) => member.managerId === id && member.active);
    if (hasActiveAgents && ROLE_DOMAIN[input.role] !== ROLE_DOMAIN[current.role]) {
      fail('Move this manager’s active agents first; a manager with a team cannot switch domain.');
    }
    const manager = input.managerId ? items.find((member) => member.id === input.managerId) : undefined;
    // Seeded demo logins have no stored hash yet; their sign-in id can only change together with a new password.
    if (username !== current.username && !current.passwordHash && !input.password) {
      fail('Set a new password when changing this account’s sign-in email.');
    }
    const fullName = input.fullName.trim();
    const updated: StoredStaff = {
      ...current,
      ...(input.password ? await credentialFor(input.password) : {}),
      fullName,
      username,
      role: input.role,
      managerId: manager?.id ?? null,
      managerName: manager?.fullName ?? null
    };
    // Keep agents' "Reports to" name in step when a manager is renamed.
    persist(items.map((member) => (member.id === id ? updated : member.managerId === id ? { ...member, managerName: fullName } : member)));
    return toPublic(updated);
  },

  /** Administrator only (the admin console is the only caller). Records the view on the account. */
  async revealPassword(id: string): Promise<string | null> {
    const items = load();
    const current = items.find((member) => member.id === id) ?? fail('This account no longer exists.');
    const password = current.passwordCipher ? await openPassword(current.passwordCipher) : null;
    if (password !== null) {
      persist(items.map((member) => (member.id === id ? { ...member, passwordViewedAt: new Date().toISOString() } : member)));
    }
    return password;
  },

  async setActive(id: string, active: boolean): Promise<void> {
    const items = load();
    // Same rule the backend enforces: a manager with active agents must hand them over first.
    if (!active && items.some((member) => member.managerId === id && member.active)) {
      fail('Reassign or deactivate this manager’s active agents first.');
    }
    persist(items.map((member) => (member.id === id ? { ...member, active } : member)));
  }
});
