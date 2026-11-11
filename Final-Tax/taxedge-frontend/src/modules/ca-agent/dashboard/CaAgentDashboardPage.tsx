import { RoleDashboardView } from '@/modules/workflow';
import { CA_AGENT_DASHBOARD } from '../shared/caAgentDashboard';

/** CA Agent landing page: reached only by the CA_AGENT role (route guards and, authoritatively, the server). */
export default function CaAgentDashboardPage() {
  return <RoleDashboardView config={CA_AGENT_DASHBOARD} />;
}
