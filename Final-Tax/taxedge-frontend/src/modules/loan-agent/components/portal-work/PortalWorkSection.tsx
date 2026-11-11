import { CaseQueueView } from '@/modules/workflow';
import { useLoanAgentSection } from '../../hooks/useLoanAgentSection';
import { LOAN_AGENT_QUEUES } from '../../shared/loanAgentQueues';

/** Loan Agent "Portal Work": work in progress on the outside portal. Upload the result and submit when done. */
export default function PortalWorkSection() {
  const { entry } = useLoanAgentSection('portal');
  return <CaseQueueView preset={LOAN_AGENT_QUEUES['portal']} entry={entry} showAgent={false} />;
}
