import { INDIAN_STATES, choice, day, group, name, note, optional, pan } from './forms/formBuilders';
import type { IntakeField } from './workflowServices';
import { PERSONAL_DETAILS_FIELDS } from './forms/backendRecordSections';

/**
 * GST Registration exactly as the customer fills it in the mobile app
 * (mobile-app/src/modules/gst/gst-registration): same sections, labels, dropdown options and documents.
 * Field ids are the backend's GST registration DTO keys (see the mobile gstRegistrationMapper), so a
 * record read from the database fills these fields directly; backendApplications turns its codes into
 * the labels below.
 */

export const GST_SECTIONS = Object.freeze({
  identity: 'Business Identity',
  registration: 'Registration & Scheme',
  place: 'Principal Place of Business',
  bank: 'Bank Details',
  signatory: 'Authorised Signatory',
  customer: 'Personal Details',
  record: 'Application Record'
});

export const GST_STATES = INDIAN_STATES;

export const GST_BUSINESS_TYPES = [
  'Proprietorship', 'Partnership Firm', 'Limited Liability Partnership (LLP)', 'Private Limited Company', 'Public Limited Company',
  'HUF', 'Society / Trust / Club', 'AOP / BOI', 'Government Department', 'Foreign Company', 'One Person Company (OPC)'
] as const;

export const GST_NATURE_OF_BUSINESS = [
  'Trader', 'Manufacturer', 'Service Provider', 'Wholesaler / Distributor', 'Retailer', 'Exporter / Importer', 'Contractor / Freelancer'
] as const;

export const GST_REASONS = [
  'Crossed turnover threshold', 'Voluntary registration', 'Inter-state supply', 'E-commerce operator / seller',
  'Casual taxable person', 'Input Service Distributor'
] as const;

export const GST_COMPOSITION_OPTIONS = ['No - regular scheme', 'Yes - composition scheme'] as const;
export const GST_PLACE_OPTIONS = ['Principal place of business', 'Additional place of business'] as const;
export const GST_ACCOUNT_TYPES = ['Current', 'Savings', 'Cash Credit / OD'] as const;
export const GST_ADDRESS_PROOF_TYPES = ['Rental Agreement', 'Ownership Proof', 'Electricity Bill', 'Other Address Proof'] as const;
export const GST_CONSENT_OPTIONS = ['Given', 'Not given'] as const;

export const GST_REGISTRATION_FIELDS: readonly IntakeField[] = Object.freeze([
  ...PERSONAL_DETAILS_FIELDS,
  ...group(GST_SECTIONS.identity, [
    name('legalName', 'Legal Name of Business (as per PAN)', 'Exactly as on the PAN card'),
    name('tradeName', 'Trade Name', 'Business / trade name'),
    choice('constitutionOfBusiness', 'Constitution of Business', GST_BUSINESS_TYPES),
    choice('natureOfBusiness', 'Nature of Business', GST_NATURE_OF_BUSINESS),
    day('dateOfCommencement', 'Date of Commencement'),
    optional(pan('businessPan', 'Business PAN'))
  ]),
  ...group(GST_SECTIONS.registration, [
    choice('reasonForRegistration', 'Reason for Registration', GST_REASONS),
    choice('compositionScheme', 'Opting for Composition Scheme?', GST_COMPOSITION_OPTIONS)
  ]),
  ...group(GST_SECTIONS.place, [
    choice('placeOfBusiness', 'Place of Business', GST_PLACE_OPTIONS),
    { id: 'businessAddress', label: 'Business Address', rule: 'address', placeholder: 'Building, street, area', maxLength: 120 },
    name('city', 'City', 'City', 50),
    name('district', 'District', 'District', 50),
    choice('state', 'State / UT', GST_STATES),
    { id: 'pinCode', label: 'PIN Code', rule: 'pinCode', inputMode: 'numeric', placeholder: '6-digit PIN code', maxLength: 6 },
    { id: 'hsnSac', label: 'HSN / SAC Code', rule: 'hsn', inputMode: 'numeric', placeholder: 'e.g. 9983', maxLength: 8 },
    optional(choice('principalPlaceAddressType', 'Address Proof Type', GST_ADDRESS_PROOF_TYPES))
  ]),
  ...group(GST_SECTIONS.bank, [
    name('accountHolderName', 'Account Holder Name', 'As per bank records'),
    { id: 'bankAccountNumber', label: 'Bank Account Number', rule: 'bankAccount', inputMode: 'numeric', placeholder: '9 to 18 digits', maxLength: 18 },
    { id: 'ifscCode', label: 'IFSC Code', rule: 'ifsc', uppercase: true, placeholder: 'e.g. HDFC0001234', maxLength: 11 },
    name('bankName', 'Bank Name', 'e.g. HDFC Bank'),
    name('branchName', 'Branch Name', 'Branch name'),
    choice('accountType', 'Account Type', GST_ACCOUNT_TYPES)
  ]),
  ...group(GST_SECTIONS.signatory, [
    optional(choice('authorisedSignatory', 'Authorised Signatory', ['Yes', 'No'])),
    name('signatoryName', 'Signatory Name', 'Full name'),
    { id: 'signatoryPan', label: 'Signatory PAN', rule: 'pan', uppercase: true, placeholder: 'ABCDE1234F', maxLength: 10 },
    day('signatoryDob', 'Signatory Date of Birth'),
    name('designation', 'Designation', 'Proprietor / Director / Partner', 50),
    { id: 'signatoryMobile', label: 'Signatory Mobile', rule: 'mobile', inputMode: 'tel', placeholder: '10-digit mobile', maxLength: 10 },
    { id: 'signatoryEmail', label: 'Signatory Email', rule: 'email', inputMode: 'email', placeholder: 'name@example.com', maxLength: 120 },
    optional(choice('aadhaarConsent', 'Aadhaar Authentication Consent', GST_CONSENT_OPTIONS))
  ]),
  ...group(GST_SECTIONS.record, [
    optional(note('gstId', 'GST Application ID')),
    optional(note('documentId', 'Document ID')),
    optional(note('status', 'Status in Customer App')),
    optional(note('submittedAt', 'Submitted At'))
  ])
]);

/** The six uploads of the mobile app's document step, with the same names; all are required there. */
export const GST_REGISTRATION_DOCUMENTS = Object.freeze(
  [
    'PAN Card',
    'Aadhaar Card',
    'Business Registration Proof',
    'Principal Place Address Proof',
    'Bank Passbook / Cancelled Cheque',
    'Passport Size Photograph'
  ].map((label) => ({ label, required: true }))
);
