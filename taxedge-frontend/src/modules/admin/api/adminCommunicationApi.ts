import { invalidateAdminNavCounters } from './adminNavigationApi';
import { createMessagingApi } from './messagingClient';

/** The administrator's messaging: every CA and loan manager and agent. */
export const adminMessagingApi = createMessagingApi({
  onRead: invalidateAdminNavCounters
});
