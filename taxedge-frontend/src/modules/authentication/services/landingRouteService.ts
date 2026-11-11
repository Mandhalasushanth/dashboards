import { canAccessPath, getRoleProfile } from './accessControlService';
import type { SessionUser } from '../shared/types/session.types';

/** Admin lands on the admin dashboard; every staff role lands on the role-aware staff dashboard. */
export function resolveLandingRoute(user: SessionUser): string {
  return getRoleProfile(user.role).landingRoute;
}

/** Rejects protocol-relative and absolute URLs so a crafted "from" location cannot redirect off-site. */
function isSafeInternalPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('\\');
}

/**
 * Returns the page the user originally asked for when their role may open it,
 * otherwise their role's landing route.
 */
export function resolvePostLoginRoute(user: SessionUser, requestedPath?: string | null): string {
  if (requestedPath && isSafeInternalPath(requestedPath) && canAccessPath(user, requestedPath)) {
    return requestedPath;
  }
  return resolveLandingRoute(user);
}
