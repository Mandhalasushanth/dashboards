import type { DemoCaseSeed } from '@/modules/workflow';

/**
 * DEVELOPMENT ONLY. Demo applications that start in the Loan Manager queues, shaped like real submissions
 * from the customer mobile app (same service ids, field names and dropdown values). Loaded by the
 * workflow demo backend through a dynamic import guarded by `import.meta.env.DEV`; excluded from
 * production builds. Agent ids match the demo staff directory managed in the admin console.
 */
export const LOAN_MANAGER_DEMO_SEEDS: readonly DemoCaseSeed[] = Object.freeze([
  ['LOAN', 'home-loan', 'Rohit Sharma', 'BXJPS4417F', 'Jaipur', 'SUBMITTED', null, 1, 10, { propertyValue: '6500000', loanAmount: '4500000' }],
  ['LOAN', 'vehicle-loan', 'Harish Nair', 'BHNPN4471G', 'Kochi', 'PAYMENT_PENDING', null, 1, 8, { vehicleType: 'Car', loanAmount: '850000' }],
  ['INSURANCE', 'life-insurance', 'Pooja Nair', 'CFRPN2268A', 'Thane', 'SUBMITTED', null, 2, 7, { sumAssured: '10000000', tobacco: 'No', occupation: 'Salaried' }],
  ['INSURANCE', 'health-insurance', 'Arjun Reddy', 'BNKPR6603J', 'Hyderabad', 'PAID', null, 5, 1, { insuredCount: '4', eldestAge: '62', preExisting: 'Yes' }],
  ['LOAN', 'property-loan', 'Fatima Sheikh', 'CQRPS1173N', 'Lucknow', 'COMPLETED', 'AGT-401', 12, 4, { propertyType: 'Commercial shop', loanAmount: '3000000' }]
]);
