/**
 * Permissions are granted by the server per session. The frontend only references the ones
 * it uses for navigation; any additional server permissions are accepted and displayed as-is.
 */
export const PERMISSIONS = Object.freeze({
  ADMIN_DASHBOARD_VIEW: 'ADMIN_DASHBOARD_VIEW',
  STAFF_DASHBOARD_VIEW: 'STAFF_DASHBOARD_VIEW'
} as const);

export type KnownPermission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type Permission = string;
