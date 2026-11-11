import { describe, expect, it } from 'vitest';
import { LOAN_MANAGER_SERVICES } from '@/modules/loan-manager/shared/loanManager.config';
import { LOAN_MANAGER_DASHBOARD } from '@/modules/loan-manager/shared/loanManagerDashboard';
import { LOAN_MANAGER_NAV_ITEMS, getLoanManagerNavItem } from '@/modules/loan-manager/shared/loanManagerNavigation';
import { LOAN_MANAGER_QUEUES } from '@/modules/loan-manager/shared/loanManagerQueues';

/** One queue per step of the Loan Manager's work; the dashboard links only to pages that exist. */
describe('Loan Manager queues and dashboard', () => {
  it('covers only the services of the LOAN team', () => {
    expect(LOAN_MANAGER_SERVICES).toEqual(['LOAN', 'INSURANCE']);
    Object.values(LOAN_MANAGER_QUEUES).forEach((queue) => expect(queue.services).toEqual(LOAN_MANAGER_SERVICES));
  });

  it.each([
    ['payment', ['PAYMENT_PENDING']],
    ['working', ['ASSIGNED', 'PORTAL_WORK']]
  ] as const)('the %s queue lists applications in %j', (id, statuses) => {
    expect(LOAN_MANAGER_QUEUES[id].statuses).toEqual(statuses);
  });

  it('lists every application of the team in All Applications, newest first, from the database only', () => {
    expect(LOAN_MANAGER_QUEUES.verify.statuses).toBeUndefined();
    expect(LOAN_MANAGER_QUEUES.verify.sort).toBe('submittedAt');
    // Applications come only from the database, so none can be recorded in the dashboard.
    expect(LOAN_MANAGER_QUEUES.verify.allowIntake).toBeFalsy();
  });

  it('takes every queue title and description from its menu entry', () => {
    Object.entries(LOAN_MANAGER_QUEUES).forEach(([id, queue]) => {
      const item = getLoanManagerNavItem(id as Parameters<typeof getLoanManagerNavItem>[0]);
      expect(queue).toMatchObject({ id: `loan-manager-${id}`, title: item.label, description: item.description });
      expect(queue.emptyTitle).toBeTruthy();
    });
  });

  it('links every dashboard card and attention item to a page in the menu', () => {
    const paths = new Set(LOAN_MANAGER_NAV_ITEMS.map((item) => item.path));
    const links = [...LOAN_MANAGER_DASHBOARD.kpis.map((kpi) => kpi.to), ...(LOAN_MANAGER_DASHBOARD.attention ?? []).map((entry) => entry.to)];
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(paths.has(link as string)).toBe(true));
    expect(LOAN_MANAGER_DASHBOARD.services).toEqual(LOAN_MANAGER_SERVICES);
  });
});
