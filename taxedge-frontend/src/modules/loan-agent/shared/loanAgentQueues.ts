import { pickKpis, type QueuePreset } from '@/modules/workflow';
import { LOAN_AGENT_SERVICES } from './loanAgent.config';
import { getLoanAgentNavItem } from './loanAgentNavigation';
import type { LoanAgentQueueSectionId } from './loanAgent.types';

const QUEUE_KPIS = pickKpis(['assigned', 'docsMissing', 'portalWork', 'dueSoon'], { assigned: 'New Assignments', docsMissing: 'Waiting for Documents' });

type PresetSettings = Omit<QueuePreset, 'id' | 'title' | 'description' | 'services' | 'kpis'> & Partial<Pick<QueuePreset, 'services' | 'kpis'>>;

/** Title and description come from the menu entry, so the sidebar and the page header always agree. */
function preset(id: LoanAgentQueueSectionId, settings: PresetSettings): QueuePreset {
  const item = getLoanAgentNavItem(id);
  return { id: 'loan-agent-' + id, title: item.label, description: item.description, services: LOAN_AGENT_SERVICES, kpis: [], sort: 'priority', ...settings };
}

/** One queue per step of the Loan Agent's work, in the order the work happens. */
export const LOAN_AGENT_QUEUES: Readonly<Record<LoanAgentQueueSectionId, QueuePreset>> = Object.freeze({
  new: preset('new', { statuses: ['ASSIGNED'], emptyTitle: 'No new assignments', emptyMessage: 'Applications your manager assigns to you appear here.' }),
  missing: preset('missing', { statuses: ['DOCS_MISSING'], emptyTitle: 'Nothing waiting', emptyMessage: 'Applications where you reported missing documents appear here.' }),
  portal: preset('portal', { statuses: ['PORTAL_WORK'], emptyTitle: 'No portal work open', emptyMessage: 'Applications appear here once you start portal work.' }),
  completed: preset('completed', { statuses: ['COMPLETED'], sort: 'submittedAt', emptyTitle: 'Nothing completed yet', emptyMessage: 'Delivered results appear here.' }),
  applications: preset('applications', { kpis: QUEUE_KPIS, emptyTitle: 'No applications assigned yet', emptyMessage: 'Applications your manager assigns to you appear here.' })
});
