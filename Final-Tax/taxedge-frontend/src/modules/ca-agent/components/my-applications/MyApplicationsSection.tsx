import { CaseQueueView } from '@/modules/workflow';
import { useCaAgentSection } from '../../hooks/useCaAgentSection';
import { CA_AGENT_QUEUES } from '../../shared/caAgentQueues';

/** CA Agent "All My Applications": every application assigned to you, in any status. */
export default function MyApplicationsSection() {
  const { entry } = useCaAgentSection('applications');
  return <CaseQueueView preset={CA_AGENT_QUEUES['applications']} entry={entry} showAgent={false} />;
}
