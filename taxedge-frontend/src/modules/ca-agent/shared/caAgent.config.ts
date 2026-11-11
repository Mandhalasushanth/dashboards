import { ROUTE_PATHS } from '@/core/config/routePaths';
import type { StaffRole } from '@/modules/authentication';
import type { ServiceKind, WorkflowTeam } from '@/modules/workflow';

/** The single role this module serves; its workspace is shown only to users the server assigns this role. */
export const CA_AGENT_MODULE_ROLE: StaffRole = 'CA_AGENT';

export const CA_AGENT_TEAM: WorkflowTeam = 'CA';

/** Services this workspace works on; the server applies the same scope to every request. */
export const CA_AGENT_SERVICES: readonly ServiceKind[] = Object.freeze(['GST', 'ITR', 'INCORPORATION']);

export const CA_AGENT_WORKSPACE_LABEL = 'CA Agent Workspace';

export const CA_AGENT_ROOT_PATH = ROUTE_PATHS.caAgentRoot;

export const CA_AGENT_PROFILE_PATH = `${ROUTE_PATHS.caAgentRoot}/profile`;

export const CA_AGENT_SIDEBAR_ID = 'tx-ca-agent-sidebar';
