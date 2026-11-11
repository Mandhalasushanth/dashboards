import { CaseQueueView } from '@/modules/workflow';
import { useCaAgentSection } from '../../hooks/useCaAgentSection';
import { CA_AGENT_QUEUES } from '../../shared/caAgentQueues';

/** CA Agent "Completed": results you delivered to the customer. */
export default function CompletedSection() {
  const { entry } = useCaAgentSection('completed');
  return <CaseQueueView preset={CA_AGENT_QUEUES['completed']} entry={entry} showAgent={false} />;
}
