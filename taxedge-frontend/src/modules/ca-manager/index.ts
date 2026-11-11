/** CA Manager module: dashboard, menu sections, sidebar and header shortcuts. Other modules and the router import only from this file. */
export { CaManagerHeaderActions } from './components/shared/CaManagerHeaderActions';
export { CaManagerSidebar, type CaManagerSidebarProps } from './components/shared/CaManagerSidebar';
export { CA_MANAGER_PAGE_LOADERS, loadCaManagerProfilePage } from './pages/caManagerPages';
export {
  CA_MANAGER_MODULE_ROLE,
  CA_MANAGER_PROFILE_PATH,
  CA_MANAGER_ROOT_PATH,
  CA_MANAGER_SERVICES,
  CA_MANAGER_SIDEBAR_ID,
  CA_MANAGER_WORKSPACE_LABEL
} from './shared/caManager.config';
export { CA_MANAGER_NAV_ITEMS, resolveCaManagerPageTitle } from './shared/caManagerNavigation';
export type { CaManagerNavItem, CaManagerSectionId } from './shared/caManager.types';
