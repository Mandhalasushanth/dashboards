import { ROUTE_PATHS } from '@/core/config/routePaths';
import { pickKpis, SERVICE_KINDS, type DashboardConfig, type KpiDefinition, type QueuePreset } from '@/modules/workflow';

/**
 * Admin view of the application workflow: organisation-wide, across CA and loan services. The admin watches
 * every step (verification, payment, assignment, portal work, delivery), can confirm a payment, reassign
 * with a recorded reason and cancel; verification stays with the owning managers.
 */
export const ADMIN_APPLICATIONS_PRESET: QueuePreset = Object.freeze({
  id: 'admin-all-applications',
  title: 'All Applications',
  description: 'Every application across GST, ITR, Incorporation, Loans and Insurance: stage, payment, agent and full history.',
  services: SERVICE_KINDS,
  kpis: pickKpis(['submitted', 'paymentPending', 'readyToAssign', 'docsMissing', 'portalWork', 'overdue', 'completed']),
  emptyTitle: 'No applications yet',
  emptyMessage: 'Applications submitted by clients appear here as soon as they are routed.',
  allowIntake: false
});

const toApplications = (kpis: readonly KpiDefinition[]): readonly KpiDefinition[] =>
  kpis.map((kpi) => ({ ...kpi, to: ROUTE_PATHS.adminApplications }));

const config: DashboardConfig = {
  kpis: toApplications(
    pickKpis(['total', 'submitted', 'paymentPending', 'readyToAssign', 'assigned', 'portalWork', 'completed', 'closed'], {
      total: 'Total Applications',
      assigned: 'Agent Checking'
    })
  ),
  services: SERVICE_KINDS,
  serviceLink: ROUTE_PATHS.adminApplications,
  attention: [
    { label: 'Paid but not assigned for over 24 hours', iconName: 'clock', to: ROUTE_PATHS.adminApplications, count: (summary) => summary.staleUnassigned },
    { label: 'Delayed past due date', iconName: 'alert-triangle', to: ROUTE_PATHS.adminApplications, count: (summary) => summary.overdue },
    { label: 'Missing documents reported by agents', iconName: 'file-text', to: ROUTE_PATHS.adminApplications, count: (summary) => summary.docsMissing },
    { label: 'Waiting for customer payment', iconName: 'credit-card', to: ROUTE_PATHS.adminApplications, count: (summary) => summary.paymentPending }
  ],
  workloadLink: ROUTE_PATHS.adminAgents,
  showAgentColumn: true
};

export const ADMIN_DASHBOARD_CONFIG: DashboardConfig = Object.freeze(config);
