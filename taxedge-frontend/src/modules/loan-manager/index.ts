/** Loan Manager module: dashboard, menu sections, sidebar and header shortcuts. Other modules and the router import only from this file. */
export { LoanManagerHeaderActions } from './components/shared/LoanManagerHeaderActions';
export { LoanManagerSidebar, type LoanManagerSidebarProps } from './components/shared/LoanManagerSidebar';
export { LOAN_MANAGER_PAGE_LOADERS, loadLoanManagerProfilePage } from './pages/loanManagerPages';
export {
  LOAN_MANAGER_MODULE_ROLE,
  LOAN_MANAGER_PROFILE_PATH,
  LOAN_MANAGER_ROOT_PATH,
  LOAN_MANAGER_SERVICES,
  LOAN_MANAGER_SIDEBAR_ID,
  LOAN_MANAGER_WORKSPACE_LABEL
} from './shared/loanManager.config';
export { LOAN_MANAGER_NAV_ITEMS, resolveLoanManagerPageTitle } from './shared/loanManagerNavigation';
export type { LoanManagerNavItem, LoanManagerSectionId } from './shared/loanManager.types';
