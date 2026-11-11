/** CA Agent module: dashboard, menu sections, sidebar and header shortcuts. Other modules and the router import only from this file. */
export { CaAgentHeaderActions } from './components/shared/CaAgentHeaderActions';
export { CaAgentSidebar, type CaAgentSidebarProps } from './components/shared/CaAgentSidebar';
export { CA_AGENT_PAGE_LOADERS, loadCaAgentProfilePage } from './pages/caAgentPages';
export {
  CA_AGENT_MODULE_ROLE,
  CA_AGENT_PROFILE_PATH,
  CA_AGENT_ROOT_PATH,
  CA_AGENT_SERVICES,
  CA_AGENT_SIDEBAR_ID,
  CA_AGENT_WORKSPACE_LABEL
} from './shared/caAgent.config';
export { CA_AGENT_NAV_ITEMS, resolveCaAgentPageTitle } from './shared/caAgentNavigation';
export type { CaAgentNavItem, CaAgentSectionId } from './shared/caAgent.types';
