import { describe, expect, it } from 'vitest';
import { CA_AGENT_SERVICES } from '@/modules/ca-agent/shared/caAgent.config';
import { CA_AGENT_DASHBOARD } from '@/modules/ca-agent/shared/caAgentDashboard';
import { CA_AGENT_NAV_ITEMS, getCaAgentNavItem } from '@/modules/ca-agent/shared/caAgentNavigation';
import { CA_AGENT_QUEUES } from '@/modules/ca-agent/shared/caAgentQueues';

/** One queue per step of the CA Agent's work; the dashboard links only to pages that exist. */
describe('CA Agent queues and dashboard', () => {
  it('covers only the services of the CA team', () => {
    expect(CA_AGENT_SERVICES).toEqual(['GST', 'ITR', 'INCORPORATION']);
    Object.values(CA_AGENT_QUEUES).forEach((queue) => expect(queue.services).toEqual(CA_AGENT_SERVICES));
  });

  it.each([
    ['new', ['ASSIGNED']],
    ['missing', ['DOCS_MISSING']],
    ['portal', ['PORTAL_WORK']],
    ['completed', ['COMPLETED']]
  ] as const)('the %s queue lists applications in %j', (id, statuses) => {
    expect(CA_AGENT_QUEUES[id].statuses).toEqual(statuses);
  });

  it('lists every application assigned to the agent in All My Applications', () => {
    expect(CA_AGENT_QUEUES.applications.statuses).toBeUndefined();
  });

  it('takes every queue title and description from its menu entry', () => {
    Object.entries(CA_AGENT_QUEUES).forEach(([id, queue]) => {
      const item = getCaAgentNavItem(id as Parameters<typeof getCaAgentNavItem>[0]);
      expect(queue).toMatchObject({ id: `ca-agent-${id}`, title: item.label, description: item.description });
      expect(queue.emptyTitle).toBeTruthy();
    });
  });

  it('links every dashboard card and attention item to a page in the menu', () => {
    const paths = new Set(CA_AGENT_NAV_ITEMS.map((item) => item.path));
    const links = [...CA_AGENT_DASHBOARD.kpis.map((kpi) => kpi.to), ...(CA_AGENT_DASHBOARD.attention ?? []).map((entry) => entry.to)];
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(paths.has(link as string)).toBe(true));
    expect(CA_AGENT_DASHBOARD.services).toEqual(CA_AGENT_SERVICES);
  });
});
