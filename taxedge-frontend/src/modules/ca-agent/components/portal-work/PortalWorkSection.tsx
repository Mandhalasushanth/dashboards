import { CaseQueueView } from '@/modules/workflow';
import { useCaAgentSection } from '../../hooks/useCaAgentSection';
import { CA_AGENT_QUEUES } from '../../shared/caAgentQueues';

/** CA Agent "Portal Work": work in progress on the outside portal. Upload the result and submit when done. */
export default function PortalWorkSection() {
  const { entry } = useCaAgentSection('portal');
  return <CaseQueueView preset={CA_AGENT_QUEUES['portal']} entry={entry} showAgent={false} />;
}
