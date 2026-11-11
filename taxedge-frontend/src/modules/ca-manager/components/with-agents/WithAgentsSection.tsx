import { CaseQueueView } from '@/modules/workflow';
import { useCaManagerSection } from '../../hooks/useCaManagerSection';
import { CA_MANAGER_QUEUES } from '../../shared/caManagerQueues';

/** CA Manager "With Agents": agents are checking documents or working on the portal. */
export default function WithAgentsSection() {
  const { entry } = useCaManagerSection('working');
  return <CaseQueueView preset={CA_MANAGER_QUEUES['working']} entry={entry} />;
}
