import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Role } from '@/modules/authentication';
import { canLoanManagerMessage } from '@/modules/loan-manager/shared/loanManagerCommunication';
import { LOAN_MANAGER_QUEUES } from '@/modules/loan-manager/shared/loanManagerQueues';
import { isValidCaseId, parseLoanManagerQueueParams, parseLoanManagerService } from '@/modules/loan-manager/validation/loanManagerValidation';
import type { CaseMutation, WorkflowCase } from '@/modules/workflow/shared/workflow.types';
import { installMemoryBrowser, seedTeam } from '../workflow/workflowFixtures';

/** What a Loan Manager may open, message and see, checked against the demo backend the screens use. */
describe('Loan Manager deep links', () => {
  it('accepts only well-formed application ids', () => {
    expect(isValidCaseId('CASE-1001')).toBe(true);
    expect(isValidCaseId('TE-GST-2026-1001')).toBe(true);
    expect(isValidCaseId("CASE-1'; DROP")).toBe(false);
    expect(isValidCaseId('ab')).toBe(false);
    expect(isValidCaseId(null)).toBe(false);
  });

  it('keeps a crafted link inside the LOAN services', () => {
    expect(parseLoanManagerService('LOAN')).toBe('LOAN');
    expect(parseLoanManagerService('INSURANCE')).toBe('INSURANCE');
    expect(parseLoanManagerService('GST')).toBeNull();
    expect(parseLoanManagerService(null)).toBeNull();
  });

  it('reads the case and service from a notification link and drops anything unsafe', () => {
    expect(parseLoanManagerQueueParams(new URLSearchParams('case=CASE-1001&service=LOAN'))).toEqual({ caseId: 'CASE-1001', service: 'LOAN' });
    expect(parseLoanManagerQueueParams(new URLSearchParams('case=<script>&service=GST'))).toEqual({ caseId: null, service: null });
  });
});

describe('Loan Manager messaging', () => {
  const me = { id: 'MGR-201', role: 'LOAN_MANAGER', managerId: null };

  it.each([
    ['messages the administrator', { id: 'ADM-1', role: 'ADMIN', managerId: null }, true],
    ['messages a fellow manager of the team', { id: 'MGR-999', role: 'LOAN_MANAGER', managerId: null }, true],
    ['messages an agent who reports to them', { id: 'AGT-1', role: 'LOAN_AGENT', managerId: 'MGR-201' }, true],
    ['does not message an agent of another manager', { id: 'AGT-2', role: 'LOAN_AGENT', managerId: 'MGR-999' }, false],
    ['does not message the other team', { id: 'MGR-3', role: 'CA_MANAGER', managerId: null }, false]
  ] as const)('%s', (_label, other, allowed) => {
    expect(canLoanManagerMessage(me, other)).toBe(allowed);
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

const queueIds = async (store: Store, id: keyof typeof LOAN_MANAGER_QUEUES) => {
  const queue = LOAN_MANAGER_QUEUES[id];
  return (await store.listCases({ statuses: queue.statuses, services: queue.services, pageSize: 100 })).items.map((item) => item.id);
};

const step = (store: Store, item: WorkflowCase, mutation: CaseMutation) => store.mutate(item.id, item.version, mutation);

describe('Loan Manager workspace data', () => {
  let store: Store;

  beforeEach(async () => {
    store = await loadStore();
    signInAs('loanmanager@gmail.com', 'LOAN_MANAGER');
  });

  it('shows every new LOAN application in All Applications and nothing from the other team', async () => {
    const page = await store.listCases({ pageSize: 100 });
    expect(page.items.length).toBeGreaterThan(0);
    page.items.forEach((item) => expect(item.team).toBe('LOAN'));
    expect(await queueIds(store, 'verify')).toEqual(page.items.map((item) => item.id));
  });

  it('starts with empty work queues, because customers have only just submitted', async () => {
    expect(await queueIds(store, 'working')).toEqual([]);
  });

  it('can verify documents and assign, but only after payment', async () => {
    const [first] = (await store.listCases({ statuses: ['SUBMITTED'], pageSize: 1 })).items;
    expect(first.access?.canReviewDocuments).toBe(true);
    await expect(step(store, first, { type: 'ASSIGN', input: { agentId: 'AGT-401', instructions: '', dueDate: null } })).rejects.toMatchObject({ status: 409 });
  });

  it('sees the whole team of agents when assigning', async () => {
    const agents = await store.workload();
    expect(agents.map((entry) => entry.agent.id)).toContain('AGT-401');
    agents.forEach((entry) => expect(entry.agent.team).toBe('LOAN'));
  });
});
