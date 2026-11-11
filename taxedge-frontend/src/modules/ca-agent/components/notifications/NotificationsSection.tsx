import { WorkflowNotificationsView } from '@/modules/workflow';
import { useCaAgentSection } from '../../hooks/useCaAgentSection';

/** CA Agent "Notifications": in-app workflow notifications, each linking to its application. */
export default function NotificationsSection() {
  const { item } = useCaAgentSection('notifications');
  return <WorkflowNotificationsView title={item.label} />;
}
