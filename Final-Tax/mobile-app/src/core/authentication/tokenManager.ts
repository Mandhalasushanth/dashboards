import AsyncStorage from "@react-native-async-storage/async-storage";
import { secureStorage } from "@/core/storage/secureStorage";
import {
  getActiveBaseUrl,
  SERVER_PORT,
  STORAGE_KEY_SERVER_URL,
} from "@/core/api/apiConfig";
import { getErrorMessage, getErrorField } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// JWT Payload shape (what the backend puts inside the token)
// ─────────────────────────────────────────────────────────────────────────────
interface JwtPayload {
  sub?: string;        // custId (subject)
  name?: string;
  mobileNumber?: string;
  iat?: number;        // issued-at  (Unix seconds)
  exp?: number;        // expiry     (Unix seconds) ← the critical field
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Server-side validation response shape (from GET /auth/validate)
// ─────────────────────────────────────────────────────────────────────────────
interface ServerValidationResponse {
  valid: boolean;
  reason?: string;
  custId?: string;
  expiresAt?: number; // epoch-ms from backend
}

// ─────────────────────────────────────────────────────────────────────────────
// JwtUtils — pure functions, no side-effects, no secrets
// ─────────────────────────────────────────────────────────────────────────────
export const JwtUtils = {
  /**
   * Decodes the Base64URL-encoded payload section of a JWT.
   * NOTE: This does NOT verify the HMAC signature — it only reads the claims.
   * Use verifyWithServer() for full signature verification.
   */
  decodePayload(token: string): JwtPayload | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null; // malformed — not a JWT

      // JWT uses Base64URL encoding ('+' → '-', '/' → '_', no padding)
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      // Pad to a multiple of 4 characters
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "="
      );
      const jsonStr = atob(padded); // decode Base64 → JSON string
      return JSON.parse(jsonStr) as JwtPayload;
    } catch {
      // Intentional fallback: malformed Base64 or non-JSON JWT segment returns null
      return null;
    }
  },

  /**
   * Returns the expiry timestamp in milliseconds (compatible with Date.now()),
   * or null if the token is missing / malformed / has no exp claim.
   */
  getExpiresAtMs(token: string): number | null {
    const payload = JwtUtils.decodePayload(token);
    if (!payload || typeof payload.exp !== "number") return null;
    return payload.exp * 1000; // convert Unix seconds → ms
  },

  /**
   * Layer 1 — CLIENT-SIDE check:
   * Validates that:
   *   1. The token string is non-empty
   *   2. It has exactly 3 dot-separated parts (valid JWT structure)
   *   3. The exp claim is present and is in the future (with an optional
   *      clock-skew buffer so we don't use a token that expires in 30 s)
   *
   * This check is fast (no network) but does NOT verify the HMAC signature.
   */
  isStructureAndExpiryValid(token: string, bufferSeconds = 30): boolean {
    if (!token || token.trim().length === 0) return false;

    const payload = JwtUtils.decodePayload(token);
    if (!payload) return false;
    if (typeof payload.exp !== "number") return false;

    const nowSeconds = Math.floor(Date.now() / 1000);
    return payload.exp > nowSeconds + bufferSeconds;
  },

  /**
   * Returns true if the token will expire within the given window.
   * Useful for proactively triggering a token refresh before the token dies.
   */
  isExpiringSoon(token: string, withinSeconds = 60): boolean {
    const expiresAtMs = JwtUtils.getExpiresAtMs(token);
    if (!expiresAtMs) return true; // no expiry info → treat as expiring
    const nowMs = Date.now();
    return expiresAtMs - nowMs < withinSeconds * 1000;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TokenManager — manages storage + provides validation APIs
// ─────────────────────────────────────────────────────────────────────────────

class TokenManager {
  private static ACCESS_TOKEN_KEY = "auth_access_token";
  private static REFRESH_TOKEN_KEY = "auth_refresh_token";

  // ── Storage methods ─────────────────────────────────────────────────────────

  async getAccessToken(): Promise<string | null> {
    return secureStorage.getItem(TokenManager.ACCESS_TOKEN_KEY);
  }

  async setAccessToken(token: string): Promise<void> {
    await secureStorage.setItem(TokenManager.ACCESS_TOKEN_KEY, token);
  }

  async getRefreshToken(): Promise<string | null> {
    return secureStorage.getItem(TokenManager.REFRESH_TOKEN_KEY);
  }

  async setRefreshToken(token: string): Promise<void> {
    await secureStorage.setItem(TokenManager.REFRESH_TOKEN_KEY, token);
  }

  async clearTokens(): Promise<void> {
    await secureStorage.removeItem(TokenManager.ACCESS_TOKEN_KEY);
    await secureStorage.removeItem(TokenManager.REFRESH_TOKEN_KEY);
  }

  // ── Layer 1: Client-side expiry check (fast, no network) ────────────────────

  /**
   * Returns true only if:
   *   - A token exists in secure storage
   *   - It is a valid 3-part JWT structure
   *   - Its `exp` claim is in the future (with a 30-second clock-skew buffer)
   *
   * ⚠️  This does NOT verify the HMAC-SHA256 signature.
   *     Use isFullyValid() when you need cryptographic assurance.
   */
  async hasValidToken(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return false;
    return JwtUtils.isStructureAndExpiryValid(token);
  }

  /**
   * Returns the expiry timestamp (ms) of the stored access token,
   * or null if there is no token / the token is malformed.
   */
  async getTokenExpiresAt(): Promise<number | null> {
    const token = await this.getAccessToken();
    if (!token) return null;
    return JwtUtils.getExpiresAtMs(token);
  }

  /**
   * Returns true if the stored access token will expire within `withinSeconds`
   * (default: 60 s). Use this to trigger a proactive token refresh.
   */
  async isTokenExpiringSoon(withinSeconds = 60): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return true;
    return JwtUtils.isExpiringSoon(token, withinSeconds);
  }

  // ── Layer 2: Server-side signature verification (network call) ───────────────

  /**
   * Sends the stored access token to the backend's GET /auth/validate endpoint.
   * The backend re-derives the HMAC-SHA256 signature using the secret key and
   * returns { valid: true/false, reason?, custId?, expiresAt? }.
   *
   * This is the ONLY way to truly verify the token signature on the client
   * because the HS256 secret must never leave the server.
   *
   * Returns null if there is no token in storage or if the network call fails.
   */
  async verifyWithServer(): Promise<ServerValidationResponse | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const normalizedBaseUrl = await getActiveBaseUrl();
      const response = await fetch(`${normalizedBaseUrl}/auth/validate`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return { valid: false, reason: `Server rejected token (${response.status})` };
      }

      return (await response.json()) as ServerValidationResponse;
    } catch (err) {
      // 401 from the server means the signature/expiry check failed
      if (getErrorField(err, "status") === 401 || getErrorField(err, "code") === "API_ERROR") {
        return { valid: false, reason: getErrorMessage(err) || "Server rejected token" };
      }
      // Network error — we cannot determine validity, return null
      logger.warn("[TokenManager] verifyWithServer network error", { error: getErrorMessage(err) });
      return null;
    }
  }

  // ── Combined: Layer 1 + Layer 2 ──────────────────────────────────────────────

  /**
   * Full two-layer token validation:
   *   1. Client-side: checks JWT structure + exp claim (fast, offline)
   *   2. Server-side: verifies HMAC-SHA256 signature (requires network)
   *
   * Returns true only when BOTH layers confirm the token is valid.
   * Falls back to Layer 1 result if the network is unavailable (null response).
   *
   * Use this for critical auth gates (e.g. deciding whether to show
   * the app home screen or redirect to login).
   */
  async isFullyValid(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return false;

    // Layer 1 — fast offline check first
    const clientValid = JwtUtils.isStructureAndExpiryValid(token);
    if (!clientValid) {
      logger.debug("[TokenManager] Layer 1 token expired or malformed");
      return false;
    }

    // Layer 2 — server signature check
    const serverResult = await this.verifyWithServer();

    if (serverResult === null) {
      // Network unavailable — trust Layer 1 result (degraded mode)
      logger.warn(
        "[TokenManager] Network unavailable, falling back to client-side expiry check only"
      );
      return clientValid;
    }

    if (!serverResult.valid) {
      logger.debug(
        "[TokenManager] Layer 2 server rejected token",
        { reason: serverResult.reason }
      );
    }

    return serverResult.valid;
  }
}

export const tokenManager = new TokenManager();
export default tokenManager;
