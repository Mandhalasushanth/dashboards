import { createMessagingApi } from '@/modules/admin';
import { invalidateCaAgentNavCounters } from './caAgentNavigationApi';

/** The CA Agent's messaging: their manager and the administrator. */
export const caAgentMessagingApi = createMessagingApi({
  onRead: () => invalidateCaAgentNavCounters()
});
