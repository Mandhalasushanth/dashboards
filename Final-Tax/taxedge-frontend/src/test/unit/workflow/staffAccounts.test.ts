import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Role } from '@/modules/authentication';
import type { CaseIntakeInput, CaseMutation, TransitionInput, WorkflowCase } from '@/modules/workflow/shared/workflow.types';
import { GST_FILING_DETAILS, installMemoryBrowser } from './workflowFixtures';

/**
 * Managers and agents: the administrator creates every account; only those accounts can sign in; any
 * manager of a team sees all of its applications and can assign to any agent of that team; each agent
 * sees only what was assigned to them.
 */

const PASSWORD = 'Strong#Pass123';

async function loadModules() {
  vi.resetModules();
  installMemoryBrowser();
  const auth = (await import('@/store')).authStore;
  const { demoStaffStore } = await import('@/modules/admin/dev/demoStaffStore');
  const { demoAuthenticationGateway } = await import('@/modules/authentication/dev/demoAuthenticationGateway');
  const { demoWorkflowStore } = await import('@/modules/workflow/dev/demoWorkflowStore');
  const { DEMO_ACCOUNTS } = await import('@/modules/authentication/dev/demoAccounts');
  return { auth, staff: demoStaffStore, gateway: demoAuthenticationGateway, workflow: demoWorkflowStore, builtIn: DEMO_ACCOUNTS };
}

type Modules = Awaited<ReturnType<typeof loadModules>>;

const newStaff = (fullName: string, username: string, role: Role & `${string}_${'MANAGER' | 'AGENT'}`, managerId: string | null = null) => ({
  fullName,
  username,
  role,
  managerId,
  password: PASSWORD
});

/** The team an administrator sets up: two CA managers, an agent under each, and a loan manager. */
async function createTeam(modules: Modules) {
  const anil = await modules.staff.create(newStaff('Anil Rao', 'anil@firm.in', 'CA_MANAGER'));
  const meena = await modules.staff.create(newStaff('Meena Shah', 'meena@firm.in', 'CA_MANAGER'));
  const ravi = await modules.staff.create(newStaff('Ravi Teja', 'ravi@firm.in', 'CA_AGENT', anil.id));
  const lata = await modules.staff.create(newStaff('Lata Nair', 'lata@firm.in', 'CA_AGENT', meena.id));
  const lakshmi = await modules.staff.create(newStaff('Lakshmi Iyer', 'lakshmi@firm.in', 'LOAN_MANAGER'));
  return { anil, meena, ravi, lata, lakshmi };
}

/** Signs in through the real demo gateway, then hands the session to the workflow backend. */
async function signIn(modules: Modules, username: string, password = PASSWORD) {
  const user = await modules.gateway.login({ username, password });
  modules.auth.setAuthenticated(user);
  return user;
}

const GST_INTAKE: CaseIntakeInput = {
  service: 'GST',
  serviceType: 'gst-filing',
  client: { name: 'Asha Traders', email: 'asha@example.com', mobile: '9876543210', pan: 'AAKFA1234M', city: 'Pune' },
  details: GST_FILING_DETAILS
};

const step = (modules: Modules, item: WorkflowCase, mutation: CaseMutation) => modules.workflow.mutate(item.id, item.version, mutation);
const move = (modules: Modules, item: WorkflowCase, input: TransitionInput) => step(modules, item, { type: 'TRANSITION', input });

/** Verify every required document, request payment and mark it paid, as the signed-in manager. */
async function readyToAssign(modules: Modules, start: WorkflowCase): Promise<WorkflowCase> {
  const verified = await start.documents
    .filter((doc) => doc.required)
    .reduce(async (pending, doc) => {
      const current = await pending;
      const uploaded = await modules.workflow.uploadDocument(current.id, current.version, doc.id, new File(['x'], `${doc.typeId}.pdf`));
      return step(modules, uploaded, { type: 'DOCUMENT_REVIEW', documentId: doc.id, decision: 'VERIFIED', reason: '' });
    }, Promise.resolve(start));
  const requested = await move(modules, verified, { action: 'REQUEST_PAYMENT', note: '', amount: 1499 });
  return move(modules, requested, { action: 'MARK_PAID', note: '', reference: 'UTR-552019' });
}

const visibleIds = async (modules: Modules) => (await modules.workflow.listCases({ pageSize: 100 })).items.map((item) => item.id);

describe('accounts are created only by the administrator', () => {
  let modules: Modules;

  beforeEach(async () => {
    modules = await loadModules();
  });

  it('has no predefined managers or agents; the administrator is the only built-in login', async () => {
    expect(modules.builtIn.map((account) => account.role)).toEqual(['ADMIN']);
    expect(await modules.staff.list('MANAGER')).toEqual([]);
    expect(await modules.staff.list('AGENT')).toEqual([]);
    await expect(modules.gateway.login({ username: 'camanager@gmail.com', password: 'camanager123' })).rejects.toMatchObject({ status: 401 });
  });

  it('creates managers and agents, places each agent under a manager and never returns the password', async () => {
    const team = await createTeam(modules);
    expect(team.ravi).toMatchObject({ role: 'CA_AGENT', managerId: team.anil.id, managerName: 'Anil Rao', active: true });
    expect(Object.keys(team.ravi)).not.toEqual(expect.arrayContaining(['passwordHash', 'salt']));
    expect((await modules.staff.list('AGENT')).map((member) => member.fullName)).toEqual(['Ravi Teja', 'Lata Nair']);
  });

  it('rejects a second account with the same email', async () => {
    await createTeam(modules);
    await expect(modules.staff.create(newStaff('Another Anil', 'ANIL@firm.in', 'CA_MANAGER'))).rejects.toThrow(/already exists/);
  });

  it('signs in admin-created staff with their own password and name, and refuses a wrong password', async () => {
    await createTeam(modules);
    const user = await signIn(modules, 'ravi@firm.in');
    expect(user).toMatchObject({ username: 'ravi@firm.in', displayName: 'Ravi Teja', role: 'CA_AGENT' });
    expect(user.permissions).toContain('CA_CASE_UPDATE');
    await expect(modules.gateway.login({ username: 'lata@firm.in', password: 'Wrong#Pass123' })).rejects.toMatchObject({ status: 401 });
  });
});

describe('managers and agents share the work of their team', () => {
  let modules: Modules;
  let team: Awaited<ReturnType<typeof createTeam>>;
  let paid: WorkflowCase;

  beforeEach(async () => {
    modules = await loadModules();
    team = await createTeam(modules);
    await signIn(modules, 'anil@firm.in');
    paid = await readyToAssign(modules, await modules.workflow.submitCase(GST_INTAKE));
  });

  it('shows every application of the team to every manager of that team, and none to other teams', async () => {
    expect(await visibleIds(modules)).toContain(paid.id);
    await signIn(modules, 'meena@firm.in');
    expect(await visibleIds(modules)).toContain(paid.id);
    await signIn(modules, 'lakshmi@firm.in');
    expect(await visibleIds(modules)).not.toContain(paid.id);
  });

  it('lets a manager choose any agent of the team, not only the agents placed under them', async () => {
    const choices = (await modules.workflow.workload()).map((entry) => entry.agent.name);
    expect(choices).toEqual(expect.arrayContaining(['Ravi Teja', 'Lata Nair']));
    const assigned = await step(modules, paid, { type: 'ASSIGN', input: { agentId: team.lata.id, instructions: 'Please file this week.', dueDate: null } });
    expect(assigned).toMatchObject({ status: 'ASSIGNED', assignment: { agentId: team.lata.id, agentName: 'Lata Nair', managerName: 'Anil Rao' } });
  });

  it('shows an assigned application only to the agent it was assigned to', async () => {
    await step(modules, paid, { type: 'ASSIGN', input: { agentId: team.ravi.id, instructions: '', dueDate: null } });
    await signIn(modules, 'ravi@firm.in');
    expect(await visibleIds(modules)).toEqual([paid.id]);
    await signIn(modules, 'lata@firm.in');
    expect(await visibleIds(modules)).toEqual([]);
    await expect(modules.workflow.getCase(paid.id)).rejects.toMatchObject({ status: 403 });
  });

  it('moves the application when a manager reassigns it to another agent', async () => {
    const withRavi = await step(modules, paid, { type: 'ASSIGN', input: { agentId: team.ravi.id, instructions: '', dueDate: null } });
    await signIn(modules, 'meena@firm.in');
    await step(modules, withRavi, { type: 'ASSIGN', input: { agentId: team.lata.id, instructions: 'Ravi is on leave.', dueDate: null } });
    await signIn(modules, 'ravi@firm.in');
    expect(await visibleIds(modules)).toEqual([]);
    await signIn(modules, 'lata@firm.in');
    expect(await visibleIds(modules)).toEqual([paid.id]);
  });

  it('does not let an agent assign work or see the team directory', async () => {
    await step(modules, paid, { type: 'ASSIGN', input: { agentId: team.ravi.id, instructions: '', dueDate: null } });
    await signIn(modules, 'ravi@firm.in');
    const mine = await modules.workflow.getCase(paid.id);
    await expect(step(modules, mine, { type: 'ASSIGN', input: { agentId: team.lata.id, instructions: '', dueDate: null } })).rejects.toMatchObject({ status: 403 });
    await expect(modules.workflow.workload()).rejects.toMatchObject({ status: 403 });
  });

  it('stops a deactivated agent from signing in or receiving work', async () => {
    await modules.staff.update(team.lata.id, { ...newStaff('Lata Nair', 'lata@firm.in', 'CA_AGENT', team.meena.id), password: '' });
    await modules.staff.setActive(team.lata.id, false);
    await expect(modules.gateway.login({ username: 'lata@firm.in', password: PASSWORD })).rejects.toMatchObject({ status: 403 });
    await expect(step(modules, paid, { type: 'ASSIGN', input: { agentId: team.lata.id, instructions: '', dueDate: null } })).rejects.toMatchObject({ status: 422 });
  });
});
