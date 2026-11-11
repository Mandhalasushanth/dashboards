import { useSyncExternalStore } from 'react';
import type { SessionEndReason, SessionUser } from '@/modules/authentication/shared/types/session.types';

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  readonly status: AuthStatus;
  readonly user: SessionUser | null;
  /** Why the last session ended; drives the notice shown on the sign-in page. */
  readonly endReason: SessionEndReason | null;
}

type Listener = () => void;

const INITIAL_STATE: AuthState = Object.freeze({ status: 'initializing', user: null, endReason: null });

let state: AuthState = INITIAL_STATE;
const listeners = new Set<Listener>();

function setState(next: AuthState): void {
  state = Object.freeze(next);
  listeners.forEach((listener) => listener());
}

function getState(): AuthState {
  return state;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** In-memory only: the session itself lives in an HttpOnly cookie, never in web storage. */
export const authStore = Object.freeze({
  getState,
  subscribe,
  setAuthenticated(user: SessionUser): void {
    setState({ status: 'authenticated', user, endReason: null });
  },
  setUnauthenticated(endReason: SessionEndReason | null = null): void {
    setState({ status: 'unauthenticated', user: null, endReason });
  },
  clearEndReason(): void {
    if (state.endReason !== null) {
      setState({ ...state, endReason: null });
    }
  }
});

/** Subscribes a component to a slice of auth state. Selectors must return stable references. */
export function useAuthStore<T>(selector: (snapshot: AuthState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(INITIAL_STATE));
}
