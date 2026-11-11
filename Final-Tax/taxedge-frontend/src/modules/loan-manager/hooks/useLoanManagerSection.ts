import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '@/shared';
import type { QueueEntry } from '@/modules/workflow';
import { getLoanManagerNavItem } from '../shared/loanManagerNavigation';
import type { LoanManagerNavItem, LoanManagerSectionId } from '../shared/loanManager.types';
import { parseLoanManagerQueueParams } from '../validation/loanManagerValidation';

export interface LoanManagerSectionContext {
  readonly item: LoanManagerNavItem;
  /** Validated deep-link values (case to open, service filter). */
  readonly entry: QueueEntry;
}

/** Menu entry, document title and validated URL parameters for one section. */
export function useLoanManagerSection(id: LoanManagerSectionId): LoanManagerSectionContext {
  const item = getLoanManagerNavItem(id);
  useDocumentTitle(item.label);
  const [params] = useSearchParams();
  const query = params.toString();
  // Read once per distinct query string so the queue is not reset on unrelated renders.
  const entry = useMemo(() => parseLoanManagerQueueParams(new URLSearchParams(query)), [query]);
  return { item, entry };
}
