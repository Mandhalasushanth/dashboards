import type { ServiceKind, WorkflowCase } from '@/modules/workflow';

/**
 * Financial Dashboard figures, computed from the applications themselves: a fee counts as revenue on the
 * day the customer paid it, so these numbers always agree with what managers see in their queues.
 * A month is a calendar month; a year is the Indian financial year (1 April to 31 March).
 */
export type FinanceView = 'MONTH' | 'YEAR';

export interface FinancePeriod {
  readonly view: FinanceView;
  /** MONTH: "2026-10". YEAR: the financial year's starting calendar year, e.g. "2026" for FY 2026-27. */
  readonly key: string;
}

export interface RevenueFigure {
  readonly amount: number;
  readonly payments: number;
}

export interface TrendBucket {
  readonly key: string;
  readonly label: string;
  readonly longLabel: string;
  readonly amount: number;
  readonly payments: number;
}

export interface StaffRevenueRow {
  readonly id: string;
  readonly name: string;
  readonly role: 'Agent' | 'Manager';
  readonly team: string;
  readonly applications: number;
  readonly collected: number;
  readonly sharePercent: number;
}

export interface FinancialSnapshot {
  readonly periodLabel: string;
  readonly today: RevenueFigure;
  readonly period: RevenueFigure;
  readonly previous: RevenueFigure;
  /** Change against the previous month or year; null when there is nothing to compare with. */
  readonly changePercent: number | null;
  readonly gst: RevenueFigure;
  readonly itr: RevenueFigure;
  readonly loan: RevenueFigure;
  readonly other: RevenueFigure;
  readonly pending: RevenueFigure;
  readonly trend: readonly TrendBucket[];
  readonly agents: readonly StaffRevenueRow[];
  readonly managers: readonly StaffRevenueRow[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const TEAM_LABELS: Readonly<Record<string, string>> = Object.freeze({ CA: 'CA', LOAN: 'Loan' });

const pad = (value: number) => String(value).padStart(2, '0');
const monthKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
const dayKey = (date: Date) => `${monthKey(date)}-${pad(date.getDate())}`;
/** The financial year a date falls in, by its starting year: Jan-Mar 2027 belong to FY 2026-27. */
const financialYearOf = (date: Date) => (date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1);

export const currentPeriod = (view: FinanceView, now: Date = new Date()): FinancePeriod => ({
  view,
  key: view === 'MONTH' ? monthKey(now) : String(financialYearOf(now))
});

export function periodLabel({ view, key }: FinancePeriod): string {
  if (view === 'YEAR') {
    const start = Number(key);
    return `FY ${start}-${pad((start + 1) % 100)}`;
  }
  const [year, month] = key.split('-').map(Number);
  return `${FULL_MONTHS[month - 1]} ${year}`;
}

/** The period just before this one, for the "vs last month / year" comparison. */
export function previousPeriod({ view, key }: FinancePeriod): FinancePeriod {
  if (view === 'YEAR') return { view, key: String(Number(key) - 1) };
  const [year, month] = key.split('-').map(Number);
  return { view, key: monthKey(new Date(year, month - 2, 1)) };
}

/** Periods offered in the picker: the last 12 months, or the last 5 financial years, newest first. */
export function periodOptions(view: FinanceView, now: Date = new Date()): FinancePeriod[] {
  const count = view === 'MONTH' ? 12 : 5;
  return Array.from({ length: count }, (_, index) =>
    view === 'MONTH' ? { view, key: monthKey(new Date(now.getFullYear(), now.getMonth() - index, 1)) } : { view, key: String(financialYearOf(now) - index) }
  );
}

const paidDate = (item: WorkflowCase): Date | null => (item.payment.state === 'PAID' && item.payment.paidAt ? new Date(item.payment.paidAt) : null);

const inPeriod = ({ view, key }: FinancePeriod) => (date: Date) => (view === 'MONTH' ? monthKey(date) === key : String(financialYearOf(date)) === key);

const figure = (cases: readonly WorkflowCase[]): RevenueFigure => ({
  amount: cases.reduce((total, item) => total + (item.payment.amount ?? 0), 0),
  payments: cases.length
});

const ofServices = (cases: readonly WorkflowCase[], services: readonly ServiceKind[]) => figure(cases.filter((item) => services.includes(item.service)));

/** One bar per day of the month, or per month of the financial year (April first). */
function trendBuckets(period: FinancePeriod, paid: readonly WorkflowCase[]): TrendBucket[] {
  const byKey = paid.reduce<Record<string, WorkflowCase[]>>((groups, item) => {
    const date = paidDate(item) as Date;
    const key = period.view === 'MONTH' ? dayKey(date) : monthKey(date);
    return { ...groups, [key]: [...(groups[key] ?? []), item] };
  }, {});
  const toBucket = (key: string, label: string, longLabel: string): TrendBucket => ({ key, label, longLabel, ...figure(byKey[key] ?? []) });
  if (period.view === 'YEAR') {
    const start = Number(period.key);
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(start, 3 + index, 1);
      return toBucket(monthKey(date), MONTHS[date.getMonth()], `${FULL_MONTHS[date.getMonth()]} ${date.getFullYear()}`);
    });
  }
  const [year, month] = period.key.split('-').map(Number);
  const days = new Date(year, month, 0).getDate();
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(year, month - 1, index + 1);
    return toBucket(dayKey(date), String(index + 1), `${index + 1} ${FULL_MONTHS[month - 1]} ${year}`);
  });
}

/** Revenue per agent or per manager: who handled the paid applications. Unassigned payments are listed apart. */
function staffRows(paid: readonly WorkflowCase[], role: StaffRevenueRow['role'], total: number): StaffRevenueRow[] {
  const holder = (item: WorkflowCase) =>
    role === 'Agent' ? { id: item.assignment.agentId, name: item.assignment.agentName } : { id: item.assignment.managerId, name: item.assignment.managerName };
  const groups = paid.reduce<Record<string, { name: string; team: string; cases: WorkflowCase[] }>>((all, item) => {
    const who = holder(item);
    const id = who.id ?? 'UNASSIGNED';
    const name = who.name ?? (role === 'Agent' ? 'Not assigned yet' : 'No manager yet');
    const current = all[id] ?? { name, team: TEAM_LABELS[item.team] ?? item.team, cases: [] };
    return { ...all, [id]: { ...current, cases: [...current.cases, item] } };
  }, {});
  return Object.entries(groups)
    .map(([id, group]) => {
      const collected = figure(group.cases).amount;
      return { id, name: group.name, role, team: group.team, applications: group.cases.length, collected, sharePercent: total > 0 ? Math.round((collected / total) * 100) : 0 };
    })
    .sort((a, b) => b.collected - a.collected || a.name.localeCompare(b.name));
}

export function buildFinancialSnapshot(cases: readonly WorkflowCase[], period: FinancePeriod, now: Date = new Date()): FinancialSnapshot {
  const paid = cases.filter((item) => paidDate(item) !== null);
  const paidIn = (target: FinancePeriod) => paid.filter((item) => inPeriod(target)(paidDate(item) as Date));
  const current = paidIn(period);
  const total = figure(current);
  const previous = figure(paidIn(previousPeriod(period)));
  return {
    periodLabel: periodLabel(period),
    today: figure(paid.filter((item) => dayKey(paidDate(item) as Date) === dayKey(now))),
    period: total,
    previous,
    changePercent: previous.amount > 0 ? Math.round(((total.amount - previous.amount) / previous.amount) * 100) : null,
    gst: ofServices(current, ['GST']),
    itr: ofServices(current, ['ITR']),
    loan: ofServices(current, ['LOAN']),
    other: ofServices(current, ['INCORPORATION', 'INSURANCE']),
    // Fees requested and not yet paid, whenever they were requested: this is money owed today.
    pending: figure(cases.filter((item) => item.payment.state === 'PENDING')),
    trend: trendBuckets(period, current),
    agents: staffRows(current, 'Agent', total.amount),
    managers: staffRows(current, 'Manager', total.amount)
  };
}
