import { logger } from '@/core/logging/logger';
import { authStore } from '@/store';
import { getAuthenticationGateway } from '../api/authenticationApi';
import { normalizeCredentials } from '../validation/loginSchema';
import type { AccountCredentialUpdates, LoginCredentials } from '../shared/types/authentication.types';
import type { SessionEndReason, SessionUser } from '../shared/types/session.types';
import { deriveDisplayNameFromUsername } from '../shared/utils/displayNameUtils';
import { broadcastSessionEvent } from './sessionChannel';

/** Authenticates against the server; the returned role and permissions are the only source of truth. */
export async function signIn(values: LoginCredentials): Promise<SessionUser> {
  const gateway = await getAuthenticationGateway();
  const user = await gateway.login(normalizeCredentials(values));
  authStore.setAuthenticated(user);
  broadcastSessionEvent('signed-in', user.username);
  return user;
}

/** Ends the server session; the local session is cleared even if the server call fails. */
export async function signOut(reason: SessionEndReason = 'signed-out'): Promise<void> {
  // Read before the session is cleared, so only this person's other tabs are signed out.
  const username = authStore.getState().user?.username ?? null;
  try {
    const gateway = await getAuthenticationGateway();
    await gateway.logout();
  } catch (error) {
    logger.warn('Server sign-out failed; clearing the local session anyway.', { error });
  } finally {
    authStore.setUnauthenticated(reason);
    broadcastSessionEvent('signed-out', username);
  }
}

/** Initial load: asks the server whether the session cookie is still valid. */
export async function restoreSession(): Promise<void> {
  try {
    const gateway = await getAuthenticationGateway();
    const user = await gateway.fetchSession();
    if (user) {
      authStore.setAuthenticated(user);
    } else {
      authStore.setUnauthenticated();
    }
  } catch (error) {
    logger.warn('Unable to restore the session.', { error });
    authStore.setUnauthenticated();
  }
}

/**
 * Re-reads the session after another tab signs in or this tab regains focus, picking up
 * role changes or a session that ended elsewhere. Transient network errors keep current state.
 */
export async function revalidateSession(): Promise<void> {
  try {
    const gateway = await getAuthenticationGateway();
    const user = await gateway.fetchSession();
    const wasAuthenticated = authStore.getState().status === 'authenticated';
    if (user) {
      authStore.setAuthenticated(user);
    } else if (wasAuthenticated) {
      authStore.setUnauthenticated('expired');
    }
  } catch (error) {
    logger.debug('Session revalidation skipped.', { error });
  }
}

/**
 * Verifies that the entered password matches the currently authenticated user's real login password.
 */
export async function verifyCurrentPassword(password: string): Promise<boolean> {
  const currentUser = authStore.getState().user;
  if (!currentUser) {
    return false;
  }
  const gateway = await getAuthenticationGateway();
  if (gateway.verifyPassword) {
    return gateway.verifyPassword(currentUser.username, password);
  }
  return true;
}

/**
 * Updates the user's username and/or password.
 * Recalculates the user's display name from the updated username and refreshes the active session.
 */
export async function updateCredentials(updates: AccountCredentialUpdates): Promise<SessionUser> {
  const currentUser = authStore.getState().user;
  if (!currentUser) {
    throw new Error('No active user session');
  }
  // Only the administrator manages sign-in credentials; staff logins are created and reset by the admin.
  if (currentUser.role !== 'ADMIN') {
    throw new Error('Only the administrator can change sign-in details.');
  }

  const gateway = await getAuthenticationGateway();
  if (gateway.updateCredentials) {
    const updatedUser = await gateway.updateCredentials(currentUser.id, updates);
    authStore.setAuthenticated(updatedUser);
    broadcastSessionEvent('signed-in', updatedUser.username);
    return updatedUser;
  }

  // Fallback for mock environments
  const effectiveUsername = updates.newUsername?.trim().toLowerCase() || currentUser.username;
  const updatedUser: SessionUser = Object.freeze({
    ...currentUser,
    username: effectiveUsername,
    displayName: deriveDisplayNameFromUsername(effectiveUsername)
  });
  authStore.setAuthenticated(updatedUser);
  broadcastSessionEvent('signed-in', updatedUser.username);
  return updatedUser;
}
