import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '@/shared';
import type { QueueEntry } from '@/modules/workflow';
import { getLoanAgentNavItem } from '../shared/loanAgentNavigation';
import type { LoanAgentNavItem, LoanAgentSectionId } from '../shared/loanAgent.types';
import { parseLoanAgentQueueParams } from '../validation/loanAgentValidation';

export interface LoanAgentSectionContext {
  readonly item: LoanAgentNavItem;
  /** Validated deep-link values (case to open, service filter). */
  readonly entry: QueueEntry;
}

/** Menu entry, document title and validated URL parameters for one section. */
export function useLoanAgentSection(id: LoanAgentSectionId): LoanAgentSectionContext {
  const item = getLoanAgentNavItem(id);
  useDocumentTitle(item.label);
  const [params] = useSearchParams();
  const query = params.toString();
  // Read once per distinct query string so the queue is not reset on unrelated renders.
  const entry = useMemo(() => parseLoanAgentQueueParams(new URLSearchParams(query)), [query]);
  return { item, entry };
}
