import { MessagingWorkspace } from '@/modules/admin';
import { loanAgentMessagingApi } from '../../api/loanAgentCommunicationApi';
import { LOAN_AGENT_MESSAGING } from '../../shared/loanAgentCommunication';
import { getLoanAgentNavItem } from '../../shared/loanAgentNavigation';

const ITEM = getLoanAgentNavItem('communication');

/** Loan Agent "Communication": the admin console's messaging layout, limited to the Loan Agent's contacts. */
export default function CommunicationSection() {
  return <MessagingWorkspace title={ITEM.label} api={loanAgentMessagingApi} presentation={LOAN_AGENT_MESSAGING} />;
}
