import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Role } from '@/modules/authentication';
import { canCaAgentMessage } from '@/modules/ca-agent/shared/caAgentCommunication';
import { CA_AGENT_QUEUES } from '@/modules/ca-agent/shared/caAgentQueues';
import { isValidCaseId, parseCaAgentQueueParams, parseCaAgentService } from '@/modules/ca-agent/validation/caAgentValidation';
import type { CaseMutation, WorkflowCase } from '@/modules/workflow/shared/workflow.types';
import { installMemoryBrowser, seedTeam } from '../workflow/workflowFixtures';

/** What a CA Agent may open, message and see, checked against the demo backend the screens use. */
describe('CA Agent deep links', () => {
  it('accepts only well-formed application ids', () => {
    expect(isValidCaseId('CASE-1001')).toBe(true);
    expect(isValidCaseId('TE-GST-2026-1001')).toBe(true);
    expect(isValidCaseId("CASE-1'; DROP")).toBe(false);
    expect(isValidCaseId('ab')).toBe(false);
    expect(isValidCaseId(null)).toBe(false);
  });

  it('keeps a crafted link inside the CA services', () => {
    expect(parseCaAgentService('GST')).toBe('GST');
    expect(parseCaAgentService('ITR')).toBe('ITR');
    expect(parseCaAgentService('INCORPORATION')).toBe('INCORPORATION');
    expect(parseCaAgentService('LOAN')).toBeNull();
    expect(parseCaAgentService(null)).toBeNull();
  });

  it('reads the case and service from a notification link and drops anything unsafe', () => {
    expect(parseCaAgentQueueParams(new URLSearchParams('case=CASE-1001&service=GST'))).toEqual({ caseId: 'CASE-1001', service: 'GST' });
    expect(parseCaAgentQueueParams(new URLSearchParams('case=<script>&service=LOAN'))).toEqual({ caseId: null, service: null });
  });
});

describe('CA Agent messaging', () => {
  const me = { id: 'AGT-301', role: 'CA_AGENT', managerId: 'MGR-1' };

  it.each([
    ['messages the administrator', { id: 'ADM-1', role: 'ADMIN', managerId: null }, true],
    ['messages a manager of the team', { id: 'MGR-999', role: 'CA_MANAGER', managerId: null }, true],
    ['does not message other agents', { id: 'AGT-2', role: 'CA_AGENT', managerId: 'MGR-999' }, false],
    ['does not message the other team', { id: 'MGR-3', role: 'LOAN_MANAGER', managerId: null }, false]
  ] as const)('%s', (_label, other, allowed) => {
    expect(canCaAgentMessage(me, other)).toBe(allowed);
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

const queueIds = async (store: Store, id: keyof typeof CA_AGENT_QUEUES) => {
  const queue = CA_AGENT_QUEUES[id];
  return (await store.listCases({ statuses: queue.statuses, services: queue.services, pageSize: 100 })).items.map((item) => item.id);
};

const step = (store: Store, item: WorkflowCase, mutation: CaseMutation) => store.mutate(item.id, item.version, mutation);

describe('CA Agent workspace data', () => {
  let store: Store;

  beforeEach(async () => {
    store = await loadStore();
  });

  /** As the manager: verify every required document, request and confirm payment, then assign to this agent. */
  async function assignToMe(): Promise<WorkflowCase> {
    signInAs('camanager@gmail.com', 'CA_MANAGER');
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
    const assigned = await step(store, paid, { type: 'ASSIGN', input: { agentId: 'AGT-301', instructions: 'Please start today.', dueDate: null } });
    signInAs('caagent@gmail.com', 'CA_AGENT');
    return assigned;
  }

  it('sees nothing until a manager assigns an application', async () => {
    signInAs('caagent@gmail.com', 'CA_AGENT');
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
