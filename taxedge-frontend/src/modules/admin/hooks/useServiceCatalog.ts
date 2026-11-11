import { useCallback, useEffect, useMemo, useState } from 'react';
import { logger } from '@/core/logging/logger';
import type { ServiceKind, WorkflowTeam } from '@/modules/workflow';
import { promotionActive } from '../shared/servicePricing';
import { fetchServiceCatalog, updateCatalogService } from '../api/adminServiceCatalogApi';
import type { CatalogService, CatalogServiceUpdate } from '../shared/serviceCatalog.types';

export type CatalogTeamFilter = 'ALL' | WorkflowTeam;
export type CatalogKindFilter = 'ALL' | ServiceKind;

export interface ServiceCatalogController {
  readonly status: 'loading' | 'success' | 'error';
  readonly error: string | null;
  readonly services: readonly CatalogService[];
  readonly visible: readonly CatalogService[];
  readonly kindFilter: CatalogKindFilter;
  readonly setKindFilter: (kind: CatalogKindFilter) => void;
  readonly search: string;
  readonly setSearch: (value: string) => void;
  readonly summary: { readonly total: number; readonly active: number; readonly priced: number; readonly offers: number };
  readonly reload: () => Promise<void>;
  /** Resolves to null on success, otherwise the error message to show in the form. */
  readonly save: (serviceType: string, update: CatalogServiceUpdate) => Promise<string | null>;
}

export function useServiceCatalog(): ServiceCatalogController {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<readonly CatalogService[]>([]);
  const [kindFilter, setKindFilter] = useState<CatalogKindFilter>('ALL');
  const [search, setSearch] = useState('');

  const reload = useCallback(async () => {
    try {
      setError(null);
      setServices(await fetchServiceCatalog());
      setStatus('success');
    } catch (cause) {
      logger.warn('Service catalog could not be loaded.', { cause });
      setError(cause instanceof Error ? cause.message : 'Unable to load the service catalog.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(async (serviceType: string, update: CatalogServiceUpdate) => {
    try {
      const saved = await updateCatalogService(serviceType, update);
      setServices((current) => current.map((item) => (item.serviceType === serviceType ? saved : item)));
      return null;
    } catch (cause) {
      return cause instanceof Error ? cause.message : 'The service could not be saved.';
    }
  }, []);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return services.filter((item) => (kindFilter === 'ALL' || item.kind === kindFilter) && (!query || item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query)));
  }, [services, kindFilter, search]);

  const summary = useMemo(
    () => ({
      total: services.length,
      active: services.filter((item) => item.active).length,
      priced: services.filter((item) => item.pricing.model !== 'QUOTED' || item.pricing.fee > 0).length,
      offers: services.filter((item) => promotionActive(item) || item.discount.value > 0).length
    }),
    [services]
  );

  return { status, error, services, visible, kindFilter, setKindFilter, search, setSearch, summary, reload, save };
}
