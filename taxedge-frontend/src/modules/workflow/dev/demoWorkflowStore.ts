import { ApiError } from '@/core/api';
import { computeWorkload, isClosed, queryCases, summarizeCases } from '../services/caseQueries';
import {
  WorkflowRuleError,
  availableActions,
  canAddNote,
  canDownloadDocuments,
  canReviewDocuments,
  canUploadDocuments,
  canUploadOutput,
  canViewCase,
  teamOf,
  tierOf
} from '../services/transitionRules';
import { getServiceType } from '../shared/serviceTypes';
import { SERVICE_DEFINITIONS } from '../shared/workflowServices';
import { validateDocumentFile } from '../validation/documentValidation';
import { normalizeIntake, validateIntake } from '../validation/intakeValidation';
import { base64Extension, rememberBase64File, rememberUploadedFile, samplePreviewUrl, uploadedFileUrl } from './demoDocumentPreview';
import { applyMutation, commit, makeEvent, newId, notify, persistCase, reject, teamManagers, type Context } from './demoWorkflowMutations';
import { loadDirectory, loadState, resolveActor, saveState } from './demoWorkflowState';
import type { ImportedApplication } from '../api/backendApplications';
import type {
  AgentWorkload,
  AuditPage,
  AuditQuery,
  CaseIntakeInput,
  CaseMutation,
  CasePage,
  CaseQuery,
  CaseSummary,
  StaffOption,
  WorkflowCase,
  WorkflowNotification
} from '../shared/workflow.types';

/**
 * DEVELOPMENT ONLY. Browser stand-in for the workflow backend, persisted in localStorage. It applies the
 * same transition, ownership and validation rules the server must enforce, records an audit event for
 * every change, and keeps notifications per recipient. Excluded from production builds.
 */
const DAY = 86_400_000;

function toApiError(error: unknown): unknown {
  if (!(error instanceof WorkflowRuleError)) {
    return error;
  }
  const status = error.code === 'FORBIDDEN' ? 403 : error.code === 'CONFLICT' ? 409 : 422;
  return new ApiError(error.code === 'FORBIDDEN' ? 'FORBIDDEN' : 'VALIDATION_FAILED', error.message, status);
}

/** Loads staff, actor and state, runs the operation, and converts rule failures into API errors. */
async function run<T>(operation: (context: Context) => T): Promise<T> {
  try {
    const directory = await loadDirectory();
    const staff = directory.map((entry) => entry.option);
    const actor = resolveActor(directory);
    const state = await loadState(staff);
    return operation({ staff, actor, state });
  } catch (error) {
    throw toApiError(error);
  }
}

const fileUrl = (id: string, label: string, item: WorkflowCase, uploadedBy: string | null) =>
  uploadedFileUrl(id) ?? samplePreviewUrl(label, item.client.name, uploadedBy ?? item.client.name);

/** Mirrors the server: each case in a response carries the caller's allowed actions and short-lived file links. */
/** File links are made only for an opened application (`withFiles`); lists never show files, so they skip it. */
function withAccess(context: Context, item: WorkflowCase, withFiles = true): WorkflowCase {
  return {
    ...item,
    documents: item.documents.map((doc) => ({ ...doc, fileUrl: withFiles && doc.fileName ? fileUrl(doc.id, doc.label, item, doc.uploadedBy) : null })),
    outputs: item.outputs.map((output) => ({ ...output, fileUrl: withFiles ? fileUrl(output.id, output.fileName, item, output.uploadedBy) : null })),
    access: {
      actions: availableActions(context.actor, item),
      canAddNote: canAddNote(context.actor, item),
      canReviewDocuments: canReviewDocuments(context.actor, item),
      canUploadDocuments: canUploadDocuments(context.actor, item),
      canDownloadDocuments: canDownloadDocuments(context.actor, item),
      canUploadOutput: canUploadOutput(context.actor, item)
    }
  };
}

/** Every agent of the manager's team (CA or Loan) can receive work from any manager of that team. The admin sees all agents. */
function teamAgents(context: Context): StaffOption[] {
  const team = teamOf(context.actor.role);
  return context.staff.filter((member) => tierOf(member.role) === 'AGENT' && (team === null || member.team === team));
}

function visibleCases(context: Context): WorkflowCase[] {
  return context.state.cases.filter((item) => canViewCase(context.actor, item));
}

function findVisible(context: Context, id: string): WorkflowCase {
  const item = context.state.cases.find((candidate) => candidate.id === id);
  return item && canViewCase(context.actor, item) ? item : reject('FORBIDDEN', 'This application does not exist or you cannot access it.');
}

function requireVersion(item: WorkflowCase, expectedVersion: number): void {
  if (item.version !== expectedVersion) {
    reject('CONFLICT', 'This application was updated by someone else. Reload it and try again.');
  }
}

/** A new application waiting for verification, with every document of its service type still missing. */
function newCase(id: string, sequence: number, input: CaseIntakeInput, submittedAt: number): WorkflowCase {
  const definition = SERVICE_DEFINITIONS[input.service];
  const type = getServiceType(input.serviceType, input.service);
  return {
    id,
    referenceNumber: `TE-${definition.shortLabel.slice(0, 3).toUpperCase()}-${new Date(submittedAt).getFullYear()}-${sequence}`,
    service: input.service,
    serviceType: type.id,
    team: definition.team,
    client: input.client,
    details: input.details,
    status: 'SUBMITTED',
    assignment: { managerId: null, managerName: null, agentId: null, agentName: null, assignedAt: null, instructions: null },
    dueDate: new Date(submittedAt + definition.slaDays * DAY).toISOString(),
    submittedAt: new Date(submittedAt).toISOString(),
    updatedAt: new Date(submittedAt).toISOString(),
    version: 0,
    documents: type.documents.map((doc, index) => ({
      id: `${id}-D${index + 1}`, typeId: `doc-${index + 1}`, label: doc.label, required: doc.required, state: 'MISSING', fileName: null, uploadedBy: null, uploadedAt: null, version: 0, rejectionReason: null
    })),
    payment: { state: 'NOT_REQUESTED', amount: null, requestedAt: null, paidAt: null, reference: null },
    documentsDownloadedAt: null,
    outputs: [],
    openIssue: null,
    notes: [],
    history: []
  };
}

/**
 * Links each file the customer uploaded to its document, so "View" opens it. A document still MISSING
 * here becomes UPLOADED; one already checked keeps its state. Returns the same case when nothing changed.
 */
/**
 * Matches the mobile app: a GST Nil Return needs no documents, so none of them is required (any the customer
 * did upload can still be checked).
 */
function withDocumentRules(item: WorkflowCase): WorkflowCase {
  const nilReturn = item.serviceType === 'gst-filing' && item.details.filingType === 'Nil Return';
  if (!nilReturn || item.documents.every((doc) => !doc.required)) return item;
  return { ...item, documents: item.documents.map((doc) => ({ ...doc, required: false })) };
}

/** A backend timestamp as ISO, or null when missing or unreadable. */
const timeOf = (value: string | null): string | null => {
  const at = value ? Date.parse(value) : Number.NaN;
  return Number.isNaN(at) ? null : new Date(at).toISOString();
};

function attachBackendFiles(item: WorkflowCase, application: ImportedApplication): WorkflowCase {
  let changed = false;
  const documents = item.documents.map((doc, index) => {
    const base64 = application.files[index];
    if (!base64) return doc;
    rememberBase64File(doc.id, base64);
    if (doc.state !== 'MISSING') return doc;
    changed = true;
    const fileName = `${doc.label.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()}.${base64Extension(base64)}`;
    return { ...doc, state: 'UPLOADED' as const, fileName, uploadedBy: item.client.name, uploadedAt: item.submittedAt };
  });
  return changed ? { ...item, documents } : item;
}

const BACKEND_AGENT_PREFIX = 'BE-AGT-';

export const demoWorkflowStore = Object.freeze({
  /** The backend id of the signed-in agent, or null when the user is not an agent saved in the backend. */
  backendAgentId: (): Promise<string | null> =>
    run((context) => (context.actor.id.startsWith(BACKEND_AGENT_PREFIX) ? context.actor.id.slice(BACKEND_AGENT_PREFIX.length) : null)),

  /**
   * Gives the signed-in agent the applications the backend says are assigned to them, including ones
   * assigned from another browser. Cases already with this agent keep their progress.
   */
  applyBackendAssignments: (caseIds: readonly string[], agentStaffId?: string): Promise<boolean> =>
    run((context) => {
      // Without an agent id these are the signed-in agent's own cases; a manager passes each agent in turn.
      const agent = agentStaffId ? context.staff.find((member) => member.id === agentStaffId) : { id: context.actor.id, name: context.actor.name };
      if (!agent) return false;
      const wanted = new Set(caseIds);
      let changed = false;
      const cases = context.state.cases.map((item) => {
        if (!wanted.has(item.id) || item.assignment.agentId === agent.id) return item;
        changed = true;
        const event = makeEvent(context.actor, item, 'ASSIGN', 'ASSIGNED', `Assigned to ${agent.name} in the backend.`, { reference: agent.name, clientVisible: false });
        return commit(
          item,
          {
            status: 'ASSIGNED',
            assignment: { ...item.assignment, agentId: agent.id, agentName: agent.name, assignedAt: event.createdAt }
          },
          event
        );
      });
      if (changed) saveState({ ...context.state, cases });
      return changed;
    }),

  /** The backend ids of the agents saved in the database, with their staff ids in the dashboard. */
  backendAgents: (): Promise<{ readonly backendId: string; readonly staffId: string }[]> =>
    run((context) =>
      context.staff
        .filter((member) => member.id.startsWith(BACKEND_AGENT_PREFIX))
        .map((member) => ({ backendId: member.id.slice(BACKEND_AGENT_PREFIX.length), staffId: member.id }))
    ),


  /**
   * Adds backend applications (GST registrations from the customer app) not seen before. Each keeps its
   * backend id, so a refresh never adds it twice and its progress here is kept.
   */
  importApplications: (applications: readonly ImportedApplication[]): Promise<boolean> =>
    run((context) => {
      const byId = new Map(context.state.cases.map((item) => [item.id, item]));
      const added: WorkflowCase[] = [];
      let changed = false;
      for (const application of applications) {
        const id = application.caseId ?? `GST-REG-${application.sourceId}`;
        let item = byId.get(id);
        if (!item) {
          const sequence = context.state.cases.length + added.length + 1001;
          const parsed = application.submittedAt ? Date.parse(application.submittedAt) : Number.NaN;
          const base = { ...newCase(id, sequence, normalizeIntake(application.intake), Number.isNaN(parsed) ? Date.now() : parsed), referenceNumber: application.sourceId };
          const received = commit(base, {}, makeEvent(context.actor, base, 'SUBMITTED', 'SUBMITTED', 'Received from the customer app.', { fromStatus: null }));
          // The database's times, not the moment the dashboard first loaded the record.
          item = { ...received, history: received.history.map((event) => ({ ...event, createdAt: base.submittedAt })), updatedAt: base.submittedAt };
          added.push(item);
        }
        // Submitted and last-updated always follow the database; a later step taken here stays the latest update.
        const submittedAt = timeOf(application.submittedAt) ?? item.submittedAt;
        const backendUpdated = timeOf(application.updatedAt) ?? submittedAt;
        const localUpdated = item.history.length > 1 ? item.updatedAt : backendUpdated;
        const updatedAt = Date.parse(localUpdated) > Date.parse(backendUpdated) ? localUpdated : backendUpdated;
        if (item.submittedAt !== submittedAt || item.updatedAt !== updatedAt) {
          const timed = { ...item, submittedAt, updatedAt };
          if (added.includes(item)) added[added.indexOf(item)] = timed;
          else byId.set(id, timed);
          item = timed;
          changed = true;
        }
        // The application is known by its backend GST id; ones imported earlier with a TE- number are renamed.
        // Details are re-read each time, so what the customer saved is always what the dashboard shows.
        const details = normalizeIntake(application.intake).details;
        if (item.referenceNumber !== application.sourceId || JSON.stringify(item.details) !== JSON.stringify(details)) {
          const renamed = { ...item, referenceNumber: application.sourceId, details };
          if (added.includes(item)) added[added.indexOf(item)] = renamed;
          else byId.set(id, renamed);
          item = renamed;
          changed = true;
        }
        const withFiles = withDocumentRules(attachBackendFiles(item, application));
        if (withFiles !== item) {
          changed = true;
          if (added.includes(item)) added[added.indexOf(item)] = withFiles;
          else byId.set(id, withFiles);
        }
      }
      if (added.length > 0 || changed) {
        const updated = context.state.cases.map((item) => byId.get(item.id) ?? item);
        saveState({ ...context.state, cases: [...added, ...updated] });
        return true;
      }
      return false;
    }),

  listCases: (query: CaseQuery): Promise<CasePage> =>
    run((context) => {
      const page = queryCases(visibleCases(context), query);
      return { ...page, items: page.items.map((item) => withAccess(context, item, false)) };
    }),

  getCase: (id: string): Promise<WorkflowCase> => run((context) => withAccess(context, findVisible(context, id))),

  summary: (): Promise<CaseSummary> => run((context) => summarizeCases(visibleCases(context))),

  submitCase: (raw: CaseIntakeInput): Promise<WorkflowCase> =>
    run((context) => {
      const tier = tierOf(context.actor.role);
      const definition = SERVICE_DEFINITIONS[raw.service];
      if (tier === 'AGENT' || (tier === 'MANAGER' && teamOf(context.actor.role) !== definition.team)) {
        reject('FORBIDDEN', 'You cannot record applications for this service.');
      }
      const type = getServiceType(raw.serviceType, raw.service);
      if (type.id !== raw.serviceType || type.service !== raw.service) {
        reject('VALIDATION_FAILED', 'Choose a service type offered under this service.');
      }
      const errors = validateIntake(raw);
      const firstError = Object.values(errors)[0];
      if (firstError) reject('VALIDATION_FAILED', firstError);
      const input = normalizeIntake(raw);
      const duplicate = context.state.cases.find((item) => item.serviceType === input.serviceType && item.client.pan === input.client.pan && !isClosed(item));
      if (duplicate) reject('CONFLICT', `An open ${type.label} application already exists for this PAN (${duplicate.referenceNumber}).`);
      const sequence = context.state.cases.length + 1001;
      const base = withDocumentRules(newCase(`CASE-${sequence}`, sequence, input, Date.now()));
      const event = makeEvent(context.actor, base, 'SUBMITTED', 'SUBMITTED', `Recorded on behalf of ${input.client.name}.`, { fromStatus: null });
      const created = commit(base, {}, event);
      saveState({
        cases: [created, ...context.state.cases],
        notifications: [...notify(teamManagers(context, created), created, `New ${type.label} application ${created.referenceNumber} is waiting for verification.`), ...context.state.notifications]
      });
      return withAccess(context, created);
    }),

  mutate: (id: string, expectedVersion: number, mutation: CaseMutation): Promise<WorkflowCase> =>
    run((context) => {
      const item = findVisible(context, id);
      requireVersion(item, expectedVersion);
      return withAccess(context, applyMutation(context, item, mutation));
    }),

  uploadDocument: (id: string, expectedVersion: number, documentId: string, file: File): Promise<WorkflowCase> =>
    run((context) => {
      const item = findVisible(context, id);
      requireVersion(item, expectedVersion);
      if (!canUploadDocuments(context.actor, item)) reject('FORBIDDEN', 'Documents can be uploaded for the customer only while they are being checked or fixed.');
      const fileError = validateDocumentFile(file);
      if (fileError) reject('VALIDATION_FAILED', fileError);
      const doc = item.documents.find((entry) => entry.id === documentId) ?? reject('VALIDATION_FAILED', 'Document not found.');
      rememberUploadedFile(doc.id, file);
      const now = new Date().toISOString();
      const documents = item.documents.map((entry) =>
        entry.id === doc.id ? { ...entry, state: 'UPLOADED' as const, fileName: file.name, uploadedBy: context.actor.name, uploadedAt: now, version: entry.version + 1, rejectionReason: null } : entry
      );
      return withAccess(context, persistCase(context, commit(item, { documents }, makeEvent(context.actor, item, 'DOCUMENT_UPLOADED', null, `${doc.label} (v${doc.version + 1})`))));
    }),

  uploadOutput: (id: string, expectedVersion: number, file: File): Promise<WorkflowCase> =>
    run((context) => {
      const item = findVisible(context, id);
      requireVersion(item, expectedVersion);
      if (!canUploadOutput(context.actor, item)) reject('FORBIDDEN', 'Results can be uploaded only by the assigned agent during portal work.');
      const fileError = validateDocumentFile(file);
      if (fileError) reject('VALIDATION_FAILED', fileError);
      const output = { id: newId('OUT'), fileName: file.name, uploadedBy: context.actor.name, uploadedAt: new Date().toISOString() };
      rememberUploadedFile(output.id, file);
      const event = makeEvent(context.actor, item, 'OUTPUT_UPLOADED', null, file.name, { clientVisible: false });
      return withAccess(context, persistCase(context, commit(item, { outputs: [...item.outputs, output] }, event)));
    }),

  listAgents: (): Promise<StaffOption[]> =>
    run((context) => {
      const tier = tierOf(context.actor.role);
      if (tier === 'AGENT') reject('FORBIDDEN', 'Only managers and administrators can view the agent directory.');
      return teamAgents(context);
    }),

  workload: (): Promise<AgentWorkload[]> =>
    run((context) => {
      if (tierOf(context.actor.role) === 'AGENT') reject('FORBIDDEN', 'Only managers and administrators can view team workload.');
      const agents = teamAgents(context);
      return computeWorkload(agents, visibleCases(context));
    }),

  auditLog: (query: AuditQuery): Promise<AuditPage> =>
    run((context) => {
      if (tierOf(context.actor.role) === 'AGENT') reject('FORBIDDEN', 'Audit logs are available to managers and administrators.');
      const search = (query.search ?? '').trim().toLowerCase();
      const cases = visibleCases(context).filter((item) => !query.service || query.service === 'ALL' || item.service === query.service);
      const references = new Map(cases.map((item) => [item.id, item.referenceNumber]));
      const events = cases
        .flatMap((item) => item.history)
        .filter((event) => !search || [event.actorName, event.action, references.get(event.caseId) ?? '', event.note ?? ''].some((value) => value.toLowerCase().includes(search)))
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      const pageSize = Math.max(1, query.pageSize ?? 20);
      const page = Math.min(Math.max(1, query.page ?? 1), Math.max(1, Math.ceil(events.length / pageSize)));
      const items = events.slice((page - 1) * pageSize, page * pageSize).map((event) => ({ ...event, referenceNumber: references.get(event.caseId) }));
      return { items, total: events.length, page, pageSize };
    }),

  notifications: (): Promise<WorkflowNotification[]> =>
    run((context) => context.state.notifications.filter((entry) => entry.recipientId === context.actor.id)),

  markNotificationRead: (id: string): Promise<void> =>
    run((context) => {
      saveState({ ...context.state, notifications: context.state.notifications.map((entry) => (entry.id === id && entry.recipientId === context.actor.id ? { ...entry, read: true } : entry)) });
    }),

  markAllNotificationsRead: (): Promise<void> =>
    run((context) => {
      saveState({ ...context.state, notifications: context.state.notifications.map((entry) => (entry.recipientId === context.actor.id ? { ...entry, read: true } : entry)) });
    })
});
