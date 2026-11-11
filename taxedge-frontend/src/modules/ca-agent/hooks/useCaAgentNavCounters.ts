import { useEffect, useState } from 'react';
import { logger } from '@/core/logging/logger';
import { fetchCaAgentNavCounters, onCaAgentNavCountersInvalidated } from '../api/caAgentNavigationApi';
import type { CaAgentNavCounters } from '../shared/caAgent.types';

/** Loads badge counts, and reloads them whenever an action may have changed them; on failure badges hide. */
export function useCaAgentNavCounters(): CaAgentNavCounters {
  const [counters, setCounters] = useState<CaAgentNavCounters>({});

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await fetchCaAgentNavCounters();
        if (active) {
          setCounters(result);
        }
      } catch (error) {
        logger.warn('Sidebar counters are unavailable.', { error });
      }
    };
    void load();
    const stopListening = onCaAgentNavCountersInvalidated(() => {
      void load();
    });
    return () => {
      active = false;
      stopListening();
    };
  }, []);

  return counters;
}
