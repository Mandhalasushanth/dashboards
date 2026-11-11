import { COMPANY_REGISTRATION_FORM } from './forms/incorporationForms';
import { GST_AMENDMENT_FORM, GST_CANCELLATION_FORM, GST_CERTIFICATE_FORM, GST_COMPLIANCE_FORM, GST_FILING_FORM } from './forms/gstServiceForms';
import { ITR_FILING_FORM, PREVIOUS_YEAR_ITR_FORM, REVISED_ITR_FORM, TAX_NOTICE_FORM, TDS_REFUND_FORM } from './forms/itrServiceForms';
import {
  BUSINESS_LOAN_FORM,
  HOME_LOAN_FORM,
  MACHINERY_LOAN_FORM,
  MSME_LOAN_FORM,
  PERSONAL_LOAN_FORM,
  PROPERTY_LOAN_FORM,
  VEHICLE_LOAN_FORM,
  WORKING_CAPITAL_FORM
} from './forms/loanServiceForms';
import { GST_REGISTRATION_DOCUMENTS, GST_REGISTRATION_FIELDS } from './gstRegistrationForm';
import type { IntakeField } from './workflowServices';
import type { ServiceKind } from './workflow.types';

/**
 * Service types exactly as the customer mobile app offers them (mobile-app/src/data/services.ts and its
 * GST / ITR flows): same ids, names, form fields, dropdown options and required documents, so what the
 * customer filled in is what the manager sees. Each type belongs to one owning service and team.
 */
export interface ServiceTypeDefinition {
  /** The mobile app's `serviceId`, e.g. "gst-filing". */
  readonly id: string;
  readonly label: string;
  readonly service: ServiceKind;
  /** The mobile app's category heading. */
  readonly mobileCategory: 'GST' | 'ITR' | 'LOANS' | 'INSURANCE' | 'BUSINESS';
  readonly fields: readonly IntakeField[];
  readonly documents: readonly { readonly label: string; readonly required: boolean }[];
}

const text = (id: string, label: string, placeholder = '', required = true): IntakeField => ({ id, label, placeholder, rule: 'name', required, kind: 'text', maxLength: 120 });
const amount = (id: string, label: string, placeholder = 'e.g. 1500000'): IntakeField => ({ id, label, placeholder, rule: 'amount', required: true, kind: 'number', inputMode: 'numeric', maxLength: 12 });
const count = (id: string, label: string, min: number, max: number, placeholder = ''): IntakeField => ({ id, label, placeholder, rule: 'count', required: true, kind: 'number', inputMode: 'numeric', min, max, maxLength: String(max).length });
const dropdown = (id: string, label: string, options: readonly string[]): IntakeField => ({ id, label, placeholder: `Select ${label.toLowerCase()}`, rule: 'option', required: true, kind: 'dropdown', options });

/** "(if any)" documents are optional in the mobile app; everything else must be uploaded. */
const docs = (...labels: string[]) => labels.map((label) => ({ label, required: !/\(if any\)/i.test(label) }));

const YES_NO = ['No', 'Yes'];

export const SERVICE_TYPES: readonly ServiceTypeDefinition[] = Object.freeze([
  // GST — CA team
  {
    id: 'gst-registration', label: 'GST Registration', service: 'GST', mobileCategory: 'GST',
    fields: GST_REGISTRATION_FIELDS,
    documents: GST_REGISTRATION_DOCUMENTS
  },
  {
    id: 'gst-filing', label: 'GST Filing', service: 'GST', mobileCategory: 'GST',
    fields: GST_FILING_FORM.fields,
    documents: GST_FILING_FORM.documents
  },
  {
    id: 'gst-compliance', label: 'GST Compliance', service: 'GST', mobileCategory: 'GST',
    fields: GST_COMPLIANCE_FORM.fields,
    documents: GST_COMPLIANCE_FORM.documents
  },
  {
    id: 'gst-amendment', label: 'GST Amendment', service: 'GST', mobileCategory: 'GST',
    fields: GST_AMENDMENT_FORM.fields,
    documents: GST_AMENDMENT_FORM.documents
  },
  {
    id: 'gst-cancellation', label: 'GST Cancellation', service: 'GST', mobileCategory: 'GST',
    fields: GST_CANCELLATION_FORM.fields,
    documents: GST_CANCELLATION_FORM.documents
  },
  {
    id: 'gst-certificate', label: 'GST Certificate', service: 'GST', mobileCategory: 'GST',
    fields: GST_CERTIFICATE_FORM.fields,
    documents: GST_CERTIFICATE_FORM.documents
  },
  // ITR & TDS — CA team
  {
    id: 'itr-filing', label: 'ITR Filing', service: 'ITR', mobileCategory: 'ITR',
    fields: ITR_FILING_FORM.fields,
    documents: ITR_FILING_FORM.documents
  },
  {
    id: 'tds-refund', label: 'TDS Refund Claim', service: 'ITR', mobileCategory: 'ITR',
    fields: TDS_REFUND_FORM.fields,
    documents: TDS_REFUND_FORM.documents
  },
  {
    id: 'previous-year-itr', label: 'Previous Year ITR', service: 'ITR', mobileCategory: 'ITR',
    fields: PREVIOUS_YEAR_ITR_FORM.fields,
    documents: PREVIOUS_YEAR_ITR_FORM.documents
  },
  {
    id: 'revised-itr', label: 'Revised ITR', service: 'ITR', mobileCategory: 'ITR',
    fields: REVISED_ITR_FORM.fields,
    documents: REVISED_ITR_FORM.documents
  },
  {
    id: 'tax-notice-assistance', label: 'Tax Notice Assistance', service: 'ITR', mobileCategory: 'ITR',
    fields: TAX_NOTICE_FORM.fields,
    documents: TAX_NOTICE_FORM.documents
  },
  // Business — CA team
  {
    id: 'company-registration', label: 'Company Registration', service: 'INCORPORATION', mobileCategory: 'BUSINESS',
    fields: COMPANY_REGISTRATION_FORM.fields,
    documents: COMPANY_REGISTRATION_FORM.documents
  },
  {
    id: 'accounting-bookkeeping', label: 'Accounting & Bookkeeping', service: 'INCORPORATION', mobileCategory: 'BUSINESS',
    fields: [text('businessName', 'Business Name'), count('monthlyTransactions', 'Approx. Monthly Transactions', 1, 1_000_000)],
    documents: docs('Bank Statements', 'Sales Invoices', 'Purchase Bills')
  },
  // Loans — Loan team
  {
    id: 'business-loan', label: 'Business Loan', service: 'LOAN', mobileCategory: 'LOANS',
    fields: BUSINESS_LOAN_FORM.fields,
    documents: BUSINESS_LOAN_FORM.documents
  },
  {
    id: 'personal-loan', label: 'Personal Loan', service: 'LOAN', mobileCategory: 'LOANS',
    fields: PERSONAL_LOAN_FORM.fields,
    documents: PERSONAL_LOAN_FORM.documents
  },
  {
    id: 'working-capital', label: 'Working Capital', service: 'LOAN', mobileCategory: 'LOANS',
    fields: WORKING_CAPITAL_FORM.fields,
    documents: WORKING_CAPITAL_FORM.documents
  },
  {
    id: 'home-loan', label: 'Home Loan', service: 'LOAN', mobileCategory: 'LOANS',
    fields: HOME_LOAN_FORM.fields,
    documents: HOME_LOAN_FORM.documents
  },
  {
    id: 'property-loan', label: 'Property Loan', service: 'LOAN', mobileCategory: 'LOANS',
    fields: PROPERTY_LOAN_FORM.fields,
    documents: PROPERTY_LOAN_FORM.documents
  },
  {
    id: 'vehicle-loan', label: 'Vehicle Loan', service: 'LOAN', mobileCategory: 'LOANS',
    fields: VEHICLE_LOAN_FORM.fields,
    documents: VEHICLE_LOAN_FORM.documents
  },
  {
    id: 'machinery-loan', label: 'Machinery Loan', service: 'LOAN', mobileCategory: 'LOANS',
    fields: MACHINERY_LOAN_FORM.fields,
    documents: MACHINERY_LOAN_FORM.documents
  },
  {
    id: 'msme-loan', label: 'MSME Loan', service: 'LOAN', mobileCategory: 'LOANS',
    fields: MSME_LOAN_FORM.fields,
    documents: MSME_LOAN_FORM.documents
  },
  // Insurance — Loan team
  {
    id: 'health-insurance', label: 'Health Insurance', service: 'INSURANCE', mobileCategory: 'INSURANCE',
    fields: [count('insuredCount', 'Number of members to insure', 1, 20), count('eldestAge', 'Age of eldest member', 0, 120), dropdown('preExisting', 'Any pre-existing illness?', YES_NO)],
    documents: docs('Aadhaar Card', 'PAN Card', 'Previous Insurance Policy (if any)')
  },
  {
    id: 'life-insurance', label: 'Life Insurance', service: 'INSURANCE', mobileCategory: 'INSURANCE',
    fields: [amount('sumAssured', 'Desired Sum Assured (₹)', 'e.g. 10000000'), dropdown('tobacco', 'Do you consume tobacco?', YES_NO), dropdown('occupation', 'Occupation Type', ['Salaried', 'Self-Employed', 'Business Owner'])],
    documents: docs('Aadhaar Card', 'PAN Card', 'Income Proof (Payslips/ITR)')
  }
]);

const BY_ID = new Map(SERVICE_TYPES.map((type) => [type.id, type]));

/** Unknown ids (e.g. a service the app adds later) fall back to the owning service's first type. */
export function getServiceType(id: string, service?: ServiceKind): ServiceTypeDefinition {
  return BY_ID.get(id) ?? SERVICE_TYPES.find((type) => type.service === service) ?? SERVICE_TYPES[0];
}

export function serviceTypesFor(service: ServiceKind): readonly ServiceTypeDefinition[] {
  return SERVICE_TYPES.filter((type) => type.service === service);
}

/** Every distinct required document across a service's types, for the service catalog. */
export function requiredDocumentsFor(service: ServiceKind): readonly string[] {
  return [...new Set(serviceTypesFor(service).flatMap((type) => type.documents.filter((doc) => doc.required).map((doc) => doc.label)))];
}
