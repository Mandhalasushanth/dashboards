import { describe, expect, it } from 'vitest';
import { CA_MANAGER_SERVICES } from '@/modules/ca-manager/shared/caManager.config';
import { CA_MANAGER_DASHBOARD } from '@/modules/ca-manager/shared/caManagerDashboard';
import { CA_MANAGER_NAV_ITEMS, getCaManagerNavItem } from '@/modules/ca-manager/shared/caManagerNavigation';
import { CA_MANAGER_QUEUES } from '@/modules/ca-manager/shared/caManagerQueues';

/** One queue per step of the CA Manager's work; the dashboard links only to pages that exist. */
describe('CA Manager queues and dashboard', () => {
  it('covers only the services of the CA team', () => {
    expect(CA_MANAGER_SERVICES).toEqual(['GST', 'ITR', 'INCORPORATION']);
    Object.values(CA_MANAGER_QUEUES).forEach((queue) => expect(queue.services).toEqual(CA_MANAGER_SERVICES));
  });

  it.each([
    ['payment', ['PAYMENT_PENDING']],
    ['working', ['ASSIGNED', 'PORTAL_WORK']]
  ] as const)('the %s queue lists applications in %j', (id, statuses) => {
    expect(CA_MANAGER_QUEUES[id].statuses).toEqual(statuses);
  });

  it('lists every application of the team in All Applications, newest first, from the database only', () => {
    expect(CA_MANAGER_QUEUES.verify.statuses).toBeUndefined();
    expect(CA_MANAGER_QUEUES.verify.sort).toBe('submittedAt');
    // Applications come only from the database, so none can be recorded in the dashboard.
    expect(CA_MANAGER_QUEUES.verify.allowIntake).toBeFalsy();
  });

  it('takes every queue title and description from its menu entry', () => {
    Object.entries(CA_MANAGER_QUEUES).forEach(([id, queue]) => {
      const item = getCaManagerNavItem(id as Parameters<typeof getCaManagerNavItem>[0]);
      expect(queue).toMatchObject({ id: `ca-manager-${id}`, title: item.label, description: item.description });
      expect(queue.emptyTitle).toBeTruthy();
    });
  });

  it('links every dashboard card and attention item to a page in the menu', () => {
    const paths = new Set(CA_MANAGER_NAV_ITEMS.map((item) => item.path));
    const links = [...CA_MANAGER_DASHBOARD.kpis.map((kpi) => kpi.to), ...(CA_MANAGER_DASHBOARD.attention ?? []).map((entry) => entry.to)];
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(paths.has(link as string)).toBe(true));
    expect(CA_MANAGER_DASHBOARD.services).toEqual(CA_MANAGER_SERVICES);
  });
});
