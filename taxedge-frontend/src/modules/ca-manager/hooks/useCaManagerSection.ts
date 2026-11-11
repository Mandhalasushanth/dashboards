import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '@/shared';
import type { QueueEntry } from '@/modules/workflow';
import { getCaManagerNavItem } from '../shared/caManagerNavigation';
import type { CaManagerNavItem, CaManagerSectionId } from '../shared/caManager.types';
import { parseCaManagerQueueParams } from '../validation/caManagerValidation';

export interface CaManagerSectionContext {
  readonly item: CaManagerNavItem;
  /** Validated deep-link values (case to open, service filter). */
  readonly entry: QueueEntry;
}

/** Menu entry, document title and validated URL parameters for one section. */
export function useCaManagerSection(id: CaManagerSectionId): CaManagerSectionContext {
  const item = getCaManagerNavItem(id);
  useDocumentTitle(item.label);
  const [params] = useSearchParams();
  const query = params.toString();
  // Read once per distinct query string so the queue is not reset on unrelated renders.
  const entry = useMemo(() => parseCaManagerQueueParams(new URLSearchParams(query)), [query]);
  return { item, entry };
}
