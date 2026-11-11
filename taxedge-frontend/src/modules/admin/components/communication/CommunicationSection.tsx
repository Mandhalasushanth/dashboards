import { adminMessagingApi } from '../../api/adminCommunicationApi';
import type { MessagingPresentation } from '../../shared/communication.types';
import { ROLE_FILTER_ORDER } from './config/staffRoleTheme';
import { MessagingWorkspace } from './MessagingWorkspace';

const ADMIN_MESSAGING: MessagingPresentation = Object.freeze({
  filters: ROLE_FILTER_ORDER,
  allLabel: 'All staff',
  placeholderText: 'Choose a CA or Loan manager or agent from the directory on the left to view messages and collaborate.',
  emptyGroupText: 'No staff members in this group.'
});

/** Admin "Communication": message any CA Manager, CA Agent, Loan Manager or Loan Agent. */
export default function CommunicationSection() {
  return <MessagingWorkspace title="Communication" api={adminMessagingApi} presentation={ADMIN_MESSAGING} />;
}
