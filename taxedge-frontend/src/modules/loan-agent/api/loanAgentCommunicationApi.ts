import { createMessagingApi } from '@/modules/admin';
import { invalidateLoanAgentNavCounters } from './loanAgentNavigationApi';

/** The Loan Agent's messaging: their manager and the administrator. */
export const loanAgentMessagingApi = createMessagingApi({
  onRead: () => invalidateLoanAgentNavCounters()
});
