import type { QueuePreset } from '@/modules/workflow';
import { LOAN_MANAGER_SERVICES } from './loanManager.config';
import { getLoanManagerNavItem } from './loanManagerNavigation';
import type { LoanManagerQueueSectionId } from './loanManager.types';

type PresetSettings = Omit<QueuePreset, 'id' | 'title' | 'description' | 'services' | 'kpis'> & Partial<Pick<QueuePreset, 'services' | 'kpis'>>;

/** Title and description come from the menu entry, so the sidebar and the page header always agree. */
function preset(id: LoanManagerQueueSectionId, settings: PresetSettings): QueuePreset {
  const item = getLoanManagerNavItem(id);
  return { id: 'loan-manager-' + id, title: item.label, description: item.description, services: LOAN_MANAGER_SERVICES, kpis: [], sort: 'dueDate', claiming: true, ...settings };
}

/** One queue per step of the Loan Manager's work, in the order the work happens. */
export const LOAN_MANAGER_QUEUES: Readonly<Record<LoanManagerQueueSectionId, QueuePreset>> = Object.freeze({
  verify: preset('verify', { sort: 'submittedAt', emptyTitle: 'No applications yet', emptyMessage: 'Applications from customers appear here automatically.' }),
  mine: preset('mine', { mineOnly: true, sort: 'submittedAt', emptyTitle: 'No applications taken yet', emptyMessage: 'Press Take application on a queue and it appears here.' }),
  payment: preset('payment', { statuses: ['PAYMENT_PENDING'], emptyTitle: 'No pending payments', emptyMessage: 'Applications appear here after you send a payment request.' }),
  working: preset('working', { statuses: ['ASSIGNED', 'PORTAL_WORK'], emptyTitle: 'No work in progress', emptyMessage: 'Assigned applications appear here while agents work on them.' }),
});
