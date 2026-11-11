import { CaseQueueView } from '@/modules/workflow';
import { useCaManagerSection } from '../../hooks/useCaManagerSection';
import { CA_MANAGER_QUEUES } from '../../shared/caManagerQueues';

/** CA Manager "My Applications": the applications this manager has taken, each with a View button. */
export default function MyApplicationsSection() {
  const { entry } = useCaManagerSection('mine');
  return <CaseQueueView preset={CA_MANAGER_QUEUES['mine']} entry={entry} />;
}
