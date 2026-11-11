import { AREA_ACCESS, ROLE_PROFILES } from '../shared/config/roleRoutes';
import type { Permission } from '../shared/types/permission.types';
import type { Role, RoleProfile } from '../shared/types/role.types';

/** Minimal shape needed for access checks, so this module stays independent of identity types. */
export interface AccessSubject {
  readonly role: Role;
  readonly permissions: readonly Permission[];
}

export function getRoleProfile(role: Role): RoleProfile {
  return ROLE_PROFILES[role];
}

export function hasRole(subject: AccessSubject | null, allowedRoles: readonly Role[]): boolean {
  return subject !== null && allowedRoles.includes(subject.role);
}

export function hasPermission(subject: AccessSubject | null, permission: Permission): boolean {
  return subject !== null && subject.permissions.includes(permission);
}

const isInside = (path: string, root: string) => path === root || path.startsWith(`${root}/`) || path.startsWith(`${root}?`);

/** Whether an in-app path belongs to this subject's own workspace and the server granted its area permission. */
export function canAccessPath(subject: AccessSubject, path: string): boolean {
  const { area, workspaceRoot } = getRoleProfile(subject.role);
  const { permission } = AREA_ACCESS[area];
  return isInside(path, workspaceRoot) && hasPermission(subject, permission);
}
