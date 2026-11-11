import { CaseQueueView } from '@/modules/workflow';
import { useCaManagerSection } from '../../hooks/useCaManagerSection';
import { CA_MANAGER_QUEUES } from '../../shared/caManagerQueues';

/** CA Manager "Awaiting Payment": payment requested from the customer. These cannot be assigned until they are paid. */
export default function AwaitingPaymentSection() {
  const { entry } = useCaManagerSection('payment');
  return <CaseQueueView preset={CA_MANAGER_QUEUES['payment']} entry={entry} />;
}
