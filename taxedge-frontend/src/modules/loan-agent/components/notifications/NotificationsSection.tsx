import { WorkflowNotificationsView } from '@/modules/workflow';
import { useLoanAgentSection } from '../../hooks/useLoanAgentSection';

/** Loan Agent "Notifications": in-app workflow notifications, each linking to its application. */
export default function NotificationsSection() {
  const { item } = useLoanAgentSection('notifications');
  return <WorkflowNotificationsView title={item.label} />;
}
