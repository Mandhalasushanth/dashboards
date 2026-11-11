import { API_ENDPOINTS, ApiError } from '@/core/api';
import { environment } from '@/core/config/environment';
import { loadChatCredentials } from '@/modules/authentication';
import { backendApplicationOf } from './backendApplications';

/**
 * CaManagerBucketController (/api/v1/bucket): "Take application" saves the application in the manager's bucket,
 * and the bucket lists tell every screen which manager took which application. Calls are made with the access
 * token from sign-in; a demo sign-in has none, so these calls are skipped and the take stays in this browser.
 */
const { bucket: ENDPOINTS } = API_ENDPOINTS;

/** The type prefix of each dashboard case id, so a bucket item can be turned back into its case id. */
const CASE_PREFIXES: Readonly<Record<string, string>> = Object.freeze({
  GST_REGISTRATION: 'GST-REG-',
  GST_FILING: 'GST-FIL-',
  GST_COMPLIANCE: 'GST-COM-',
  LEGAL_NAME_AMENDMENT: 'GST-AMD-LEGAL-NAME-',
  PRINCIPAL_PLACE_AMENDMENT: 'GST-AMD-PRINCIPAL-PLACE-',
  ADDITIONAL_PLACE_AMENDMENT: 'GST-AMD-ADDITIONAL-PLACE-',
  BANK_ACCOUNT_AMENDMENT: 'GST-AMD-BANK-',
  SIGNATORY_AMENDMENT: 'GST-AMD-SIGNATORY-',
  CONTACT_AMENDMENT: 'GST-AMD-CONTACT-',
  ITR_FILING: 'ITR-FIL-',
  TDS_REFUND: 'ITR-TDS-',
  REVISED_ITR: 'ITR-REV-',
  COMPANY_REGISTRATION: 'INC-REG-'
});

/** One application a manager has taken, as the bucket holds it. */
export interface BucketClaim {
  readonly caseId: string;
  /** The bucket row id, needed to hand the application over to another manager. */
  readonly itemId: string;
  readonly managerId: string;
  readonly managerName: string;
  readonly takenAt: string;
  /** What the manager chose when assigning, as the bucket row holds it. */
  readonly priority: string | null;
  readonly notes: string | null;
  readonly dueDate: string | null;
  readonly assignedAgentId: string | null;
  readonly updatedAt: string | null;
  /** The customer who made the application (their id is their chat address), when the row has one. */
  readonly customer: { readonly id: string; readonly name: string; readonly email: string } | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * The bucket endpoints are open, but the server rejects an expired token on them. So a call is tried with the token
 * (it tells the server which manager is asking) and, when answered 401, once more without it.
 */
async function bucketFetch(url: string, init: Omit<RequestInit, 'headers'>, token: string, json = false): Promise<Response> {
  const response = await fetch(url, { ...init, headers: headers(token, json) });
  if (response.status !== 401) return response;
  const open = headers(token, json);
  open.delete('Authorization');
  return fetch(url, { ...init, headers: open });
}

function headers(token: string, json = false): Headers {
  const result = new Headers({ Accept: 'application/json, text/plain', Authorization: `Bearer ${token}` });
  if (json) result.set('Content-Type', 'application/json');
  return result;
}

async function failure(response: Response, what: string): Promise<ApiError> {
  const reason = (await response.text().catch(() => '')).trim();
  return new ApiError('SERVER_ERROR', `${what} (HTTP ${response.status})${reason && reason.length < 200 ? `: ${reason}` : ''}. Try again.`, response.status);
}

const unreachable = () => new ApiError('NETWORK_ERROR', 'The server could not be reached, so the application was not taken. Try again.');

/** True when this sign-in can call the bucket endpoints (a real sign-in, not a demo account). */
export const canUseBucket = (): boolean => loadChatCredentials() !== null;

/** POST /api/v1/bucket/add: puts the application in the signed-in manager's bucket. Cases the backend does not hold are skipped. */
export async function addToBucket(caseId: string): Promise<boolean> {
  const credentials = loadChatCredentials();
  const application = backendApplicationOf(caseId);
  if (!credentials || !application) return false;
  const response = await bucketFetch(
    `${environment.apiBaseUrl}${ENDPOINTS.add}`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        applicationId: application.applicationId,
        applicationCategory: application.registrationType,
        applicationType: application.applicationType,
        managerId: Number(credentials.id),
        stage: 'NEW'
      })
    },
    credentials.accessToken,
    true
  ).catch(() => {
    throw unreachable();
  });
  if (!response.ok) throw await failure(response, 'The application was not taken');
  return true;
}

/** DELETE /api/v1/bucket/{id}: takes an application out of a bucket (used when another manager takes it over). */
export async function removeFromBucket(itemId: string): Promise<void> {
  const credentials = loadChatCredentials();
  if (!credentials) return;
  const response = await bucketFetch(`${environment.apiBaseUrl}${ENDPOINTS.item(itemId)}`, { method: 'DELETE', credentials: 'include' }, credentials.accessToken).catch(() => {
    throw unreachable();
  });
  if (!response.ok) throw await failure(response, 'The application could not be handed over');
}

/**
 * GET /api/v1/bucket/manager/0: the signed-in manager's bucket, or every manager's when the server cannot tie the
 * token to one manager (the administrator). Items that are not tied to a manager are ignored.
 */
export async function fetchBucketClaims(): Promise<BucketClaim[]> {
  const credentials = loadChatCredentials();
  if (!credentials) return [];
  const response = await bucketFetch(`${environment.apiBaseUrl}${ENDPOINTS.byManager('0')}`, { credentials: 'include', cache: 'no-store' }, credentials.accessToken);
  if (!response.ok) return [];
  const items: unknown = await response.json();
  if (!Array.isArray(items)) return [];
  const claims: BucketClaim[] = [];
  for (const item of items) {
    if (!isRecord(item) || !isRecord(item.manager)) continue;
    const prefix = typeof item.applicationType === 'string' ? CASE_PREFIXES[item.applicationType] : undefined;
    if (!prefix || typeof item.applicationId !== 'string' || item.manager.id === undefined) continue;
    claims.push({
      caseId: prefix + item.applicationId,
      itemId: String(item.id),
      managerId: String(item.manager.id),
      managerName: typeof item.manager.fullName === 'string' ? item.manager.fullName : 'Manager',
      takenAt: typeof item.addedAt === 'string' ? item.addedAt : new Date().toISOString(),
      priority: typeof item.priority === 'string' ? item.priority : null,
      notes: typeof item.notes === 'string' && item.notes.trim() ? item.notes : null,
      dueDate: typeof item.dueDate === 'string' ? item.dueDate : null,
      assignedAgentId: isRecord(item.assignedAgent) && item.assignedAgent.id !== undefined ? String(item.assignedAgent.id) : null,
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : null,
      customer:
        isRecord(item.customer) && typeof item.customer.custId === 'string'
          ? {
              id: item.customer.custId,
              name: typeof item.customer.name === 'string' ? item.customer.name : item.customer.custId,
              email: typeof item.customer.email === 'string' ? item.customer.email : ''
            }
          : null
    });
  }
  return claims;
}

/** The fields PUT /api/v1/bucket/{id} accepts (UpdateBucketRequestDto); anything left out is kept as it is. */
export interface BucketUpdate {
  readonly priority?: string;
  readonly notes?: string;
  /** YYYY-MM-DD. */
  readonly dueDate?: string;
  readonly agentId?: number;
}

/** PUT /api/v1/bucket/{id}: saves the priority, note, due date and agent chosen when assigning. */
export async function updateBucketItem(itemId: string, update: BucketUpdate): Promise<void> {
  const credentials = loadChatCredentials();
  if (!credentials) return;
  const response = await bucketFetch(
    `${environment.apiBaseUrl}${ENDPOINTS.item(itemId)}`,
    { method: 'PUT', credentials: 'include', body: JSON.stringify(update) },
    credentials.accessToken,
    true
  ).catch(() => {
    throw unreachable();
  });
  if (!response.ok) throw await failure(response, 'The assignment details were not saved');
}
