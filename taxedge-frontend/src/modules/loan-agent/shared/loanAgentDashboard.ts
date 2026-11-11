import { pickKpis, type DashboardConfig, type KpiDefinition } from '@/modules/workflow';
import { LOAN_AGENT_SERVICES } from './loanAgent.config';
import { getLoanAgentNavItem } from './loanAgentNavigation';

const to = (id: Parameters<typeof getLoanAgentNavItem>[0]) => getLoanAgentNavItem(id).path;

const LINKS: Readonly<Record<string, string>> = { total: to('applications'), assigned: to('new'), docsMissing: to('missing'), portalWork: to('portal'), completed: to('completed') };

const KPIS: readonly KpiDefinition[] = pickKpis(['total', 'assigned', 'docsMissing', 'portalWork', 'dueSoon', 'completed'], { total: 'Assigned to Me', assigned: 'New Assignments', docsMissing: 'Waiting for Documents' }).map((kpi) => ({
  ...kpi,
  to: LINKS[kpi.key] ?? to('applications')
}));

/** Loan Agent landing page: personal counts, attention items and the next work by due date. */
export const LOAN_AGENT_DASHBOARD: DashboardConfig = {
  kpis: KPIS,
  services: LOAN_AGENT_SERVICES,
  serviceLink: to('applications'),
  attention: [
    { label: 'New assignments to check', iconName: 'inbox', to: to('new'), count: (summary) => summary.assigned },
    { label: 'Overdue applications', iconName: 'alert-triangle', to: to('applications'), count: (summary) => summary.overdue },
    { label: 'Portal work in progress', iconName: 'globe', to: to('portal'), count: (summary) => summary.portalWork },
    { label: 'Waiting for documents from your manager', iconName: 'clock', to: to('missing'), count: (summary) => summary.docsMissing }
  ],
  showAgentColumn: false
};
