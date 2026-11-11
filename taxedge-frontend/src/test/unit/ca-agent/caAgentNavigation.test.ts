import { describe, expect, it } from 'vitest';
import { ROUTE_PATHS } from '@/core/config/routePaths';
import { CA_AGENT_PROFILE_PATH, CA_AGENT_ROOT_PATH, CA_AGENT_WORKSPACE_LABEL } from '@/modules/ca-agent/shared/caAgent.config';
import {
  CA_AGENT_HEADER_SHORTCUT_IDS,
  CA_AGENT_NAV_ITEMS,
  findCaAgentNavItem,
  getCaAgentNavItem,
  resolveCaAgentPageTitle
} from '@/modules/ca-agent/shared/caAgentNavigation';
import type { CaAgentSectionId } from '@/modules/ca-agent/shared/caAgent.types';

/** The CA Agent sidebar: every entry has its own page, and headers and titles come from the same list. */
describe('CA Agent navigation', () => {
  const paths = CA_AGENT_NAV_ITEMS.map((item) => item.path);

  it('opens on the dashboard and keeps every page inside the CA Agent workspace', () => {
    expect(CA_AGENT_ROOT_PATH).toBe(ROUTE_PATHS.caAgentRoot);
    expect(CA_AGENT_NAV_ITEMS[0]).toMatchObject({ id: 'overview', path: `${CA_AGENT_ROOT_PATH}/dashboard` });
    paths.forEach((path) => expect(path.startsWith(`${CA_AGENT_ROOT_PATH}/`)).toBe(true));
  });

  it('gives every menu entry a unique id, a unique page and a description', () => {
    expect(new Set(CA_AGENT_NAV_ITEMS.map((item) => item.id)).size).toBe(CA_AGENT_NAV_ITEMS.length);
    expect(new Set(paths).size).toBe(paths.length);
    CA_AGENT_NAV_ITEMS.forEach((item) => expect(item.description.length).toBeGreaterThan(10));
  });

  it('shows header shortcuts only for pages that are in the menu', () => {
    expect(CA_AGENT_HEADER_SHORTCUT_IDS).toEqual(['notifications', 'communication', 'new']);
    CA_AGENT_HEADER_SHORTCUT_IDS.forEach((id) => expect(getCaAgentNavItem(id).id).toBe(id));
  });

  it('names each page after its menu entry, the profile page and unknown pages included', () => {
    const queue = CA_AGENT_NAV_ITEMS[1];
    expect(resolveCaAgentPageTitle(queue.path)).toBe(queue.title ?? queue.label);
    expect(resolveCaAgentPageTitle(CA_AGENT_PROFILE_PATH)).toBe('My Profile');
    expect(resolveCaAgentPageTitle(`${CA_AGENT_ROOT_PATH}/not-a-page`)).toBe(CA_AGENT_WORKSPACE_LABEL);
    expect(findCaAgentNavItem('/admin/dashboard')).toBeUndefined();
  });

  it('fails loudly for a section that is not configured', () => {
    expect(() => getCaAgentNavItem('missing-section' as CaAgentSectionId)).toThrow(/not configured/);
  });
});
