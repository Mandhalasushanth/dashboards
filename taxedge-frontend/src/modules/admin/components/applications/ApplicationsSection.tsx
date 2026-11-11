import { CaseQueueView } from '@/modules/workflow';
import { ADMIN_APPLICATIONS_PRESET } from '../../shared/adminWorkflow';

/**
 * Admin "Applications": the organisation-wide view of the same workflow records the managers and agents
 * work on, so every stage, payment, assignment and audit event matches what the teams see.
 */
export default function ApplicationsSection() {
  return <CaseQueueView preset={ADMIN_APPLICATIONS_PRESET} />;
}
