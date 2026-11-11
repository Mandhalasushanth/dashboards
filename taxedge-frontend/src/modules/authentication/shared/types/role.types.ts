export const ROLES = Object.freeze(['ADMIN', 'CA_MANAGER', 'CA_AGENT', 'LOAN_MANAGER', 'LOAN_AGENT'] as const);

export type Role = (typeof ROLES)[number];

export type StaffRole = Exclude<Role, 'ADMIN'>;

export type WorkspaceArea = 'admin' | 'staff';

export type ServiceDomain = 'GLOBAL' | 'CA' | 'LOAN';

export type RoleTier = 'ADMINISTRATOR' | 'MANAGER' | 'AGENT';

export interface RoleProfile {
  readonly role: Role;
  readonly label: string;
  readonly area: WorkspaceArea;
  readonly domain: ServiceDomain;
  readonly tier: RoleTier;
  /** Every page of this role's workspace lives under this path. */
  readonly workspaceRoot: string;
  readonly landingRoute: string;
  readonly dashboardTitle: string;
  readonly dashboardSummary: string;
}

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}
