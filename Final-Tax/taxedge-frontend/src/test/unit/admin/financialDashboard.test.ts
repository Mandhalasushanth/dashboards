import { describe, expect, it } from 'vitest';
import {
  buildFinancialSnapshot,
  currentPeriod,
  periodLabel,
  periodOptions,
  previousPeriod
} from '@/modules/admin/shared/financialDashboard';
import type { ServiceKind, WorkflowCase } from '@/modules/workflow';

/** Builds just the parts of an application the Financial Dashboard reads. */
function application(id: string, service: ServiceKind, amount: number, paidAt: string | null, who: { agent?: string; manager?: string } = {}): WorkflowCase {
  return {
    id,
    service,
    team: service === 'LOAN' || service === 'INSURANCE' ? 'LOAN' : 'CA',
    payment: { state: paidAt ? 'PAID' : 'PENDING', amount, requestedAt: '2026-10-01T09:00:00', paidAt, reference: null },
    assignment: {
      agentId: who.agent ? `AGT-${who.agent}` : null,
      agentName: who.agent ?? null,
      managerId: who.manager ? `MGR-${who.manager}` : null,
      managerName: who.manager ?? null,
      assignedAt: null,
      instructions: null
    }
  } as unknown as WorkflowCase;
}

const NOW = new Date(2026, 9, 28, 15, 0);

const CASES: readonly WorkflowCase[] = [
  application('A', 'GST', 1499, '2026-10-28T10:00:00', { agent: 'Ravi', manager: 'Anil' }),
  application('B', 'ITR', 999, '2026-10-05T10:00:00', { agent: 'Ravi', manager: 'Anil' }),
  application('C', 'LOAN', 4999, '2026-10-12T10:00:00', { agent: 'Lata', manager: 'Meena' }),
  application('D', 'INCORPORATION', 6999, '2026-10-20T10:00:00'),
  application('E', 'GST', 2000, '2026-09-15T10:00:00', { agent: 'Ravi', manager: 'Anil' }),
  application('F', 'GST', 1000, '2027-02-10T10:00:00', { agent: 'Lata', manager: 'Meena' }),
  application('G', 'ITR', 1500, '2026-03-30T10:00:00', { agent: 'Ravi', manager: 'Anil' }),
  application('H', 'LOAN', 3000, null)
];

describe('Financial Dashboard periods', () => {
  it('uses calendar months and Indian financial years (April to March)', () => {
    expect(currentPeriod('MONTH', NOW)).toEqual({ view: 'MONTH', key: '2026-10' });
    expect(currentPeriod('YEAR', NOW)).toEqual({ view: 'YEAR', key: '2026' });
    expect(currentPeriod('YEAR', new Date(2027, 1, 10))).toEqual({ view: 'YEAR', key: '2026' });
    expect(periodLabel({ view: 'YEAR', key: '2026' })).toBe('FY 2026-27');
    expect(periodLabel({ view: 'MONTH', key: '2026-10' })).toBe('October 2026');
  });

  it('compares with the month or year before, across a year boundary', () => {
    expect(previousPeriod({ view: 'MONTH', key: '2026-01' })).toEqual({ view: 'MONTH', key: '2025-12' });
    expect(previousPeriod({ view: 'YEAR', key: '2026' })).toEqual({ view: 'YEAR', key: '2025' });
  });

  it('offers the last 12 months or the last 5 financial years, newest first', () => {
    const months = periodOptions('MONTH', NOW);
    expect(months).toHaveLength(12);
    expect(months[0].key).toBe('2026-10');
    expect(months[11].key).toBe('2025-11');
    expect(periodOptions('YEAR', NOW).map((option) => option.key)).toEqual(['2026', '2025', '2024', '2023', '2022']);
  });
});

describe('Financial Dashboard monthly figures', () => {
  const snapshot = buildFinancialSnapshot(CASES, { view: 'MONTH', key: '2026-10' }, NOW);

  it("counts today's payments and the month's revenue", () => {
    expect(snapshot.today).toEqual({ amount: 1499, payments: 1 });
    expect(snapshot.period).toEqual({ amount: 1499 + 999 + 4999 + 6999, payments: 4 });
  });

  it('splits revenue into GST, ITR, loan processing and other services', () => {
    expect(snapshot.gst).toEqual({ amount: 1499, payments: 1 });
    expect(snapshot.itr).toEqual({ amount: 999, payments: 1 });
    expect(snapshot.loan).toEqual({ amount: 4999, payments: 1 });
    expect(snapshot.other).toEqual({ amount: 6999, payments: 1 });
  });

  it('shows money still owed, and the change against last month', () => {
    expect(snapshot.pending).toEqual({ amount: 3000, payments: 1 });
    expect(snapshot.previous.amount).toBe(2000);
    expect(snapshot.changePercent).toBe(Math.round(((14496 - 2000) / 2000) * 100));
  });

  it('has one bar per day of the month', () => {
    expect(snapshot.trend).toHaveLength(31);
    expect(snapshot.trend[27]).toMatchObject({ label: '28', amount: 1499, payments: 1 });
    expect(snapshot.trend.reduce((sum, bucket) => sum + bucket.amount, 0)).toBe(snapshot.period.amount);
  });

  it('credits revenue to the agent and manager who handled it, with unassigned payments listed apart', () => {
    expect(snapshot.agents.map((row) => [row.name, row.collected, row.applications])).toEqual([
      ['Not assigned yet', 6999, 1],
      ['Lata', 4999, 1],
      ['Ravi', 2498, 2]
    ]);
    expect(snapshot.managers.find((row) => row.name === 'Anil')).toMatchObject({ collected: 2498, team: 'CA', role: 'Manager' });
    expect(snapshot.agents.reduce((sum, row) => sum + row.sharePercent, 0)).toBeGreaterThanOrEqual(99);
  });
});

describe('Financial Dashboard yearly figures', () => {
  const snapshot = buildFinancialSnapshot(CASES, { view: 'YEAR', key: '2026' }, NOW);

  it('adds up the whole financial year, from April to the following March', () => {
    expect(snapshot.period.amount).toBe(1499 + 999 + 4999 + 6999 + 2000 + 1000);
    expect(snapshot.previous.amount).toBe(1500);
  });

  it('has one bar per month, starting in April', () => {
    expect(snapshot.trend.map((bucket) => bucket.label)).toEqual(['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']);
    expect(snapshot.trend[6].amount).toBe(1499 + 999 + 4999 + 6999);
    expect(snapshot.trend[10].amount).toBe(1000);
  });

  it('shows zeros, not errors, when nothing has been paid', () => {
    const empty = buildFinancialSnapshot([], { view: 'YEAR', key: '2026' }, NOW);
    expect(empty.period).toEqual({ amount: 0, payments: 0 });
    expect(empty.changePercent).toBeNull();
    expect(empty.agents).toEqual([]);
  });
});
