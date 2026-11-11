import { ROUTE_PATHS } from '@/core/config/routePaths';
import type { StaffRole } from '@/modules/authentication';
import type { ServiceKind, WorkflowTeam } from '@/modules/workflow';

/** The single role this module serves; its workspace is shown only to users the server assigns this role. */
export const CA_MANAGER_MODULE_ROLE: StaffRole = 'CA_MANAGER';

export const CA_MANAGER_TEAM: WorkflowTeam = 'CA';

/** Services this workspace works on; the server applies the same scope to every request. */
export const CA_MANAGER_SERVICES: readonly ServiceKind[] = Object.freeze(['GST', 'ITR', 'INCORPORATION']);

export const CA_MANAGER_WORKSPACE_LABEL = 'CA Manager Workspace';

export const CA_MANAGER_ROOT_PATH = ROUTE_PATHS.caManagerRoot;

export const CA_MANAGER_PROFILE_PATH = `${ROUTE_PATHS.caManagerRoot}/profile`;

export const CA_MANAGER_SIDEBAR_ID = 'tx-ca-manager-sidebar';
