import { useEffect, useState } from 'react';
import { logger } from '@/core/logging/logger';
import { fetchLoanManagerNavCounters, onLoanManagerNavCountersInvalidated } from '../api/loanManagerNavigationApi';
import type { LoanManagerNavCounters } from '../shared/loanManager.types';

/** Loads badge counts, and reloads them whenever an action may have changed them; on failure badges hide. */
export function useLoanManagerNavCounters(): LoanManagerNavCounters {
  const [counters, setCounters] = useState<LoanManagerNavCounters>({});

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await fetchLoanManagerNavCounters();
        if (active) {
          setCounters(result);
        }
      } catch (error) {
        logger.warn('Sidebar counters are unavailable.', { error });
      }
    };
    void load();
    const stopListening = onLoanManagerNavCountersInvalidated(() => {
      void load();
    });
    return () => {
      active = false;
      stopListening();
    };
  }, []);

  return counters;
}
