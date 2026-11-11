import { describe, expect, it } from 'vitest';
import { queryCases, summarizeCases } from '@/modules/workflow/services/caseQueries';
import { WorkflowRuleError, actionBlockers, availableActions, canViewCase, resolveTransition, validateAssignment } from '@/modules/workflow/services/transitionRules';
import { buildSeedCases } from '@/modules/workflow/dev/demoWorkflowSeeds';
import { CA_AGENT_DEMO_SEEDS } from '@/modules/ca-agent/dev/demoCaAgentSeeds';
import { CA_MANAGER_DEMO_SEEDS } from '@/modules/ca-manager/dev/demoCaManagerSeeds';
import { LOAN_AGENT_DEMO_SEEDS } from '@/modules/loan-agent/dev/demoLoanAgentSeeds';
import { LOAN_MANAGER_DEMO_SEEDS } from '@/modules/loan-manager/dev/demoLoanManagerSeeds';
import type { StaffOption, WorkflowActor, WorkflowCase } from '@/modules/workflow/shared/workflow.types';
import { financialYearFormat, validateIntake } from '@/modules/workflow/validation/intakeValidation';
import { GST_FILING_DETAILS } from './workflowFixtures';
import { validateDocumentFile } from '@/modules/workflow/validation/documentValidation';

const STAFF: readonly StaffOption[] = [
  { id: 'MGR-101', name: 'CA Manager', role: 'CA_MANAGER', team: 'CA', active: true },
  { id: 'AGT-301', name: 'CA Agent', role: 'CA_AGENT', team: 'CA', active: true },
  { id: 'AGT-302', name: 'Second CA Agent', role: 'CA_AGENT', team: 'CA', active: true },
  { id: 'AGT-399', name: 'Inactive CA Agent', role: 'CA_AGENT', team: 'CA', active: false },
  { id: 'MGR-201', name: 'Loan Manager', role: 'LOAN_MANAGER', team: 'LOAN', active: true },
  { id: 'AGT-401', name: 'Loan Agent', role: 'LOAN_AGENT', team: 'LOAN', active: true },
  { id: 'AGT-402', name: 'Second Loan Agent', role: 'LOAN_AGENT', team: 'LOAN', active: true }
];

const actor = (id: string): WorkflowActor => {
  const member = STAFF.find((entry) => entry.id === id);
  return member ? { id: member.id, name: member.name, role: member.role } : { id, name: 'Admin', role: 'ADMIN' };
};

const SEEDS = [...CA_MANAGER_DEMO_SEEDS, ...CA_AGENT_DEMO_SEEDS, ...LOAN_MANAGER_DEMO_SEEDS, ...LOAN_AGENT_DEMO_SEEDS];
const CASES = buildSeedCases(SEEDS, STAFF);
const byStatus = (status: WorkflowCase['status'], service?: WorkflowCase['service']) =>
  CASES.find((item) => item.status === status && (!service || item.service === service)) as WorkflowCase;
const allVerified = (item: WorkflowCase): WorkflowCase => ({ ...item, documents: item.documents.map((doc) => (doc.required ? { ...doc, state: 'VERIFIED' as const } : doc)) });

const expectRuleError = (run: () => unknown, code: WorkflowRuleError['code']) => {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(WorkflowRuleError);
    expect((error as WorkflowRuleError).code).toBe(code);
    return;
  }
  throw new Error('Expected a workflow rule error.');
};

describe('role boundaries', () => {
  it('CA managers see only CA cases and loan managers only loan cases', () => {
    const caCase = byStatus('SUBMITTED', 'GST');
    const loanCase = byStatus('SUBMITTED', 'LOAN');
    expect(canViewCase(actor('MGR-101'), caCase)).toBe(true);
    expect(canViewCase(actor('MGR-101'), loanCase)).toBe(false);
    expect(canViewCase(actor('MGR-201'), loanCase)).toBe(true);
    expect(canViewCase(actor('MGR-201'), caCase)).toBe(false);
  });

  it('agents see only cases assigned to them; admins see everything', () => {
    const mine = CASES.find((item) => item.assignment.agentId === 'AGT-301') as WorkflowCase;
    expect(canViewCase(actor('AGT-301'), mine)).toBe(true);
    expect(canViewCase(actor('AGT-302'), mine)).toBe(false);
    expect(canViewCase(actor('AGT-401'), mine)).toBe(false);
    expect(CASES.every((item) => canViewCase(actor('ADMIN-1'), item))).toBe(true);
  });

  it('hides every action from a user who cannot see the case', () => {
    expect(availableActions(actor('MGR-201'), byStatus('SUBMITTED', 'GST'))).toEqual([]);
  });
});

describe('assignment happens only after payment', () => {
  const paid = byStatus('PAID', 'GST');

  it('blocks assigning before the customer has paid', () => {
    expectRuleError(() => validateAssignment(actor('MGR-101'), byStatus('SUBMITTED', 'GST'), STAFF[1]), 'CONFLICT');
    expectRuleError(() => validateAssignment(actor('MGR-101'), byStatus('PAYMENT_PENDING', 'GST'), STAFF[1]), 'CONFLICT');
    expect(availableActions(actor('MGR-101'), byStatus('PAYMENT_PENDING', 'GST'))).not.toContain('ASSIGN');
  });

  it('allows an active agent of the owning team once paid', () => {
    expect(() => validateAssignment(actor('MGR-101'), paid, STAFF[1])).not.toThrow();
  });

  it('rejects inactive agents, other teams, non-agents and the wrong assigner', () => {
    expectRuleError(() => validateAssignment(actor('MGR-101'), paid, STAFF[3]), 'VALIDATION_FAILED');
    expectRuleError(() => validateAssignment(actor('MGR-101'), paid, STAFF[5]), 'FORBIDDEN');
    expectRuleError(() => validateAssignment(actor('MGR-101'), paid, STAFF[0]), 'FORBIDDEN');
    expectRuleError(() => validateAssignment(actor('AGT-301'), paid, STAFF[2]), 'FORBIDDEN');
    expectRuleError(() => validateAssignment(actor('MGR-201'), paid, STAFF[1]), 'FORBIDDEN');
  });
});

describe('manager verification and payment', () => {
  const submitted = byStatus('SUBMITTED', 'GST');

  it('sends the payment request only when every required document is verified and the fee is valid', () => {
    expect(actionBlockers(submitted, 'REQUEST_PAYMENT').length).toBeGreaterThan(0);
    expectRuleError(() => resolveTransition(actor('MGR-101'), submitted, { action: 'REQUEST_PAYMENT', note: '', amount: 1499 }), 'VALIDATION_FAILED');
    const verified = allVerified(submitted);
    expectRuleError(() => resolveTransition(actor('MGR-101'), verified, { action: 'REQUEST_PAYMENT', note: '', amount: 0 }), 'VALIDATION_FAILED');
    expect(resolveTransition(actor('MGR-101'), verified, { action: 'REQUEST_PAYMENT', note: '', amount: 1499 })).toBe('PAYMENT_PENDING');
  });

  it('needs a reason to send documents back, and a reference to mark a payment as received', () => {
    expectRuleError(() => resolveTransition(actor('MGR-101'), submitted, { action: 'SEND_BACK', note: '' }), 'VALIDATION_FAILED');
    expect(resolveTransition(actor('MGR-101'), submitted, { action: 'SEND_BACK', note: 'PAN copy is blurred.' })).toBe('CORRECTION_NEEDED');
    const pending = byStatus('PAYMENT_PENDING', 'GST');
    expectRuleError(() => resolveTransition(actor('MGR-101'), pending, { action: 'MARK_PAID', note: '' }), 'VALIDATION_FAILED');
    expect(resolveTransition(actor('MGR-101'), pending, { action: 'MARK_PAID', note: '', reference: 'UTR-778812' })).toBe('PAID');
  });

  it('keeps verification and payment away from agents', () => {
    expectRuleError(() => resolveTransition(actor('AGT-301'), byStatus('PAYMENT_PENDING', 'GST'), { action: 'MARK_PAID', note: '', reference: 'UTR-1' }), 'FORBIDDEN');
  });
});

describe('agent work', () => {
  const assigned = CASES.find((item) => item.status === 'ASSIGNED' && item.assignment.agentId === 'AGT-301') as WorkflowCase;
  const agent = actor('AGT-301');

  it('starts portal work only after the documents are downloaded', () => {
    expectRuleError(() => resolveTransition(agent, assigned, { action: 'START_PORTAL_WORK', note: '' }), 'VALIDATION_FAILED');
    expect(resolveTransition(agent, { ...assigned, documentsDownloadedAt: new Date().toISOString() }, { action: 'START_PORTAL_WORK', note: '' })).toBe('PORTAL_WORK');
  });

  it('reports missing documents to the manager with a list or a description', () => {
    expectRuleError(() => resolveTransition(agent, assigned, { action: 'REPORT_MISSING', note: '' }), 'VALIDATION_FAILED');
    expect(resolveTransition(agent, assigned, { action: 'REPORT_MISSING', note: '', documentIds: [assigned.documents[0].id] })).toBe('DOCS_MISSING');
  });

  it('submits only with a result file, which the agent cannot skip', () => {
    const portal = { ...assigned, status: 'PORTAL_WORK' as const };
    expectRuleError(() => resolveTransition(agent, portal, { action: 'SUBMIT_OUTPUT', note: '' }), 'VALIDATION_FAILED');
    const withResult = { ...portal, outputs: [{ id: 'O1', fileName: 'ack.pdf', uploadedBy: 'CA Agent', uploadedAt: new Date().toISOString() }] };
    expect(resolveTransition(agent, withResult, { action: 'SUBMIT_OUTPUT', note: '' })).toBe('COMPLETED');
  });
});

describe('queries and counters', () => {
  it('dashboard counts match the case list they summarise', () => {
    const summary = summarizeCases(CASES);
    expect(summary.total).toBe(CASES.length);
    expect(summary.readyToAssign).toBe(queryCases(CASES, { statuses: ['PAID'], pageSize: 100 }).total);
    expect(summary.docsMissing).toBe(queryCases(CASES, { statuses: ['DOCS_MISSING'], pageSize: 100 }).total);
    const serviceTotal = Object.values(summary.byService).reduce((sum, count) => sum + count, 0);
    expect(serviceTotal).toBe(CASES.length);
  });

  it('paginates and clamps out-of-range pages', () => {
    const page = queryCases(CASES, { page: 99, pageSize: 5 });
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.page).toBe(Math.ceil(CASES.length / 5));
  });
});

describe('intake and upload validation', () => {
  const valid = {
    service: 'GST' as const,
    serviceType: 'gst-filing',
    client: { name: 'Asha Traders', email: 'asha@example.com', mobile: '+91 98765 43210', pan: 'aakfa1234m', city: 'Pune' },
    details: GST_FILING_DETAILS
  };

  it('accepts a complete GST intake and normalises identifiers', () => {
    expect(validateIntake(valid)).toEqual({});
  });

  it('validates each field by its type', () => {
    const errors = validateIntake({ ...valid, client: { ...valid.client, mobile: '12345', email: 'asha@' }, details: { ...valid.details, gstin: 'BAD', filingFrequency: 'Weekly' } });
    expect(Object.keys(errors).sort()).toEqual(['client.email', 'client.mobile', 'details.filingFrequency', 'details.gstin']);
  });

  it('checks financial years and upload files', () => {
    expect(financialYearFormat('2025-26')).toBeNull();
    expect(financialYearFormat('2025-2026')).not.toBeNull();
    expect(validateDocumentFile({ name: 'form16.pdf', size: 2048 })).toBeNull();
    expect(validateDocumentFile({ name: 'script.exe', size: 2048 })).not.toBeNull();
    expect(validateDocumentFile({ name: 'huge.pdf', size: 50 * 1024 * 1024 })).not.toBeNull();
  });
});
