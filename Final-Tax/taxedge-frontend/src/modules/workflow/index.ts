/**
 * Workflow module: the application lifecycle shared by every role — routing to the owning team,
 * verification, payment, assignment, portal work and delivery, notifications and audit history.
 * Role modules (admin, ca-manager, ca-agent, loan-manager, loan-agent) import only from this file.
 */
export { workflowApi } from './api/workflowApi';
export { fetchBucketClaims, type BucketClaim } from './api/bucketApi';
export { emitWorkflowChanged, onWorkflowChanged } from './api/workflowEvents';

export { CaseQueueView, type CaseQueueViewProps } from './components/queue/CaseQueueView';
export { RoleDashboardView, type AttentionItem, type DashboardConfig } from './components/dashboard/RoleDashboardView';
export { TeamWorkloadView } from './components/dashboard/TeamWorkloadView';
export { WorkflowNotificationsView } from './components/notifications/WorkflowNotificationsView';
export { WorkflowModal, type WorkflowModalProps } from './components/modals/WorkflowModal';
export { CaseStatusBadge, ServiceBadge } from './components/badges/CaseBadges';

export type { QueueEntry } from './hooks/useCaseQueue';
export { messageOf, useWorkflowResource } from './hooks/useWorkflowResource';
export { formatRupees } from './shared/fieldFormat';
export { actionBlockers, validateNote } from './services/transitionRules';
export { getServiceDefinition, servicesForTeam, SERVICE_DEFINITIONS, SERVICE_KINDS } from './shared/workflowServices';
export { getServiceType, requiredDocumentsFor, serviceTypesFor, SERVICE_TYPES, type ServiceTypeDefinition } from './shared/serviceTypes';
export { AGENT_STATUSES, CLOSED_STATUSES, MIN_NOTE_LENGTH, STATUS_META } from './shared/workflowStatuses';
export { pickKpis, type KpiDefinition, type QueuePreset } from './shared/workflowViews';
export type { AgentWorkload, CaseStatus, CaseSummary, ServiceKind, WorkflowCase, WorkflowTeam } from './shared/workflow.types';
export type { DemoCaseSeed } from './dev/demoWorkflowSeeds';

/** Organisation-wide counts for badges outside the workflow screens; scoped by the server to the session. */
export const fetchWorkflowSummary = () => import('./api/workflowApi').then(({ workflowApi }) => workflowApi.summary());

/** Unread in-app notifications for the signed-in user. */
export const fetchUnreadNotificationCount = () =>
  import('./api/workflowApi').then(async ({ workflowApi }) => (await workflowApi.notifications()).filter((entry) => !entry.read).length);
