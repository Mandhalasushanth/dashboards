import { describe, expect, it } from 'vitest';
import { ROUTE_PATHS } from '@/core/config/routePaths';
import { CA_MANAGER_PROFILE_PATH, CA_MANAGER_ROOT_PATH, CA_MANAGER_WORKSPACE_LABEL } from '@/modules/ca-manager/shared/caManager.config';
import {
  CA_MANAGER_HEADER_SHORTCUT_IDS,
  CA_MANAGER_NAV_ITEMS,
  findCaManagerNavItem,
  getCaManagerNavItem,
  resolveCaManagerPageTitle
} from '@/modules/ca-manager/shared/caManagerNavigation';
import type { CaManagerSectionId } from '@/modules/ca-manager/shared/caManager.types';

/** The CA Manager sidebar: every entry has its own page, and headers and titles come from the same list. */
describe('CA Manager navigation', () => {
  const paths = CA_MANAGER_NAV_ITEMS.map((item) => item.path);

  it('opens on the dashboard and keeps every page inside the CA Manager workspace', () => {
    expect(CA_MANAGER_ROOT_PATH).toBe(ROUTE_PATHS.caManagerRoot);
    expect(CA_MANAGER_NAV_ITEMS[0]).toMatchObject({ id: 'overview', path: `${CA_MANAGER_ROOT_PATH}/dashboard` });
    paths.forEach((path) => expect(path.startsWith(`${CA_MANAGER_ROOT_PATH}/`)).toBe(true));
  });

  it('gives every menu entry a unique id, a unique page and a description', () => {
    expect(new Set(CA_MANAGER_NAV_ITEMS.map((item) => item.id)).size).toBe(CA_MANAGER_NAV_ITEMS.length);
    expect(new Set(paths).size).toBe(paths.length);
    CA_MANAGER_NAV_ITEMS.forEach((item) => expect(item.description.length).toBeGreaterThan(10));
  });

  it('shows header shortcuts only for pages that are in the menu', () => {
    expect(CA_MANAGER_HEADER_SHORTCUT_IDS).toEqual(['notifications', 'communication']);
    CA_MANAGER_HEADER_SHORTCUT_IDS.forEach((id) => expect(getCaManagerNavItem(id).id).toBe(id));
  });

  it('names each page after its menu entry, the profile page and unknown pages included', () => {
    const queue = CA_MANAGER_NAV_ITEMS[1];
    expect(resolveCaManagerPageTitle(queue.path)).toBe(queue.title ?? queue.label);
    expect(resolveCaManagerPageTitle(CA_MANAGER_PROFILE_PATH)).toBe('My Profile');
    expect(resolveCaManagerPageTitle(`${CA_MANAGER_ROOT_PATH}/not-a-page`)).toBe(CA_MANAGER_WORKSPACE_LABEL);
    expect(findCaManagerNavItem('/admin/dashboard')).toBeUndefined();
  });

  it('fails loudly for a section that is not configured', () => {
    expect(() => getCaManagerNavItem('missing-section' as CaManagerSectionId)).toThrow(/not configured/);
  });
});
