import { NotificationsWithPush, recipientsFromCases } from '@/modules/push-notifications';
import { WorkflowNotificationsView, workflowApi } from '@/modules/workflow';
import { useLoanManagerSection } from '../../hooks/useLoanManagerSection';

/** Up to this many of the team's applications are read to build the customer list. */
const CUSTOMER_SOURCE_PAGE_SIZE = 500;

/** The customers on this team's applications; the server scopes the case list to the signed-in manager. */
const loadTeamCustomers = () =>
  workflowApi.listCases({ pageSize: CUSTOMER_SOURCE_PAGE_SIZE }).then((page) => recipientsFromCases(page.items));

/** Loan Manager "Notifications": workflow notifications, plus a tab for push notifications to chosen customers. */
export default function NotificationsSection() {
  const { item } = useLoanManagerSection('notifications');
  return (
    <NotificationsWithPush
      mode="MANAGER"
      inbox={<WorkflowNotificationsView title={item.label} />}
      loadRecipients={loadTeamCustomers}
    />
  );
}
