import { describe, expect, it } from 'vitest';
import { ROUTE_PATHS } from '@/core/config/routePaths';
import { LOAN_MANAGER_PROFILE_PATH, LOAN_MANAGER_ROOT_PATH, LOAN_MANAGER_WORKSPACE_LABEL } from '@/modules/loan-manager/shared/loanManager.config';
import {
  LOAN_MANAGER_HEADER_SHORTCUT_IDS,
  LOAN_MANAGER_NAV_ITEMS,
  findLoanManagerNavItem,
  getLoanManagerNavItem,
  resolveLoanManagerPageTitle
} from '@/modules/loan-manager/shared/loanManagerNavigation';
import type { LoanManagerSectionId } from '@/modules/loan-manager/shared/loanManager.types';

/** The Loan Manager sidebar: every entry has its own page, and headers and titles come from the same list. */
describe('Loan Manager navigation', () => {
  const paths = LOAN_MANAGER_NAV_ITEMS.map((item) => item.path);

  it('opens on the dashboard and keeps every page inside the Loan Manager workspace', () => {
    expect(LOAN_MANAGER_ROOT_PATH).toBe(ROUTE_PATHS.loanManagerRoot);
    expect(LOAN_MANAGER_NAV_ITEMS[0]).toMatchObject({ id: 'overview', path: `${LOAN_MANAGER_ROOT_PATH}/dashboard` });
    paths.forEach((path) => expect(path.startsWith(`${LOAN_MANAGER_ROOT_PATH}/`)).toBe(true));
  });

  it('gives every menu entry a unique id, a unique page and a description', () => {
    expect(new Set(LOAN_MANAGER_NAV_ITEMS.map((item) => item.id)).size).toBe(LOAN_MANAGER_NAV_ITEMS.length);
    expect(new Set(paths).size).toBe(paths.length);
    LOAN_MANAGER_NAV_ITEMS.forEach((item) => expect(item.description.length).toBeGreaterThan(10));
  });

  it('shows header shortcuts only for pages that are in the menu', () => {
    expect(LOAN_MANAGER_HEADER_SHORTCUT_IDS).toEqual(['notifications', 'communication']);
    LOAN_MANAGER_HEADER_SHORTCUT_IDS.forEach((id) => expect(getLoanManagerNavItem(id).id).toBe(id));
  });

  it('names each page after its menu entry, the profile page and unknown pages included', () => {
    const queue = LOAN_MANAGER_NAV_ITEMS[1];
    expect(resolveLoanManagerPageTitle(queue.path)).toBe(queue.title ?? queue.label);
    expect(resolveLoanManagerPageTitle(LOAN_MANAGER_PROFILE_PATH)).toBe('My Profile');
    expect(resolveLoanManagerPageTitle(`${LOAN_MANAGER_ROOT_PATH}/not-a-page`)).toBe(LOAN_MANAGER_WORKSPACE_LABEL);
    expect(findLoanManagerNavItem('/admin/dashboard')).toBeUndefined();
  });

  it('fails loudly for a section that is not configured', () => {
    expect(() => getLoanManagerNavItem('missing-section' as LoanManagerSectionId)).toThrow(/not configured/);
  });
});
