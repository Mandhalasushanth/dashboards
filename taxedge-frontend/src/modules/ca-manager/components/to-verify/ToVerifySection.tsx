import { CaseQueueView } from '@/modules/workflow';
import { useCaManagerSection } from '../../hooks/useCaManagerSection';
import { CA_MANAGER_QUEUES } from '../../shared/caManagerQueues';

/** CA Manager "All Applications": every application in the team; new ones open in the verification steps. */
export default function ToVerifySection() {
  const { entry } = useCaManagerSection('verify');
  return <CaseQueueView preset={CA_MANAGER_QUEUES['verify']} entry={entry} />;
}
