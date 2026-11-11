import {
  INDIAN_STATES,
  YES_NO,
  address,
  bankAccount,
  choice,
  documents,
  dueDay,
  email,
  gstin,
  group,
  ifsc,
  mobile,
  name,
  note,
  optional,
  pan,
  pinCode,
  rupees
} from './formBuilders';
import { PERSONAL_DETAILS_FIELDS, applicationRecordFields } from './backendRecordSections';

/**
 * GST Filing, Compliance, Amendment, Cancellation and Certificate exactly as the mobile app collects them
 * (mobile-app/src/modules/gst/*). Field ids are the keys of the DTO each flow sends to the backend.
 */

const FINANCIAL_YEARS = ['FY 2026-27', 'FY 2025-26', 'FY 2024-25', 'FY 2023-24', 'FY 2022-23', 'FY 2021-22', 'FY 2020-21', 'FY 2019-20', 'FY 2018-19', 'FY 2017-18'];

export const GST_FILING_FORM = Object.freeze({
  fields: [
    ...PERSONAL_DETAILS_FIELDS,
    ...group('Return Details', [
      gstin(),
      choice('financialYear', 'Financial Year', FINANCIAL_YEARS),
      choice('filingFrequency', 'Filing Frequency', ['Monthly', 'Quarterly', 'Annual']),
      note('filingPeriod', 'Filing Period', 'e.g. August 2026 or Q2'),
      choice('returnType', 'Return Type', ['GSTR-1', 'GSTR-3B']),
      choice('filingType', 'Nature of Filing', ['Regular Return', 'Nil Return'])
    ]),
    ...group('Tax Calculation', [
      choice('taxCalculationMethod', 'How should tax be calculated?', ['Estimation figures', 'TaxEdge CA calculation']),
      optional(rupees('estimatedTaxableSales', 'Estimated Taxable Sales (₹)')),
      optional(rupees('estimatedTaxablePurchases', 'Estimated Taxable Purchases (₹)')),
      optional(rupees('estimatedEligibleItc', 'Estimated Eligible ITC (₹)'))
    ]),
    ...applicationRecordFields('GST Filing ID')
  ],
  documents: documents([
    'Sales Invoices / Register',
    'Credit Notes',
    'Debit Notes',
    'E-Invoice Data (IRN)',
    'E-Way Bill Data',
    'Purchase Invoices / Register',
    'GSTR-2B ITC Statement',
    'Expense Invoices & Vouchers',
    'Bank Statement / Passbook',
    'Previous GST Returns',
    'Previous Filing Acknowledgement',
    'Other Supporting Documents'
  ])
});

export const GST_COMPLIANCE_FORM = Object.freeze({
  fields: [
    ...PERSONAL_DETAILS_FIELDS,
    ...group('Request Details', [gstin(), choice('financialYear', 'Financial Year', FINANCIAL_YEARS), choice('requestType', 'Request Type', ['Reconciliation Support', 'Notice Response'])]),
    ...group('Reconciliation Parameters', [optional(note('gstr2bRef', 'GSTR-2B Ref / Period')), optional(note('reconciliationRemarks', 'Remarks'))]),
    ...group('Notice Details', [
      optional(note('noticeNumber', 'Notice / Order No.')),
      optional(dueDay('noticeIssueDate', 'Notice Issue Date')),
      optional(dueDay('replyDueDate', 'Reply Due Date')),
      optional(note('noticeRemarks', 'Remarks / Grounds'))
    ]),
    ...applicationRecordFields('Compliance ID')
  ],
  documents: documents([], ['Purchase Register', 'Sales Register', 'Notice Copy'])
});

export const GST_AMENDMENT_SECTIONS = ['Legal Business Name', 'Principal Place of Business', 'Additional Place of Business', 'Bank Accounts', 'Authorised Signatories', 'Contact Details'];

/** Only the section being amended is filled in; the rest stay empty. */
export const GST_AMENDMENT_FORM = Object.freeze({
  fields: [
    ...PERSONAL_DETAILS_FIELDS,
    ...group('Amendment', [gstin(), choice('amendmentSection', 'Section to Amend', GST_AMENDMENT_SECTIONS)]),
    ...group('Legal Business Name', [optional(name('newLegalName', 'New Legal Business Name'))]),
    ...group('Principal Place of Business', [
      optional(address('newBusinessAddress', 'New Business Address')),
      optional(name('newCity', 'City', '', 50)),
      optional(name('newDistrict', 'District', '', 50)),
      optional(choice('newState', 'State / UT', INDIAN_STATES)),
      optional(pinCode('newPinCode')),
      optional(choice('principalNatureOfPremises', 'Nature of Premises', ['Leased', 'Warehouse', 'Owned', 'Rented', 'Consent', 'Shared', 'Others'])),
      optional(choice('principalProofType', 'Address Proof Type', ['Rental Agreement', 'Ownership Proof', 'Electricity Bill', 'Other Address Proof']))
    ]),
    ...group('Additional Place of Business', [
      optional(address('address', 'Additional Address')),
      optional(name('city', 'City', '', 50)),
      optional(pinCode('pinCode')),
      optional(choice('natureOfPremises', 'Nature of Premises', ['Leased', 'Warehouse', 'Owned', 'Rented', 'Consent', 'Shared', 'Others']))
    ]),
    ...group('Bank Accounts', [
      optional(name('newBankName', 'Bank Name')),
      optional(bankAccount('newBankAccountNumber')),
      optional(ifsc('newIfscCode')),
      optional(choice('newAccountType', 'Account Type', ['Current', 'Savings', 'Cash Credit']))
    ]),
    ...group('Authorised Signatories', [
      optional(name('newSignatoryName', 'Signatory Name')),
      optional(pan('newSignatoryPan', 'Signatory PAN')),
      optional(dueDay('newSignatoryDob', 'Signatory Date of Birth')),
      optional(name('newDesignation', 'Designation', '', 50)),
      optional(mobile('newSignatoryMobile', 'Signatory Mobile')),
      optional(email('newSignatoryEmail', 'Signatory Email'))
    ]),
    ...group('Contact Details', [optional(mobile('newMobileNumber', 'New Mobile Number')), optional(email('newEmail', 'New Email'))]),
    ...applicationRecordFields('Amendment ID')
  ],
  documents: documents(['Documentary Proof of Amendment'], ['Board Resolution / Letter of Authority'])
});

export const GST_CANCELLATION_REASONS = [
  'Discontinuance / Closure of Business',
  'Annual Turnover Fell Below GST Exemption Limit (₹40L/₹20L)',
  'Transfer of Business / Demerger / Amalgamation',
  'Death of Sole Proprietor',
  'Change in Legal Constitution',
  'Other Valid Reason'
];

export const GST_CANCELLATION_FORM = Object.freeze({
  fields: [
    ...group('Cancellation Details', [
      gstin(),
      choice('reasonForCancellation', 'Reason for Cancellation', GST_CANCELLATION_REASONS),
      optional(note('otherReason', 'Describe the Reason')),
      dueDay('dateCancellationIsSought', 'Effective Date of Cancellation')
    ]),
    ...group('Financial Assessment', [
      rupees('closingStockAndInputTaxReversal', 'Closing Stock & ITC Reversal (₹)'),
      rupees('pendingDuesLiabilities', 'Pending Tax Dues (₹)'),
      note('lastGstr3bFiledArnPeriod', 'Last GSTR-3B Filed (ARN or Period)')
    ]),
    ...group('Compliance Verification', [
      choice('isVoluntaryUnderOneYear', 'Voluntary registration less than 1 year old?', YES_NO),
      choice('areAllReturnsFiled', 'All returns filed till date?', YES_NO),
      choice('isFinalReturnDeclared', 'Final return (GSTR-10) declaration accepted?', YES_NO)
    ])
  ],
  documents: documents(['Cancellation Supporting Proof'], ['Closing Stock & ITC Reversal Sheet'])
});

export const GST_CERTIFICATE_FORM = Object.freeze({
  fields: group('Certificate Request', [
    gstin(),
    name('legalName', 'Legal Name'),
    optional(name('tradeName', 'Trade Name')),
    optional(name('constitution', 'Constitution of Business')),
    optional(address('address', 'Principal Place of Business')),
    optional(name('signatoryName', 'Authorised Signatory'))
  ]),
  documents: documents(['Applicant / Business PAN Proof'], ['Existing Certificate Copy (If available)'])
});
