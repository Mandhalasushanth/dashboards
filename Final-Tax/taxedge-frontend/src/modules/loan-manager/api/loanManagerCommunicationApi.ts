import { createMessagingApi } from '@/modules/admin';
import { invalidateLoanManagerNavCounters } from './loanManagerNavigationApi';

/** The Loan Manager's messaging: their agents, the customers on their applications and the administrator. */
export const loanManagerMessagingApi = createMessagingApi({
  onRead: () => invalidateLoanManagerNavCounters()
});
