import { RoleDashboardView } from '@/modules/workflow';
import { CA_MANAGER_DASHBOARD } from '../shared/caManagerDashboard';

/** CA Manager landing page: reached only by the CA_MANAGER role (route guards and, authoritatively, the server). */
export default function CaManagerDashboardPage() {
  return <RoleDashboardView config={CA_MANAGER_DASHBOARD} />;
}
