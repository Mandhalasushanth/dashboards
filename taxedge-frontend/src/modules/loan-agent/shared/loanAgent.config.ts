import { ROUTE_PATHS } from '@/core/config/routePaths';
import type { StaffRole } from '@/modules/authentication';
import type { ServiceKind, WorkflowTeam } from '@/modules/workflow';

/** The single role this module serves; its workspace is shown only to users the server assigns this role. */
export const LOAN_AGENT_MODULE_ROLE: StaffRole = 'LOAN_AGENT';

export const LOAN_AGENT_TEAM: WorkflowTeam = 'LOAN';

/** Services this workspace works on; the server applies the same scope to every request. */
export const LOAN_AGENT_SERVICES: readonly ServiceKind[] = Object.freeze(['LOAN', 'INSURANCE']);

export const LOAN_AGENT_WORKSPACE_LABEL = 'Loan Agent Workspace';

export const LOAN_AGENT_ROOT_PATH = ROUTE_PATHS.loanAgentRoot;

export const LOAN_AGENT_PROFILE_PATH = `${ROUTE_PATHS.loanAgentRoot}/profile`;

export const LOAN_AGENT_SIDEBAR_ID = 'tx-loan-agent-sidebar';
