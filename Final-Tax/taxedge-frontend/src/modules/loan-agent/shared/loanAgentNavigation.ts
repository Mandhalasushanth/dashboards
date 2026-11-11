import { LOAN_AGENT_PROFILE_PATH, LOAN_AGENT_ROOT_PATH, LOAN_AGENT_WORKSPACE_LABEL } from './loanAgent.config';
import type { LoanAgentNavItem, LoanAgentSectionId } from './loanAgent.types';

/** Loan Agent menu, in display order. The first item is the landing page. */
export const LOAN_AGENT_NAV_ITEMS: readonly LoanAgentNavItem[] = Object.freeze([
  {
    id: 'overview',
    label: 'My Dashboard',
    path: `${LOAN_AGENT_ROOT_PATH}/dashboard`,
    iconName: 'layout-dashboard',
    group: 'My Work',
    title: 'Loan Agent Dashboard',
    description: 'Your assigned work at a glance.'
  },
  {
    id: 'new',
    label: 'New Assignments',
    path: `${LOAN_AGENT_ROOT_PATH}/new`,
    iconName: 'inbox',
    group: 'My Work',
    description: 'Check the documents, download them and start on the portal.',
    counterKey: 'assigned'
  },
  {
    id: 'missing',
    label: 'Waiting for Documents',
    path: `${LOAN_AGENT_ROOT_PATH}/missing`,
    iconName: 'clock',
    group: 'My Work',
    description: 'You reported missing documents. These come back to you once your manager updates them.'
  },
  {
    id: 'portal',
    label: 'Portal Work',
    path: `${LOAN_AGENT_ROOT_PATH}/portal`,
    iconName: 'globe',
    group: 'My Work',
    description: 'Work in progress on the outside portal. Upload the result and submit when done.',
    counterKey: 'portalWork'
  },
  {
    id: 'completed',
    label: 'Completed',
    path: `${LOAN_AGENT_ROOT_PATH}/completed`,
    iconName: 'circle-check',
    group: 'My Work',
    description: 'Results you delivered to the customer.'
  },
  {
    id: 'applications',
    label: 'All My Applications',
    path: `${LOAN_AGENT_ROOT_PATH}/applications`,
    iconName: 'file-spreadsheet',
    group: 'My Work',
    description: 'Every application assigned to you, in any status.',
    hiddenFromMenu: true
  },
  {
    id: 'communication',
    label: 'Communication',
    path: `${LOAN_AGENT_ROOT_PATH}/communication`,
    iconName: 'message-square',
    group: 'My Work',
    description: 'Messages with your manager and the administrator.',
    counterKey: 'communication'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: `${LOAN_AGENT_ROOT_PATH}/notifications`,
    iconName: 'bell',
    group: 'My Work',
    description: 'New assignments and updated documents.',
    counterKey: 'notifications'
  }
]);

export function findLoanAgentNavItem(pathname: string): LoanAgentNavItem | undefined {
  return LOAN_AGENT_NAV_ITEMS.find((item) => item.path === pathname);
}

/** Looks up a section's menu entry; every LoanAgentSectionId is defined above, so a miss is a programming error. */
export function getLoanAgentNavItem(id: LoanAgentSectionId): LoanAgentNavItem {
  const item = LOAN_AGENT_NAV_ITEMS.find((entry) => entry.id === id);
  if (!item) {
    throw new Error(`Loan Agent navigation item "${id}" is not configured.`);
  }
  return item;
}

/** Title shown in the top header for the current page. */
export function resolveLoanAgentPageTitle(pathname: string): string {
  if (pathname === LOAN_AGENT_PROFILE_PATH) {
    return 'My Profile';
  }
  const item = findLoanAgentNavItem(pathname);
  return item ? item.title ?? item.label : LOAN_AGENT_WORKSPACE_LABEL;
}

/** Sidebar entries that also appear as quick-access buttons in the top header, in display order. */
export const LOAN_AGENT_HEADER_SHORTCUT_IDS: readonly LoanAgentSectionId[] = Object.freeze(['notifications', 'communication', 'new']);
