import { describe, expect, it } from 'vitest';
import { LOAN_AGENT_SERVICES } from '@/modules/loan-agent/shared/loanAgent.config';
import { LOAN_AGENT_DASHBOARD } from '@/modules/loan-agent/shared/loanAgentDashboard';
import { LOAN_AGENT_NAV_ITEMS, getLoanAgentNavItem } from '@/modules/loan-agent/shared/loanAgentNavigation';
import { LOAN_AGENT_QUEUES } from '@/modules/loan-agent/shared/loanAgentQueues';

/** One queue per step of the Loan Agent's work; the dashboard links only to pages that exist. */
describe('Loan Agent queues and dashboard', () => {
  it('covers only the services of the LOAN team', () => {
    expect(LOAN_AGENT_SERVICES).toEqual(['LOAN', 'INSURANCE']);
    Object.values(LOAN_AGENT_QUEUES).forEach((queue) => expect(queue.services).toEqual(LOAN_AGENT_SERVICES));
  });

  it.each([
    ['new', ['ASSIGNED']],
    ['missing', ['DOCS_MISSING']],
    ['portal', ['PORTAL_WORK']],
    ['completed', ['COMPLETED']]
  ] as const)('the %s queue lists applications in %j', (id, statuses) => {
    expect(LOAN_AGENT_QUEUES[id].statuses).toEqual(statuses);
  });

  it('lists every application assigned to the agent in All My Applications', () => {
    expect(LOAN_AGENT_QUEUES.applications.statuses).toBeUndefined();
  });

  it('takes every queue title and description from its menu entry', () => {
    Object.entries(LOAN_AGENT_QUEUES).forEach(([id, queue]) => {
      const item = getLoanAgentNavItem(id as Parameters<typeof getLoanAgentNavItem>[0]);
      expect(queue).toMatchObject({ id: `loan-agent-${id}`, title: item.label, description: item.description });
      expect(queue.emptyTitle).toBeTruthy();
    });
  });

  it('links every dashboard card and attention item to a page in the menu', () => {
    const paths = new Set(LOAN_AGENT_NAV_ITEMS.map((item) => item.path));
    const links = [...LOAN_AGENT_DASHBOARD.kpis.map((kpi) => kpi.to), ...(LOAN_AGENT_DASHBOARD.attention ?? []).map((entry) => entry.to)];
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(paths.has(link as string)).toBe(true));
    expect(LOAN_AGENT_DASHBOARD.services).toEqual(LOAN_AGENT_SERVICES);
  });
});
