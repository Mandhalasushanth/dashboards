import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Role } from '@/modules/authentication';
import { canCaManagerMessage } from '@/modules/ca-manager/shared/caManagerCommunication';
import { CA_MANAGER_QUEUES } from '@/modules/ca-manager/shared/caManagerQueues';
import { isValidCaseId, parseCaManagerQueueParams, parseCaManagerService } from '@/modules/ca-manager/validation/caManagerValidation';
import type { CaseMutation, WorkflowCase } from '@/modules/workflow/shared/workflow.types';
import { installMemoryBrowser, seedTeam } from '../workflow/workflowFixtures';

/** What a CA Manager may open, message and see, checked against the demo backend the screens use. */
describe('CA Manager deep links', () => {
  it('accepts only well-formed application ids', () => {
    expect(isValidCaseId('CASE-1001')).toBe(true);
    expect(isValidCaseId('TE-GST-2026-1001')).toBe(true);
    expect(isValidCaseId("CASE-1'; DROP")).toBe(false);
    expect(isValidCaseId('ab')).toBe(false);
    expect(isValidCaseId(null)).toBe(false);
  });

  it('keeps a crafted link inside the CA services', () => {
    expect(parseCaManagerService('GST')).toBe('GST');
    expect(parseCaManagerService('ITR')).toBe('ITR');
    expect(parseCaManagerService('INCORPORATION')).toBe('INCORPORATION');
    expect(parseCaManagerService('LOAN')).toBeNull();
    expect(parseCaManagerService(null)).toBeNull();
  });

  it('reads the case and service from a notification link and drops anything unsafe', () => {
    expect(parseCaManagerQueueParams(new URLSearchParams('case=CASE-1001&service=GST'))).toEqual({ caseId: 'CASE-1001', service: 'GST' });
    expect(parseCaManagerQueueParams(new URLSearchParams('case=<script>&service=LOAN'))).toEqual({ caseId: null, service: null });
  });
});

describe('CA Manager messaging', () => {
  const me = { id: 'MGR-101', role: 'CA_MANAGER', managerId: null };

  it.each([
    ['messages the administrator', { id: 'ADM-1', role: 'ADMIN', managerId: null }, true],
    ['messages a fellow manager of the team', { id: 'MGR-999', role: 'CA_MANAGER', managerId: null }, true],
    ['messages an agent who reports to them', { id: 'AGT-1', role: 'CA_AGENT', managerId: 'MGR-101' }, true],
    ['does not message an agent of another manager', { id: 'AGT-2', role: 'CA_AGENT', managerId: 'MGR-999' }, false],
    ['does not message the other team', { id: 'MGR-3', role: 'LOAN_MANAGER', managerId: null }, false]
  ] as const)('%s', (_label, other, allowed) => {
    expect(canCaManagerMessage(me, other)).toBe(allowed);
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

const queueIds = async (store: Store, id: keyof typeof CA_MANAGER_QUEUES) => {
  const queue = CA_MANAGER_QUEUES[id];
  return (await store.listCases({ statuses: queue.statuses, services: queue.services, pageSize: 100 })).items.map((item) => item.id);
};

const step = (store: Store, item: WorkflowCase, mutation: CaseMutation) => store.mutate(item.id, item.version, mutation);

describe('CA Manager workspace data', () => {
  let store: Store;

  beforeEach(async () => {
    store = await loadStore();
    signInAs('camanager@gmail.com', 'CA_MANAGER');
  });

  it('shows every new CA application in All Applications and nothing from the other team', async () => {
    const page = await store.listCases({ pageSize: 100 });
    expect(page.items.length).toBeGreaterThan(0);
    page.items.forEach((item) => expect(item.team).toBe('CA'));
    expect(await queueIds(store, 'verify')).toEqual(page.items.map((item) => item.id));
  });

  it('starts with empty work queues, because customers have only just submitted', async () => {
    expect(await queueIds(store, 'working')).toEqual([]);
  });

  it('can verify documents and assign, but only after payment', async () => {
    const [first] = (await store.listCases({ statuses: ['SUBMITTED'], pageSize: 1 })).items;
    expect(first.access?.canReviewDocuments).toBe(true);
    await expect(step(store, first, { type: 'ASSIGN', input: { agentId: 'AGT-301', instructions: '', dueDate: null } })).rejects.toMatchObject({ status: 409 });
  });

  it('sees the whole team of agents when assigning', async () => {
    const agents = await store.workload();
    expect(agents.map((entry) => entry.agent.id)).toContain('AGT-301');
    agents.forEach((entry) => expect(entry.agent.team).toBe('CA'));
  });
});
