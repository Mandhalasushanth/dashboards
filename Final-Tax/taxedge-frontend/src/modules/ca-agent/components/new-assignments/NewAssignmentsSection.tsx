import { CaseQueueView } from '@/modules/workflow';
import { useCaAgentSection } from '../../hooks/useCaAgentSection';
import { CA_AGENT_QUEUES } from '../../shared/caAgentQueues';

/** CA Agent "New Assignments": check the documents, download them and start on the portal. */
export default function NewAssignmentsSection() {
  const { entry } = useCaAgentSection('new');
  return <CaseQueueView preset={CA_AGENT_QUEUES['new']} entry={entry} showAgent={false} />;
}
