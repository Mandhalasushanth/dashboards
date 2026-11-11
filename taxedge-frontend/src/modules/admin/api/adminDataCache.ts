import { authStore } from '@/store';

/**
 * In-memory cache for admin pages: revisiting a page shows the last data immediately while a
 * fresh copy loads in the background. Cleared whenever the user is no longer signed in, so data
 * never carries over to the next person using this browser tab.
 */
export interface DataCache<T> {
  peek(): T | null;
  remember(value: T): void;
}

const clearers = new Set<() => void>();

authStore.subscribe(() => {
  if (authStore.getState().status !== 'authenticated') {
    clearers.forEach((clear) => clear());
  }
});

export function createDataCache<T>(): DataCache<T> {
  let value: T | null = null;
  clearers.add(() => {
    value = null;
  });
  return Object.freeze({
    peek: () => value,
    remember: (next: T) => {
      value = next;
    }
  });
}
