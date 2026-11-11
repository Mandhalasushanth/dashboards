import { API_ENDPOINTS, apiClient } from '@/core/api';
import type { NewStaffInput, StaffTier, UpdateStaffInput } from '../shared/staff.types';
import { forgetStaffPassword, rememberStaffPassword } from './staffPasswordVault';

/**
 * Manager and agent accounts on the backend's ManagerLoginController (/api/v1/admin/managers) and
 * AgentLoginController (/api/v1/admin/agents). The server's DTOs use "email" where the staff screens
 * use "username" and have no status or work figures yet, so records are translated into the shape
 * parseStaffMember reads.
 */
type AccountRecord = Readonly<Record<string, unknown>>;

const BASE_PATHS: Readonly<Record<StaffTier, string>> = Object.freeze({
  MANAGER: API_ENDPOINTS.admin.managers,
  AGENT: API_ENDPOINTS.admin.agents
});

const accountPath = (tier: StaffTier, id: string) => `${BASE_PATHS[tier]}/${encodeURIComponent(id)}`;

/** Agents send their "Reports to" manager; a blank password is left out, so an edit keeps the current one. */
const toAccountBody = (tier: StaffTier, input: NewStaffInput | UpdateStaffInput) => ({
  fullName: input.fullName.trim(),
  email: input.username.trim().toLowerCase(),
  role: input.role,
  ...(tier === 'AGENT' && input.managerId ? { managerId: Number(input.managerId) } : {}),
  ...(input.password ? { password: input.password, confirmPassword: input.password } : {})
});

const idOf = (raw: unknown): string | null => {
  const id = typeof raw === 'object' && raw !== null ? (raw as AccountRecord).id : null;
  return typeof id === 'number' || typeof id === 'string' ? String(id) : null;
};

const toStaffRecord = (raw: unknown): unknown => {
  if (typeof raw !== 'object' || raw === null) return raw;
  const record = raw as AccountRecord;
  return {
    ...record,
    username: record.email,
    managerId: record.managerId === null || record.managerId === undefined ? null : String(record.managerId),
    // Every stored account can sign in; the backend has no deactivated state.
    active: true,
    joinedAt: record.createdAt
  };
};

export const accountGateway = Object.freeze({
  list: async (tier: StaffTier) => {
    const body = await apiClient.get<unknown>(BASE_PATHS[tier]);
    return Array.isArray(body) ? body.map(toStaffRecord) : [];
  },
  // A password is kept for "Show" only after the backend has saved the account with it.
  create: async (tier: StaffTier, input: NewStaffInput) => {
    const saved = await apiClient.post<unknown>(BASE_PATHS[tier], toAccountBody(tier, input));
    const id = idOf(saved);
    if (id && input.password) await rememberStaffPassword(tier, id, input.password);
    return toStaffRecord(saved);
  },
  update: async (tier: StaffTier, id: string, input: UpdateStaffInput) => {
    const saved = await apiClient.put<unknown>(accountPath(tier, id), toAccountBody(tier, input));
    if (input.password) await rememberStaffPassword(tier, idOf(saved) ?? id, input.password);
    return toStaffRecord(saved);
  },
  remove: async (tier: StaffTier, id: string) => {
    await apiClient.delete<void>(accountPath(tier, id));
    forgetStaffPassword(tier, id);
  }
});
