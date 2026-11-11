import { API_ENDPOINTS, ApiError, apiClient } from '@/core/api';
import { environment } from '@/core/config/environment';
import { GST_REGISTRATION_FIELDS } from '../shared/gstRegistrationForm';
import type { CaseIntakeInput } from '../shared/workflow.types';

/**
 * Turns the backend's GST registration record (the same DTO the mobile app saves, see
 * mobile-app/src/modules/gst/gst-registration/utils/gstRegistrationMapper.ts) into the case details the
 * dashboard shows. Field ids already equal the DTO keys; only enum codes become the app's labels.
 */
export type GstRegistrationDto = Readonly<Record<string, string | boolean | null | undefined>>;

const CODE_LABELS: Readonly<Record<string, Readonly<Record<string, string>>>> = Object.freeze({
  constitutionOfBusiness: {
    PROPRIETORSHIP: 'Proprietorship',
    PARTNERSHIP: 'Partnership Firm',
    LLP: 'Limited Liability Partnership (LLP)',
    PRIVATE_LIMITED_COMPANY: 'Private Limited Company',
    PUBLIC_LIMITED_COMPANY: 'Public Limited Company',
    HUF: 'HUF',
    SOCIETY_TRUST_CLUB: 'Society / Trust / Club',
    AOP_BOI: 'AOP / BOI',
    GOVERNMENT_DEPARTMENT: 'Government Department',
    FOREIGN_COMPANY: 'Foreign Company',
    ONE_PERSON_COMPANY: 'One Person Company (OPC)'
  },
  natureOfBusiness: {
    TRADER: 'Trader',
    MANUFACTURER: 'Manufacturer',
    SERVICE_PROVIDER: 'Service Provider',
    RETAILER: 'Retailer',
    E_COMMERCE: 'E-commerce',
    WORK_CONTRACT: 'Contractor / Freelancer',
    IMPORT_EXPORT: 'Exporter / Importer',
    WARE_HOUSE_DEPOT: 'Wholesaler / Distributor'
  },
  reasonForRegistration: {
    CROSSED_TURN_OVER_THRESHOLD: 'Crossed turnover threshold',
    VOLUNTARY_REGISTRATION: 'Voluntary registration',
    INTER_STATE_SUPPLY: 'Inter-state supply',
    ECOMMERCE_OPERATOR_SELLER: 'E-commerce operator / seller',
    CASUAL_TAXABLE_PERSON: 'Casual taxable person',
    INPUT_SERVICE_DISTRIBUTOR: 'Input Service Distributor'
  },
  compositionScheme: { YES_COMPOSITION_SCHEME: 'Yes - composition scheme', NO_REGULAR_SCHEME: 'No - regular scheme' },
  placeOfBusiness: { PRINCIPAL_PLACE_OF_BUSINESS: 'Principal place of business', ADDITIONAL_PLACE_OF_BUSINESS: 'Additional place of business' },
  accountType: { CURRENT: 'Current', SAVINGS: 'Savings', CASH_CREDIT_OD: 'Cash Credit / OD' }
});

/** Dates arrive as YYYY-MM-DD; DD-MM-YYYY (the app's display form) is turned around. */
const toIsoDate = (value: string): string => {
  const match = /^(\d{2})[-/](\d{2})[-/](\d{4})$/.exec(value);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
};

const toText = (value: string | boolean | null | undefined): string => {
  if (typeof value === 'boolean') {
    return value ? 'Given' : 'Not given';
  }
  return (value ?? '').toString().trim();
};

/** Codes without an entry above (e.g. YES, RENTAL_AGREEMENT) read as words: "Yes", "Rental Agreement". */
const toWords = (code: string): string =>
  /^[A-Z0-9_]+$/.test(code) && /[A-Z]/.test(code)
    ? code.split('_').filter(Boolean).map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
    : code;

/** Backend enum values shown in plain text fields, so they are reworded like dropdown answers. */
const CODED_FIELDS: ReadonlySet<string> = new Set(['status', 'customer.gender', 'customer.customerType']);

const DATE_TIME =new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/** "customer.name" reads the nested customer block; every other id is a top-level DTO key. */
const readField = (dto: GstRegistrationDto, id: string): string | boolean | null | undefined => {
  if (!id.startsWith('customer.')) return dto[id];
  const customer = (dto as GstRegistrationRecord).customer;
  return customer ? customer[id.slice('customer.'.length)] : undefined;
};

const toDetail = (dto: GstRegistrationDto, id: string, rule: string): string => {
  const raw = toText(readField(dto, id));
  const label = CODE_LABELS[id]?.[raw.toUpperCase()];
  if (label) {
    return label;
  }
  if (id === 'submittedAt' && raw && !Number.isNaN(Date.parse(raw))) {
    return DATE_TIME.format(Date.parse(raw));
  }
  if (rule === 'date') {
    return toIsoDate(raw);
  }
  // Only coded answers are reworded; names, ids and addresses are shown exactly as the customer typed them.
  return rule === 'option' || CODED_FIELDS.has(id) ? toWords(raw) : raw;
};

export function gstRegistrationDetails(dto: GstRegistrationDto): Record<string, string> {
  const details = Object.fromEntries(GST_REGISTRATION_FIELDS.map((field) => [field.id, toDetail(dto, field.id, field.rule)]));
  // The backend does not store the consent tick, but the mobile app will not let a customer past the
  // business step without it, so any registration that left the draft stage was given consent.
  if (!details.aadhaarConsent && toText(dto.status) && toText(dto.status).toUpperCase() !== 'DRAFT') {
    details.aadhaarConsent = 'Given';
  }
  return details;
}

/** The customer block GstDashboardController puts on every record. */
type CustomerDto = Readonly<Record<string, string | null | undefined>>;
type GstRegistrationRecord = GstRegistrationDto & { readonly customer?: CustomerDto | null };

/** A backend GST registration ready to enter the dashboard's application list, keyed by its gstId. */
export interface ImportedApplication {
  /** The backend id, shown as the Application ID. */
  readonly sourceId: string;
  /** The dashboard case id; GST registrations leave it out and get "GST-REG-<gstId>". */
  readonly caseId?: string;
  /** When the customer submitted it (the record's creation time while it is still a draft). */
  readonly submittedAt: string | null;
  /** When the database record last changed. */
  readonly updatedAt: string | null;
  readonly intake: CaseIntakeInput;
  /** The uploaded files as base64, in the order of the service type's documents; null where none was uploaded. */
  readonly files: readonly (string | null)[];
}

/** The DTO's document fields, in the same order as GST_REGISTRATION_DOCUMENTS. */
const DOCUMENT_FIELDS = Object.freeze([
  'panCard',
  'aadhaarCard',
  'businessRegistrationProof',
  'principalPlaceAddressProof',
  'bankPassbookOrCancelledCheque',
  'passportSizePhotograph'
]);

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

function toImportedApplication(record: GstRegistrationRecord): ImportedApplication | null {
  const sourceId = text(record.gstId);
  if (!sourceId) {
    return null;
  }
  const customer = record.customer ?? {};
  return {
    sourceId,
    submittedAt: text(record.submittedAt) || text(record.createdAt) || null,
    updatedAt: text(record.updatedAt) || text(record.submittedAt) || text(record.createdAt) || null,
    intake: {
      service: 'GST',
      serviceType: 'gst-registration',
      client: {
        custId: text(customer.customerId) || text(customer.custId) || undefined, // the customer block calls it customerId
        name: text(customer.name) || text(record.legalName) || text(record.tradeName),
        email: text(customer.email) || text(record.signatoryEmail),
        mobile: text(customer.mobileNumber) || text(record.signatoryMobile),
        pan: (text(record.businessPan) || text(customer.pan)).toUpperCase(),
        city: text(record.city) || text(customer.city)
      },
      details: gstRegistrationDetails(record)
    },
    files: DOCUMENT_FIELDS.map((field) => text(record[field]) || null)
  };
}

/** GET /api/v1/ca-manager/gst-registrations: every GST registration customers saved in the mobile app. */
export function fetchGstRegistrations(): Promise<ImportedApplication[]> {
  return fetchRegistrations(API_ENDPOINTS.caManager.gstRegistrations);
}

/** GET /api/v1/agent/gst-registrations/{agentId}: the GST registrations assigned to that agent in the backend. */
export function fetchAgentGstRegistrations(agentId: string): Promise<ImportedApplication[]> {
  return fetchRegistrations(API_ENDPOINTS.agent.gstRegistrations(agentId));
}

/** applicationType values AgentAssignmentController accepts, by the dashboard case-id prefix of each GST list. */
const ASSIGNMENT_TYPES: readonly (readonly [string, string])[] = [
  ['GST-REG-', 'GST_REGISTRATION'],
  ['GST-FIL-', 'GST_FILING'],
  ['GST-COM-', 'GST_COMPLIANCE'],
  ['GST-AMD-LEGAL-NAME-', 'LEGAL_NAME_AMENDMENT'],
  ['GST-AMD-PRINCIPAL-PLACE-', 'PRINCIPAL_PLACE_AMENDMENT'],
  ['GST-AMD-ADDITIONAL-PLACE-', 'ADDITIONAL_PLACE_AMENDMENT'],
  ['GST-AMD-BANK-', 'BANK_ACCOUNT_AMENDMENT'],
  ['GST-AMD-SIGNATORY-', 'SIGNATORY_AMENDMENT'],
  ['GST-AMD-CONTACT-', 'CONTACT_AMENDMENT'],
  ['ITR-FIL-', 'ITR_FILING'],
  ['ITR-TDS-', 'TDS_REFUND'],
  ['ITR-REV-', 'REVISED_ITR'],
  ['INC-REG-', 'COMPANY_REGISTRATION']
];

/** registrationType the assign endpoint routes on, by case-id prefix; everything else is GST. */
const REGISTRATION_TYPES: readonly (readonly [string, 'ITR' | 'COMPANY'])[] = [
  ['ITR-', 'ITR'],
  ['INC-', 'COMPANY']
];

/** The backend application id and type behind a dashboard case id, or null for a case the backend does not hold. */
export function backendApplicationOf(
  caseId: string
): { readonly applicationId: string; readonly applicationType: string; readonly registrationType: 'GST' | 'ITR' | 'COMPANY' } | null {
  const match = ASSIGNMENT_TYPES.find(([prefix]) => caseId.startsWith(prefix));
  if (!match) return null;
  const registrationType = REGISTRATION_TYPES.find(([prefix]) => caseId.startsWith(prefix))?.[1] ?? 'GST';
  return { applicationId: caseId.slice(match[0].length), applicationType: match[1], registrationType };
}

/**
 * PUT /api/v1/ca-manager/assign?registrationType=GST|ITR|COMPANY: records the assignment in the database. The endpoint
 * answers with plain text, which apiClient rejects as a non-JSON reply, so only the status is read.
 */
export async function assignGstApplication(caseId: string, agentId: string): Promise<void> {
  const application = backendApplicationOf(caseId);
  if (!application) return;
  const response = await fetch(`${environment.apiBaseUrl}${API_ENDPOINTS.caManager.assignAgent(application.registrationType)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/plain' },
    body: JSON.stringify({ applicationId: application.applicationId, agentId: Number(agentId), applicationType: application.applicationType })
  }).catch(() => {
    throw new ApiError('NETWORK_ERROR', 'The server could not be reached, so the assignment was not saved. Try again.');
  });
  if (!response.ok) {
    const reason = (await response.text().catch(() => '')).trim();
    throw new ApiError('SERVER_ERROR', `The assignment was not saved (HTTP ${response.status})${reason && reason.length < 200 ? `: ${reason}` : ''}. Try again.`, response.status);
  }
}

async function fetchRegistrations(path: string): Promise<ImportedApplication[]> {
  const records = await apiClient.get<unknown>(path);
  if (!Array.isArray(records)) {
    return [];
  }
  return (records as GstRegistrationRecord[]).map(toImportedApplication).filter((item): item is ImportedApplication => item !== null);
}
