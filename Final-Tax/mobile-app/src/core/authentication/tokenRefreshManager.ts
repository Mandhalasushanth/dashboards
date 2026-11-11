import { tokenManager } from "@/core/authentication/tokenManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getActiveBaseUrl,
  SERVER_PORT,
  STORAGE_KEY_SERVER_URL,
} from "@/core/api/apiConfig";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";

/**
 * Backend response shape from POST /auth/refresh
 */
interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

/**
 * Listener invoked when silent refresh fails irrecoverably.
 * The app should clear auth state and redirect to login.
 */
type SessionExpiredListener = () => void;

/**
 * TokenRefreshManager — production-grade silent token refresh.
 *
 * Key design decisions:
 *  1. Uses raw `fetch()` — NOT apiClient — to call POST /auth/refresh.
 *     This avoids the Bearer-token request interceptor attaching the expired
 *     access token, and avoids infinite 401→refresh→401 loops.
 *
 *  2. Mutex via `refreshPromise` — if 5 API calls all get 401 at the same time,
 *     only ONE refresh call is made. The other 4 await the same Promise.
 *
 *  3. `onSessionExpired` callback — when the refresh token itself is expired or
 *     revoked, the manager notifies the app to redirect to login instead of
 *     silently failing forever.
 */
class TokenRefreshManager {
  /** The in-flight refresh promise (null when idle). Acts as a mutex. */
  private refreshPromise: Promise<boolean> | null = null;

  /** Callback fired when refresh fails — the session is truly dead. */
  private sessionExpiredListener: SessionExpiredListener | null = null;

  /**
   * Register a callback for session expiry (refresh token dead).
   * Typically called once in AppBootstrap to wire up logout/redirect.
   */
  onSessionExpired(listener: SessionExpiredListener): void {
    this.sessionExpiredListener = listener;
  }

  /**
   * Attempts to refresh the access token using the stored refresh token.
   *
   * - If a refresh is already in flight, returns the existing Promise (mutex).
   * - Uses raw fetch to avoid interceptor loops.
   * - On success: stores new accessToken + refreshToken, returns true.
   * - On failure: clears all tokens, fires sessionExpiredListener, returns false.
   */
  async attemptRefresh(): Promise<boolean> {
    // ── Mutex: if already refreshing, piggyback on the same call ──────────
    if (this.refreshPromise) {
      logger.debug("[TokenRefresh] Refresh already in progress — waiting...");
      return this.refreshPromise;
    }

    this.refreshPromise = this.executeRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      // Release the mutex regardless of outcome
      this.refreshPromise = null;
    }
  }

  /**
   * The actual refresh HTTP call. Private — only called through attemptRefresh().
   */
  private async executeRefresh(): Promise<boolean> {
    const refreshToken = await tokenManager.getRefreshToken();

    if (!refreshToken) {
      logger.warn("[TokenRefresh] No refresh token in storage");
      const hasValidAccess = await tokenManager.hasValidToken().catch(() => false);
      if (!hasValidAccess) {
        this.handleSessionExpired();
      }
      return false;
    }

    try {
      const normalizedBaseUrl = await getActiveBaseUrl();

      logger.debug(`[TokenRefresh] Calling POST ${normalizedBaseUrl}/auth/refresh...`);

      const response = await fetch(`${normalizedBaseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // NOTE: No Authorization header. The refresh endpoint is public
          // and expects the refresh token in the body, not the header.
        },
        body: JSON.stringify({ refreshToken }),
      });

      // ── Refresh token is itself expired or revoked ───────────────────────
      if (response.status === 401 || response.status === 403) {
        logger.warn(
          `[TokenRefresh] Server rejected refresh token (HTTP ${response.status}) — session expired`
        );
        this.handleSessionExpired();
        return false;
      }

      if (!response.ok) {
        logger.error(
          `[TokenRefresh] Unexpected HTTP ${response.status} from /auth/refresh`
        );
        this.handleSessionExpired();
        return false;
      }

      const data: RefreshResponse = await response.json();

      if (!data.accessToken || !data.refreshToken) {
        logger.error("[TokenRefresh] Invalid response — missing tokens");
        this.handleSessionExpired();
        return false;
      }

      // ── Store new token pair ─────────────────────────────────────────────
      await tokenManager.setAccessToken(data.accessToken);
      await tokenManager.setRefreshToken(data.refreshToken);

      logger.info("[TokenRefresh] Tokens refreshed successfully");
      return true;
    } catch (error) {
      // Network error (offline, DNS failure, etc.)
      logger.error("[TokenRefresh] Network error during refresh", error);
      // Do NOT call handleSessionExpired for network errors — the refresh token
      // may still be valid. The caller will propagate the original 401 to the UI.
      return false;
    }
  }

  /**
   * Clears all stored tokens and notifies the app that the session is dead.
   * The app should redirect to the login screen.
   */
  private handleSessionExpired(): void {
    tokenManager.clearTokens().catch((err) => {
      logger.warn("[TokenRefresh] Failed to clear tokens on session expiry", {
        error: getErrorMessage(err),
      });
    });
    if (this.sessionExpiredListener) {
      this.sessionExpiredListener();
    }
  }
}

export const tokenRefreshManager = new TokenRefreshManager();
export default tokenRefreshManager;

