import { pickKpis, type DashboardConfig, type KpiDefinition } from '@/modules/workflow';
import { LOAN_MANAGER_SERVICES } from './loanManager.config';
import { getLoanManagerNavItem } from './loanManagerNavigation';

const to = (id: Parameters<typeof getLoanManagerNavItem>[0]) => getLoanManagerNavItem(id).path;

const LINKS: Readonly<Record<string, string>> = { submitted: to('verify'), paymentPending: to('payment'), assigned: to('working'), portalWork: to('working') };

const KPIS: readonly KpiDefinition[] = pickKpis(['submitted', 'paymentPending', 'readyToAssign', 'docsMissing', 'assigned', 'portalWork', 'completed', 'overdue'], { assigned: 'Agent Checking' }).map((kpi) => ({
  ...kpi,
  to: LINKS[kpi.key] ?? to('verify')
}));

/** Loan Manager landing page: team counts, service breakdown, attention items and the newest applications to verify. */
export const LOAN_MANAGER_DASHBOARD: DashboardConfig = {
  kpis: KPIS,
  services: LOAN_MANAGER_SERVICES,
  serviceLink: to('verify'),
  attention: [
    { label: 'New applications to verify', iconName: 'inbox', to: to('verify'), count: (summary) => summary.submitted },
    { label: 'Paid but not assigned for over 24 hours', iconName: 'clock', to: to('verify'), count: (summary) => summary.staleUnassigned },
    { label: 'Missing documents reported by agents', iconName: 'alert-triangle', to: to('verify'), count: (summary) => summary.docsMissing },
    { label: 'Overdue applications', iconName: 'alert-triangle', to: to('verify'), count: (summary) => summary.overdue }
  ],
  showWorkload: true,
  showAgentColumn: true
};
