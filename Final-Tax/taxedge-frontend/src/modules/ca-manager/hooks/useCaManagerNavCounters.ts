import { useEffect, useState } from 'react';
import { logger } from '@/core/logging/logger';
import { fetchCaManagerNavCounters, onCaManagerNavCountersInvalidated } from '../api/caManagerNavigationApi';
import type { CaManagerNavCounters } from '../shared/caManager.types';

/** Loads badge counts, and reloads them whenever an action may have changed them; on failure badges hide. */
export function useCaManagerNavCounters(): CaManagerNavCounters {
  const [counters, setCounters] = useState<CaManagerNavCounters>({});

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await fetchCaManagerNavCounters();
        if (active) {
          setCounters(result);
        }
      } catch (error) {
        logger.warn('Sidebar counters are unavailable.', { error });
      }
    };
    void load();
    const stopListening = onCaManagerNavCountersInvalidated(() => {
      void load();
    });
    return () => {
      active = false;
      stopListening();
    };
  }, []);

  return counters;
}
