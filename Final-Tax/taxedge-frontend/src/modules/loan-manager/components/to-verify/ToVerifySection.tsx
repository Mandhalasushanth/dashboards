import { CaseQueueView } from '@/modules/workflow';
import { useLoanManagerSection } from '../../hooks/useLoanManagerSection';
import { LOAN_MANAGER_QUEUES } from '../../shared/loanManagerQueues';

/** Loan Manager "All Applications": every application in the team; new ones open in the verification steps. */
export default function ToVerifySection() {
  const { entry } = useLoanManagerSection('verify');
  return <CaseQueueView preset={LOAN_MANAGER_QUEUES['verify']} entry={entry} />;
}
