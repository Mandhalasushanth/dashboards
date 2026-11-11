import { createMessagingApi } from '@/modules/admin';
import { invalidateCaManagerNavCounters } from './caManagerNavigationApi';

/** The CA Manager's messaging: their agents, the customers on their applications and the administrator. */
export const caManagerMessagingApi = createMessagingApi({
  onRead: () => invalidateCaManagerNavCounters()
});
