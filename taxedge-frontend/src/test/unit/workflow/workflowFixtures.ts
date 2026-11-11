import { vi } from 'vitest';
import { DEMO_STAFF_STORAGE_KEY } from '@/modules/admin/dev/demoStaffStore';
import type { StaffMember } from '@/modules/admin/shared/staff.types';

/**
 * Shared fixtures for the workflow tests. There are no predefined managers or agents any more, so each
 * test starts with the team an administrator would have created: two CA managers, two CA agents under
 * different managers, and one loan manager with one loan agent.
 */

/** In-memory stand-ins for browser storage, timers and focus events, so the demo backends run under Node. */
export function installMemoryBrowser(): void {
  const local = new Map<string, string>();
  const session = new Map<string, string>();
  const storage = (data: Map<string, string>) => ({
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key)
  });
  vi.stubGlobal('window', {
    localStorage: storage(local),
    sessionStorage: storage(session),
    setTimeout: (handler: () => void) => setTimeout(handler, 0),
    clearTimeout,
    setInterval: () => 0,
    clearInterval: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined
  });
  vi.stubGlobal('document', { visibilityState: 'visible', addEventListener: () => undefined, removeEventListener: () => undefined });
  vi.stubGlobal('URL', { ...URL, createObjectURL: () => 'blob:demo', revokeObjectURL: () => undefined });
}

const member = (id: string, fullName: string, username: string, role: StaffMember['role'], managerId: string | null, managerName: string | null): StaffMember => ({
  id,
  fullName,
  username,
  role,
  managerId,
  managerName,
  active: true,
  openCases: 0,
  completedThisMonth: 0,
  slaPercent: 0,
  joinedAt: '2026-01-01T00:00:00.000Z',
  lastLoginAt: null
});

export const TEAM: readonly StaffMember[] = Object.freeze([
  member('MGR-101', 'Sanjay Verma', 'camanager@gmail.com', 'CA_MANAGER', null, null),
  member('MGR-102', 'Neha Kulkarni', 'camanager2@gmail.com', 'CA_MANAGER', null, null),
  member('AGT-301', 'Suresh Kumar', 'caagent@gmail.com', 'CA_AGENT', 'MGR-101', 'Sanjay Verma'),
  member('AGT-302', 'Priya Sharma', 'caagent2@gmail.com', 'CA_AGENT', 'MGR-102', 'Neha Kulkarni'),
  member('MGR-201', 'Ananya Deshmukh', 'loanmanager@gmail.com', 'LOAN_MANAGER', null, null),
  member('AGT-401', 'Rajesh Patel', 'loanagent@gmail.com', 'LOAN_AGENT', 'MGR-201', 'Ananya Deshmukh')
]);

/** Writes the team into the admin staff directory, exactly where Admin → Managers / Agents saves it. */
export function seedTeam(): void {
  window.localStorage.setItem(DEMO_STAFF_STORAGE_KEY, JSON.stringify(TEAM));
}

/** A GST Filing as the mobile app submits it (GstFilingPayload keys). */
export const GST_FILING_DETAILS: Readonly<Record<string, string>> = Object.freeze({
  gstin: '27AAKFA1234M1Z3',
  financialYear: 'FY 2025-26',
  filingFrequency: 'Monthly',
  filingPeriod: 'August 2026',
  returnType: 'GSTR-3B',
  filingType: 'Regular Return',
  taxCalculationMethod: 'TaxEdge CA calculation'
});

/** A Home Loan as the mobile app submits it: the shared applicant KYC plus the loan requirement. */
export const HOME_LOAN_DETAILS: Readonly<Record<string, string>> = Object.freeze({
  fullName: 'Ravi Kumar',
  mobile: '9123456780',
  email: 'ravi@example.com',
  pan: 'BXJPK4417F',
  dob: '1988-05-10',
  'currentAddress.houseNumber': '14',
  'currentAddress.street': 'MI Road',
  'currentAddress.city': 'Jaipur',
  'currentAddress.state': 'Rajasthan',
  'currentAddress.pincode': '302001',
  isPermanentSameAsCurrent: 'Yes',
  loanAmount: '4500000',
  purpose: 'Purchase a New Home',
  propertyStatus: 'Property Identified',
  approximatePropertyValue: '6500000'
});
