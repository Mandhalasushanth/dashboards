/** Loan Agent module: dashboard, menu sections, sidebar and header shortcuts. Other modules and the router import only from this file. */
export { LoanAgentHeaderActions } from './components/shared/LoanAgentHeaderActions';
export { LoanAgentSidebar, type LoanAgentSidebarProps } from './components/shared/LoanAgentSidebar';
export { LOAN_AGENT_PAGE_LOADERS, loadLoanAgentProfilePage } from './pages/loanAgentPages';
export {
  LOAN_AGENT_MODULE_ROLE,
  LOAN_AGENT_PROFILE_PATH,
  LOAN_AGENT_ROOT_PATH,
  LOAN_AGENT_SERVICES,
  LOAN_AGENT_SIDEBAR_ID,
  LOAN_AGENT_WORKSPACE_LABEL
} from './shared/loanAgent.config';
export { LOAN_AGENT_NAV_ITEMS, resolveLoanAgentPageTitle } from './shared/loanAgentNavigation';
export type { LoanAgentNavItem, LoanAgentSectionId } from './shared/loanAgent.types';
