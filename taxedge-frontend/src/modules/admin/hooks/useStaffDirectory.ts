import { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultMessageFor, isApiError } from '@/core/api';
import { logger } from '@/core/logging/logger';
import { createStaffMember, deleteStaffMember, fetchStaff, updateStaffMember } from '../api/adminStaffApi';
import {
  ROLE_DOMAIN,
  type NewStaffInput,
  type StaffDomainFilter,
  type StaffMember,
  type StaffStatusFilter,
  type StaffTier,
  type UpdateStaffInput
} from '../shared/staff.types';

export type StaffStatus = 'loading' | 'ready' | 'error';

function toMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  logger.error('Unexpected staff directory failure.', error);
  return defaultMessageFor('UNKNOWN');
}

function matches(member: StaffMember, search: string, domain: StaffDomainFilter, status: StaffStatusFilter): boolean {
  const query = search.trim().toLowerCase();
  return (
    (domain === 'ALL' || ROLE_DOMAIN[member.role] === domain) &&
    (status === 'ALL' || (status === 'ACTIVE') === member.active) &&
    (!query || [member.fullName, member.username, member.id].some((value) => value.toLowerCase().includes(query)))
  );
}

/** Loads one tier of staff (plus active managers, for agents' reporting line) and applies filters. */
export function useStaffDirectory(tier: StaffTier) {
  const [members, setMembers] = useState<readonly StaffMember[]>([]);
  const [managers, setManagers] = useState<readonly StaffMember[]>([]);
  const [status, setStatus] = useState<StaffStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState<StaffDomainFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StaffStatusFilter>('ALL');
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [loadCount, setLoadCount] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    // The manager list only fills the agents' "Reports to" choice, so if it fails the agents still load.
    const managerList =
      tier === 'AGENT'
        ? fetchStaff('MANAGER').catch((managerError: unknown) => {
            logger.warn('Managers could not be loaded for the agent form.', { error: managerError });
            return [];
          })
        : Promise.resolve([]);
    Promise.all([fetchStaff(tier), managerList])
      .then(([list, managerList]) => {
        if (!active) return;
        setMembers(list);
        setManagers(managerList.filter((manager) => manager.active));
        setError(null);
        setStatus('ready');
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(toMessage(loadError));
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [tier, loadCount]);

  const visible = useMemo(
    () => members.filter((member) => matches(member, search, domain, statusFilter)),
    [members, search, domain, statusFilter]
  );

  const summary = useMemo(
    () => ({
      total: members.length,
      active: members.filter((member) => member.active).length,
      ca: members.filter((member) => ROLE_DOMAIN[member.role] === 'CA').length,
      loan: members.filter((member) => ROLE_DOMAIN[member.role] === 'LOAN').length,
      openCases: members.reduce((sum, member) => sum + member.openCases, 0)
    }),
    [members]
  );

  /** Returns an error message, or null on success. */
  const create = useCallback(async (input: NewStaffInput): Promise<string | null> => {
    try {
      const created = await createStaffMember(tier, input);
      if (created) setMembers((current) => [...current, created].sort((a, b) => a.fullName.localeCompare(b.fullName)));
      return null;
    } catch (createError) {
      return toMessage(createError);
    }
  }, [tier]);

  /** Returns an error message, or null on success. */
  const update = useCallback(async (id: string, input: UpdateStaffInput): Promise<string | null> => {
    try {
      const updated = await updateStaffMember(tier, id, input);
      if (updated) {
        setMembers((current) =>
          current.map((member) => (member.id === id ? updated : member)).sort((a, b) => a.fullName.localeCompare(b.fullName))
        );
      }
      return null;
    } catch (updateError) {
      return toMessage(updateError);
    }
  }, [tier]);

  /** Deletes the account; the row stays (with the server's message shown) if the server refuses. */
  const remove = useCallback(async (member: StaffMember) => {
    setPendingIds((current) => new Set(current).add(member.id));
    setError(null);
    try {
      await deleteStaffMember(tier, member.id);
      setMembers((current) => current.filter((item) => item.id !== member.id));
    } catch (deleteError) {
      setError(toMessage(deleteError));
    } finally {
      setPendingIds((current) => new Set([...current].filter((id) => id !== member.id)));
    }
  }, [tier]);

  const reload = useCallback(() => setLoadCount((value) => value + 1), []);

  return {
    status,
    error,
    members,
    visible,
    managers,
    summary,
    pendingIds,
    search,
    domain,
    statusFilter,
    setSearch,
    setDomain,
    setStatusFilter,
    create,
    update,
    remove,
    reload
  };
}

export type StaffDirectoryController = ReturnType<typeof useStaffDirectory>;
