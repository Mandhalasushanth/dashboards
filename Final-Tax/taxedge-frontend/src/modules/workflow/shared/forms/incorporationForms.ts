import type { IntakeField } from '../workflowServices';
import {
  INDIAN_STATES,
  address,
  amount,
  choice,
  count,
  day,
  documents,
  email,
  group,
  mobile,
  name,
  note,
  optional,
  pan,
  pinCode
} from './formBuilders';
import { PERSONAL_DETAILS_FIELDS, applicationRecordFields } from './backendRecordSections';

/**
 * Company Registration as the mobile wizard collects it (mobile-app/src/modules/company-registration) and
 * the backend stores it (CompanyDetails, RegisteredOfficeDetails, PromoterDirectorDetails, ShareholdingCapital
 * and ShareholdingPattern). Directors and share allocations use indexed ids ("directors.0.name") so the
 * backend's lists map one to one. Fields the backend does not keep are optional, so they never block a
 * payment request.
 */

/** How many directors and share allocations the details screen has room for. */
const MAX_DIRECTORS = 5;

const director = (index: number, required: boolean): IntakeField[] => {
  const prefix = `directors.${index}`;
  const specs = [
    name(`${prefix}.name`, 'Full Name'),
    pan(`${prefix}.pan`, 'PAN'),
    email(`${prefix}.email`, 'Email'),
    optional(mobile(`${prefix}.phone`, 'Mobile')),
    optional(day(`${prefix}.dob`, 'Date of Birth')),
    optional(name(`${prefix}.designation`, 'Designation', '', 50)),
    optional(note(`${prefix}.din`, 'DIN (if allotted)')),
    optional(name(`${prefix}.relationship`, 'Relationship', '', 50)),
    optional({ id: `${prefix}.aadhaar`, label: 'Aadhaar Number', rule: 'aadhaar', inputMode: 'numeric', placeholder: '12-digit Aadhaar', maxLength: 12 })
  ];
  return group(`Director ${index + 1}`, required ? specs : specs.map(optional));
};

export const COMPANY_REGISTRATION_FORM = Object.freeze({
  fields: [
    ...PERSONAL_DETAILS_FIELDS,
    ...group('Company Type & Classification', [
      choice('companyType', 'Company Type', [
        'Private Limited',
        'One Person Company (OPC)',
        'Section 8 (NGO)',
        'Public Limited',
        'Limited Liability Partnership (LLP)',
        'Sole Proprietorship'
      ]),
      optional(choice('companyClass', 'Class of Company', ['Private', 'Public'])),
      choice('companyCategory', 'Category', ['Company limited by Shares', 'Company limited by Guarantee', 'Unlimited Company']),
      optional(choice('companySubCategory', 'Sub-category', ['Indian Non-Government Company', 'State Government Company', 'Central Government Company'])),
      optional(name('industryCategory', 'Industry Category')),
      note('primaryActivity', 'Primary Business Activity'),
      optional({ id: 'nicCode', label: 'NIC Code', rule: 'count', kind: 'number', inputMode: 'numeric', min: 1000, max: 99999, maxLength: 5, placeholder: 'e.g. 62011' }),
      optional(note('secondaryActivity', 'Secondary Activity')),
      optional(note('businessActivityDescription', 'Business Activity Description'))
    ]),
    ...group('Proposed Names', [
      name('proposedName1', 'Proposed Name 1'),
      optional(name('proposedName2', 'Proposed Name 2')),
      optional(name('proposedName3', 'Proposed Name 3')),
      optional(name('nameSuffix', 'Name Suffix', 'e.g. Private Limited', 40))
    ]),
    ...group('Registered Office', [
      address('registeredAddressLine', 'Registered Address'),
      name('registeredCity', 'City', '', 50),
      optional(name('registeredDistrict', 'District', '', 50)),
      choice('registeredState', 'State / UT', INDIAN_STATES),
      pinCode('registeredPincode'),
      choice('premisesOwnership', 'Premises', ['Rented', 'Owned', 'Leased']),
      email('companyEmail', 'Company Email'),
      mobile('companyMobile', 'Company Mobile')
    ]),
    ...group('Share Capital', [
      amount('authorizedCapital', 'Authorised Capital (₹)', 'e.g. 100000'),
      optional(amount('paidUpCapital', 'Subscribed / Paid-up Capital (₹)', 'e.g. 100000')),
      optional(count('numberOfShares', 'Number of Shares', 1, 100_000_000)),
      optional(amount('faceValuePerShare', 'Face Value per Share (₹)', 'e.g. 10'))
    ]),
    ...Array.from({ length: MAX_DIRECTORS }, (_, index) => director(index, index === 0)).flat(),
    // One line per allocation: "Director name · 1,000 shares · ₹10,000".
    ...group('Shareholding Pattern', Array.from({ length: MAX_DIRECTORS }, (_, index) => optional(note(`shareholding.${index}`, `Shareholder ${index + 1}`)))),
    ...applicationRecordFields('Company Registration ID')
  ],
  // The mobile app's eight uploads, in its order and with its required flags (the NOC is needed only for
  // rented or leased premises, so it is optional here).
  documents: documents(
    ['PAN Card', 'Identity / Address Proof'],
    ['Passport Photo']
  ).concat(
    documents(['Office Address Proof', 'Office Utility Bill'], ['Owner NOC', 'MOA / e-MOA', 'AOA / e-AOA'])
  )
});
