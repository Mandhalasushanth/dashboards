import { API_ENDPOINTS, apiClient, isApiError } from '@/core/api';
import type { AccountCredentialUpdates, LoginCredentials } from '../shared/types/authentication.types';
import type { SessionUser } from '../shared/types/session.types';
import { deriveDisplayNameFromUsername } from '../shared/utils/displayNameUtils';

/** The admin record AdminLoginController returns; the password is never sent back. */
interface AdminRecord {
  readonly id?: number | string;
  readonly email?: string;
  readonly fullName?: string;
  readonly updatedAt?: string;
}

const WRONG_PASSWORD_STATUSES: readonly number[] = Object.freeze([400, 401, 404]);

/**
 * Checks the old password by signing in again at LoginController (/api/v1/auth/login).
 * False means wrong password; a network or server failure is thrown so it is not mistaken for one.
 */
export async function verifyAdminPassword(username: string, password: string): Promise<boolean> {
  try {
    const credentials: LoginCredentials = { username, password };
    await apiClient.post<unknown>(API_ENDPOINTS.identity.login, { ...credentials, email: username });
    return true;
  } catch (error) {
    if (isApiError(error) && WRONG_PASSWORD_STATUSES.includes(error.status)) return false;
    throw error;
  }
}

/**
 * Saves a new email and/or password at AdminLoginController (PUT /api/v1/admin/{id}).
 * Fields left out keep their stored value; the server stores only a hash of the new password.
 */
export async function updateAdminCredentials(
  currentUser: SessionUser,
  updates: AccountCredentialUpdates
): Promise<SessionUser> {
  const email = updates.newUsername?.trim().toLowerCase();
  const body = {
    ...(email ? { email, fullName: deriveDisplayNameFromUsername(email) } : {}),
    ...(updates.newPassword ? { password: updates.newPassword } : {})
  };
  const saved = await apiClient.put<AdminRecord>(
    `${API_ENDPOINTS.admin.updateAdmin}/${encodeURIComponent(String(currentUser.id))}`,
    body
  );
  const username = saved?.email ?? email ?? currentUser.username;
  return Object.freeze({
    ...currentUser,
    username,
    displayName: saved?.fullName || deriveDisplayNameFromUsername(username)
  });
}
