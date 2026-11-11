/**
 * Authentication module: sign-in, session lifecycle, roles and permissions.
 * Other modules import only from this file.
 */
export { AccountOverview } from './components/AccountOverview';
export { useAuthentication, type AuthenticationState } from './hooks/useAuthentication';
export { useCurrentUser } from './hooks/useCurrentUser';
export { canAccessPath, getRoleProfile, hasPermission, hasRole, type AccessSubject } from './services/accessControlService';
export { restoreSession, verifyCurrentPassword, updateCredentials } from './services/authenticationService';
export { resolveLandingRoute, resolvePostLoginRoute } from './services/landingRouteService';
export { startIdleTimeout, startSessionSync } from './services/sessionService';
export { deriveDisplayNameFromUsername } from './shared/utils/displayNameUtils';
export { isChatTokenExpired, loadChatCredentials, type ChatCredentials } from './api/chatCredentials';
export { ADMIN_ROLES, AREA_ACCESS, DOMAIN_LABELS, ROLE_PROFILES, STAFF_ROLES, TIER_LABELS } from './shared/config/roleRoutes';
export type { AccountCredentialUpdates, LoginCredentials } from './shared/types/authentication.types';
export { PERMISSIONS, type KnownPermission, type Permission } from './shared/types/permission.types';
export {
  ROLES,
  isRole,
  type Role,
  type RoleProfile,
  type RoleTier,
  type ServiceDomain,
  type StaffRole,
  type WorkspaceArea
} from './shared/types/role.types';
export type { SessionEndReason, SessionUser } from './shared/types/session.types';

/** Route-level page, lazy-loaded by the router. */
export const loadLoginPage = () => import('./pages/LoginPage');
export { LOGIN_EMAIL_ENDINGS, tierForLoginEmail } from './shared/config/loginAccountTypes';
