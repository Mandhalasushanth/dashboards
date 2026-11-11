import { useAuthStore } from '@/store';
import type { SessionUser } from '../shared/types/session.types';

export function useCurrentUser(): SessionUser | null {
  return useAuthStore((snapshot) => snapshot.user);
}
