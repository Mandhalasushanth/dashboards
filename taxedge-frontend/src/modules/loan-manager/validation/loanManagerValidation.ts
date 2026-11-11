import type { QueueEntry, ServiceKind } from '@/modules/workflow';
import { LOAN_MANAGER_SERVICES } from '../shared/loanManager.config';

/** Server case ids and reference numbers: letters, digits and hyphens only. */
const CASE_ID_PATTERN = /^[A-Za-z0-9-]{3,64}$/;

export function isValidCaseId(value: string | null): value is string {
  return value !== null && CASE_ID_PATTERN.test(value);
}

/** Accepts only services this workspace owns, so a crafted link cannot widen the queue's scope. */
export function parseLoanManagerService(value: string | null): ServiceKind | null {
  return LOAN_MANAGER_SERVICES.find((kind) => kind === value) ?? null;
}

/** Validates deep-link parameters (e.g. from a notification) before they reach a queue. */
export function parseLoanManagerQueueParams(params: URLSearchParams): QueueEntry {
  const caseId = params.get('case');
  return { caseId: isValidCaseId(caseId) ? caseId : null, service: parseLoanManagerService(params.get('service')) };
}
