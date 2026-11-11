/**
 * Single source of runtime configuration. Values come from VITE_* variables so each
 * deployment can point at its own API without code changes.
 */
const DEFAULTS = Object.freeze({
  appName: 'Finsolz',
  appTagline: 'Simplifying Your Fin Journey',
  apiBaseUrl: '/api/v1',
  notificationsBaseUrl: '/notifications',
  apiTimeoutMs: 15000,
  sessionIdleTimeoutMinutes: 30
});

function readString(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function readPositiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export interface Environment {
  readonly appName: string;
  readonly appTagline: string;
  readonly apiBaseUrl: string;
  /** AdminPushNotificationController (@RequestMapping("/notifications")), which sits outside apiBaseUrl. */
  readonly notificationsBaseUrl: string;
  readonly apiTimeoutMs: number;
  readonly sessionIdleTimeoutMs: number;
  readonly isProduction: boolean;
  /** Demo accounts are only ever honoured by the Vite dev server, never by a production build. */
  readonly demoAuthEnabled: boolean;
}

export const environment: Environment = Object.freeze({
  appName: readString(import.meta.env.VITE_APP_NAME, DEFAULTS.appName),
  appTagline: readString(import.meta.env.VITE_APP_TAGLINE, DEFAULTS.appTagline),
  apiBaseUrl: stripTrailingSlash(readString(import.meta.env.VITE_API_BASE_URL, DEFAULTS.apiBaseUrl)),
  notificationsBaseUrl: stripTrailingSlash(
    readString(import.meta.env.VITE_NOTIFICATIONS_BASE_URL, DEFAULTS.notificationsBaseUrl)
  ),
  apiTimeoutMs: readPositiveNumber(import.meta.env.VITE_API_TIMEOUT_MS, DEFAULTS.apiTimeoutMs),
  sessionIdleTimeoutMs:
    readPositiveNumber(import.meta.env.VITE_SESSION_IDLE_TIMEOUT_MINUTES, DEFAULTS.sessionIdleTimeoutMinutes) * 60_000,
  isProduction: import.meta.env.PROD,
  demoAuthEnabled: import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true'
});
