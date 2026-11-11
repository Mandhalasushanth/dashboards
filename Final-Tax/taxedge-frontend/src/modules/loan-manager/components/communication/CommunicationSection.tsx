import { MessagingWorkspace } from '@/modules/admin';
import { loanManagerMessagingApi } from '../../api/loanManagerCommunicationApi';
import { LOAN_MANAGER_MESSAGING } from '../../shared/loanManagerCommunication';
import { getLoanManagerNavItem } from '../../shared/loanManagerNavigation';

const ITEM = getLoanManagerNavItem('communication');

/** Loan Manager "Communication": the admin console's messaging layout, limited to the Loan Manager's contacts. */
export default function CommunicationSection() {
  return <MessagingWorkspace title={ITEM.label} api={loanManagerMessagingApi} presentation={LOAN_MANAGER_MESSAGING} />;
}
