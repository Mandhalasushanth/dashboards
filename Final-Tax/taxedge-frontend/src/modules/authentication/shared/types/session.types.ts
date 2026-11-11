import type { Permission } from './permission.types';
import type { Role } from './role.types';

/** The signed-in user exactly as the server describes it; role and permissions are never chosen client-side. */
export interface SessionUser {
  readonly id: number | string;
  readonly username: string;
  readonly displayName: string;
  readonly role: Role;
  readonly permissions: readonly Permission[];
  readonly lastLoginAt: string | null;
}

export type SessionEndReason = 'signed-out' | 'expired' | 'idle' | 'inactive';
