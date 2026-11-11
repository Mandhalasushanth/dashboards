import { useEffect, useState } from 'react';
import { logger } from '@/core/logging/logger';
import { fetchLoanAgentNavCounters, onLoanAgentNavCountersInvalidated } from '../api/loanAgentNavigationApi';
import type { LoanAgentNavCounters } from '../shared/loanAgent.types';

/** Loads badge counts, and reloads them whenever an action may have changed them; on failure badges hide. */
export function useLoanAgentNavCounters(): LoanAgentNavCounters {
  const [counters, setCounters] = useState<LoanAgentNavCounters>({});

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await fetchLoanAgentNavCounters();
        if (active) {
          setCounters(result);
        }
      } catch (error) {
        logger.warn('Sidebar counters are unavailable.', { error });
      }
    };
    void load();
    const stopListening = onLoanAgentNavCountersInvalidated(() => {
      void load();
    });
    return () => {
      active = false;
      stopListening();
    };
  }, []);

  return counters;
}
