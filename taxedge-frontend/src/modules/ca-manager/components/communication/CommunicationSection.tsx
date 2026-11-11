import { MessagingWorkspace } from '@/modules/admin';
import { caManagerMessagingApi } from '../../api/caManagerCommunicationApi';
import { CA_MANAGER_MESSAGING } from '../../shared/caManagerCommunication';
import { getCaManagerNavItem } from '../../shared/caManagerNavigation';

const ITEM = getCaManagerNavItem('communication');

/** CA Manager "Communication": the admin console's messaging layout, limited to the CA Manager's contacts. */
export default function CommunicationSection() {
  return <MessagingWorkspace title={ITEM.label} api={caManagerMessagingApi} presentation={CA_MANAGER_MESSAGING} />;
}
