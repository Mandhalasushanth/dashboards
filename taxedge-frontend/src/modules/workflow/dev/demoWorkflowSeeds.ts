import { getServiceType } from '../shared/serviceTypes';
import { getServiceDefinition } from '../shared/workflowServices';
import { sampleDetails } from './demoSampleDetails';
import type {
  CaseAction,
  CaseDocument,
  CaseEvent,
  CasePayment,
  CaseStatus,
  OpenIssue,
  ServiceKind,
  StaffOption,
  WorkflowCase
} from '../shared/workflow.types';

/**
 * DEVELOPMENT ONLY. Sample applications for the in-browser demo backend, loaded through a dynamic
 * import guarded by `import.meta.env.DEV`. References are prefixed "DEMO-" so they can never be mistaken
 * for real payments or filings.
 */
const DAY = 86_400_000;
const HOUR = 3_600_000;

type Actor = 'manager' | 'agent' | 'client';

interface SeedStep {
  readonly action: CaseAction | 'SUBMITTED';
  readonly to: CaseStatus;
  readonly by: Actor;
}

const step = (action: SeedStep['action'], to: CaseStatus, by: Actor): SeedStep => ({ action, to, by });

const TO_PAID: readonly SeedStep[] = [step('REQUEST_PAYMENT', 'PAYMENT_PENDING', 'manager'), step('MARK_PAID', 'PAID', 'client')];
const TO_ASSIGNED: readonly SeedStep[] = [...TO_PAID, step('ASSIGN', 'ASSIGNED', 'manager')];
const TO_PORTAL: readonly SeedStep[] = [...TO_ASSIGNED, step('START_PORTAL_WORK', 'PORTAL_WORK', 'agent')];

/** Steps each seeded case walked to reach its current status (after the customer's submission). */
const PATHS: Readonly<Partial<Record<CaseStatus, readonly SeedStep[]>>> = Object.freeze({
  SUBMITTED: [],
  CORRECTION_NEEDED: [step('SEND_BACK', 'CORRECTION_NEEDED', 'manager')],
  PAYMENT_PENDING: TO_PAID.slice(0, 1),
  PAID: TO_PAID,
  ASSIGNED: TO_ASSIGNED,
  DOCS_MISSING: [...TO_ASSIGNED, step('REPORT_MISSING', 'DOCS_MISSING', 'agent')],
  PORTAL_WORK: TO_PORTAL,
  COMPLETED: [...TO_PORTAL, step('SUBMIT_OUTPUT', 'COMPLETED', 'agent')]
});

/** One demo case: who it is for, where it is in the workflow and who holds it. Rows live in each role module's dev folder. */
export type DemoCaseSeed = readonly [
  service: ServiceKind,
  /** The customer app's service id, e.g. "gst-filing". */
  serviceType: string,
  client: string,
  pan: string,
  city: string,
  status: CaseStatus,
  agentId: string | null,
  submittedDaysAgo: number,
  dueInDays: number,
  details: Readonly<Record<string, string>>
];

const SAMPLE_FEES: Readonly<Record<ServiceKind, number>> = Object.freeze({ GST: 1499, ITR: 999, INCORPORATION: 6999, LOAN: 4999, INSURANCE: 1999 });
const PAID_STATUSES: ReadonlySet<CaseStatus> = new Set<CaseStatus>(['PAID', 'ASSIGNED', 'DOCS_MISSING', 'PORTAL_WORK', 'COMPLETED']);
const VERIFIED_STATUSES: ReadonlySet<CaseStatus> = new Set<CaseStatus>([...PAID_STATUSES, 'PAYMENT_PENDING']);
const PROBLEM_STATUSES: ReadonlySet<CaseStatus> = new Set<CaseStatus>(['CORRECTION_NEEDED', 'DOCS_MISSING']);

const slug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

function buildDocuments(id: string, serviceType: string, service: ServiceKind, status: CaseStatus, clientName: string, uploadedAt: number): CaseDocument[] {
  const firstRequired = getServiceType(serviceType, service).documents.findIndex((doc) => doc.required);
  return getServiceType(serviceType, service).documents.map((doc, index) => {
    const problem = PROBLEM_STATUSES.has(status) && index === firstRequired;
    const state: CaseDocument['state'] = !doc.required ? 'MISSING' : problem ? 'REJECTED' : VERIFIED_STATUSES.has(status) ? 'VERIFIED' : 'UPLOADED';
    const hasFile = state !== 'MISSING';
    return {
      id: `${id}-D${index + 1}`,
      typeId: `doc-${index + 1}`,
      label: doc.label,
      required: doc.required,
      state,
      fileName: hasFile ? `${slug(doc.label)}.pdf` : null,
      uploadedBy: hasFile ? clientName : null,
      uploadedAt: hasFile ? new Date(uploadedAt).toISOString() : null,
      version: hasFile ? 1 : 0,
      rejectionReason: problem ? 'The copy is blurred. Please upload a clear scan.' : null
    };
  });
}

function buildPayment(service: ServiceKind, status: CaseStatus, id: string, at: number): CasePayment {
  const requested = status === 'PAYMENT_PENDING' || PAID_STATUSES.has(status);
  const paid = PAID_STATUSES.has(status);
  return {
    state: paid ? 'PAID' : requested ? 'PENDING' : 'NOT_REQUESTED',
    amount: requested ? SAMPLE_FEES[service] : null,
    requestedAt: requested ? new Date(at).toISOString() : null,
    paidAt: paid ? new Date(at + 2 * HOUR).toISOString() : null,
    reference: paid ? `DEMO-PAY-${id}` : null
  };
}

function buildIssue(status: CaseStatus, documents: readonly CaseDocument[], manager: StaffOption | undefined, agent: StaffOption | undefined, at: string): OpenIssue | null {
  const labels = documents.filter((doc) => doc.state === 'REJECTED').map((doc) => doc.label);
  if (status === 'CORRECTION_NEEDED') {
    return { waitingOn: 'CUSTOMER', message: 'Please upload a clear copy of the marked document.', documentLabels: labels, raisedBy: manager?.name ?? 'Manager', createdAt: at };
  }
  if (status === 'DOCS_MISSING') {
    return { waitingOn: 'MANAGER', message: 'This document is unreadable, so I cannot start on the portal.', documentLabels: labels, raisedBy: agent?.name ?? 'Agent', createdAt: at };
  }
  return null;
}

function buildEvents(id: string, status: CaseStatus, people: Readonly<Record<Actor, StaffOption | undefined>>, submittedAt: number, clientName: string): CaseEvent[] {
  const steps = [step('SUBMITTED', 'SUBMITTED', 'client'), ...(PATHS[status] ?? [])];
  return steps.map((entry, index) => {
    const actor = people[entry.by];
    return {
      id: `${id}-E${index}`,
      caseId: id,
      action: entry.action,
      actorId: actor?.id ?? 'CLIENT',
      actorName: actor?.name ?? clientName,
      actorRole: actor?.role ?? 'CLIENT',
      fromStatus: index === 0 ? null : steps[index - 1].to,
      toStatus: entry.to,
      note: entry.action === 'ASSIGN' ? `Assigned to ${people.agent?.name ?? 'agent'}.` : null,
      reference: entry.action === 'MARK_PAID' ? `DEMO-PAY-${id}` : null,
      clientVisible: entry.action !== 'ASSIGN' && entry.action !== 'REPORT_MISSING',
      createdAt: new Date(submittedAt + index * 6 * HOUR).toISOString()
    };
  });
}

/** Builds the demo case set from the current staff directory, so names always match real demo accounts. */
export function buildSeedCases(seeds: readonly DemoCaseSeed[], staff: readonly StaffOption[], now: number = Date.now()): WorkflowCase[] {
  const byId = new Map(staff.map((member) => [member.id, member]));
  const managerOf = (team: WorkflowCase['team']) => staff.find((member) => member.team === team && member.role.endsWith('MANAGER') && member.active);

  return seeds.map(([service, serviceType, clientName, pan, city, status, agentId, daysAgo, dueIn, details], index) => {
    const definition = getServiceDefinition(service);
    const id = `CASE-${String(1001 + index)}`;
    const submittedAt = now - daysAgo * DAY - 2 * HOUR;
    const agent = agentId ? byId.get(agentId) : undefined;
    const manager = managerOf(definition.team);
    const history = buildEvents(id, status, { manager, agent, client: undefined }, submittedAt, clientName);
    const lastAt = history[history.length - 1].createdAt;
    const documents = buildDocuments(id, serviceType, service, status, clientName, submittedAt + HOUR);
    const working = status === 'PORTAL_WORK' || status === 'COMPLETED';
    return {
      id,
      referenceNumber: `TE-${definition.shortLabel.slice(0, 3).toUpperCase()}-${new Date(submittedAt).getFullYear()}-${String(1001 + index)}`,
      service,
      serviceType: getServiceType(serviceType, service).id,
      team: definition.team,
      client: { name: clientName, email: `${clientName.split(' ')[0].toLowerCase()}@example.com`, mobile: `98${String(76543210 + index * 137).slice(0, 8)}`, pan, city },
      details: sampleDetails(getServiceType(serviceType, service), details, { name: clientName, pan, city }),
      status,
      assignment: {
        managerId: manager?.id ?? null,
        managerName: manager?.name ?? null,
        agentId: agent?.id ?? null,
        agentName: agent?.name ?? null,
        assignedAt: agent ? new Date(submittedAt + 18 * HOUR).toISOString() : null,
        instructions: agent ? 'Check every document before starting on the portal.' : null
      },
      dueDate: new Date(now + dueIn * DAY).toISOString(),
      submittedAt: new Date(submittedAt).toISOString(),
      updatedAt: lastAt,
      version: history.length,
      documents,
      payment: buildPayment(service, status, id, submittedAt + 6 * HOUR),
      documentsDownloadedAt: working ? lastAt : null,
      outputs: status === 'COMPLETED' ? [{ id: `${id}-O1`, fileName: 'acknowledgement.pdf', uploadedBy: agent?.name ?? 'Agent', uploadedAt: lastAt }] : [],
      openIssue: buildIssue(status, documents, manager, agent, lastAt),
      notes: [],
      history
    };
  });
}
