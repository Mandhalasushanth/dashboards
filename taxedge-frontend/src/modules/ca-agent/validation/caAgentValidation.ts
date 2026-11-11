import type { QueueEntry, ServiceKind } from '@/modules/workflow';
import { CA_AGENT_SERVICES } from '../shared/caAgent.config';

/** Server case ids and reference numbers: letters, digits and hyphens only. */
const CASE_ID_PATTERN = /^[A-Za-z0-9-]{3,64}$/;

export function isValidCaseId(value: string | null): value is string {
  return value !== null && CASE_ID_PATTERN.test(value);
}

/** Accepts only services this workspace owns, so a crafted link cannot widen the queue's scope. */
export function parseCaAgentService(value: string | null): ServiceKind | null {
  return CA_AGENT_SERVICES.find((kind) => kind === value) ?? null;
}

/** Validates deep-link parameters (e.g. from a notification) before they reach a queue. */
export function parseCaAgentQueueParams(params: URLSearchParams): QueueEntry {
  const caseId = params.get('case');
  return { caseId: isValidCaseId(caseId) ? caseId : null, service: parseCaAgentService(params.get('service')) };
}
