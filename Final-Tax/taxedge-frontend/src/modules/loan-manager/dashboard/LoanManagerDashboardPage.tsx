import { RoleDashboardView } from '@/modules/workflow';
import { LOAN_MANAGER_DASHBOARD } from '../shared/loanManagerDashboard';

/** Loan Manager landing page: reached only by the LOAN_MANAGER role (route guards and, authoritatively, the server). */
export default function LoanManagerDashboardPage() {
  return <RoleDashboardView config={LOAN_MANAGER_DASHBOARD} />;
}
