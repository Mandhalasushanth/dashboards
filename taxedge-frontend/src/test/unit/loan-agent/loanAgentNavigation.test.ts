import { describe, expect, it } from 'vitest';
import { ROUTE_PATHS } from '@/core/config/routePaths';
import { LOAN_AGENT_PROFILE_PATH, LOAN_AGENT_ROOT_PATH, LOAN_AGENT_WORKSPACE_LABEL } from '@/modules/loan-agent/shared/loanAgent.config';
import {
  LOAN_AGENT_HEADER_SHORTCUT_IDS,
  LOAN_AGENT_NAV_ITEMS,
  findLoanAgentNavItem,
  getLoanAgentNavItem,
  resolveLoanAgentPageTitle
} from '@/modules/loan-agent/shared/loanAgentNavigation';
import type { LoanAgentSectionId } from '@/modules/loan-agent/shared/loanAgent.types';

/** The Loan Agent sidebar: every entry has its own page, and headers and titles come from the same list. */
describe('Loan Agent navigation', () => {
  const paths = LOAN_AGENT_NAV_ITEMS.map((item) => item.path);

  it('opens on the dashboard and keeps every page inside the Loan Agent workspace', () => {
    expect(LOAN_AGENT_ROOT_PATH).toBe(ROUTE_PATHS.loanAgentRoot);
    expect(LOAN_AGENT_NAV_ITEMS[0]).toMatchObject({ id: 'overview', path: `${LOAN_AGENT_ROOT_PATH}/dashboard` });
    paths.forEach((path) => expect(path.startsWith(`${LOAN_AGENT_ROOT_PATH}/`)).toBe(true));
  });

  it('gives every menu entry a unique id, a unique page and a description', () => {
    expect(new Set(LOAN_AGENT_NAV_ITEMS.map((item) => item.id)).size).toBe(LOAN_AGENT_NAV_ITEMS.length);
    expect(new Set(paths).size).toBe(paths.length);
    LOAN_AGENT_NAV_ITEMS.forEach((item) => expect(item.description.length).toBeGreaterThan(10));
  });

  it('shows header shortcuts only for pages that are in the menu', () => {
    expect(LOAN_AGENT_HEADER_SHORTCUT_IDS).toEqual(['notifications', 'communication', 'new']);
    LOAN_AGENT_HEADER_SHORTCUT_IDS.forEach((id) => expect(getLoanAgentNavItem(id).id).toBe(id));
  });

  it('names each page after its menu entry, the profile page and unknown pages included', () => {
    const queue = LOAN_AGENT_NAV_ITEMS[1];
    expect(resolveLoanAgentPageTitle(queue.path)).toBe(queue.title ?? queue.label);
    expect(resolveLoanAgentPageTitle(LOAN_AGENT_PROFILE_PATH)).toBe('My Profile');
    expect(resolveLoanAgentPageTitle(`${LOAN_AGENT_ROOT_PATH}/not-a-page`)).toBe(LOAN_AGENT_WORKSPACE_LABEL);
    expect(findLoanAgentNavItem('/admin/dashboard')).toBeUndefined();
  });

  it('fails loudly for a section that is not configured', () => {
    expect(() => getLoanAgentNavItem('missing-section' as LoanAgentSectionId)).toThrow(/not configured/);
  });
});
