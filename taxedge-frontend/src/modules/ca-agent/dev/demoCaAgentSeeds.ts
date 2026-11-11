import type { DemoCaseSeed } from '@/modules/workflow';
import { gstRegistrationSample } from '@/modules/workflow/dev/demoGstRegistrationSample';

/**
 * DEVELOPMENT ONLY. Demo applications that start in the CA Agent queues, shaped like real submissions
 * from the customer mobile app (same service ids, field names and dropdown values). Loaded by the
 * workflow demo backend through a dynamic import guarded by `import.meta.env.DEV`; excluded from
 * production builds. Agent ids match the demo staff directory managed in the admin console.
 */
export const CA_AGENT_DEMO_SEEDS: readonly DemoCaseSeed[] = Object.freeze([
  ['GST', 'gst-registration', 'Shree Balaji Foods', 'AAHFS6610Q', 'Nagpur', 'ASSIGNED', 'AGT-301', 2, 3, gstRegistrationSample({ legalName: 'Shree Balaji Foods', pan: 'AAHFS6610Q', city: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', pinCode: '440001', constitution: 'PROPRIETORSHIP', signatory: 'Shree Agrawal', designation: 'Proprietor', commencedOn: '2026-07-15' })],
  ['ITR', 'itr-filing', 'Anil Gupta', 'AEPPG2201H', 'Delhi', 'PORTAL_WORK', 'AGT-301', 4, 1, { fullName: 'Anil Gupta', dob: '1985-11-03', incomeType: 'Capital Gains', estimatedIncome: '2400000' }],
  ['ITR', 'revised-itr', 'Meera Iyer', 'BKZPI9034C', 'Chennai', 'DOCS_MISSING', 'AGT-302', 6, -1, { assessmentYear: 'AY 2025-26', revisionReason: 'Rental income from second flat was missed' }],
  ['INCORPORATION', 'company-registration', 'Sneha Das', 'DLMPD5520B', 'Kolkata', 'ASSIGNED', 'AGT-302', 9, 6, { proposedName1: 'Dasworks Private Limited', proposedName2: '', directorsCount: '2', businessActivity: 'Interior design and fit-out services' }]
]);
