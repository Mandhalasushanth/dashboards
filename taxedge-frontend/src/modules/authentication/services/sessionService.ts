import { onSessionLoss } from '@/core/api';
import { authStore } from '@/store';
import { USER_ACTIVITY_EVENTS } from '../shared/constants/authentication.constants';
import { revalidateSession, signOut } from './authenticationService';
import { subscribeToSessionEvents } from './sessionChannel';

/** Activity bursts (scrolling, typing) only need to reset the idle timer once per window. */
const ACTIVITY_THROTTLE_MS = 1000;

/**
 * Keeps this tab in step with the server session for the whole app lifetime: any API call
 * reporting a lost session, other tabs signing in or out, and the tab regaining focus.
 */
export function startSessionSync(): () => void {
  const stopSessionLoss = onSessionLoss((error) => {
    authStore.setUnauthenticated(error.code === 'ACCOUNT_INACTIVE' ? 'inactive' : 'expired');
  });

  const stopChannel = subscribeToSessionEvents(({ event, username }) => {
    if (event === 'signed-out') {
      // Another tab's sign-out ends this tab only when it is the same person; an older message without
      // a username is treated the same way, since it cannot say whose session ended.
      const current = authStore.getState().user?.username.toLowerCase() ?? null;
      if (current && (username === null || username === current)) {
        authStore.setUnauthenticated('signed-out');
      }
      return;
    }
    void revalidateSession();
  });

  const handleVisibility = () => {
    if (document.visibilityState === 'visible' && authStore.getState().status === 'authenticated') {
      void revalidateSession();
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    stopSessionLoss();
    stopChannel();
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}

/** Signs the user out after `timeoutMs` without interaction. Returns a stop function. */
export function startIdleTimeout(timeoutMs: number): () => void {
  const handleIdle = () => {
    void signOut('idle');
  };
  let timerId = window.setTimeout(handleIdle, timeoutMs);
  let lastResetAt = Date.now();

  const resetTimer = () => {
    const now = Date.now();
    if (now - lastResetAt < ACTIVITY_THROTTLE_MS) {
      return;
    }
    lastResetAt = now;
    window.clearTimeout(timerId);
    timerId = window.setTimeout(handleIdle, timeoutMs);
  };

  USER_ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, resetTimer, { passive: true }));

  return () => {
    window.clearTimeout(timerId);
    USER_ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
  };
}
