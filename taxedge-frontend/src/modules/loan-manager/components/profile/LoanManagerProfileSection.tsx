import { ProfileSection } from '@/modules/admin';
import { useDocumentTitle } from '@/shared';

/**
 * Loan Manager "My Profile", opened from the sidebar footer. Reuses the shared account profile screen
 * (personal details, password change); what may be edited is still decided by the server.
 */
export default function LoanManagerProfileSection() {
  useDocumentTitle('My Profile');
  return <ProfileSection />;
}
