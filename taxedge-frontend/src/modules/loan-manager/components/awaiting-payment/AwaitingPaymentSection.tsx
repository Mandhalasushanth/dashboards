import { CaseQueueView } from '@/modules/workflow';
import { useLoanManagerSection } from '../../hooks/useLoanManagerSection';
import { LOAN_MANAGER_QUEUES } from '../../shared/loanManagerQueues';

/** Loan Manager "Awaiting Payment": payment requested from the customer. These cannot be assigned until they are paid. */
export default function AwaitingPaymentSection() {
  const { entry } = useLoanManagerSection('payment');
  return <CaseQueueView preset={LOAN_MANAGER_QUEUES['payment']} entry={entry} />;
}
