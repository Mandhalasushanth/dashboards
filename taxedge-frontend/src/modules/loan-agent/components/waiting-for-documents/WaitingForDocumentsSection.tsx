import { CaseQueueView } from '@/modules/workflow';
import { useLoanAgentSection } from '../../hooks/useLoanAgentSection';
import { LOAN_AGENT_QUEUES } from '../../shared/loanAgentQueues';

/** Loan Agent "Waiting for Documents": you reported missing documents. These come back to you once your manager updates them. */
export default function WaitingForDocumentsSection() {
  const { entry } = useLoanAgentSection('missing');
  return <CaseQueueView preset={LOAN_AGENT_QUEUES['missing']} entry={entry} showAgent={false} />;
}
