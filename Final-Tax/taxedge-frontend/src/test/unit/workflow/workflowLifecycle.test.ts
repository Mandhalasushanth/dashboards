import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Role } from '@/modules/authentication';
import { GST_FILING_DETAILS, HOME_LOAN_DETAILS, installMemoryBrowser, seedTeam } from './workflowFixtures';
import type { CaseIntakeInput, CaseMutation, TransitionInput, WorkflowCase } from '@/modules/workflow/shared/workflow.types';

/** Re-imported with the store after each module reset, so both share one auth state. */
let auth: (typeof import('@/store'))['authStore'];

const signInAs = (username: string, role: Role) =>
  auth.setAuthenticated({ id: username, username, displayName: username, role, permissions: [], lastLoginAt: null });

const ADMIN = () => signInAs('admin@gmail.com', 'ADMIN');
const CA_MANAGER = () => signInAs('camanager@gmail.com', 'CA_MANAGER');
const CA_AGENT = () => signInAs('caagent@gmail.com', 'CA_AGENT');
const LOAN_MANAGER = () => signInAs('loanmanager@gmail.com', 'LOAN_MANAGER');
const LOAN_AGENT = () => signInAs('loanagent@gmail.com', 'LOAN_AGENT');

async function loadStore() {
  vi.resetModules();
  installMemoryBrowser();
  seedTeam();
  auth = (await import('@/store')).authStore;
  return (await import('@/modules/workflow/dev/demoWorkflowStore')).demoWorkflowStore;
}

type Store = Awaited<ReturnType<typeof loadStore>>;

const GST_INTAKE: CaseIntakeInput = {
  service: 'GST',
  serviceType: 'gst-filing',
  client: { name: 'Asha Traders', email: 'asha@example.com', mobile: '9876543210', pan: 'AAKFA1234M', city: 'Pune' },
  details: GST_FILING_DETAILS
};

const LOAN_INTAKE: CaseIntakeInput = {
  service: 'LOAN',
  serviceType: 'home-loan',
  client: { name: 'Ravi Kumar', email: 'ravi@example.com', mobile: '9123456780', pan: 'BXJPK4417F', city: 'Jaipur' },
  details: HOME_LOAN_DETAILS
};

const pdf = (name: string) => new File(['content'], `${name}.pdf`);

const step = (store: Store, item: WorkflowCase, mutation: CaseMutation) => store.mutate(item.id, item.version, mutation);
const move = (store: Store, item: WorkflowCase, input: TransitionInput) => step(store, item, { type: 'TRANSITION', input });

/** Manager uploads (on the customer's behalf) and marks every required document correct. */
async function verifyAll(store: Store, start: WorkflowCase): Promise<WorkflowCase> {
  return start.documents
    .filter((doc) => doc.required && doc.state !== 'VERIFIED')
    .reduce(async (pending, doc) => {
      const current = await pending;
      const withFile = current.documents.find((entry) => entry.id === doc.id)?.state === 'UPLOADED' ? current : await store.uploadDocument(current.id, current.version, doc.id, pdf(doc.typeId));
      return step(store, withFile, { type: 'DOCUMENT_REVIEW', documentId: doc.id, decision: 'VERIFIED', reason: '' });
    }, Promise.resolve(start));
}

/** Verify → payment request → paid, as the manager. */
async function verifyAndPay(store: Store, start: WorkflowCase): Promise<WorkflowCase> {
  const verified = await verifyAll(store, start);
  const requested = await move(store, verified, { action: 'REQUEST_PAYMENT', note: '', amount: 1499 });
  return move(store, requested, { action: 'MARK_PAID', note: '', reference: 'UTR-552019' });
}

const visibleIds = async (store: Store) => (await store.listCases({ pageSize: 100 })).items.map((item) => item.id);

describe('tax application workflow (acceptance walkthrough)', () => {
  let store: Store;

  beforeEach(async () => {
    store = await loadStore();
  });

  it('verifies, collects payment, assigns, handles missing documents and delivers the result, all audited', async () => {
    ADMIN();
    const created = await store.submitCase(GST_INTAKE);
    expect(created.status).toBe('SUBMITTED');
    expect(created.team).toBe('CA');
    expect(created.referenceNumber).toMatch(/^TE-GST-\d{4}-\d+$/);

    LOAN_MANAGER();
    expect(await visibleIds(store)).not.toContain(created.id);

    CA_MANAGER();
    expect((await store.notifications()).some((entry) => entry.caseId === created.id)).toBe(true);
    const fresh = await store.getCase(created.id);
    await expect(step(store, fresh, { type: 'ASSIGN', input: { agentId: 'AGT-301', instructions: '', dueDate: null } })).rejects.toMatchObject({ status: 409 });

    // Wrong document → back to the customer → resubmitted → verified.
    const firstDoc = fresh.documents.find((doc) => doc.required) as WorkflowCase['documents'][number];
    const uploaded = await store.uploadDocument(fresh.id, fresh.version, firstDoc.id, pdf('blurred'));
    const wrong = await step(store, uploaded, { type: 'DOCUMENT_REVIEW', documentId: firstDoc.id, decision: 'REJECTED', reason: 'Copy is blurred.' });
    const sentBack = await move(store, wrong, { action: 'SEND_BACK', note: 'Please upload a clear PAN copy.', documentIds: [firstDoc.id] });
    expect(sentBack.status).toBe('CORRECTION_NEEDED');
    expect(sentBack.openIssue?.waitingOn).toBe('CUSTOMER');
    const reuploaded = await store.uploadDocument(sentBack.id, sentBack.version, firstDoc.id, pdf('clear'));
    const rechecking = await move(store, reuploaded, { action: 'RECHECK', note: '' });
    expect(rechecking.status).toBe('SUBMITTED');

    const verified = await verifyAll(store, rechecking);
    await expect(move(store, verified, { action: 'REQUEST_PAYMENT', note: '', amount: 0 })).rejects.toMatchObject({ status: 422 });
    const requested = await move(store, verified, { action: 'REQUEST_PAYMENT', note: '', amount: 1499 });
    expect(requested.payment).toMatchObject({ state: 'PENDING', amount: 1499 });
    await expect(step(store, requested, { type: 'ASSIGN', input: { agentId: 'AGT-301', instructions: '', dueDate: null } })).rejects.toMatchObject({ status: 409 });
    const paid = await move(store, requested, { action: 'MARK_PAID', note: '', reference: 'UTR-552019' });
    expect(paid.status).toBe('PAID');
    const assigned = await step(store, paid, { type: 'ASSIGN', input: { agentId: 'AGT-301', instructions: 'File before the 20th.', dueDate: null } });
    expect(assigned.status).toBe('ASSIGNED');

    LOAN_AGENT();
    expect(await visibleIds(store)).not.toContain(created.id);
    CA_AGENT();
    const received = await store.getCase(created.id);
    await expect(move(store, received, { action: 'START_PORTAL_WORK', note: '' })).rejects.toMatchObject({ status: 422 });
    const reported = await move(store, received, { action: 'REPORT_MISSING', note: 'Purchase register is missing.', documentIds: [firstDoc.id] });
    expect(reported.status).toBe('DOCS_MISSING');
    expect(reported.openIssue?.waitingOn).toBe('MANAGER');

    CA_MANAGER();
    const missing = await store.getCase(created.id);
    await expect(move(store, missing, { action: 'DOCS_UPDATED', note: '' })).rejects.toMatchObject({ status: 422 });
    const fixed = await verifyAll(store, await store.uploadDocument(missing.id, missing.version, firstDoc.id, pdf('register')));
    const returned = await move(store, fixed, { action: 'DOCS_UPDATED', note: 'Register added.' });
    expect(returned.status).toBe('ASSIGNED');
    expect(returned.openIssue).toBeNull();

    CA_AGENT();
    const downloaded = await step(store, await store.getCase(created.id), { type: 'DOCUMENTS_DOWNLOADED' });
    const working = await move(store, downloaded, { action: 'START_PORTAL_WORK', note: '' });
    expect(working.status).toBe('PORTAL_WORK');
    await expect(move(store, working, { action: 'SUBMIT_OUTPUT', note: '' })).rejects.toMatchObject({ status: 422 });
    const withResult = await store.uploadOutput(working.id, working.version, pdf('gstr3b-ack'));
    const delivered = await move(store, withResult, { action: 'SUBMIT_OUTPUT', note: 'Return filed.', reference: 'AA2710250012345' });
    expect(delivered.status).toBe('COMPLETED');

    CA_MANAGER();
    expect((await store.getCase(created.id)).outputs).toHaveLength(1);

    ADMIN();
    const timeline = (await store.getCase(created.id)).history.map((event) => event.action);
    expect(timeline).toEqual(
      expect.arrayContaining(['SUBMITTED', 'SEND_BACK', 'RECHECK', 'REQUEST_PAYMENT', 'MARK_PAID', 'ASSIGN', 'REPORT_MISSING', 'DOCS_UPDATED', 'DOCUMENTS_DOWNLOADED', 'START_PORTAL_WORK', 'SUBMIT_OUTPUT'])
    );
    const audit = await store.auditLog({ search: created.referenceNumber, pageSize: 100 });
    expect(audit.total).toBe((await store.getCase(created.id)).history.length);
  });

  it('rejects stale writes, duplicate submissions and cross-team access', async () => {
    ADMIN();
    const created = await store.submitCase(GST_INTAKE);
    await expect(store.submitCase(GST_INTAKE)).rejects.toMatchObject({ status: 409 });

    CA_MANAGER();
    const note: CaseMutation = { type: 'NOTE', text: 'Called the customer.' };
    await store.mutate(created.id, created.version, note);
    await expect(store.mutate(created.id, created.version, note)).rejects.toMatchObject({ status: 409 });

    LOAN_MANAGER();
    await expect(store.getCase(created.id)).rejects.toMatchObject({ status: 403 });
    CA_AGENT();
    await expect(store.listAgents()).rejects.toMatchObject({ status: 403 });
  });

  it('lets the administrator confirm payment and reassign only with a recorded reason', async () => {
    ADMIN();
    const created = await store.submitCase(GST_INTAKE);
    CA_MANAGER();
    const paid = await verifyAndPay(store, await store.getCase(created.id));
    ADMIN();
    await expect(store.mutate(paid.id, paid.version, { type: 'ASSIGN', input: { agentId: 'AGT-301', instructions: '', dueDate: null } })).rejects.toMatchObject({ status: 422 });
    const assigned = await store.mutate(paid.id, paid.version, { type: 'ASSIGN', input: { agentId: 'AGT-301', instructions: 'Manager on leave; covering.', dueDate: null } });
    expect(assigned.history.at(-1)?.actorRole).toBe('ADMIN');
  });
});

describe('loan application workflow', () => {
  it('routes through the loan team and follows the same pay-before-assign flow', async () => {
    const store = await loadStore();
    ADMIN();
    const created = await store.submitCase(LOAN_INTAKE);
    expect(created.team).toBe('LOAN');

    CA_MANAGER();
    expect(await visibleIds(store)).not.toContain(created.id);
    LOAN_MANAGER();
    const paid = await verifyAndPay(store, await store.getCase(created.id));
    const assigned = await step(store, paid, { type: 'ASSIGN', input: { agentId: 'AGT-401', instructions: '', dueDate: null } });

    LOAN_AGENT();
    const mine = await store.getCase(assigned.id);
    expect(mine.access?.actions).toEqual(expect.arrayContaining(['START_PORTAL_WORK', 'REPORT_MISSING']));
    expect(mine.access?.canDownloadDocuments).toBe(true);
  });
});
