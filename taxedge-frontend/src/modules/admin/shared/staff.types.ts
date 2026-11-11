import type { StaffRole } from '@/modules/authentication';

/** Managers and agents share one directory; the tier decides which roles a section shows. */
export type StaffTier = 'MANAGER' | 'AGENT';
export type StaffDomain = 'CA' | 'LOAN';
export type StaffDomainFilter = StaffDomain | 'ALL';
export type StaffStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export const TIER_ROLES: Readonly<Record<StaffTier, readonly StaffRole[]>> = Object.freeze({
  MANAGER: ['CA_MANAGER', 'LOAN_MANAGER'],
  AGENT: ['CA_AGENT', 'LOAN_AGENT']
});

export const ROLE_DOMAIN: Readonly<Record<StaffRole, StaffDomain>> = Object.freeze({
  CA_MANAGER: 'CA',
  CA_AGENT: 'CA',
  LOAN_MANAGER: 'LOAN',
  LOAN_AGENT: 'LOAN'
});

export const TIER_LABELS: Readonly<Record<StaffTier, { singular: string; plural: string }>> = Object.freeze({
  MANAGER: { singular: 'manager', plural: 'managers' },
  AGENT: { singular: 'agent', plural: 'agents' }
});

export interface StaffMember {
  readonly id: string;
  readonly fullName: string;
  /** Login id: the work email an administrator provisions. */
  readonly username: string;
  readonly role: StaffRole;
  /** Agents only: the manager they report to (same domain). */
  readonly managerId: string | null;
  readonly managerName: string | null;
  readonly active: boolean;
  readonly openCases: number;
  readonly completedThisMonth: number;
  /** Share of cases closed within the SLA turnaround, 0-100. */
  readonly slaPercent: number;
  readonly joinedAt: string;
  readonly lastLoginAt: string | null;
  /** When an administrator last revealed this account's password; every view is recorded. */
  readonly passwordViewedAt?: string | null;
}

export interface NewStaffInput {
  readonly fullName: string;
  readonly username: string;
  readonly role: StaffRole;
  readonly managerId: string | null;
  /** The sign-in password the administrator sets. Sent once over HTTPS; the server stores only a hash. */
  readonly password: string;
}

/** Same fields as a new account; an empty password keeps the current one. */
export type UpdateStaffInput = NewStaffInput;
