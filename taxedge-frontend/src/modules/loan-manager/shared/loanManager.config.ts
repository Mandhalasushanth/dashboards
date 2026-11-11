import { ROUTE_PATHS } from '@/core/config/routePaths';
import type { StaffRole } from '@/modules/authentication';
import type { ServiceKind, WorkflowTeam } from '@/modules/workflow';

/** The single role this module serves; its workspace is shown only to users the server assigns this role. */
export const LOAN_MANAGER_MODULE_ROLE: StaffRole = 'LOAN_MANAGER';

export const LOAN_MANAGER_TEAM: WorkflowTeam = 'LOAN';

/** Services this workspace works on; the server applies the same scope to every request. */
export const LOAN_MANAGER_SERVICES: readonly ServiceKind[] = Object.freeze(['LOAN', 'INSURANCE']);

export const LOAN_MANAGER_WORKSPACE_LABEL = 'Loan Manager Workspace';

export const LOAN_MANAGER_ROOT_PATH = ROUTE_PATHS.loanManagerRoot;

export const LOAN_MANAGER_PROFILE_PATH = `${ROUTE_PATHS.loanManagerRoot}/profile`;

export const LOAN_MANAGER_SIDEBAR_ID = 'tx-loan-manager-sidebar';
