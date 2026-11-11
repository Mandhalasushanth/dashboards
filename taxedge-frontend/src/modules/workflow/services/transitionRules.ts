import { ROLE_PROFILES, type Role, type RoleTier } from '@/modules/authentication';
import { getServiceType } from '../shared/serviceTypes';
import { ACTION_RULES, CASE_ACTIONS, CLOSED_STATUSES, MAX_FEE, MAX_NOTE_LENGTH, MIN_FEE, MIN_NOTE_LENGTH } from '../shared/workflowStatuses';
import type { CaseAction, CaseStatus, WorkflowActor, WorkflowCase, WorkflowTeam } from '../shared/workflow.types';

export type RuleErrorCode = 'FORBIDDEN' | 'VALIDATION_FAILED' | 'CONFLICT';

/** Raised when a request breaks a workflow rule; the API layer turns it into a 403/409/422 response. */
export class WorkflowRuleError extends Error {
  readonly code: RuleErrorCode;

  constructor(code: RuleErrorCode, message: string) {
    super(message);
    this.name = 'WorkflowRuleError';
    this.code = code;
  }
}

const fail = (code: RuleErrorCode, message: string): never => {
  throw new WorkflowRuleError(code, message);
};

export function tierOf(role: Role): RoleTier {
  return ROLE_PROFILES[role].tier;
}

/** The team a staff role belongs to; administrators span both teams. */
export function teamOf(role: Role): WorkflowTeam | null {
  const domain = ROLE_PROFILES[role].domain;
  return domain === 'GLOBAL' ? null : domain;
}

export function canViewCase(actor: WorkflowActor, item: WorkflowCase): boolean {
  const tier = tierOf(actor.role);
  if (tier === 'ADMINISTRATOR') {
    return true;
  }
  if (tier === 'MANAGER') {
    return teamOf(actor.role) === item.team;
  }
  return item.team === teamOf(actor.role) && item.assignment.agentId === actor.id;
}

const isTeamManager = (actor: WorkflowActor, item: WorkflowCase) => tierOf(actor.role) === 'MANAGER' && canViewCase(actor, item);
const isAssignedAgent = (actor: WorkflowActor, item: WorkflowCase) => tierOf(actor.role) === 'AGENT' && canViewCase(actor, item);

/** Internal notes can be added by any staff member who can see an open case; clients never see them. */
export function canAddNote(actor: WorkflowActor, item: WorkflowCase): boolean {
  return canViewCase(actor, item) && !CLOSED_STATUSES.includes(item.status);
}

/** The manager verifies documents before payment, and again after the agent reports something missing. */
export function canReviewDocuments(actor: WorkflowActor, item: WorkflowCase): boolean {
  return isTeamManager(actor, item) && (item.status === 'SUBMITTED' || item.status === 'DOCS_MISSING');
}

/** The customer uploads in the app; the manager may upload on their behalf while documents are being fixed. */
export function canUploadDocuments(actor: WorkflowActor, item: WorkflowCase): boolean {
  return isTeamManager(actor, item) && ['SUBMITTED', 'CORRECTION_NEEDED', 'DOCS_MISSING'].includes(item.status);
}

export function canDownloadDocuments(actor: WorkflowActor, item: WorkflowCase): boolean {
  return isAssignedAgent(actor, item) && (item.status === 'ASSIGNED' || item.status === 'PORTAL_WORK');
}

export function canUploadOutput(actor: WorkflowActor, item: WorkflowCase): boolean {
  return isAssignedAgent(actor, item) && item.status === 'PORTAL_WORK';
}

function ruleAllows(actor: WorkflowActor, item: WorkflowCase, action: CaseAction): boolean {
  const rule = ACTION_RULES[action];
  return rule.tiers.includes(tierOf(actor.role)) && rule.from.includes(item.status);
}

/** Actions the actor may take on this case right now; drives which buttons are rendered. */
export function availableActions(actor: WorkflowActor, item: WorkflowCase): readonly CaseAction[] {
  return canViewCase(actor, item) ? CASE_ACTIONS.filter((action) => ruleAllows(actor, item, action)) : [];
}

const unverifiedDocuments = (item: WorkflowCase): readonly string[] =>
  item.documents
    .filter((doc) => doc.required && doc.state !== 'VERIFIED')
    .map((doc) => `${doc.label} is ${doc.state === 'MISSING' ? 'not uploaded' : doc.state === 'REJECTED' ? 'marked wrong' : 'not verified yet'}.`);

const unusableDocuments = (item: WorkflowCase): readonly string[] =>
  item.documents
    .filter((doc) => doc.required && (doc.state === 'MISSING' || doc.state === 'REJECTED'))
    .map((doc) => `${doc.label} is ${doc.state === 'MISSING' ? 'not uploaded' : 'marked wrong'}.`);

const missingFields = (item: WorkflowCase): readonly string[] =>
  getServiceType(item.serviceType, item.service)
    .fields.filter((field) => field.required && !item.details[field.id]?.trim())
    .map((field) => `${field.label} is empty.`);

const BLOCKERS: Readonly<Partial<Record<CaseAction, (item: WorkflowCase) => readonly string[]>>> = Object.freeze({
  REQUEST_PAYMENT: (item) => [...missingFields(item), ...unverifiedDocuments(item)],
  // Checking again only makes sense once the customer has sent a new copy of everything sent back.
  RECHECK: (item) =>
    item.documents
      .filter((doc) => doc.state === 'REJECTED' || (doc.state === 'MISSING' && (item.openIssue?.documentLabels ?? []).includes(doc.label)))
      .map((doc) => `Waiting for the customer to upload a new ${doc.label}.`),
  DOCS_UPDATED: (item) => [
    ...unverifiedDocuments(item),
    ...item.documents
      .filter((doc) => !doc.required && doc.state !== 'VERIFIED' && (item.openIssue?.documentLabels ?? []).includes(doc.label))
      .map((doc) => `${doc.label} (reported by the agent) is ${doc.state === 'MISSING' ? 'not uploaded' : 'not marked correct yet'}.`)
  ],
  // The agent cannot mark documents correct (the manager does), so only a missing or wrong required document stops the work.
  START_PORTAL_WORK: (item) => [...unusableDocuments(item), ...(item.documentsDownloadedAt ? [] : ['Download the documents first.'])],
  SUBMIT_OUTPUT: (item) => (item.outputs.length > 0 ? [] : ['Upload at least one result file (acknowledgement, certificate or filed return).'])
});

/** Everything still stopping an action, in plain words. Empty means the action can go ahead. */
export function actionBlockers(item: WorkflowCase, action: CaseAction): readonly string[] {
  return BLOCKERS[action]?.(item) ?? [];
}

export function validateNote(note: string, required: boolean, label = 'A note'): string | null {
  const trimmed = note.trim();
  if (required && trimmed.length < MIN_NOTE_LENGTH) {
    return `${label} of at least ${MIN_NOTE_LENGTH} characters is required.`;
  }
  return trimmed.length > MAX_NOTE_LENGTH ? `${label} must be at most ${MAX_NOTE_LENGTH} characters.` : null;
}

/** Whole rupees inside the allowed fee range. */
export function validateFee(amount: number | undefined): string | null {
  return amount !== undefined && Number.isInteger(amount) && amount >= MIN_FEE && amount <= MAX_FEE
    ? null
    : `Enter a fee between ₹${MIN_FEE} and ₹${MAX_FEE.toLocaleString('en-IN')} (whole rupees).`;
}

/** Payment references and portal acknowledgements: letters, digits, "/" and "-". */
const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9/-]{2,39}$/;

export function validateReference(value: string | undefined, required: boolean, label: string): string | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return required ? `${label} is required.` : null;
  return REFERENCE_PATTERN.test(trimmed) ? null : `${label}: use 3–40 letters, digits, "/" or "-".`;
}

export interface TransitionRequest {
  readonly action: Exclude<CaseAction, 'ASSIGN'>;
  readonly note: string;
  readonly reference?: string;
  readonly amount?: number;
  readonly documentIds?: readonly string[];
}

/** Input checks specific to one action; the note rule from ACTION_RULES is checked for every action. */
function inputError(item: WorkflowCase, request: TransitionRequest): string | null {
  const picked = request.documentIds ?? [];
  const unknownDocument = picked.some((id) => !item.documents.some((doc) => doc.id === id));
  const checks: Readonly<Partial<Record<CaseAction, () => string | null>>> = {
    REQUEST_PAYMENT: () => validateFee(request.amount),
    MARK_PAID: () => validateReference(request.reference, true, 'Payment reference'),
    SUBMIT_OUTPUT: () => validateReference(request.reference, false, 'Acknowledgement number'),
    REPORT_MISSING: () => (picked.length === 0 && request.note.trim().length < MIN_NOTE_LENGTH ? 'Tick the missing documents or describe what is missing.' : null)
  };
  return unknownDocument ? 'One of the selected documents does not belong to this application.' : checks[request.action]?.() ?? null;
}

/**
 * Validates role, ownership, current state, required reason and action inputs, then returns the
 * resulting status. Mirrors the server-side transition service; the server's answer is authoritative.
 */
export function resolveTransition(actor: WorkflowActor, item: WorkflowCase, request: TransitionRequest): CaseStatus {
  if (!canViewCase(actor, item)) {
    fail('FORBIDDEN', 'You are not authorised to work on this application.');
  }
  const rule = ACTION_RULES[request.action];
  if (!rule.tiers.includes(tierOf(actor.role))) {
    fail('FORBIDDEN', `Your role cannot perform "${rule.label}".`);
  }
  if (!rule.from.includes(item.status)) {
    fail('CONFLICT', `"${rule.label}" is not allowed while the application is in its current status.`);
  }
  const problem = validateNote(request.note, rule.requiresNote, 'A reason') ?? inputError(item, request) ?? actionBlockers(item, request.action)[0] ?? null;
  if (problem) {
    fail('VALIDATION_FAILED', problem);
  }
  return rule.to ?? item.status;
}

/** Assignment rule: only active agents of the owning team, assigned by that team's manager or an admin. */
export function validateAssignment(
  actor: WorkflowActor,
  item: WorkflowCase,
  agent: { readonly id: string; readonly role: Role; readonly active: boolean } | undefined,
  /** Keeping the same agent is allowed only when the due date is being moved. */
  rescheduling = false
): void {
  if (!canViewCase(actor, item) || !ACTION_RULES.ASSIGN.tiers.includes(tierOf(actor.role))) {
    fail('FORBIDDEN', 'You cannot assign this application.');
  }
  if (!ruleAllows(actor, item, 'ASSIGN')) {
    fail('CONFLICT', 'An application can be assigned only after the customer has paid.');
  }
  if (!agent) {
    return fail('VALIDATION_FAILED', 'Select an agent to assign.');
  }
  if (tierOf(agent.role) !== 'AGENT' || teamOf(agent.role) !== item.team) {
    fail('FORBIDDEN', 'Applications can only be assigned to agents of the owning team.');
  }
  if (!agent.active) {
    fail('VALIDATION_FAILED', 'This agent is inactive and cannot receive assignments.');
  }
  if (item.assignment.agentId === agent.id && !rescheduling) {
    fail('CONFLICT', 'The application is already assigned to this agent. Change the due date to reschedule it.');
  }
}
