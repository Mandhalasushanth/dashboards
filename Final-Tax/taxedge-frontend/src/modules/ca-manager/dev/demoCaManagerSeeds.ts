import type { DemoCaseSeed } from '@/modules/workflow';
import { gstRegistrationSample } from '@/modules/workflow/dev/demoGstRegistrationSample';

/**
 * DEVELOPMENT ONLY. Demo applications that start in the CA Manager queues, shaped like real submissions
 * from the customer mobile app (same service ids, field names and dropdown values). Loaded by the
 * workflow demo backend through a dynamic import guarded by `import.meta.env.DEV`; excluded from
 * production builds. Agent ids match the demo staff directory managed in the admin console.
 */
export const CA_MANAGER_DEMO_SEEDS: readonly DemoCaseSeed[] = Object.freeze([
  ['GST', 'gst-registration', 'Kulkarni Traders', 'AAKFK4821M', 'Pune', 'SUBMITTED', null, 1, 4, gstRegistrationSample({ legalName: 'Kulkarni Traders', pan: 'AAKFK4821M', city: 'Pune', district: 'Pune', state: 'Maharashtra', pinCode: '411001', constitution: 'PARTNERSHIP', signatory: 'Vikas Kulkarni', designation: 'Partner', commencedOn: '2026-09-01' })],
  ['ITR', 'itr-filing', 'Ritika Menon', 'BQRPM7712D', 'Kochi', 'SUBMITTED', null, 3, 1, { fullName: 'Ritika Menon', dob: '1991-04-12', incomeType: 'Salaried', estimatedIncome: '1250000' }],
  ['INCORPORATION', 'company-registration', 'Vikram Rao', 'CTWPR3390K', 'Hyderabad', 'SUBMITTED', null, 0, 15, { proposedName1: 'Raotech Systems Private Limited', proposedName2: 'Raotech Solutions Private Limited', directorsCount: '2', businessActivity: 'Software development and IT consulting' }],
  ['INCORPORATION', 'accounting-bookkeeping', 'Sharma Textiles', 'AAKFS5521K', 'Ludhiana', 'CORRECTION_NEEDED', null, 2, 10, { businessName: 'Sharma Textiles', monthlyTransactions: '450' }],
  ['GST', 'gst-amendment', 'Mehta Electricals', 'AAJFM7734C', 'Indore', 'PAYMENT_PENDING', null, 2, 5, { gstin: '23AAJFM7734C1Z2', amendmentSection: 'Bank Account' }],
  ['GST', 'gst-filing', 'Patel Hardware', 'AAOFP1186L', 'Surat', 'PAID', null, 3, 2, { gstin: '24AAOFP1186L1ZD', filingPeriod: 'August 2026' }],
  ['ITR', 'tds-refund', 'Karan Malhotra', 'AHVPM8890E', 'Mumbai', 'PAID', null, 4, 3, { pan: 'AHVPM8890E', financialYear: 'FY 2025-26' }],
  ['GST', 'gst-compliance', 'Green Leaf Organics', 'AAJCG3345P', 'Bengaluru', 'COMPLETED', 'AGT-301', 20, -10, { gstin: '29AAJCG3345P1Z8', contactPerson: 'Ravi Gowda' }]
]);
