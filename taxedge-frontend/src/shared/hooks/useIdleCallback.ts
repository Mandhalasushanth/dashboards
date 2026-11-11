import { useEffect } from 'react';

/** Upper bound on how long a browser may postpone the idle work. */
const IDLE_TIMEOUT_MS = 2000;

/** Runs `callback` once, after mount, when the browser is idle (or after a short timeout). */
export function useIdleCallback(callback: (() => void) | undefined): void {
  useEffect(() => {
    if (!callback) {
      return undefined;
    }
    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(callback, { timeout: IDLE_TIMEOUT_MS });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = setTimeout(callback, IDLE_TIMEOUT_MS / 4);
    return () => clearTimeout(timer);
  }, [callback]);
}
