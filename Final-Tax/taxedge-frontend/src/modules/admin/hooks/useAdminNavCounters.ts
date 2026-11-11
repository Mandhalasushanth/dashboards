import { useEffect, useState } from 'react';
import { logger } from '@/core/logging/logger';
import { fetchAdminNavCounters, onAdminNavCountersInvalidated } from '../api/adminNavigationApi';
import type { AdminNavCounters } from '../shared/adminNavigation';

/** Loads badge counts, and reloads them whenever an action may have changed them; on failure badges hide. */
export function useAdminNavCounters(): AdminNavCounters {
  const [counters, setCounters] = useState<AdminNavCounters>({});

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await fetchAdminNavCounters();
        if (active) {
          setCounters(result);
        }
      } catch (error) {
        logger.warn('Sidebar counters are unavailable.', { error });
      }
    };
    void load();
    const stopListening = onAdminNavCountersInvalidated(() => {
      void load();
    });
    return () => {
      active = false;
      stopListening();
    };
  }, []);

  return counters;
}
