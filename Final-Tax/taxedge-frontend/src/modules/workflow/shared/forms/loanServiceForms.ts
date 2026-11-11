import type { IntakeField } from '../workflowServices';
import {
  INDIAN_STATES,
  YES_NO,
  aadhaar,
  address,
  amount,
  choice,
  count,
  day,
  documents,
  email,
  gstin,
  group,
  mobile,
  name,
  note,
  optional,
  pan,
  pinCode
} from './formBuilders';

/**
 * Every loan exactly as the mobile app collects it (mobile-app/src/modules/loans): the shared applicant
 * KYC step, then the loan's own details, with the same labels and dropdown options. Nested KYC values use
 * dotted ids ("currentAddress.city") so the backend's nested objects map one to one.
 */

const KYC_FIELDS: readonly IntakeField[] = [
  ...group('Applicant (KYC)', [
    name('fullName', 'Full Name (as per PAN)'),
    mobile('mobile', 'Mobile Number'),
    email('email', 'Email'),
    pan('pan', 'PAN'),
    optional(aadhaar('aadhaar', 'Aadhaar Number')),
    day('dob', 'Date of Birth')
  ]),
  ...group('Current Address', [
    note('currentAddress.houseNumber', 'House / Flat No.'),
    address('currentAddress.street', 'Street / Area'),
    name('currentAddress.city', 'City', '', 50),
    choice('currentAddress.state', 'State / UT', INDIAN_STATES),
    pinCode('currentAddress.pincode'),
    choice('isPermanentSameAsCurrent', 'Permanent address same as current?', YES_NO)
  ])
];

const loanForm = (fields: readonly IntakeField[], docs: ReturnType<typeof documents>) =>
  Object.freeze({ fields: [...KYC_FIELDS, ...fields], documents: docs });

const BUSINESS_PROFILE = group('Business Profile', [
  name('businessName', 'Business Name'),
  choice('constitution', 'Constitution', ['Proprietorship', 'Partnership', 'LLP', 'Private Limited Company', 'Other']),
  choice('businessActivity', 'Business Activity', ['Trading', 'Manufacturing', 'Retail', 'Services', 'Other']),
  day('establishmentDate', 'Date of Establishment'),
  address('businessAddress', 'Business Address'),
  pinCode('pincode'),
  choice('isGstRegistered', 'GST Registered?', YES_NO),
  optional(gstin()),
  optional(note('udyamRegistration', 'Udyam Registration Number'))
]);

const PAN_DOC = 'Business / Promoter PAN Card';

export const BUSINESS_LOAN_FORM = loanForm(
  [
    ...BUSINESS_PROFILE,
    ...group('Loan Requirement', [
      amount('loanAmount', 'Loan Amount (₹)'),
      choice('purpose', 'Purpose of Loan', ['Business Expansion', 'Equipment Purchase', 'Renovation', 'Inventory Purchase', 'Business Setup', 'Other']),
      optional(note('purposeDescription', 'Describe the Purpose')),
      optional(amount('projectCost', 'Project / Equipment Cost (₹)'))
    ])
  ],
  documents([PAN_DOC, 'Business Registration Proof'], ['Business Bank Statement (Last 6 Months)', 'Equipment Quotation / Project Estimate'])
);

export const WORKING_CAPITAL_FORM = loanForm(
  [
    ...BUSINESS_PROFILE,
    ...group('Working Capital Requirement', [
      amount('loanAmount', 'Required Limit (₹)'),
      choice('purpose', 'Purpose', ['Inventory Purchase', 'Supplier Payments', 'Operating Expenses', 'Payroll', 'Cash-Flow Gap', 'Seasonal Business Needs', 'Other']),
      optional(note('purposeDescription', 'Describe the Purpose')),
      amount('monthlySales', 'Average Monthly Sales (₹)'),
      amount('monthlyExpenses', 'Average Monthly Expenses (₹)')
    ])
  ],
  documents([PAN_DOC, 'GST Registration Certificate / Business License', 'Business Bank Statement (Last 12 Months)'], ['Audited Financials / P&L (Last 2 Years)'])
);

export const PERSONAL_LOAN_FORM = loanForm(
  [
    ...group('Employment & Income', [
      choice('employmentType', 'Employment Type', ['Salaried', 'Self-employed']),
      optional(name('employerName', 'Employer / Company Name')),
      optional(choice('jobType', 'Job Type', ['Private', 'Government', 'Public Sector', 'Self-Employed Professional', 'Other'])),
      optional(amount('monthlyNetSalary', 'Monthly Net Salary (₹)')),
      optional(choice('workExperience', 'Work Experience', ['Less than 1 year', '1 - 3 years', '3 - 5 years', '5+ years'])),
      optional(choice('salaryCreditMethod', 'Salary Received By', ['Bank Account', 'Cash', 'Cheque'])),
      optional(name('businessOrProfessionName', 'Business / Profession Name')),
      optional(choice('natureOfBusiness', 'Nature of Business', ['Trading', 'Services', 'Manufacturing', 'Retail', 'Professional', 'Other'])),
      optional(amount('averageMonthlyIncome', 'Average Monthly Income (₹)')),
      optional(choice('yearsInBusiness', 'Years in Business', ['Less than 1 year', '1 - 2 years', '3 - 5 years', '5+ years']))
    ]),
    ...group('Loan Requirement', [
      amount('loanAmount', 'Loan Amount (₹)'),
      choice('purpose', 'Purpose of Loan', ['Medical Expenses', 'Education', 'Wedding', 'Home Renovation', 'Travel', 'Debt Consolidation', 'Emergency Expenses', 'Consumer Purchase', 'Other'])
    ])
  ],
  documents(['Applicant PAN Card'], ['Salary Bank Statement (Last 3 Months)', 'Bank Statement (Last 6 Months)', 'ITR Acknowledgment / Computation'])
);

/** Home and property loans ask for different papers per purpose; every one the app can ask for is listed. */
const PROPERTY_DOCUMENTS = documents([], [
  'Property / Sale Agreement Document',
  'Bank Statement / Income Document',
  'Property Ownership Document',
  'Plot / Property Document',
  'Existing Loan Statement / Account Document',
  'Property Quotation / Builder Document',
  'Construction Document (If Available)',
  'Sanctioned Building Plan',
  'Construction Cost Estimate',
  'Renovation Cost Estimate',
  'Contractor Quotation',
  'Sale Agreement / Allotment Letter',
  'Plot Quotation / Cost Sheet',
  'Foreclosure / Outstanding Statement',
  'Additional Property Document'
]);

export const HOME_LOAN_FORM = loanForm(
  group('Home Loan Requirement', [
    amount('loanAmount', 'Loan Amount (₹)'),
    choice('purpose', 'Purpose', ['Purchase a New Home', 'Purchase a Resale Home', 'Construct a House', 'Home Renovation', 'Balance Transfer']),
    choice('propertyStatus', 'Property Status', ['Property Identified', 'Looking for Property', 'Under Construction', 'Ready to Move']),
    amount('approximatePropertyValue', 'Approximate Property Value (₹)')
  ]),
  PROPERTY_DOCUMENTS
);

export const PROPERTY_LOAN_FORM = loanForm(
  group('Property Details', [
    amount('requestedAmount', 'Requested Amount (₹)'),
    choice('purpose', 'Purpose', ['Home Purchase', 'Home Construction', 'Home Renovation', 'Plot Purchase', 'Plot + Construction', 'Balance Transfer', 'Other']),
    choice('propertyType', 'Property Type', ['Apartment / Flat', 'Independent House', 'Villa', 'Plot', 'Commercial Property', 'Other']),
    name('city', 'Property City', '', 50),
    choice('state', 'Property State / UT', INDIAN_STATES),
    pinCode('pinCode', 'Property PIN Code'),
    choice('propertyStatus', 'Property Status', ['Identified Property', 'Property Not Yet Identified']),
    optional(choice('constructionStage', 'Construction Stage', ['Planning Stage', 'Construction Started'])),
    optional(choice('renovationStatus', 'Renovation Status', ['Planning Stage', 'Renovation Started'])),
    choice('ownership', 'Ownership', ['Self', 'Joint / Family', 'Not Yet Purchased'])
  ]),
  PROPERTY_DOCUMENTS
);

export const VEHICLE_LOAN_FORM = loanForm(
  group('Vehicle Details', [
    amount('requestedLoanAmount', 'Loan Amount (₹)'),
    choice('vehicleCondition', 'Vehicle Condition', ['New Vehicle', 'Used Vehicle']),
    choice('vehicleCategory', 'Vehicle Category', ['Car', 'Two-Wheeler', 'Commercial Vehicle', 'Other']),
    name('make', 'Make / Brand', '', 50),
    name('model', 'Model', '', 50),
    amount('approximateVehiclePrice', 'Approximate Vehicle Price (₹)'),
    choice('dealerSelected', 'Dealer Selected?', YES_NO),
    optional(name('dealerName', 'Dealer Name')),
    choice('purchaseTimeline', 'Purchase Timeline', ['Within 7 days', 'Within 30 days', '1–3 months', 'Just exploring']),
    choice('registrationState', 'Registration State', INDIAN_STATES)
  ]),
  documents([], ['Vehicle Quotation / Proforma Invoice', 'Booking Receipt', 'RC Copy'])
);

export const MACHINERY_LOAN_FORM = loanForm(
  group('Machinery Details', [
    amount('requestedLoanAmount', 'Loan Amount (₹)'),
    choice('machineryType', 'Machinery Type', [
      'Manufacturing Machinery', 'Construction Machinery', 'Agricultural Machinery', 'Medical Equipment', 'Printing Machinery',
      'Packaging Machinery', 'Textile Machinery', 'Food Processing Machinery', 'CNC / Industrial Machinery', 'Other'
    ]),
    name('machineryName', 'Machinery / Equipment Name'),
    choice('machineryCondition', 'Condition', ['New', 'Used / Pre-owned']),
    choice('purchaseType', 'Purchasing From', ['Direct from Manufacturer', 'Authorized Dealer', 'Other Supplier']),
    amount('approximateMachineryCost', 'Approximate Machinery Cost (₹)'),
    optional(name('dealerName', 'Dealer / Supplier Name'))
  ]),
  documents(['Machinery Quotation / Proforma Invoice'])
);

export const MSME_LOAN_FORM = loanForm(
  [
    ...group('MSME Business Profile', [
      name('businessName', 'Business Name'),
      choice('constitution', 'Constitution', ['Proprietorship', 'Partnership', 'LLP', 'Private Limited Company', 'Public Limited Company', 'Other']),
      choice('businessActivity', 'Business Activity', [
        'Manufacturing', 'Service Provider', 'Wholesale Trading', 'Retail Trading', 'IT / Software Services', 'Food & Agro Processing',
        'Textiles & Apparel', 'Automotive & Engineering', 'Other'
      ]),
      day('establishmentDate', 'Date of Establishment'),
      choice('operatingDuration', 'Operating For', ['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', 'More than 10 years']),
      count('numberOfEmployees', 'Number of Employees', 0, 100_000),
      amount('annualTurnover', 'Annual Turnover (₹)'),
      choice('ownershipType', 'Premises Ownership', ['Sole Owner', 'Joint Ownership', 'Other'])
    ]),
    ...group('Operating Address', [
      note('operatingAddress.houseNumber', 'Shop / Unit No.'),
      address('operatingAddress.street', 'Street / Area'),
      name('operatingAddress.city', 'City', '', 50),
      choice('operatingAddress.state', 'State / UT', INDIAN_STATES),
      pinCode('operatingAddress.pincode')
    ]),
    ...group('Registrations', [
      choice('udyamStatus', 'Udyam Registration', ['Registered', 'Not Registered', 'Applied / Pending']),
      optional(note('udyamRegistrationNumber', 'Udyam Registration Number')),
      choice('gstStatus', 'GST Registration', ['Registered', 'Not Registered', 'Exempt']),
      optional(gstin())
    ])
  ],
  documents(['Udyam Registration Certificate', 'GST Registration Certificate'])
);
