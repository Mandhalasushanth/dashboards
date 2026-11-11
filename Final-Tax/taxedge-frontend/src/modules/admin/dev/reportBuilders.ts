import { CLOSED_STATUSES, STATUS_META, getServiceType, type WorkflowCase } from '@/modules/workflow';
import type { AgentWorkload } from '@/modules/workflow';
import { ENTITY_TYPE_LABELS, type Customer } from '../shared/customers.types';
import type { AdminReport, ReportCell, ReportKpi } from '../shared/reports.types';

/**
 * DEVELOPMENT ONLY. The admin reports, each worked out from the applications, customers and agents the
 * dashboard has loaded from the backend. Nothing is invented: a report with no matching data is empty.
 * Payments come from the dashboard's own payment steps, as the backend has no payment data yet.
 */
const DATE = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const MONTH = new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' });
const DAY_MS = 86_400_000;

const day = (iso: string | null): string => (iso ? DATE.format(Date.parse(iso)) : '—');
const isOpen = (item: WorkflowCase) => !CLOSED_STATUSES.includes(item.status);
const isOverdue = (item: WorkflowCase) => isOpen(item) && item.dueDate !== null && Date.parse(item.dueDate) < Date.now();
const typeLabel = (item: WorkflowCase) => getServiceType(item.serviceType, item.service).label;
const status = (item: WorkflowCase) => STATUS_META[item.status].label;
const agent = (item: WorkflowCase) => item.assignment.agentName ?? 'Unassigned';
const detail = (item: WorkflowCase, ...keys: string[]) => keys.map((key) => item.details[key]?.trim()).find(Boolean) ?? '—';
const amountOf = (value: string): number => Number(value.replace(/[^\d.]/g, '')) || 0;
const newestFirst = (a: WorkflowCase, b: WorkflowCase) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt);
const paidAmount = (items: readonly WorkflowCase[]) => items.reduce((sum, item) => sum + (item.payment.state === 'PAID' ? item.payment.amount ?? 0 : 0), 0);

type Spec = Omit<AdminReport, 'rows'> & { readonly rows: (readonly ReportCell[])[] };
const report = (spec: Spec): AdminReport => spec;

export function reportKpis(cases: readonly WorkflowCase[]): ReportKpi[] {
  const completed = cases.filter((item) => item.status === 'COMPLETED').length;
  const pendingPayments = cases.filter((item) => item.payment.state === 'PENDING').length;
  return [
    { label: 'Applications received', value: cases.length, format: 'number', hint: 'Submitted in this financial year' },
    { label: 'In progress', value: cases.filter(isOpen).length, format: 'number', hint: 'Not yet completed or closed' },
    { label: 'Completed', value: completed, format: 'number', hint: cases.length ? `${Math.round((completed / cases.length) * 100)}% of received` : 'Nothing received yet' },
    { label: 'Revenue collected', value: paidAmount(cases), format: 'currency', hint: pendingPayments ? `${pendingPayments} payment${pendingPayments === 1 ? '' : 's'} pending` : 'No payments pending' },
    { label: 'Overdue', value: cases.filter(isOverdue).length, format: 'number', hint: 'Open past their due date' }
  ];
}

export function customerReport(customers: readonly Customer[]): AdminReport {
  return report({
    id: 'customer-report',
    category: 'CUSTOMERS',
    title: 'Customer Report',
    description: 'Every customer with their details and how many applications they have.',
    columns: [
      { label: 'Customer', format: 'text' }, { label: 'Customer ID', format: 'text', exportOnly: true }, { label: 'Type', format: 'text' },
      { label: 'PAN', format: 'text' }, { label: 'Email', format: 'text', exportOnly: true }, { label: 'Mobile', format: 'text' },
      { label: 'City', format: 'text' }, { label: 'Applications', format: 'number' }, { label: 'In progress', format: 'number' },
      { label: 'Completed', format: 'number', exportOnly: true }, { label: 'Last activity', format: 'text' }
    ],
    rows: [...customers]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => [c.name, c.id, ENTITY_TYPE_LABELS[c.entityType], c.pan || '—', c.email || '—', c.mobile || '—', c.city || '—', c.applications.length, c.openCount, c.completedCount, day(c.lastActivityAt)])
  });
}

function serviceReport(cases: readonly WorkflowCase[], service: 'GST' | 'ITR'): AdminReport {
  const gst = service === 'GST';
  return report({
    id: gst ? 'gst-report' : 'itr-report',
    category: 'SERVICES',
    title: gst ? 'GST Report' : 'ITR Report',
    description: gst ? 'All GST registrations, filings, compliance requests and amendments.' : 'All income tax returns, TDS refunds and revised returns.',
    columns: [
      { label: 'Application ID', format: 'text' }, { label: 'Customer', format: 'text' }, { label: 'Service', format: 'text' },
      { label: gst ? 'GSTIN' : 'Assessment year', format: 'text', exportOnly: gst }, { label: 'Status', format: 'text' },
      { label: 'Agent', format: 'text' }, { label: 'Submitted', format: 'text' }, { label: 'Due', format: 'text', exportOnly: true }
    ],
    rows: cases
      .filter((item) => item.service === service)
      .sort(newestFirst)
      .map((item) => [item.referenceNumber, item.client.name, typeLabel(item), gst ? detail(item, 'gstin', 'record.gstin') : detail(item, 'assessmentYear', 'financialYear'), status(item), agent(item), day(item.submittedAt), day(item.dueDate)])
  });
}

export const gstReport = (cases: readonly WorkflowCase[]) => serviceReport(cases, 'GST');
export const itrReport = (cases: readonly WorkflowCase[]) => serviceReport(cases, 'ITR');

const loans = (cases: readonly WorkflowCase[]) => cases.filter((item) => item.service === 'LOAN');

export function loanLeadReport(cases: readonly WorkflowCase[]): AdminReport {
  return report({
    id: 'loan-lead-report',
    category: 'LOANS',
    title: 'Loan Lead Report',
    description: 'Every loan enquiry with the amount asked for and where it stands.',
    columns: [
      { label: 'Application ID', format: 'text' }, { label: 'Customer', format: 'text' }, { label: 'Loan type', format: 'text' },
      { label: 'Amount asked', format: 'currency' }, { label: 'Mobile', format: 'text', exportOnly: true }, { label: 'City', format: 'text', exportOnly: true },
      { label: 'Status', format: 'text' }, { label: 'Agent', format: 'text' }, { label: 'Submitted', format: 'text' }
    ],
    rows: loans(cases)
      .sort(newestFirst)
      .map((item) => [item.referenceNumber, item.client.name, typeLabel(item), amountOf(detail(item, 'loanAmount', 'requestedLoanAmount')), item.client.mobile || '—', item.client.city || '—', status(item), agent(item), day(item.submittedAt)])
  });
}

export function loanConversionReport(cases: readonly WorkflowCase[]): AdminReport {
  const byType = new Map<string, WorkflowCase[]>();
  for (const item of loans(cases)) byType.set(typeLabel(item), [...(byType.get(typeLabel(item)) ?? []), item]);
  return report({
    id: 'loan-conversion-report',
    category: 'LOANS',
    title: 'Loan Conversion Report',
    description: 'How many loan leads became completed loans, by loan type.',
    columns: [
      { label: 'Loan type', format: 'text' }, { label: 'Leads', format: 'number' }, { label: 'In progress', format: 'number' },
      { label: 'Converted', format: 'number' }, { label: 'Dropped', format: 'number' }, { label: 'Conversion', format: 'percent' }
    ],
    rows: [...byType].map(([label, items]) => {
      const converted = items.filter((item) => item.status === 'COMPLETED').length;
      const dropped = items.filter((item) => item.status === 'REJECTED' || item.status === 'CANCELLED').length;
      return [label, items.length, items.length - converted - dropped, converted, dropped, (converted / items.length) * 100];
    })
  });
}

export function paymentReport(cases: readonly WorkflowCase[]): AdminReport {
  return report({
    id: 'payment-report',
    category: 'PAYMENTS',
    title: 'Payment Report',
    description: 'Every payment request sent to a customer, paid or not.',
    columns: [
      { label: 'Application ID', format: 'text' }, { label: 'Customer', format: 'text' }, { label: 'Service', format: 'text' },
      { label: 'Amount', format: 'currency' }, { label: 'Payment', format: 'text' }, { label: 'Requested', format: 'text' },
      { label: 'Paid', format: 'text' }, { label: 'Reference', format: 'text', exportOnly: true }
    ],
    rows: cases
      .filter((item) => item.payment.state !== 'NOT_REQUESTED')
      .sort((a, b) => Date.parse(b.payment.requestedAt ?? b.submittedAt) - Date.parse(a.payment.requestedAt ?? a.submittedAt))
      .map((item) => [item.referenceNumber, item.client.name, typeLabel(item), item.payment.amount ?? 0, item.payment.state === 'PAID' ? 'Paid' : 'Pending', day(item.payment.requestedAt), day(item.payment.paidAt), item.payment.reference ?? '—'])
  });
}

export function revenueReport(cases: readonly WorkflowCase[]): AdminReport {
  const byType = new Map<string, WorkflowCase[]>();
  for (const item of cases.filter((entry) => entry.payment.state !== 'NOT_REQUESTED')) byType.set(typeLabel(item), [...(byType.get(typeLabel(item)) ?? []), item]);
  return report({
    id: 'revenue-report',
    category: 'PAYMENTS',
    title: 'Revenue Report',
    description: 'Money collected and still due, by service.',
    columns: [
      { label: 'Service', format: 'text' }, { label: 'Paid applications', format: 'number' },
      { label: 'Collected', format: 'currency' }, { label: 'Still due', format: 'currency' }
    ],
    rows: [...byType].map(([label, items]) => [
      label,
      items.filter((item) => item.payment.state === 'PAID').length,
      paidAmount(items),
      items.reduce((sum, item) => sum + (item.payment.state === 'PENDING' ? item.payment.amount ?? 0 : 0), 0)
    ])
  });
}

export function staffPerformanceReport(workload: readonly AgentWorkload[]): AdminReport {
  return report({
    id: 'staff-performance',
    category: 'TEAM',
    title: 'Staff Performance',
    description: 'Each agent’s current work and what they have completed.',
    columns: [
      { label: 'Agent', format: 'text' }, { label: 'Team', format: 'text' }, { label: 'Active', format: 'number' },
      { label: 'On portal', format: 'number' }, { label: 'Overdue', format: 'number' }, { label: 'Completed', format: 'number' },
      { label: 'Completion', format: 'percent' }
    ],
    rows: [...workload]
      .sort((a, b) => b.activeCases - a.activeCases || a.agent.name.localeCompare(b.agent.name))
      .map((entry) => {
        const handled = entry.activeCases + entry.completed;
        return [entry.agent.name, entry.agent.team === 'CA' ? 'CA' : 'Loan', entry.activeCases, entry.portalWork, entry.overdue, entry.completed, handled ? (entry.completed / handled) * 100 : 0];
      })
  });
}

export function pendingDocumentsReport(cases: readonly WorkflowCase[]): AdminReport {
  const missing = (item: WorkflowCase) => item.documents.filter((doc) => doc.required && (doc.state === 'MISSING' || doc.state === 'REJECTED'));
  return report({
    id: 'pending-documents',
    category: 'TEAM',
    title: 'Pending Documents',
    description: 'Open applications still waiting for required documents, or with documents marked wrong.',
    columns: [
      { label: 'Application ID', format: 'text' }, { label: 'Customer', format: 'text' }, { label: 'Service', format: 'text' },
      { label: 'Missing', format: 'number' }, { label: 'Documents', format: 'text' }, { label: 'Status', format: 'text' }, { label: 'Agent', format: 'text', exportOnly: true }
    ],
    rows: cases
      .filter((item) => isOpen(item) && missing(item).length > 0)
      .sort(newestFirst)
      .map((item) => [item.referenceNumber, item.client.name, typeLabel(item), missing(item).length, missing(item).map((doc) => doc.label).join(', '), status(item), agent(item)])
  });
}

export function pendingPaymentsReport(cases: readonly WorkflowCase[]): AdminReport {
  return report({
    id: 'pending-payments',
    category: 'PAYMENTS',
    title: 'Pending Payments',
    description: 'Payment requests the customer has not paid yet, oldest first.',
    columns: [
      { label: 'Application ID', format: 'text' }, { label: 'Customer', format: 'text' }, { label: 'Mobile', format: 'text' },
      { label: 'Service', format: 'text' }, { label: 'Amount', format: 'currency' }, { label: 'Requested', format: 'text' }, { label: 'Waiting', format: 'days' }
    ],
    rows: cases
      .filter((item) => item.payment.state === 'PENDING')
      .sort((a, b) => Date.parse(a.payment.requestedAt ?? a.submittedAt) - Date.parse(b.payment.requestedAt ?? b.submittedAt))
      .map((item) => [item.referenceNumber, item.client.name, item.client.mobile || '—', typeLabel(item), item.payment.amount ?? 0, day(item.payment.requestedAt), (Date.now() - Date.parse(item.payment.requestedAt ?? item.submittedAt)) / DAY_MS])
  });
}

export function monthlyBusinessReport(cases: readonly WorkflowCase[], from: number): AdminReport {
  const months = Array.from({ length: 12 }, (_, index) => {
    const start = new Date(from);
    start.setMonth(start.getMonth() + index);
    return start;
  }).filter((start) => start.getTime() <= Date.now());
  const inMonth = (iso: string | null, start: Date) => {
    if (!iso) return false;
    const at = new Date(iso);
    return at.getFullYear() === start.getFullYear() && at.getMonth() === start.getMonth();
  };
  return report({
    id: 'monthly-business',
    category: 'BUSINESS',
    title: 'Monthly Business Report',
    description: 'Applications, completions, payments and revenue for each month of the year.',
    columns: [
      { label: 'Month', format: 'text' }, { label: 'Received', format: 'number' }, { label: 'Completed', format: 'number' },
      { label: 'Payments received', format: 'number' }, { label: 'Revenue', format: 'currency' }
    ],
    rows: months.reverse().map((start) => {
      const paid = cases.filter((item) => item.payment.state === 'PAID' && inMonth(item.payment.paidAt, start));
      return [
        MONTH.format(start),
        cases.filter((item) => inMonth(item.submittedAt, start)).length,
        cases.filter((item) => item.status === 'COMPLETED' && inMonth(item.updatedAt, start)).length,
        paid.length,
        paidAmount(paid)
      ];
    })
  });
}
