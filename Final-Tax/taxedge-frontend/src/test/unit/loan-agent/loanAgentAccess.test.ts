import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Role } from '@/modules/authentication';
import { canLoanAgentMessage } from '@/modules/loan-agent/shared/loanAgentCommunication';
import { LOAN_AGENT_QUEUES } from '@/modules/loan-agent/shared/loanAgentQueues';
import { isValidCaseId, parseLoanAgentQueueParams, parseLoanAgentService } from '@/modules/loan-agent/validation/loanAgentValidation';
import type { CaseMutation, WorkflowCase } from '@/modules/workflow/shared/workflow.types';
import { installMemoryBrowser, seedTeam } from '../workflow/workflowFixtures';

/** What a Loan Agent may open, message and see, checked against the demo backend the screens use. */
describe('Loan Agent deep links', () => {
  it('accepts only well-formed application ids', () => {
    expect(isValidCaseId('CASE-1001')).toBe(true);
    expect(isValidCaseId('TE-GST-2026-1001')).toBe(true);
    expect(isValidCaseId("CASE-1'; DROP")).toBe(false);
    expect(isValidCaseId('ab')).toBe(false);
    expect(isValidCaseId(null)).toBe(false);
  });

  it('keeps a crafted link inside the LOAN services', () => {
    expect(parseLoanAgentService('LOAN')).toBe('LOAN');
    expect(parseLoanAgentService('INSURANCE')).toBe('INSURANCE');
    expect(parseLoanAgentService('GST')).toBeNull();
    expect(parseLoanAgentService(null)).toBeNull();
  });

  it('reads the case and service from a notification link and drops anything unsafe', () => {
    expect(parseLoanAgentQueueParams(new URLSearchParams('case=CASE-1001&service=LOAN'))).toEqual({ caseId: 'CASE-1001', service: 'LOAN' });
    expect(parseLoanAgentQueueParams(new URLSearchParams('case=<script>&service=GST'))).toEqual({ caseId: null, service: null });
  });
});

describe('Loan Agent messaging', () => {
  const me = { id: 'AGT-401', role: 'LOAN_AGENT', managerId: 'MGR-1' };

  it.each([
    ['messages the administrator', { id: 'ADM-1', role: 'ADMIN', managerId: null }, true],
    ['messages a manager of the team', { id: 'MGR-999', role: 'LOAN_MANAGER', managerId: null }, true],
    ['does not message other agents', { id: 'AGT-2', role: 'LOAN_AGENT', managerId: 'MGR-999' }, false],
    ['does not message the other team', { id: 'MGR-3', role: 'CA_MANAGER', managerId: null }, false]
  ] as const)('%s', (_label, other, allowed) => {
    expect(canLoanAgentMessage(me, other)).toBe(allowed);
  });
});

let auth: (typeof import('@/store'))['authStore'];

const signInAs = (username: string, role: Role) =>
  auth.setAuthenticated({ id: username, username, displayName: username, role, permissions: [], lastLoginAt: null });

async function loadStore() {
  vi.resetModules();
  installMemoryBrowser();
  seedTeam();
  auth = (await import('@/store')).authStore;
  return (await import('@/modules/workflow/dev/demoWorkflowStore')).demoWorkflowStore;
}

type Store = Awaited<ReturnType<typeof loadStore>>;

const queueIds = async (store: Store, id: keyof typeof LOAN_AGENT_QUEUES) => {
  const queue = LOAN_AGENT_QUEUES[id];
  return (await store.listCases({ statuses: queue.statuses, services: queue.services, pageSize: 100 })).items.map((item) => item.id);
};

const step = (store: Store, item: WorkflowCase, mutation: CaseMutation) => store.mutate(item.id, item.version, mutation);

describe('Loan Agent workspace data', () => {
  let store: Store;

  beforeEach(async () => {
    store = await loadStore();
  });

  /** As the manager: verify every required document, request and confirm payment, then assign to this agent. */
  async function assignToMe(): Promise<WorkflowCase> {
    signInAs('loanmanager@gmail.com', 'LOAN_MANAGER');
    const [first] = (await store.listCases({ statuses: ['SUBMITTED'], pageSize: 1 })).items;
    const verified = await first.documents
      .filter((doc) => doc.required)
      .reduce(async (pending, doc) => {
        const current = await pending;
        const uploaded = await store.uploadDocument(current.id, current.version, doc.id, new File(['x'], `${doc.typeId}.pdf`));
        return step(store, uploaded, { type: 'DOCUMENT_REVIEW', documentId: doc.id, decision: 'VERIFIED', reason: '' });
      }, Promise.resolve(first));
    const requested = await step(store, verified, { type: 'TRANSITION', input: { action: 'REQUEST_PAYMENT', note: '', amount: 999 } });
    const paid = await step(store, requested, { type: 'TRANSITION', input: { action: 'MARK_PAID', note: '', reference: 'UTR-552019' } });
    const assigned = await step(store, paid, { type: 'ASSIGN', input: { agentId: 'AGT-401', instructions: 'Please start today.', dueDate: null } });
    signInAs('loanagent@gmail.com', 'LOAN_AGENT');
    return assigned;
  }

  it('sees nothing until a manager assigns an application', async () => {
    signInAs('loanagent@gmail.com', 'LOAN_AGENT');
    expect(await queueIds(store, 'applications')).toEqual([]);
    expect(await queueIds(store, 'new')).toEqual([]);
  });

  it('finds an application in New Assignments as soon as it is assigned', async () => {
    const assigned = await assignToMe();
    expect(await queueIds(store, 'new')).toEqual([assigned.id]);
    expect(await queueIds(store, 'applications')).toEqual([assigned.id]);
    expect(await queueIds(store, 'portal')).toEqual([]);
  });

  it('can download and work on the assigned application but cannot verify or assign it', async () => {
    const assigned = await assignToMe();
    const mine = await store.getCase(assigned.id);
    expect(mine.access).toMatchObject({ canDownloadDocuments: true, canReviewDocuments: false, canUploadDocuments: false });
    expect(mine.access?.actions).toEqual(expect.arrayContaining(['REPORT_MISSING', 'START_PORTAL_WORK']));
    await expect(store.workload()).rejects.toMatchObject({ status: 403 });
  });

  it('moves the application to Portal Work once the documents are downloaded and work starts', async () => {
    const assigned = await assignToMe();
    const mine = await store.getCase(assigned.id);
    await expect(step(store, mine, { type: 'TRANSITION', input: { action: 'START_PORTAL_WORK', note: '' } })).rejects.toBeTruthy();
    const downloaded = await step(store, mine, { type: 'DOCUMENTS_DOWNLOADED' });
    await step(store, downloaded, { type: 'TRANSITION', input: { action: 'START_PORTAL_WORK', note: '' } });
    expect(await queueIds(store, 'portal')).toEqual([assigned.id]);
    expect(await queueIds(store, 'new')).toEqual([]);
  });
});
