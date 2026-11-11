import type { RoleTier } from '@/modules/authentication';
import type { IconName } from '@/shared';
import type { CaseAction, CaseStatus, SummaryKey } from './workflow.types';

export type StatusTone = 'new' | 'info' | 'navy' | 'warning' | 'review' | 'success' | 'danger' | 'neutral';

export interface StatusMeta {
  readonly label: string;
  readonly tone: StatusTone;
  /** Summary bucket this status is counted in. */
  readonly bucket: Exclude<SummaryKey, 'total' | 'unassigned' | 'overdue' | 'dueSoon' | 'staleUnassigned'>;
  /** Who has to act next, in plain words; shown in the case header. */
  readonly nextStep: string;
}

export const STATUS_META: Readonly<Record<CaseStatus, StatusMeta>> = Object.freeze({
  SUBMITTED: { label: 'To Verify', tone: 'new', bucket: 'submitted', nextStep: 'Manager checks the details and every document, then sends the payment request.' },
  CORRECTION_NEEDED: { label: 'Waiting on Customer', tone: 'warning', bucket: 'correctionNeeded', nextStep: 'Waiting for the customer to re-upload in the mobile app. When the new copies arrive, check them again.' },
  PAYMENT_PENDING: { label: 'Awaiting Payment', tone: 'warning', bucket: 'paymentPending', nextStep: 'Waiting for the customer to pay. The application cannot be assigned until it is paid.' },
  PAID: { label: 'Ready to Assign', tone: 'info', bucket: 'readyToAssign', nextStep: 'Payment received. The manager assigns an agent.' },
  ASSIGNED: { label: 'With Agent', tone: 'navy', bucket: 'assigned', nextStep: 'The agent checks the documents, downloads them and starts the portal work.' },
  DOCS_MISSING: { label: 'Missing Documents', tone: 'danger', bucket: 'docsMissing', nextStep: 'The agent reported missing documents. The manager asks the customer for them, checks the new copies, then sends the case back to the agent.' },
  PORTAL_WORK: { label: 'Portal Work', tone: 'review', bucket: 'portalWork', nextStep: 'The agent is working on the outside portal and uploads the result when done.' },
  COMPLETED: { label: 'Completed', tone: 'success', bucket: 'completed', nextStep: 'Done. The result is visible to the manager and the customer.' },
  REJECTED: { label: 'Rejected', tone: 'danger', bucket: 'closed', nextStep: 'This application was rejected. The reason is in the history.' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral', bucket: 'closed', nextStep: 'This application was cancelled. The reason is in the history.' }
});

export const ALL_STATUSES = Object.freeze(Object.keys(STATUS_META) as CaseStatus[]);

/** Statuses after which nothing more can happen to a case. */
export const CLOSED_STATUSES: readonly CaseStatus[] = Object.freeze(['COMPLETED', 'REJECTED', 'CANCELLED']);

/** Statuses where an agent holds the case. */
export const AGENT_STATUSES: readonly CaseStatus[] = Object.freeze(['ASSIGNED', 'DOCS_MISSING', 'PORTAL_WORK']);


export interface ActionRule {
  readonly label: string;
  readonly from: readonly CaseStatus[];
  /** null keeps the current status (re-assignment of a case already with an agent). */
  readonly to: CaseStatus | null;
  readonly tiers: readonly RoleTier[];
  readonly requiresNote: boolean;
  readonly notePrompt: string;
  /** One sentence shown at the top of the confirmation dialog. */
  readonly explain: string;
  readonly iconName: IconName;
  readonly variant: 'primary' | 'secondary' | 'danger';
}

const OPEN_STATUSES: readonly CaseStatus[] = Object.freeze(['SUBMITTED', 'CORRECTION_NEEDED', 'PAYMENT_PENDING', 'PAID', 'ASSIGNED', 'DOCS_MISSING', 'PORTAL_WORK']);

/** Allowed transitions. The backend enforces the same table; this copy drives which buttons are shown. */
export const ACTION_RULES: Readonly<Record<CaseAction, ActionRule>> = Object.freeze({
  REQUEST_PAYMENT: {
    label: 'Send Payment Request',
    from: ['SUBMITTED'],
    to: 'PAYMENT_PENDING',
    tiers: ['MANAGER'],
    requiresNote: false,
    notePrompt: 'Message to the customer (optional)',
    explain: 'All details and documents are verified. The customer gets a payment request in the mobile app.',
    iconName: 'credit-card',
    variant: 'primary'
  },
  SEND_BACK: {
    label: 'Send Back to Customer',
    from: ['SUBMITTED'],
    to: 'CORRECTION_NEEDED',
    tiers: ['MANAGER'],
    requiresNote: true,
    notePrompt: 'What should the customer fix?',
    explain: 'The customer is asked to correct and re-upload. The application waits until they resubmit.',
    iconName: 'rotate-ccw',
    variant: 'secondary'
  },
  RECHECK: {
    label: 'Customer Resubmitted · Check Again',
    from: ['CORRECTION_NEEDED'],
    to: 'SUBMITTED',
    tiers: ['MANAGER'],
    requiresNote: false,
    notePrompt: 'Note (optional)',
    explain: 'Moves the application back to "To Verify" so you can check the new documents.',
    iconName: 'rotate-cw',
    variant: 'primary'
  },
  MARK_PAID: {
    label: 'Mark as Paid',
    from: ['PAYMENT_PENDING'],
    to: 'PAID',
    tiers: ['MANAGER', 'ADMINISTRATOR'],
    requiresNote: false,
    notePrompt: 'Note (optional)',
    explain: 'Use this only when the payment is confirmed (gateway, UPI or bank). The application becomes ready to assign.',
    iconName: 'circle-check',
    variant: 'primary'
  },
  ASSIGN: {
    label: 'Assign Agent',
    from: ['PAID', 'ASSIGNED', 'DOCS_MISSING', 'PORTAL_WORK'],
    to: null,
    tiers: ['MANAGER', 'ADMINISTRATOR'],
    requiresNote: false,
    notePrompt: 'Instructions for the agent',
    explain: 'Only paid applications can be assigned.',
    iconName: 'user-check',
    variant: 'primary'
  },
  REPORT_MISSING: {
    label: 'Report Missing Documents',
    from: ['ASSIGNED'],
    to: 'DOCS_MISSING',
    tiers: ['AGENT'],
    requiresNote: false,
    notePrompt: 'Message to your manager (optional)',
    explain: 'Your manager gets a message listing what is missing. The application comes back to you once it is updated.',
    iconName: 'alert-triangle',
    variant: 'secondary'
  },
  FORWARD_TO_CUSTOMER: {
    label: 'Request from Customer',
    from: ['DOCS_MISSING'],
    to: null,
    tiers: ['MANAGER'],
    requiresNote: false,
    notePrompt: 'Message to the customer (the agent’s message is used if left empty)',
    explain: 'The customer is asked to upload the missing documents in the mobile app. Check the new copies when they arrive, then send the case back to the agent.',
    iconName: 'rotate-ccw',
    variant: 'primary'
  },
  DOCS_UPDATED: {
    label: 'Documents Updated · Send to Agent',
    from: ['DOCS_MISSING'],
    to: 'ASSIGNED',
    tiers: ['MANAGER'],
    requiresNote: false,
    notePrompt: 'What was updated? (optional)',
    explain: 'Use this after the customer has sent the new copies and you have marked them Correct. The agent is notified.',
    iconName: 'send',
    variant: 'primary'
  },
  START_PORTAL_WORK: {
    label: 'Start Portal Work',
    from: ['ASSIGNED'],
    to: 'PORTAL_WORK',
    tiers: ['AGENT'],
    requiresNote: false,
    notePrompt: 'Portal or note (optional)',
    explain: 'Confirms the documents are complete and downloaded, and that you are starting work on the outside portal.',
    iconName: 'arrow-right',
    variant: 'primary'
  },
  SUBMIT_OUTPUT: {
    label: 'Work Completed · Submit',
    from: ['PORTAL_WORK'],
    to: 'COMPLETED',
    tiers: ['AGENT'],
    requiresNote: false,
    notePrompt: 'Message for the customer (optional)',
    explain: 'The uploaded result becomes visible to your manager and the customer.',
    iconName: 'check-check',
    variant: 'primary'
  },
  REJECT: {
    label: 'Reject Application',
    from: ['SUBMITTED', 'CORRECTION_NEEDED'],
    to: 'REJECTED',
    tiers: ['MANAGER'],
    requiresNote: true,
    notePrompt: 'Reason for rejection',
    explain: 'This closes the application and cannot be undone. The reason is recorded in the audit log.',
    iconName: 'x',
    variant: 'danger'
  },
  CANCEL: {
    label: 'Cancel Application',
    from: OPEN_STATUSES,
    to: 'CANCELLED',
    tiers: ['MANAGER', 'ADMINISTRATOR'],
    requiresNote: true,
    notePrompt: 'Reason for cancellation',
    explain: 'This closes the application and cannot be undone. The reason is recorded in the audit log.',
    iconName: 'trash',
    variant: 'danger'
  }
});

export const CASE_ACTIONS = Object.freeze(Object.keys(ACTION_RULES) as CaseAction[]);

/** Minimum characters for any mandatory reason, comment or instruction. */
export const MIN_NOTE_LENGTH = 5;
export const MAX_NOTE_LENGTH = 1000;
/** Service fee bounds in whole rupees. */
export const MIN_FEE = 1;
export const MAX_FEE = 1_000_000;
/** A case with a due date inside this window counts as "due soon". */
export const DUE_SOON_DAYS = 2;
/** Paid applications should get an agent within this many hours; older ones are flagged for attention. */
export const ASSIGNMENT_TARGET_HOURS = 24;
export const DEFAULT_PAGE_SIZE = 1000;
