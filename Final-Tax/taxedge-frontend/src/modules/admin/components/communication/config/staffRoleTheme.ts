import { ROLE_PROFILES } from '@/modules/authentication';
import type { ContactRole, ContactRoleFilter } from '../../../shared/communication.types';

export interface StaffRoleTheme {
  /** Tab label, e.g. "CA Managers". */
  readonly pluralLabel: string;
  /** CSS modifier for the avatar and role tag colour. */
  readonly tone: 'navy' | 'blue' | 'orange' | 'green' | 'purple';
}

/** Colour and plural label per staff role, so each group is easy to tell apart in the list. */
export const STAFF_ROLE_THEME: Readonly<Record<ContactRole, StaffRoleTheme>> = Object.freeze({
  CUSTOMER: { pluralLabel: 'Customers', tone: 'green' },
  ADMIN: { pluralLabel: 'Administrator', tone: 'purple' },
  CA_MANAGER: { pluralLabel: 'CA Managers', tone: 'navy' },
  CA_AGENT: { pluralLabel: 'CA Agents', tone: 'blue' },
  LOAN_MANAGER: { pluralLabel: 'Loan Managers', tone: 'orange' },
  LOAN_AGENT: { pluralLabel: 'Loan Agents', tone: 'green' }
});

/** The admin console's tabs: every staff role. */
export const ROLE_FILTER_ORDER: readonly ContactRoleFilter[] = Object.freeze(['ALL', 'CA_MANAGER', 'CA_AGENT', 'LOAN_MANAGER', 'LOAN_AGENT']);

/** "CA Manager", "Customer", ... for the role tag next to a contact's name. */
export const contactRoleLabel = (role: ContactRole): string => (role === 'CUSTOMER' ? 'Customer' : ROLE_PROFILES[role].label);
