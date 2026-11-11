import type { NewStaffInput, StaffMember, StaffTier, UpdateStaffInput } from '../shared/staff.types';
import { parseStaffList, parseStaffMember } from '../validation/staffSchema';
import { accountGateway } from './adminAccountsApi';
import { recallStaffPassword } from './staffPasswordVault';

/** Manager and agent accounts live on the backend (ManagerLoginController and AgentLoginController). */
export async function fetchStaff(tier: StaffTier): Promise<StaffMember[]> {
  return parseStaffList(await accountGateway.list(tier));
}

/** The server stores only a hash of the password the administrator sets. */
export async function createStaffMember(tier: StaffTier, input: NewStaffInput): Promise<StaffMember | null> {
  return parseStaffMember(await accountGateway.create(tier, input));
}

/** A non-empty password replaces the current one. */
export async function updateStaffMember(tier: StaffTier, id: string, input: UpdateStaffInput): Promise<StaffMember | null> {
  return parseStaffMember(await accountGateway.update(tier, id, input));
}

/** Deletes the account for good; a manager who still has agents is refused by the server. */
export async function deleteStaffMember(tier: StaffTier, id: string): Promise<void> {
  await accountGateway.remove(tier, id);
}

/**
 * The server keeps only BCrypt hashes and never returns a password, so this reads the dashboard's encrypted
 * copy of the last password the administrator set for this account from this browser; null when there is none.
 */
export async function revealStaffPassword(member: StaffMember): Promise<string | null> {
  return recallStaffPassword(member.role.endsWith('MANAGER') ? 'MANAGER' : 'AGENT', member.id);
}
