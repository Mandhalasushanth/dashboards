import { useCallback, useState } from 'react';
import { useAuthStore, type AuthStatus } from '@/store';
import { signOut as endSession } from '../services/authenticationService';
import type { SessionEndReason, SessionUser } from '../shared/types/session.types';

export interface AuthenticationState {
  readonly status: AuthStatus;
  readonly user: SessionUser | null;
  readonly endReason: SessionEndReason | null;
  readonly signingOut: boolean;
  readonly signOut: () => Promise<void>;
}

export function useAuthentication(): AuthenticationState {
  const status = useAuthStore((snapshot) => snapshot.status);
  const user = useAuthStore((snapshot) => snapshot.user);
  const endReason = useAuthStore((snapshot) => snapshot.endReason);
  const [signingOut, setSigningOut] = useState(false);

  const signOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await endSession('signed-out');
    } finally {
      setSigningOut(false);
    }
  }, []);

  return { status, user, endReason, signingOut, signOut };
}
