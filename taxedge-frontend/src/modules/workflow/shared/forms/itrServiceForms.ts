import {
  INDIAN_STATES,
  aadhaar,
  address,
  bankAccount,
  choice,
  day,
  documents,
  dueDay,
  email,
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
 * ITR Filing, TDS Refund, Previous Year ITR, Revised ITR and Tax Notice Assistance exactly as the mobile
 * app collects them (mobile-app/src/modules/itr/*). Field ids are the backend DTO keys where the app
 * already sends one (ItrApiService, TdsFormData, TaxNoticeFormData) and the app's form keys otherwise.
 */

export const ASSESSMENT_YEARS = ['AY 2026-27', 'AY 2025-26', 'AY 2024-25', 'AY 2023-24', 'AY 2022-23'];

/** Income sections only appear for the sources the customer switched on, so their fields are optional. */
const income = (section: string, specs: Parameters<typeof group>[1]) => group(section, specs.map(optional));

export const ITR_FILING_FORM = Object.freeze({
  fields: [
    ...group('Personal Information', [
      pan('pan', 'PAN'),
      aadhaar('aadhaar', 'Aadhaar Number'),
      name('name', 'Full Name (as per PAN)'),
      day('dob', 'Date of Birth'),
      optional(name('gender', 'Gender', '', 20)),
      optional(name('fatherSpouseName', "Father's / Spouse's Name")),
      address('address', 'Address'),
      name('city', 'City', '', 50),
      choice('state', 'State / UT', INDIAN_STATES),
      pinCode('pincode'),
      mobile('mobile', 'Mobile'),
      email('email', 'Email')
    ]),
    ...group('Filing Details', [
      choice('assessmentYear', 'Assessment Year', ASSESSMENT_YEARS),
      choice('residentialStatus', 'Residential Status', ['Resident', 'NRI', 'RNOR']),
      choice('filingType', 'Filing Type', ['Original Return – 139(1)', 'Belated Return – 139(4)', 'Revised Return – 139(5)', 'Updated Return – 139(8A)']),
      optional(note('incomeSource', 'Main Income Source'))
    ]),
    ...group('Refund Bank Account', [name('bankName', 'Bank Name'), bankAccount('accountNumber', 'Account Number'), ifsc('ifscCode'), optional(choice('accountType', 'Account Type', ['Savings', 'Current']))]),
    ...income('Salary Income', [name('employerLegalName', 'Employer Name'), rupees('grossSalary', 'Gross Salary (₹)'), rupees('exemptAllowances', 'Exempt Allowances (₹)'), rupees('tdsDeductedByEmployer', 'TDS Deducted by Employer (₹)')]),
    ...income('House Property', [
      choice('propertyType', 'Property Type', ['Self Occupied', 'Let Out']),
      rupees('annualRentReceived', 'Annual Rent Received (₹)'),
      rupees('municipalTaxesPaid', 'Municipal Taxes Paid (₹)'),
      rupees('homeLoanInterestPaid', 'Home Loan Interest Paid (₹)')
    ]),
    ...income('Business / Profession', [
      choice('howDoYouReportThisBusiness', 'How is the business reported?', ['Presumptive – 44AD', 'Presumptive – 44ADA', 'Regular Books of Accounts', 'Not Sure']),
      name('businessName', 'Business Name'),
      rupees('grossTurnover', 'Gross Turnover (₹)'),
      rupees('declaredNetProfit', 'Declared Net Profit (₹)')
    ]),
    ...income('Capital Gains', [
      choice('assetType', 'Asset Type', ['Equity / Mutual Funds', 'F&O / Intraday', 'Property / Assets', 'Crypto / VDA']),
      rupees('shortTermGains', 'Short-Term Gains (₹)'),
      rupees('longTermGains', 'Long-Term Gains (₹)')
    ]),
    ...income('Other Sources', [
      rupees('savingsInterest', 'Savings Interest (₹)'),
      rupees('fdTermInterest', 'FD / Term Deposit Interest (₹)'),
      rupees('dividendIncome', 'Dividend Income (₹)'),
      rupees('otherMiscellaneous', 'Other Income (₹)')
    ]),
    ...income('Deductions', [rupees('sec80c', 'Section 80C (₹)'), rupees('sec80d', 'Section 80D – Health Insurance (₹)'), rupees('sec24b', 'Section 24(b) – Home Loan Interest (₹)'), rupees('sec80e', 'Section 80E – Education Loan (₹)')]),
    ...income('Previous Filing & Taxes Paid', [
      note('previousAckNumber', 'Previous ITR Acknowledgement No.'),
      note('noticeSection', 'Tax Notice Section'),
      rupees('advanceTax', 'Advance Tax Paid (₹)'),
      rupees('selfAssessmentTax', 'Self-Assessment Tax Paid (₹)')
    ]),
    ...applicationRecordFields('ITR Filing ID')
  ],
  /** The app asks for each income document only when that income was declared, so all are listed as optional here. */
  documents: documents([], [
    'Form 16 (Part A & B)',
    'Capital Gains Statement / P&L',
    'Business Turnover & GST Filings',
    'Form 26AS Tax Credit Statement',
    'AIS / TIS Statement',
    'Bank Account Statement',
    'Salary Payslips',
    'Health Insurance Premium Receipt (80D)',
    'Home Loan Interest Certificate (Sec 24b)',
    'Previous Year ITR-V Acknowledgment',
    'Income Tax Notice Copy',
    'Advance / Self-Assessment Tax Challan'
  ])
});

export const TDS_SECTIONS = [
  'Section 192 - Salary',
  'Section 194A - Interest on Fixed Deposits / Savings',
  'Section 194C - Payments to Contractors / Freelancers',
  'Section 194H - Commission or Brokerage',
  'Section 194I - Rent on Land, Building or Furniture',
  'Section 194J - Professional & Technical Fees',
  'Section 194Q - Purchase of Goods',
  'Other Sections'
];

export const TDS_REFUND_FORM = Object.freeze({
  fields: [
    ...PERSONAL_DETAILS_FIELDS,
    // The current app sends the refund bank account, business PAN and Aadhaar; the income and TDS figures
    // below are from its earlier form, so they are optional and shown only when a record has them.
    ...group('Business & KYC', [
      optional(name('legalBusinessName', 'Legal Business Name')),
      optional(pan('businessPan', 'Business PAN')),
      optional({ id: 'aadhaarNumber', label: 'Aadhaar Number', rule: 'aadhaar', inputMode: 'numeric', placeholder: '12-digit Aadhaar', maxLength: 12 }),
      optional(mobile('mobileNumber', 'Mobile Number'))
    ]),
    ...income('Taxpayer Details', [
      pan('panNumber', 'PAN Number'),
      choice('assessmentYear', 'Assessment Year', ['AY 2025-26 (FY 2024-25)', 'AY 2024-25 (FY 2023-24)', 'AY 2023-24 (FY 2022-23)', 'AY 2022-23 (FY 2021-22)']),
      rupees('totalIncome', 'Total Income (₹)'),
      rupees('totalDeductions', 'Total Deductions (₹)')
    ]),
    ...income('TDS Details', [
      name('deductorName', 'Deductor Name'),
      { id: 'deductorTan', label: 'Deductor TAN', rule: 'text', uppercase: true, placeholder: 'e.g. PNEA12345B', maxLength: 10 },
      rupees('tdsAmount', 'TDS Amount (₹)'),
      choice('deductedSection', 'Deducted Under Section', TDS_SECTIONS)
    ]),
    ...group('Refund Bank Account', [
      optional(name('accountHolderName', 'Account Holder Name')),
      name('bankName', 'Bank Name'),
      optional(name('branchName', 'Branch Name')),
      bankAccount('accountNumber', 'Account Number'),
      ifsc('ifscCode'),
      optional(choice('accountType', 'Account Type', ['Savings', 'Current'])),
      optional(choice('previousItrFiled', 'ITR already filed for this year?', ['Yes, already filed ITR for this year', 'No, return has not been filed yet']))
    ]),
    ...applicationRecordFields('TDS Refund ID')
  ],
  // The app asks for the PAN and Aadhaar copies; the statements are optional extras.
  documents: documents(
    ['PAN Card', 'Aadhaar Card'],
    [
      'Form 26AS (Tax Credit Statement)',
      'Annual Information Statement (AIS)',
      'Bank Account Statement / Cancelled Cheque',
      'Taxpayer Information Summary (TIS)',
      'Salary Slips (Recent 3 months)',
      'Interest / Fixed Deposit Certificate',
      'Broker Contract Notes / P&L Report',
      'Mutual Fund Capital Gains Report',
      'Rental Agreement',
      'LIC / Life Insurance Premium Proof',
      'Health Insurance Premium Receipt (Sec 80D)',
      'Donation Receipts (Sec 80G)',
      'Tuition Fee / PPF / ELSS Investment Receipts',
      'Other TDS Certificates (16B, 16C, 27D TCS)',
      'Additional Supporting Documents'
    ]
  )
});

const RETURN_DOCUMENTS = ['PAN Card', 'Aadhaar Card', 'Form 16 / Form 16A', 'AIS and TIS Statement', 'Bank Statements', 'Investment Proofs'];

export const PREVIOUS_YEAR_ITR_FORM = Object.freeze({
  fields: group('Return Year', [choice('assessmentYear', 'Assessment Year', ASSESSMENT_YEARS)]),
  documents: documents(RETURN_DOCUMENTS)
});

export const REVISED_ITR_FORM = Object.freeze({
  fields: [
    ...PERSONAL_DETAILS_FIELDS,
    ...group('Original Return', [
      note('acknowledgementNumber', 'Acknowledgement Number'),
      choice('assessmentYear', 'Assessment Year', ASSESSMENT_YEARS),
      optional(day('filingDate', 'Original Filing Date')),
      optional(choice('itrForm', 'ITR Form', ['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4']))
    ]),
    ...group('Reason for Revision', [choice('revisionReason', 'Reason for Revision', ['Missed Income', 'Wrong Deduction', 'Incorrect Bank Details', 'Other']), optional(note('otherReason', 'Reason Details'))]),
    ...income('Revised Figures', [
      rupees('salaryBusinessIncome', 'Salary / Business Income (₹)'),
      rupees('otherIncome', 'Other Income (₹)'),
      rupees('sec80c', 'Section 80C (₹)'),
      rupees('sec80d', 'Section 80D (₹)'),
      rupees('homeLoanInterest', 'Home Loan Interest (₹)'),
      optional(rupees('taxableIncome', 'Taxable Income (₹)')),
      bankAccount('bankAccount', 'Refund Bank Account'),
      ifsc('ifsc')
    ]),
    ...applicationRecordFields('Revised ITR ID')
  ],
  documents: documents(RETURN_DOCUMENTS)
});

export const TAX_NOTICE_TYPES = [
  'Section 143(1)(a) - Proposed Adjustment',
  'Section 139(9) - Defective Return',
  'Section 142(1) - Inquiry / Production of Accounts',
  'Section 148 / 148A - Income Escaping Assessment',
  'Section 156 - Notice of Demand',
  'Section 245 - Refund Adjustment Intimation'
];

export const TAX_NOTICE_FORM = Object.freeze({
  fields: group('Notice Details', [
    pan('pan', 'PAN'),
    choice('assessmentYear', 'Assessment Year', ASSESSMENT_YEARS),
    choice('noticeType', 'Notice Type', TAX_NOTICE_TYPES),
    day('noticeDate', 'Date of Notice'),
    note('noticeNumber', 'Notice Reference Number / DIN'),
    dueDay('responseDueDate', 'Response Due Date'),
    optional(note('customerExplanation', 'Your Explanation'))
  ]),
  documents: documents(
    ['Tax Notice', 'Previous ITR', 'ITR Acknowledgement', 'Form 16 / 16A', 'AIS (Annual Information Statement)', 'Bank Statements'],
    ['TIS (Taxpayer Information Summary)', 'Supporting Income Documents', 'Supporting Expense Documents', 'Previous Tax Responses', 'Other Notice-Specific Documents']
  )
});
