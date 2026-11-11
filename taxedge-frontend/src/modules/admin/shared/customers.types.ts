import type { CaseStatus, ServiceKind } from '@/modules/workflow';

/** Holder type, from the 4th character of the PAN (P = individual, C = company, F = firm/LLP …). */
export type CustomerEntityType = 'INDIVIDUAL' | 'COMPANY' | 'FIRM' | 'HUF' | 'TRUST' | 'OTHER';

export const ENTITY_TYPE_LABELS: Readonly<Record<CustomerEntityType, string>> = Object.freeze({
  INDIVIDUAL: 'Individual',
  COMPANY: 'Company',
  FIRM: 'Firm / LLP',
  HUF: 'HUF',
  TRUST: 'Trust',
  OTHER: 'Other entity'
});

/** PAN 4th-character codes as issued by the Income Tax Department. */
const PAN_HOLDER_TYPES: Readonly<Record<string, CustomerEntityType>> = Object.freeze({
  P: 'INDIVIDUAL',
  C: 'COMPANY',
  F: 'FIRM',
  H: 'HUF',
  T: 'TRUST'
});

export function entityTypeFromPan(pan: string): CustomerEntityType {
  return PAN_HOLDER_TYPES[pan.charAt(3).toUpperCase()] ?? 'OTHER';
}

export interface CustomerApplication {
  readonly caseId: string;
  readonly referenceNumber: string;
  readonly service: ServiceKind;
  /** The customer app's service id, e.g. "home-loan". */
  readonly serviceType: string;
  readonly status: CaseStatus;
  readonly submittedAt: string;
  readonly updatedAt: string;
}

export interface Customer {
  /** The customer's id in the backend (their PAN when the record has none); one person is one row. */
  readonly id: string;
  readonly name: string;
  readonly pan: string;
  readonly email: string;
  readonly mobile: string;
  readonly city: string;
  readonly entityType: CustomerEntityType;
  readonly applications: readonly CustomerApplication[];
  readonly openCount: number;
  readonly completedCount: number;
  readonly firstSeenAt: string;
  readonly lastActivityAt: string;
}

export type CustomerTypeFilter = 'ALL' | CustomerEntityType;
export type CustomerActivityFilter = 'ALL' | 'OPEN' | 'NO_OPEN';
export type CustomerServiceFilter = 'ALL' | ServiceKind;
