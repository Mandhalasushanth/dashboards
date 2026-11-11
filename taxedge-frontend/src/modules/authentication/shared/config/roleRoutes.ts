import { ROUTE_PATHS } from '@/core/config/routePaths';
import { PERMISSIONS, type KnownPermission } from '../types/permission.types';
import type { Role, RoleProfile, RoleTier, ServiceDomain, StaffRole, WorkspaceArea } from '../types/role.types';

export const DOMAIN_LABELS: Readonly<Record<ServiceDomain, string>> = Object.freeze({
  GLOBAL: 'All services',
  CA: 'Chartered Accountancy (CA)',
  LOAN: 'Loans & Insurance'
});

export const TIER_LABELS: Readonly<Record<RoleTier, string>> = Object.freeze({
  ADMINISTRATOR: 'Administrator',
  MANAGER: 'Manager',
  AGENT: 'Agent'
});

/** Presentation and navigation metadata per role. Authorization itself is decided by the server. */
export const ROLE_PROFILES: Readonly<Record<Role, RoleProfile>> = Object.freeze({
  ADMIN: {
    role: 'ADMIN',
    label: 'Administrator',
    area: 'admin',
    domain: 'GLOBAL',
    tier: 'ADMINISTRATOR',
    workspaceRoot: ROUTE_PATHS.adminRoot,
    landingRoute: ROUTE_PATHS.adminDashboard,
    dashboardTitle: 'Admin Dashboard',
    dashboardSummary: 'Provision staff accounts, oversee CA and loan operations, and monitor platform activity.'
  },
  CA_MANAGER: {
    role: 'CA_MANAGER',
    label: 'CA Manager',
    area: 'staff',
    domain: 'CA',
    tier: 'MANAGER',
    workspaceRoot: ROUTE_PATHS.caManagerRoot,
    landingRoute: `${ROUTE_PATHS.caManagerRoot}/dashboard`,
    dashboardTitle: 'CA Manager Dashboard',
    dashboardSummary: 'Verify GST, ITR and incorporation applications, request payment, assign CA agents and track delivery.'
  },
  CA_AGENT: {
    role: 'CA_AGENT',
    label: 'CA Agent',
    area: 'staff',
    domain: 'CA',
    tier: 'AGENT',
    workspaceRoot: ROUTE_PATHS.caAgentRoot,
    landingRoute: `${ROUTE_PATHS.caAgentRoot}/dashboard`,
    dashboardTitle: 'CA Agent Dashboard',
    dashboardSummary: 'Check and download the documents of your assigned cases, do the portal work and deliver the result.'
  },
  LOAN_MANAGER: {
    role: 'LOAN_MANAGER',
    label: 'Loan Manager',
    area: 'staff',
    domain: 'LOAN',
    tier: 'MANAGER',
    workspaceRoot: ROUTE_PATHS.loanManagerRoot,
    landingRoute: `${ROUTE_PATHS.loanManagerRoot}/dashboard`,
    dashboardTitle: 'Loan Manager Dashboard',
    dashboardSummary: 'Verify loan and insurance applications, request payment, assign loan agents and track delivery.'
  },
  LOAN_AGENT: {
    role: 'LOAN_AGENT',
    label: 'Loan Agent',
    area: 'staff',
    domain: 'LOAN',
    tier: 'AGENT',
    workspaceRoot: ROUTE_PATHS.loanAgentRoot,
    landingRoute: `${ROUTE_PATHS.loanAgentRoot}/dashboard`,
    dashboardTitle: 'Loan Agent Dashboard',
    dashboardSummary: 'Check and download the documents of your assigned cases, do the lender or insurer portal work and deliver the result.'
  }
});

export const STAFF_ROLES: readonly StaffRole[] = Object.freeze(['CA_MANAGER', 'CA_AGENT', 'LOAN_MANAGER', 'LOAN_AGENT']);

export const ADMIN_ROLES: readonly Role[] = Object.freeze(['ADMIN']);

/** Root path and dashboard permission for each workspace area. */
export const AREA_ACCESS: Readonly<Record<WorkspaceArea, { rootPath: string; permission: KnownPermission }>> =
  Object.freeze({
    admin: { rootPath: ROUTE_PATHS.adminRoot, permission: PERMISSIONS.ADMIN_DASHBOARD_VIEW },
    staff: { rootPath: ROUTE_PATHS.staffRoot, permission: PERMISSIONS.STAFF_DASHBOARD_VIEW }
  });
