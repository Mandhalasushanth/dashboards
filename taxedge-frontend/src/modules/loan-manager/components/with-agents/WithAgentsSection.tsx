import { CaseQueueView } from '@/modules/workflow';
import { useLoanManagerSection } from '../../hooks/useLoanManagerSection';
import { LOAN_MANAGER_QUEUES } from '../../shared/loanManagerQueues';

/** Loan Manager "With Agents": agents are checking documents or working on the portal. */
export default function WithAgentsSection() {
  const { entry } = useLoanManagerSection('working');
  return <CaseQueueView preset={LOAN_MANAGER_QUEUES['working']} entry={entry} />;
}
