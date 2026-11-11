import { apiClient } from '@/core/api';
import { getServiceType } from '../shared/serviceTypes';
import type { ServiceKind } from '../shared/workflow.types';
import type { ImportedApplication } from './backendApplications';

/**
 * The CA manager's other lists, turned into dashboard applications the same way GST registrations are:
 * GST filings, compliance and the six amendment types (GstDashboardController), and ITR filings, TDS
 * refunds and revised returns (ItrDashboardController), and company registrations
 * (CompanyRegistrationDashboardController). Each backend record
 * fills the form the dashboard already has for that service type, and its uploaded files fill that form's
 * documents in order.
 */
type Dto = Readonly<Record<string, unknown>>;

interface ServiceSpec {
  /** GET path under /api/v1 for the CA manager's full list. */
  readonly path: string;
  /** GET path under /api/v1 for one agent's assigned list (AgentDashboardController), without the agent id. */
  readonly agentPath: string;
  /** The service the list belongs to; GST when left out. */
  readonly service?: ServiceKind;
  readonly serviceType: string;
  /** Prefix of the dashboard case id; amendment ids are only unique within their own table. */
  readonly casePrefix: string;
  /** The record's id field; its value is shown as the Application ID exactly as the backend sends it. */
  readonly idField: string;
  /** Form field id <- DTO key; "customer.<key>" reads the customer's profile on the record. */
  readonly fields: Readonly<Record<string, string>>;
  /** DTO keys of the uploaded files, in the order of the service type's documents. */
  readonly files: readonly string[];
  /** Fixed details, such as the amendment section this list belongs to. */
  readonly fixed?: Readonly<Record<string, string>>;
  /** Details worked out from the whole record, e.g. one line per share allocation. */
  readonly extra?: (record: Dto) => Record<string, string>;
}

/** How many directors and share allocations the Company Registration form has room for. */
const MAX_DIRECTORS = 5;
const INR_AMOUNT = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

/** directors.N.<form field> <- directors.N.<backend field>, for every director the form can show. */
const directorFields = (): Record<string, string> =>
  Object.fromEntries(
    Array.from({ length: MAX_DIRECTORS }, (_, index) =>
      [
        ['name', 'fullName'],
        ['pan', 'panNumber'],
        ['email', 'emailAddress'],
        ['phone', 'mobileNumber'],
        ['dob', 'dateOfBirth'],
        ['designation', 'designation'],
        ['din', 'din'],
        ['relationship', 'relationship'],
        ['aadhaar', 'aadhaarNumber']
      ].map(([field, key]) => [`directors.${index}.${field}`, `directors.${index}.${key}`])
    ).flat()
  );

/** "Asha Rao · 1,000 shares · ₹10,000" for each share allocation of a company registration. */
function shareholdingLines(record: Dto): Record<string, string> {
  const allocations = Array.isArray(record.shareholdingPattern) ? (record.shareholdingPattern as Dto[]) : [];
  return Object.fromEntries(
    allocations.slice(0, MAX_DIRECTORS).map((allocation, index) => {
      const shares = Number(allocation.allocatedShares);
      const amount = Number(allocation.amount);
      const parts = [
        text(allocation.directorName) || 'Shareholder',
        Number.isFinite(shares) ? `${shares.toLocaleString('en-IN')} shares` : '',
        Number.isFinite(amount) ? INR_AMOUNT.format(amount) : ''
      ].filter(Boolean);
      return [`shareholding.${index}`, parts.join(' · ')];
    })
  );
}

const AMENDMENT_FILES = ['imageData'];

const SPECS: readonly ServiceSpec[] = Object.freeze([
  {
    path: '/ca-manager/gst-filings',
    agentPath: '/agent/gst-filings',
    serviceType: 'gst-filing',
    casePrefix: 'GST-FIL-',
    idField: 'gstfilingId',
    fields: {
      gstin: 'gstin',
      financialYear: 'financialYear',
      filingFrequency: 'filingFrequency',
      filingPeriod: 'filingPeriod',
      returnType: 'returnType',
      filingType: 'filingType',
      taxCalculationMethod: 'taxCalculationMethod',
      estimatedTaxableSales: 'estimatedTaxableSales',
      estimatedTaxablePurchases: 'estimatedTaxablePurchases',
      estimatedEligibleItc: 'estimatedEligibleItc'
    },
    files: [
      'salesInvoice',
      'creditNotes',
      'debitNotes',
      'einvoiceData',
      'ewayBillData',
      'purchaseInvoices',
      'gstr2bItcStatement',
      'expenseInvoicesAndVouchers',
      'bankStatement',
      'previousGstReturns',
      'previousFilingAcknowledgement',
      'otherSupportingDocuments'
    ]
  },
  {
    path: '/ca-manager/gst-compliance',
    agentPath: '/agent/gst-compliances',
    serviceType: 'gst-compliance',
    casePrefix: 'GST-COM-',
    idField: 'complianceId',
    fields: {
      gstin: 'gstin',
      financialYear: 'financialYear',
      requestType: 'requestType',
      gstr2bRef: 'gstr2bNumber',
      noticeNumber: 'noticeNumber',
      noticeIssueDate: 'noticeIssueDate',
      replyDueDate: 'replyDueDate'
    },
    files: ['reconciliationFile1', 'reconciliationFile2', 'noticeFile']
  },
  amendment('/ca-manager/legal-name-amendments', 'LEGAL-NAME', 'Legal Business Name', { newLegalName: 'newLegalName' }),
  amendment('/ca-manager/principal-place-amendments', 'PRINCIPAL-PLACE', 'Principal Place of Business', {
    newBusinessAddress: 'newBusinessAddress',
    newCity: 'newCity',
    newDistrict: 'newDistrict',
    newState: 'newState',
    newPinCode: 'newPinCode',
    principalNatureOfPremises: 'natureOfPremises'
  }),
  amendment('/ca-manager/additional-place-amendments', 'ADDITIONAL-PLACE', 'Additional Place of Business', {
    address: 'address',
    city: 'city',
    pinCode: 'pinCode',
    natureOfPremises: 'natureOfPremises'
  }),
  amendment('/ca-manager/bank-account-amendments', 'BANK', 'Bank Accounts', {
    newBankName: 'newBankName',
    newBankAccountNumber: 'newBankAccountNumber',
    newIfscCode: 'newIfscCode',
    newAccountType: 'newAccountType'
  }),
  amendment('/ca-manager/signatory-amendments', 'SIGNATORY', 'Authorised Signatories', {
    newSignatoryName: 'newSignatoryName',
    newSignatoryPan: 'newSignatoryPan',
    newSignatoryDob: 'newSignatoryDob',
    newDesignation: 'newDesignation',
    newSignatoryMobile: 'newSignatoryMobile',
    newSignatoryEmail: 'newSignatoryEmail'
  }),
  amendment('/ca-manager/contact-amendments', 'CONTACT', 'Contact Details', { newMobileNumber: 'newMobileNumber', newEmail: 'newEmail' }),
  {
    path: '/ca-manager/itr-filings',
    agentPath: '/agent/itr-filings',
    service: 'ITR',
    serviceType: 'itr-filing',
    casePrefix: 'ITR-FIL-',
    idField: 'itrId',
    fields: {
      // Personal Information comes from the customer's profile.
      pan: 'customer.pan',
      aadhaar: 'customer.aadhaar',
      name: 'customer.name',
      dob: 'customer.dob',
      gender: 'customer.gender',
      address: 'customer.address',
      city: 'customer.city',
      state: 'customer.state',
      pincode: 'customer.pincode',
      mobile: 'customer.mobileNumber',
      email: 'customer.email',
      assessmentYear: 'assessmentYear',
      residentialStatus: 'residentialStatus',
      filingType: 'filingType',
      incomeSource: 'incomeSource',
      bankName: 'bankName',
      accountNumber: 'accountNumber',
      ifscCode: 'ifscCode',
      employerLegalName: 'employerLegalName',
      grossSalary: 'grossSalary',
      exemptAllowances: 'exemptAllowances',
      tdsDeductedByEmployer: 'tdsDeductedByEmployer',
      propertyType: 'propertyClassification',
      annualRentReceived: 'annualRentReceived',
      municipalTaxesPaid: 'municipalTaxesPaid',
      homeLoanInterestPaid: 'homeLoanInterestPaid',
      howDoYouReportThisBusiness: 'howDoYouReportThisBusiness',
      grossTurnover: 'grossTurnover',
      declaredNetProfit: 'declaredNetProfit',
      assetType: 'assetType',
      shortTermGains: 'shortTermGains',
      longTermGains: 'longTermGains',
      savingsInterest: 'savingsInterest',
      fdTermInterest: 'fdTermInterest',
      dividendIncome: 'dividendIncome',
      otherMiscellaneous: 'otherMiscellaneous'
    },
    // In the order of the ITR Filing documents: Form 16, capital gains, business turnover, 26AS, AIS/TIS, bank, payslips.
    files: ['form16PartAPartB', 'capitalGainsStatement', 'businessTurnover', 'form26as', 'aisTis', 'bankAccountStatement', 'salaryPayslips']
  },
  {
    path: '/ca-manager/tds-refunds',
    agentPath: '/agent/tds-refunds',
    service: 'ITR',
    serviceType: 'tds-refund',
    casePrefix: 'ITR-TDS-',
    idField: 'id',
    fields: {
      panNumber: 'customer.pan',
      legalBusinessName: 'legalBusinessName',
      businessPan: 'businessPan',
      aadhaarNumber: 'aadhaarNumber',
      mobileNumber: 'mobileNumber',
      accountHolderName: 'accountHolderName',
      bankName: 'bankName',
      branchName: 'branchName',
      accountNumber: 'accountNumber',
      ifscCode: 'ifscCode',
      accountType: 'accountType'
    },
    files: ['businessPanDocument', 'aadhaarDocument']
  },
  {
    path: '/ca-manager/revised-itrs',
    agentPath: '/agent/revised-itrs',
    service: 'ITR',
    serviceType: 'revised-itr',
    casePrefix: 'ITR-REV-',
    idField: 'revisedItrId',
    fields: {
      acknowledgementNumber: 'itrAcknowledgementNumber',
      assessmentYear: 'assessmentYear',
      revisionReason: 'reason',
      otherReason: 'otherReason',
      salaryBusinessIncome: 'salaryBusinessIncome',
      otherIncome: 'otherIncome',
      sec80c: 'deduction80C',
      sec80d: 'deduction80D',
      homeLoanInterest: 'homeLoanInterest',
      taxableIncome: 'taxableIncome',
      bankAccount: 'bankAccountForRefund',
      ifsc: 'ifscCode'
    },
    files: ['panCard', 'aadhaarCard', 'form16Form16A', 'aisTisStatement', 'bankStatements', 'investmentProofs']
  },
  {
    path: '/ca-manager/company-registrations',
    agentPath: '/agent/company-registrations',
    service: 'INCORPORATION',
    serviceType: 'company-registration',
    casePrefix: 'INC-REG-',
    idField: 'companyRegistrationId',
    fields: {
      companyType: 'companyStructure',
      companyCategory: 'categoryOfCompany',
      companySubCategory: 'subCategoryOfCompany',
      primaryActivity: 'primaryBusinessActivity',
      nicCode: 'nic5DigitCode',
      secondaryActivity: 'secondaryActivity',
      proposedName1: 'proposedCompanyName',
      proposedName2: 'alternativeProposedName',
      registeredAddressLine: 'registeredOffice.buildingPremisesAddressLine',
      registeredCity: 'registeredOffice.city',
      registeredDistrict: 'registeredOffice.district',
      registeredState: 'registeredOffice.state',
      registeredPincode: 'registeredOffice.pinCode',
      premisesOwnership: 'registeredOffice.premisesOwnership',
      companyEmail: 'registeredOffice.companyEmail',
      companyMobile: 'registeredOffice.mobileNumber',
      authorizedCapital: 'shareholdingCapital.authorisedCapital',
      paidUpCapital: 'shareholdingCapital.subscribedCapital',
      numberOfShares: 'shareholdingCapital.authorisedShares',
      faceValuePerShare: 'shareholdingCapital.faceValuePerShare',
      ...directorFields()
    },
    // In the order of the Company Registration documents (the mobile app's eight uploads).
    files: ['panCard', 'identityAddressProof', 'passportPhoto', 'officeAddressProof', 'officeUtilityBill', 'ownerNoc', 'statutoryDocuments', 'aoaEAoa'],
    extra: shareholdingLines
  }
]);

function amendment(path: string, kind: string, section: string, fields: Readonly<Record<string, string>>): ServiceSpec {
  return {
    path,
    agentPath: path.replace('/ca-manager/', '/agent/'),
    serviceType: 'gst-amendment',
    casePrefix: `GST-AMD-${kind}-`,
    idField: 'id',
    fields: { gstin: 'gstNumber', ...fields },
    files: AMENDMENT_FILES,
    fixed: { amendmentSection: section }
  };
}

/** Codes whose dashboard wording is not simply the code in words. */
const LABELS: Readonly<Record<string, string>> = Object.freeze({
  GSTR_1: 'GSTR-1',
  GSTR_3B: 'GSTR-3B',
  REGULAR: 'Regular Return',
  REGULAR_RETURN: 'Regular Return',
  TAXEDGE_CA_CALCULATION: 'TaxEdge CA calculation',
  ESTIMATION_FIGURES: 'Estimation figures',
  NOT_PROVIDED: 'Not provided',
  CASH_CREDIT_OD: 'Cash Credit',
  '139_1_original': 'Original Return – 139(1)',
  '139_4_belated': 'Belated Return – 139(4)',
  '139_5_revised': 'Revised Return – 139(5)',
  '139_8a_updated': 'Updated Return – 139(8A)',
  NRI: 'NRI',
  RNOR: 'RNOR',
  EQUITY_MUTUAL_FUNDS: 'Equity / Mutual Funds',
  FNO_INTRADAY: 'F&O / Intraday',
  PROPERTY_ASSETS: 'Property / Assets',
  CRYPTO_VDA: 'Crypto / VDA'
});

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : '');

/** A dropdown code in words: "SAVINGS" -> "Savings", "NIL_RETURN" -> "Nil Return". */
const toWords = (value: string): string => {
  if (LABELS[value]) return LABELS[value];
  return /^[A-Z]+(?:_[A-Z]+)*$/.test(value)
    ? value.split('_').map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
    : value;
};

/** The mobile app sends "2023-24"; the dashboard's dropdown reads "FY 2023-24". */
const toFinancialYear = (value: string): string => (/^\d{4}-\d{2}$/.test(value) ? `FY ${value}` : value);

/** "2026-2027" or "2026-27" -> "AY 2026-27", as the ITR forms list assessment years. */
function toAssessmentYear(value: string): string {
  const match = /^(\d{4})-(\d{2}|\d{4})$/.exec(value);
  return match ? `AY ${match[1]}-${match[2].slice(-2)}` : value;
}

/** A DTO value, or a value from the customer's profile for "customer.<key>". */
/**
 * A DTO value by key or dotted path: "customer.pan", "registeredOffice.city" or "directors.0.fullName"
 * (list positions are numbers).
 */
const readValue = (record: Dto, key: string): unknown =>
  key.split('.').reduce<unknown>((value, part) => {
    if (value === null || value === undefined) return undefined;
    if (Array.isArray(value)) return value[Number(part)];
    return typeof value === 'object' ? (value as Dto)[part] : undefined;
  }, record);

const DATE_TIME = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/** The customer's profile, as "customer.<key>" details for the Personal Details section. */
function personalDetails(record: Dto): Record<string, string> {
  const customer = (record.customer ?? {}) as Dto;
  const details: Record<string, string> = {};
  for (const [key, value] of Object.entries(customer)) {
    const raw = text(value);
    if (raw) details[`customer.${key}`] = key === 'gender' || key === 'customerType' ? toWords(raw) : raw;
  }
  return details;
}

/** The record's own id, document id, status and submission time for the Application Record section. */
function recordDetails(spec: ServiceSpec, record: Dto): Record<string, string> {
  const submitted = text(record.submittedAt);
  const entries: [string, string][] = [
    ['record.id', text(record[spec.idField])],
    ['record.documentId', text(record.documentId)],
    ['record.status', toWords(text(record.status))],
    ['record.submittedAt', submitted && !Number.isNaN(Date.parse(submitted)) ? DATE_TIME.format(Date.parse(submitted)) : submitted]
  ];
  return Object.fromEntries(entries.filter(([, value]) => value));
}

function detailsOf(spec: ServiceSpec, record: Dto): Record<string, string> {
  const details: Record<string, string> = { ...spec.fixed };
  // Only dropdown answers arrive as codes; typed text (names, remarks, IFSC) is kept exactly as entered.
  const dropdowns = new Set(getServiceType(spec.serviceType, spec.service ?? 'GST').fields.filter((field) => field.kind === 'dropdown').map((field) => field.id));
  for (const [fieldId, key] of Object.entries(spec.fields)) {
    const raw = text(readValue(record, key));
    if (!raw) continue;
    details[fieldId] =
      fieldId === 'financialYear' ? toFinancialYear(raw)
      : fieldId === 'assessmentYear' ? toAssessmentYear(raw)
      : dropdowns.has(fieldId) || LABELS[raw] ? toWords(raw)
      : raw === 'NOT_PROVIDED' ? LABELS.NOT_PROVIDED
      : raw;
  }
  Object.assign(details, personalDetails(record), recordDetails(spec, record), spec.extra?.(record));
  // Compliance remarks belong to whichever request the customer made.
  if (spec.serviceType === 'gst-compliance') {
    const remarks = text(record.message);
    if (remarks) details[record.requestType === 'NOTICE_RESPONSE' ? 'noticeRemarks' : 'reconciliationRemarks'] = remarks;
  }
  return details;
}

function toImportedApplication(spec: ServiceSpec, record: Dto): ImportedApplication | null {
  const id = text(record[spec.idField]);
  if (!id) {
    return null;
  }
  const customer = (record.customer ?? {}) as Dto;
  const gstin = text(record.gstin) || text(record.gstNumber);
  return {
    sourceId: id,
    caseId: `${spec.casePrefix}${id}`,
    // Rows saved before created_at existed fall back to their last update.
    submittedAt: text(record.submittedAt) || text(record.createdAt) || text(record.updatedAt) || null,
    updatedAt: text(record.updatedAt) || text(record.submittedAt) || text(record.createdAt) || null,
    intake: {
      service: spec.service ?? 'GST',
      serviceType: spec.serviceType,
      client: {
        custId: text(customer.customerId) || text(customer.custId) || undefined, // the customer block calls it customerId
        name: text(customer.name) || gstin,
        email: text(customer.email),
        mobile: text(customer.mobileNumber),
        // A GSTIN carries the business PAN in characters 3-12.
        pan: (text(customer.pan) || gstin.slice(2, 12)).toUpperCase(),
        city: text(customer.city)
      },
      details: detailsOf(spec, record)
    },
    files: spec.files.map((key) => text(record[key]) || null)
  };
}

async function fetchList(spec: ServiceSpec, path = spec.path): Promise<ImportedApplication[]> {
  try {
    const records = await apiClient.get<unknown>(path);
    if (!Array.isArray(records)) return [];
    return (records as Dto[]).map((record) => toImportedApplication(spec, record)).filter((item): item is ImportedApplication => item !== null);
  } catch {
    // One list failing (endpoint down or changed) leaves the others showing.
    return [];
  }
}

/** Every GST filing, compliance request, amendment, ITR filing, TDS refund and revised ITR, for the CA manager. */
export async function fetchCaManagerGstServices(): Promise<ImportedApplication[]> {
  return (await Promise.all(SPECS.map((spec) => fetchList(spec)))).flat();
}

/** The GST and ITR applications (other than GST registrations) assigned to one agent in the database. */
export async function fetchAgentGstServices(agentId: string): Promise<ImportedApplication[]> {
  const id = encodeURIComponent(agentId);
  return (await Promise.all(SPECS.map((spec) => fetchList(spec, `${spec.agentPath}/${id}`)))).flat();
}
