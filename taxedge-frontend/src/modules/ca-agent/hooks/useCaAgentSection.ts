import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '@/shared';
import type { QueueEntry } from '@/modules/workflow';
import { getCaAgentNavItem } from '../shared/caAgentNavigation';
import type { CaAgentNavItem, CaAgentSectionId } from '../shared/caAgent.types';
import { parseCaAgentQueueParams } from '../validation/caAgentValidation';

export interface CaAgentSectionContext {
  readonly item: CaAgentNavItem;
  /** Validated deep-link values (case to open, service filter). */
  readonly entry: QueueEntry;
}

/** Menu entry, document title and validated URL parameters for one section. */
export function useCaAgentSection(id: CaAgentSectionId): CaAgentSectionContext {
  const item = getCaAgentNavItem(id);
  useDocumentTitle(item.label);
  const [params] = useSearchParams();
  const query = params.toString();
  // Read once per distinct query string so the queue is not reset on unrelated renders.
  const entry = useMemo(() => parseCaAgentQueueParams(new URLSearchParams(query)), [query]);
  return { item, entry };
}
