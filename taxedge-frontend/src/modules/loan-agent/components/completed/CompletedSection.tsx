import { CaseQueueView } from '@/modules/workflow';
import { useLoanAgentSection } from '../../hooks/useLoanAgentSection';
import { LOAN_AGENT_QUEUES } from '../../shared/loanAgentQueues';

/** Loan Agent "Completed": results you delivered to the customer. */
export default function CompletedSection() {
  const { entry } = useLoanAgentSection('completed');
  return <CaseQueueView preset={LOAN_AGENT_QUEUES['completed']} entry={entry} showAgent={false} />;
}
