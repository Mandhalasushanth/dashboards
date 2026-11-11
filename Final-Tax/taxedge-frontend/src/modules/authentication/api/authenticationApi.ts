import { API_ENDPOINTS, apiClient, hasCsrfToken } from '@/core/api';
import { environment } from '@/core/config/environment';
import { logger } from '@/core/logging/logger';
import { sessionUserFromLogin } from '../shared/config/rolePermissions';
import type { AccountCredentialUpdates, AuthenticationGateway, LoginCredentials } from '../shared/types/authentication.types';
import type { SessionUser } from '../shared/types/session.types';
import { clearChatCredentials, saveChatCredentials } from './chatCredentials';
import { parseSessionUser } from './sessionUserParser';
import { updateAdminCredentials, verifyAdminPassword } from './adminCredentialsApi';
import { LOGIN_NETWORK_ERROR, loginErrorMessage } from '../shared/utils/loginErrorMessage';

const IDENTITY_REQUEST = Object.freeze({ notifySessionLoss: false });
/**
 * The signed-in user is kept in sessionStorage, which the browser clears when the tab or app window
 * closes, so every new visit starts at the login page; a page refresh keeps the user signed in.
 */
const SESSION_STORAGE_KEY = 'taxedge.auth.session';

// Earlier versions kept the session in localStorage, which never expires; remove any copy left behind.
try {
  localStorage.removeItem(SESSION_STORAGE_KEY);
} catch {
  // ignore
}

function saveLocalSession(user: SessionUser): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

function loadLocalSession(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

function clearLocalSession(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}

async function ensureCsrfToken(): Promise<void> {
  if (!hasCsrfToken()) {
    try {
      await apiClient.get<void>(API_ENDPOINTS.identity.csrf, IDENTITY_REQUEST);
    } catch {
      // Optional if disabled on backend
    }
  }
}

/**
 * Direct fetch call to LoginController (/api/v1/auth/login), the one sign-in for admins, managers and agents.
 */
async function fetchAdminLogin(credentials: LoginCredentials): Promise<SessionUser> {
  const baseUrl = environment.apiBaseUrl || '/api/v1';
  const targetUrl = `${baseUrl}${API_ENDPOINTS.identity.login}`;

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      username: credentials.username,
      email: credentials.username,
      password: credentials.password
    })
  }).catch(() => {
    throw new Error(LOGIN_NETWORK_ERROR);
  });

  if (!response.ok) {
    throw new Error(await loginErrorMessage(response));
  }

  const data = await response.json();
  const user = sessionUserFromLogin(data, credentials.username);

  saveLocalSession(user);
  saveChatCredentials(data);
  return user;
}

export const httpAuthenticationGateway: AuthenticationGateway = Object.freeze({
  async login(credentials: LoginCredentials) {
    try {
      return await fetchAdminLogin(credentials);
    } catch (error) {
      if (error instanceof Error && error.message !== 'Failed to fetch') {
        throw error;
      }
      // If server is unreachable in development mode, fallback to demo accounts
      if (import.meta.env.DEV && environment.demoAuthEnabled) {
        logger.warn('Backend fetch failed, attempting demo account login fallback.');
        const { demoAuthenticationGateway } = await import('../dev/demoAuthenticationGateway');
        return demoAuthenticationGateway.login(credentials);
      }
      throw error;
    }
  },

  verifyPassword: verifyAdminPassword,

  /** Saves on the server, then keeps this tab's session in step with the new email. */
  async updateCredentials(_userId: number | string, updates: AccountCredentialUpdates) {
    const current = loadLocalSession();
    if (!current) {
      throw new Error('No active user session');
    }
    const user = await updateAdminCredentials(current, updates);
    saveLocalSession(user);
    return user;
  },

  async fetchSession() {
    const cached = loadLocalSession();
    if (cached) {
      return cached;
    }
    try {
      const payload = await apiClient.get<unknown>(API_ENDPOINTS.identity.session, IDENTITY_REQUEST);
      return payload ? parseSessionUser(payload) : null;
    } catch {
      return null;
    }
  },

  async logout() {
    clearLocalSession();
    clearChatCredentials();
    try {
      await ensureCsrfToken();
      await apiClient.post<void>(API_ENDPOINTS.identity.logout, {}, IDENTITY_REQUEST);
    } catch {
      // ignore
    }
  }
});

export function getAuthenticationGateway(): Promise<AuthenticationGateway> {
  return Promise.resolve(httpAuthenticationGateway);
}