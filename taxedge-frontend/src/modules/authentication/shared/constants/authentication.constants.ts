import type { SessionEndReason } from '../types/session.types';

/** Login field rules. Usernames are provisioned by an administrator; there is no self sign-up. */
export const CREDENTIAL_RULES = Object.freeze({
  username: Object.freeze({
    minLength: 3,
    maxLength: 64,
    pattern: /^[a-zA-Z0-9][a-zA-Z0-9._@-]*$/,
    patternMessage: 'Username may only contain letters, numbers, dots, hyphens, underscores and @.'
  }),
  password: Object.freeze({
    minLength: 8,
    maxLength: 128
  })
});

export type NoticeTone = 'info' | 'warning' | 'error';

export interface SessionNotice {
  readonly tone: NoticeTone;
  readonly message: string;
}

export const SESSION_END_NOTICES: Readonly<Record<SessionEndReason, SessionNotice>> = Object.freeze({
  'signed-out': { tone: 'info', message: 'You have been signed out securely.' },
  expired: { tone: 'warning', message: 'Your session has expired. Please sign in again.' },
  idle: { tone: 'warning', message: 'You were signed out after a period of inactivity.' },
  inactive: { tone: 'error', message: 'Your account is inactive. Please contact your administrator.' }
});

/** Cross-tab channel so signing out in one tab signs out every open tab. */
export const SESSION_BROADCAST_CHANNEL = 'taxedge.session';

export const USER_ACTIVITY_EVENTS: readonly (keyof WindowEventMap)[] = Object.freeze([
  'pointerdown',
  'keydown',
  'scroll',
  'touchstart'
]);
