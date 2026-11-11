/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_NOTIFICATIONS_BASE_URL?: string;
  /** Chat WebSocket URL; defaults to /ws on the page origin (proxied to the backend in dev). */
  readonly VITE_WS_URL?: string;
  /** Email of the administrator account managers and agents can message (looked up through /admin/profile). */
  readonly VITE_ADMIN_EMAIL?: string;
  readonly VITE_API_TIMEOUT_MS?: string;
  readonly VITE_SESSION_IDLE_TIMEOUT_MINUTES?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_TAGLINE?: string;
  readonly VITE_ENABLE_DEMO_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
