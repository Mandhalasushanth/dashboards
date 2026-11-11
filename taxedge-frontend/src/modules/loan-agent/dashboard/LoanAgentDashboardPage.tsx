import { RoleDashboardView } from '@/modules/workflow';
import { LOAN_AGENT_DASHBOARD } from '../shared/loanAgentDashboard';

/** Loan Agent landing page: reached only by the LOAN_AGENT role (route guards and, authoritatively, the server). */
export default function LoanAgentDashboardPage() {
  return <RoleDashboardView config={LOAN_AGENT_DASHBOARD} />;
}
