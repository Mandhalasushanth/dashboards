/**
 * DEVELOPMENT ONLY. Keeps the passwords the administrator sets in a recoverable, encrypted form so the
 * admin can view them, as the business requires. Sign-in still checks the salted hash; this copy is used
 * only by "Show password".
 *
 * In the demo the AES-GCM key lives in this browser's storage, which protects nothing against someone with
 * access to the browser. The real backend must keep the key in a key vault / KMS, never next to the data,
 * allow decryption to administrators only, and write an audit entry for every view.
 */
export interface PasswordCipher {
  readonly iv: string;
  readonly data: string;
}

const KEY_STORAGE_KEY = 'taxedge.demo.passwordVaultKey';

const toBase64 = (bytes: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const fromBase64 = (text: string) => Uint8Array.from(atob(text), (char) => char.charCodeAt(0));

async function vaultKey(): Promise<CryptoKey> {
  const stored = window.localStorage.getItem(KEY_STORAGE_KEY);
  if (stored) {
    return crypto.subtle.importKey('raw', fromBase64(stored), 'AES-GCM', false, ['encrypt', 'decrypt']);
  }
  const raw = crypto.getRandomValues(new Uint8Array(32));
  window.localStorage.setItem(KEY_STORAGE_KEY, toBase64(raw));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function sealPassword(password: string): Promise<PasswordCipher> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await vaultKey(), new TextEncoder().encode(password));
  return { iv: toBase64(iv), data: toBase64(data) };
}

/** Null when the copy cannot be opened (e.g. the browser's key was cleared). */
export async function openPassword(cipher: PasswordCipher): Promise<string | null> {
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(cipher.iv) }, await vaultKey(), fromBase64(cipher.data));
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}
