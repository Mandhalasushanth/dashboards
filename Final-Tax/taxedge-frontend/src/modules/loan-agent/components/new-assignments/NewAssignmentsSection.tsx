import { CaseQueueView } from '@/modules/workflow';
import { useLoanAgentSection } from '../../hooks/useLoanAgentSection';
import { LOAN_AGENT_QUEUES } from '../../shared/loanAgentQueues';

/** Loan Agent "New Assignments": check the documents, download them and start on the portal. */
export default function NewAssignmentsSection() {
  const { entry } = useLoanAgentSection('new');
  return <CaseQueueView preset={LOAN_AGENT_QUEUES['new']} entry={entry} showAgent={false} />;
}
