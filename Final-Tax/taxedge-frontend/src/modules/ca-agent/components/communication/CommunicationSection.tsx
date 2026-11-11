import { MessagingWorkspace } from '@/modules/admin';
import { caAgentMessagingApi } from '../../api/caAgentCommunicationApi';
import { CA_AGENT_MESSAGING } from '../../shared/caAgentCommunication';
import { getCaAgentNavItem } from '../../shared/caAgentNavigation';

const ITEM = getCaAgentNavItem('communication');

/** CA Agent "Communication": the admin console's messaging layout, limited to the CA Agent's contacts. */
export default function CommunicationSection() {
  return <MessagingWorkspace title={ITEM.label} api={caAgentMessagingApi} presentation={CA_AGENT_MESSAGING} />;
}
