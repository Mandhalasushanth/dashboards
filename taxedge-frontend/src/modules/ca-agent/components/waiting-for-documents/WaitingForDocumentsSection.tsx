import { CaseQueueView } from '@/modules/workflow';
import { useCaAgentSection } from '../../hooks/useCaAgentSection';
import { CA_AGENT_QUEUES } from '../../shared/caAgentQueues';

/** CA Agent "Waiting for Documents": you reported missing documents. These come back to you once your manager updates them. */
export default function WaitingForDocumentsSection() {
  const { entry } = useCaAgentSection('missing');
  return <CaseQueueView preset={CA_AGENT_QUEUES['missing']} entry={entry} showAgent={false} />;
}
