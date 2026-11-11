import { CaseQueueView } from '@/modules/workflow';
import { useLoanAgentSection } from '../../hooks/useLoanAgentSection';
import { LOAN_AGENT_QUEUES } from '../../shared/loanAgentQueues';

/** Loan Agent "All My Applications": every application assigned to you, in any status. */
export default function MyApplicationsSection() {
  const { entry } = useLoanAgentSection('applications');
  return <CaseQueueView preset={LOAN_AGENT_QUEUES['applications']} entry={entry} showAgent={false} />;
}
