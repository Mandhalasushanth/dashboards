import { CaseQueueView } from '@/modules/workflow';
import { useLoanManagerSection } from '../../hooks/useLoanManagerSection';
import { LOAN_MANAGER_QUEUES } from '../../shared/loanManagerQueues';

/** Loan Manager "My Applications": the applications this manager has taken, each with a View button. */
export default function MyApplicationsSection() {
  const { entry } = useLoanManagerSection('mine');
  return <CaseQueueView preset={LOAN_MANAGER_QUEUES['mine']} entry={entry} />;
}
