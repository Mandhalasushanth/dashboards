import { WorkflowRuleError, canAddNote, canDownloadDocuments, canReviewDocuments, canUploadOutput, resolveTransition, tierOf, validateAssignment, validateNote } from '../services/transitionRules';
import { ACTION_RULES, STATUS_META } from '../shared/workflowStatuses';
import { saveState, type DemoState, type StoredNotification } from './demoWorkflowState';
import type { CaseDocument, CaseEvent, CaseMutation, CaseStatus, OpenIssue, StaffOption, TransitionInput, WorkflowActor, WorkflowCase } from '../shared/workflow.types';

/**
 * DEVELOPMENT ONLY. The write side of the demo backend: every change is validated with the same rules
 * the server enforces, recorded as an audit event and announced to the people who must act next.
 */
const DAY = 86_400_000;

export interface Context {
  readonly staff: readonly StaffOption[];
  readonly actor: WorkflowActor;
  readonly state: DemoState;
}

export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export const reject = (code: WorkflowRuleError['code'], message: string): never => {
  throw new WorkflowRuleError(code, message);
};

export function makeEvent(actor: WorkflowActor, item: WorkflowCase, action: string, toStatus: CaseStatus | null, note: string | null, extra: Partial<CaseEvent> = {}): CaseEvent {
  return {
    id: newId('EVT'),
    caseId: item.id,
    action,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    fromStatus: toStatus ? item.status : null,
    toStatus,
    note,
    reference: null,
    clientVisible: true,
    createdAt: new Date().toISOString(),
    ...extra
  };
}

/** Applies a change plus its audit event and bumps the concurrency version. */
export function commit(item: WorkflowCase, patch: Partial<WorkflowCase>, event: CaseEvent): WorkflowCase {
  return { ...item, ...patch, history: [...item.history, event], version: item.version + 1, updatedAt: event.createdAt };
}

export function notify(recipients: readonly (string | null)[], item: WorkflowCase, message: string): StoredNotification[] {
  const unique = [...new Set(recipients.filter((id): id is string => Boolean(id)))];
  return unique.map((recipientId) => ({
    id: newId('NTF'),
    recipientId,
    caseId: item.id,
    referenceNumber: item.referenceNumber,
    message,
    createdAt: new Date().toISOString(),
    read: false
  }));
}

export const teamManagers = (context: Context, item: WorkflowCase) =>
  context.staff.filter((member) => member.team === item.team && tierOf(member.role) === 'MANAGER' && member.active).map((member) => member.id);

/** The accountable manager: the one who assigned the case, else every active team manager. */
const managersOf = (context: Context, item: WorkflowCase) => (item.assignment.managerId ? [item.assignment.managerId] : teamManagers(context, item));

export function persistCase(context: Context, changed: WorkflowCase, notifications: readonly StoredNotification[] = []): WorkflowCase {
  const { access: _computedPerRequest, ...rest } = changed;
  // File links are issued per request, never stored.
  const updated = {
    ...rest,
    documents: rest.documents.map(({ fileUrl: _issuedPerRequest, ...doc }) => doc),
    outputs: rest.outputs.map(({ fileUrl: _issuedPerRequest, ...output }) => output)
  };
  saveState({
    cases: context.state.cases.map((item) => (item.id === updated.id ? updated : item)),
    notifications: [...notifications, ...context.state.notifications]
  });
  return updated;
}

function assign(context: Context, item: WorkflowCase, input: Extract<CaseMutation, { type: 'ASSIGN' }>['input']): WorkflowCase {
  const agent = context.staff.find((member) => member.id === input.agentId);
  const rescheduling = input.agentId === item.assignment.agentId && input.dueDate !== item.dueDate;
  validateAssignment(context.actor, item, agent, rescheduling);
  const isAdmin = tierOf(context.actor.role) === 'ADMINISTRATOR';
  const noteError = validateNote(input.instructions, isAdmin, isAdmin ? 'An intervention reason' : 'Instructions');
  if (noteError) reject('VALIDATION_FAILED', noteError);
  if (input.dueDate && Date.parse(input.dueDate) < Date.now() - DAY) reject('VALIDATION_FAILED', 'The due date cannot be in the past.');
  const chosen = agent as StaffOption;
  const previousAgentId = item.assignment.agentId;
  const toStatus: CaseStatus = item.status === 'PAID' ? 'ASSIGNED' : item.status;
  const manager = tierOf(context.actor.role) === 'MANAGER' ? context.actor : null;
  const dueLabel = input.dueDate ? new Date(input.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'no due date';
  const summary = rescheduling ? `Due date changed to ${dueLabel}.` : input.instructions.trim() || `Assigned to ${chosen.name}.`;
  const event = makeEvent(context.actor, item, previousAgentId ? 'REASSIGNED' : 'ASSIGN', toStatus, summary, { reference: chosen.name, clientVisible: false });
  const updated = commit(
    item,
    {
      status: toStatus,
      dueDate: input.dueDate ?? item.dueDate,
      assignment: {
        managerId: manager?.id ?? item.assignment.managerId,
        managerName: manager?.name ?? item.assignment.managerName,
        agentId: chosen.id,
        agentName: chosen.name,
        assignedAt: event.createdAt,
        instructions: input.instructions.trim() || null
      }
    },
    event
  );
  const notices = rescheduling
    ? notify([chosen.id], updated, `${updated.referenceNumber} is now due ${dueLabel}.`)
    : [
        ...notify([chosen.id], updated, `${updated.referenceNumber} was assigned to you by ${context.actor.name}.`),
        ...(previousAgentId ? notify([previousAgentId], updated, `${updated.referenceNumber} was reassigned to ${chosen.name}.`) : [])
      ];
  return persistCase(context, updated, notices);
}

/** Marks the picked documents as needing a new copy, with the reason the customer or manager will see. */
function flagDocuments(documents: readonly CaseDocument[], ids: readonly string[], reason: string): CaseDocument[] {
  return documents.map((doc) => (ids.includes(doc.id) && doc.state !== 'MISSING' ? { ...doc, state: 'REJECTED' as const, rejectionReason: reason } : doc));
}

function issueFor(item: WorkflowCase, input: TransitionInput, waitingOn: OpenIssue['waitingOn'], actor: WorkflowActor, fallback: string): OpenIssue {
  const ids = input.documentIds ?? [];
  const labels = item.documents.filter((doc) => ids.includes(doc.id) || (waitingOn === 'CUSTOMER' && doc.state === 'REJECTED')).map((doc) => doc.label);
  return { waitingOn, message: input.note.trim() || fallback, documentLabels: [...new Set(labels)], raisedBy: actor.name, createdAt: new Date().toISOString() };
}

function transitionPatch(context: Context, item: WorkflowCase, input: TransitionInput, toStatus: CaseStatus): Partial<WorkflowCase> {
  const now = new Date().toISOString();
  const ids = input.documentIds ?? [];
  const patches: Readonly<Partial<Record<TransitionInput['action'], () => Partial<WorkflowCase>>>> = {
    REQUEST_PAYMENT: () => ({ payment: { state: 'PENDING', amount: input.amount ?? null, requestedAt: now, paidAt: null, reference: null } }),
    SEND_BACK: () => {
      const documents = flagDocuments(item.documents, ids, input.note.trim());
      return { documents, openIssue: issueFor({ ...item, documents }, input, 'CUSTOMER', context.actor, 'Please correct and re-upload.') };
    },
    RECHECK: () => ({ openIssue: null }),
    MARK_PAID: () => ({ payment: { ...item.payment, state: 'PAID', paidAt: now, reference: input.reference?.trim() ?? null } }),
    REPORT_MISSING: () => ({
      documents: flagDocuments(item.documents, ids, input.note.trim() || 'Reported by the agent as missing or unclear.'),
      openIssue: issueFor(item, input, 'MANAGER', context.actor, 'Some documents are missing or unclear.')
    }),
    FORWARD_TO_CUSTOMER: () => ({
      openIssue: {
        waitingOn: 'CUSTOMER',
        message: input.note.trim() || item.openIssue?.message || 'Please upload the missing documents.',
        documentLabels: item.openIssue?.documentLabels ?? [],
        raisedBy: context.actor.name,
        createdAt: now
      }
    }),
    DOCS_UPDATED: () => ({ openIssue: null, documentsDownloadedAt: null })
  };
  return { status: toStatus, ...(patches[input.action]?.() ?? {}) };
}

function transitionRecipients(context: Context, item: WorkflowCase, action: TransitionInput['action']): (string | null)[] {
  const agent = item.assignment.agentId;
  const recipients: Readonly<Partial<Record<TransitionInput['action'], (string | null)[]>>> = {
    MARK_PAID: teamManagers(context, item),
    REPORT_MISSING: managersOf(context, item),
    DOCS_UPDATED: [agent],
    SUBMIT_OUTPUT: managersOf(context, item),
    CANCEL: [agent, ...managersOf(context, item)]
  };
  return (recipients[action] ?? []).filter((id) => id !== context.actor.id);
}

/** Internal steps the customer never sees in their timeline. */
const INTERNAL_ACTIONS: ReadonlySet<TransitionInput['action']> = new Set(['REPORT_MISSING', 'DOCS_UPDATED']);

function transition(context: Context, item: WorkflowCase, input: TransitionInput): WorkflowCase {
  const toStatus = resolveTransition(context.actor, item, input);
  const amountNote = input.action === 'REQUEST_PAYMENT' && input.amount ? `Fee ₹${input.amount.toLocaleString('en-IN')}. ` : '';
  const event = makeEvent(context.actor, item, input.action, toStatus, `${amountNote}${input.note.trim()}`.trim() || null, {
    reference: input.reference?.trim() || null,
    clientVisible: !INTERNAL_ACTIONS.has(input.action)
  });
  const updated = commit(item, transitionPatch(context, item, input, toStatus), event);
  const message = `${updated.referenceNumber}: ${ACTION_RULES[input.action].label} — now ${STATUS_META[toStatus].label}.`;
  return persistCase(context, updated, notify(transitionRecipients(context, item, input.action), updated, message));
}

function reviewDocument(context: Context, item: WorkflowCase, mutation: Extract<CaseMutation, { type: 'DOCUMENT_REVIEW' }>): WorkflowCase {
  if (!canReviewDocuments(context.actor, item)) reject('FORBIDDEN', 'You cannot review documents at this stage.');
  const doc = item.documents.find((entry) => entry.id === mutation.documentId) ?? reject('VALIDATION_FAILED', 'Document not found.');
  if (doc.state === 'MISSING') reject('CONFLICT', 'This document has not been uploaded yet.');
  const reasonError = mutation.decision === 'REJECTED' ? validateNote(mutation.reason, true, 'A reason') : null;
  if (reasonError) reject('VALIDATION_FAILED', reasonError);
  const documents = item.documents.map((entry) =>
    entry.id === doc.id ? { ...entry, state: mutation.decision, rejectionReason: mutation.decision === 'REJECTED' ? mutation.reason.trim() : null } : entry
  );
  const event = makeEvent(context.actor, item, `DOCUMENT_${mutation.decision}`, null, `${doc.label}${mutation.reason.trim() ? `: ${mutation.reason.trim()}` : ''}`);
  return persistCase(context, commit(item, { documents }, event));
}

export function applyMutation(context: Context, item: WorkflowCase, mutation: CaseMutation): WorkflowCase {
  switch (mutation.type) {
    case 'ASSIGN':
      return assign(context, item, mutation.input);
    case 'TRANSITION':
      return transition(context, item, mutation.input);
    case 'DOCUMENT_REVIEW':
      return reviewDocument(context, item, mutation);
    case 'DOCUMENTS_DOWNLOADED': {
      if (!canDownloadDocuments(context.actor, item)) reject('FORBIDDEN', 'Only the assigned agent can download the documents now.');
      const event = makeEvent(context.actor, item, 'DOCUMENTS_DOWNLOADED', null, `${item.documents.filter((doc) => doc.fileName).length} files`, { clientVisible: false });
      return persistCase(context, commit(item, { documentsDownloadedAt: event.createdAt }, event));
    }
    case 'REMOVE_OUTPUT': {
      if (!canUploadOutput(context.actor, item)) reject('FORBIDDEN', 'Results can be changed only while the portal work is open.');
      const output = item.outputs.find((entry) => entry.id === mutation.outputId) ?? reject('VALIDATION_FAILED', 'File not found.');
      const event = makeEvent(context.actor, item, 'OUTPUT_REMOVED', null, output.fileName, { clientVisible: false });
      return persistCase(context, commit(item, { outputs: item.outputs.filter((entry) => entry.id !== output.id) }, event));
    }
    case 'NOTE': {
      if (!canAddNote(context.actor, item)) reject('FORBIDDEN', 'Notes cannot be added to this application.');
      const noteError = validateNote(mutation.text, true, 'A note');
      if (noteError) reject('VALIDATION_FAILED', noteError);
      const note = { id: newId('NOTE'), authorName: context.actor.name, authorRole: context.actor.role, text: mutation.text.trim(), createdAt: new Date().toISOString() };
      return persistCase(context, commit(item, { notes: [...item.notes, note] }, makeEvent(context.actor, item, 'NOTE_ADDED', null, null, { clientVisible: false })));
    }
  }
}
