import type { StaffTier } from '../shared/staff.types';

/**
 * Lets the administrator see a manager's or agent's password, as the business asked. The backend keeps
 * only a one-way BCrypt hash and never returns a password, so the dashboard keeps its own AES-GCM encrypted
 * copy of every password the administrator sets (on create or Edit), in this browser only.
 *
 * Limits, by design of a browser-only copy: it covers passwords set from this browser after this was added;
 * it is lost if the browser's site data is cleared; and the key sits next to the data, so it protects
 * against casual reading, not against someone with access to this browser. A proper version needs a
 * backend endpoint that stores the encrypted copy with its key in a key vault and audits every view.
 */
interface SealedPassword {
  readonly iv: string;
  readonly data: string;
  readonly savedAt: string;
}

const KEY_STORAGE_KEY = 'finsolz.staffPasswordKey';
const VAULT_STORAGE_KEY = 'finsolz.staffPasswords';

const toBase64 = (bytes: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const fromBase64 = (text: string) => Uint8Array.from(atob(text), (char) => char.charCodeAt(0));

/** One entry per account, by its backend id, so a change of email keeps the copy. */
const entryKey = (tier: StaffTier, id: string) => `${tier}:${id}`;

async function vaultKey(): Promise<CryptoKey> {
  const stored = window.localStorage.getItem(KEY_STORAGE_KEY);
  if (stored) {
    return crypto.subtle.importKey('raw', fromBase64(stored), 'AES-GCM', false, ['encrypt', 'decrypt']);
  }
  const raw = crypto.getRandomValues(new Uint8Array(32));
  window.localStorage.setItem(KEY_STORAGE_KEY, toBase64(raw));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

function readVault(): Record<string, SealedPassword> {
  try {
    const raw = window.localStorage.getItem(VAULT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, SealedPassword>) : {};
  } catch {
    return {};
  }
}

function writeVault(vault: Record<string, SealedPassword>): void {
  try {
    window.localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vault));
  } catch {
    // Storage blocked or full: the password still works for sign-in, it just cannot be shown later.
  }
}

/** Keeps an encrypted copy of a password the administrator just set. Never throws: saving the account matters more. */
export async function rememberStaffPassword(tier: StaffTier, id: string, password: string): Promise<void> {
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await vaultKey(), new TextEncoder().encode(password));
    writeVault({ ...readVault(), [entryKey(tier, id)]: { iv: toBase64(iv), data: toBase64(data), savedAt: new Date().toISOString() } });
  } catch {
    // Web Crypto unavailable (e.g. not a secure context): nothing is kept.
  }
}

/** The password last set for this account from this browser, or null when there is no copy. */
export async function recallStaffPassword(tier: StaffTier, id: string): Promise<string | null> {
  const sealed = readVault()[entryKey(tier, id)];
  if (!sealed) return null;
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(sealed.iv) }, await vaultKey(), fromBase64(sealed.data));
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}

/** Forgets the copy when the account is deleted. */
export function forgetStaffPassword(tier: StaffTier, id: string): void {
  const vault = readVault();
  const key = entryKey(tier, id);
  if (!(key in vault)) return;
  const { [key]: _removed, ...rest } = vault;
  writeVault(rest);
}
