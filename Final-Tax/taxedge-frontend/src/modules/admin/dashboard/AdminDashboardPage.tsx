import { RoleDashboardView } from '@/modules/workflow';
import { ADMIN_DASHBOARD_CONFIG } from '../shared/adminWorkflow';

/**
 * Admin "Overview": organisation-wide workflow monitoring.
 * Reached only by the ADMIN role (enforced by route guards and, authoritatively, the server).
 */
export default function AdminDashboardPage() {
  return <RoleDashboardView config={ADMIN_DASHBOARD_CONFIG} />;
}
