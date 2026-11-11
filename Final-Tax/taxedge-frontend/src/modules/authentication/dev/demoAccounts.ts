import { ROLE_PERMISSION_SETS } from '../shared/config/rolePermissions';
import type { Role } from '../shared/types/role.types';

/**
 * DEVELOPMENT ONLY. The one built-in account: the administrator. Every manager and agent login is
 * created by the administrator in Admin → Managers / Agents; there are no other predefined users.
 * Only salted SHA-256 hashes are stored; this module is loaded through a dynamic import
 * guarded by `import.meta.env.DEV` and is excluded from production bundles.
 */
export interface DemoAccount {
  readonly id: number;
  readonly username: string;
  readonly displayName: string;
  readonly role: Role;
  readonly active: boolean;
  readonly salt: string;
  readonly passwordHash: string;
  readonly permissions: readonly string[];
}

import { deriveDisplayNameFromUsername } from '../shared/utils/displayNameUtils';
export { deriveDisplayNameFromUsername };

export const DEMO_ACCOUNTS: readonly DemoAccount[] = Object.freeze([
  {
    id: 1,
    username: 'admin@gmail.com',
    displayName: deriveDisplayNameFromUsername('admin@gmail.com'),
    role: 'ADMIN',
    active: true,
    salt: '97471fd84549dd0920bd8f48d8a4348e',
    passwordHash: 'a5a2907b0d8735b8278ece030134549e195dae4ed38d5878142584d52a20dd90',
    permissions: ['ADMIN_DASHBOARD_VIEW', 'USER_MANAGEMENT', 'CA_OPERATIONS_VIEW', 'LOAN_OPERATIONS_VIEW']
  }
]);

/** What each role may do; applied to every account the administrator creates. */
export const ROLE_PERMISSIONS = ROLE_PERMISSION_SETS;
