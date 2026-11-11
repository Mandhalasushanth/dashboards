import type { DemoCaseSeed } from '@/modules/workflow';

/**
 * DEVELOPMENT ONLY. Demo applications that start in the Loan Agent queues, shaped like real submissions
 * from the customer mobile app (same service ids, field names and dropdown values). Loaded by the
 * workflow demo backend through a dynamic import guarded by `import.meta.env.DEV`; excluded from
 * production builds. Agent ids match the demo staff directory managed in the admin console.
 */
export const LOAN_AGENT_DEMO_SEEDS: readonly DemoCaseSeed[] = Object.freeze([
  ['LOAN', 'business-loan', 'Sai Krishna Exports', 'AASFS9902R', 'Vizag', 'PORTAL_WORK', 'AGT-401', 4, 2, { businessName: 'Sai Krishna Exports', loanAmount: '7500000', turnover: '42000000', vintage: '6' }],
  ['LOAN', 'personal-loan', 'Kavya Rao', 'CQXPR2290B', 'Mysuru', 'ASSIGNED', 'AGT-401', 2, 4, { monthlySalary: '95000', loanAmount: '600000', employer: 'Infosys Limited' }],
  ['INSURANCE', 'life-insurance', 'Neel Joshi', 'AGHPJ5521K', 'Ahmedabad', 'DOCS_MISSING', 'AGT-401', 7, 3, { sumAssured: '5000000', tobacco: 'No', occupation: 'Business Owner' }]
]);
