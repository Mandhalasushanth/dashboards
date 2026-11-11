/**
 * DEVELOPMENT ONLY. Keeps admin settings in this browser's localStorage while the backend
 * is unavailable. Loaded through a dynamic import guarded by `import.meta.env.DEV`.
 */
const STORAGE_KEY = 'taxedge.demo.adminSettings';

export const demoSettingsStore = Object.freeze({
  async read(): Promise<unknown> {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  async write(payload: Record<string, unknown>): Promise<unknown> {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Storage may be unavailable (private mode); the save still succeeds for this page view.
    }
    return payload;
  }
});
