import { useCallback, useMemo, useState } from 'react';
import { workflowApi } from '../api/workflowApi';
import { DEFAULT_PAGE_SIZE } from '../shared/workflowStatuses';
import type { KpiDefinition, QueuePreset } from '../shared/workflowViews';
import type { CasePage, CaseQuery, CaseStatus, ServiceKind } from '../shared/workflow.types';
import { useWorkflowResource, type WorkflowResource } from './useWorkflowResource';

export interface QueueFilters {
  readonly search: string;
  readonly service: ServiceKind | 'ALL';
  /** A customer app service id, or every type of the selected services. */
  readonly serviceType: string;
  readonly status: CaseStatus | 'ALL';
  /** Set only by the presets and the Overdue KPI card; the toolbar has no overdue control. */
  readonly overdueOnly: boolean;
  readonly unassignedOnly: boolean;
  readonly page: number;
}

export interface CaseQueueController {
  readonly resource: WorkflowResource<CasePage>;
  readonly filters: QueueFilters;
  readonly hasActiveFilters: boolean;
  readonly setFilter: <K extends keyof QueueFilters>(key: K, value: QueueFilters[K]) => void;
  readonly applyKpi: (kpi: KpiDefinition) => void;
  readonly resetFilters: () => void;
}

const initialFilters = (preset: QueuePreset, service: ServiceKind | 'ALL' = 'ALL'): QueueFilters => ({
  search: '',
  service,
  serviceType: 'ALL',
  status: 'ALL',
  overdueOnly: preset.overdueOnly ?? false,
  unassignedOnly: preset.unassignedOnly ?? false,
  page: 1
});

/** Builds the server query: the preset fixes the scope, the user's filters narrow it further. */
export function toCaseQuery(preset: QueuePreset, filters: QueueFilters): CaseQuery {
  return {
    statuses: filters.status === 'ALL' ? preset.statuses : [filters.status],
    services: filters.service === 'ALL' ? preset.services : [filters.service],
    serviceTypes: filters.serviceType === 'ALL' ? undefined : [filters.serviceType],
    unassignedOnly: filters.unassignedOnly,
    overdueOnly: filters.overdueOnly,
    claim: preset.mineOnly ? 'MINE' : undefined,
    search: filters.search.trim(),
    sort: preset.sort ?? 'submittedAt',
    page: filters.page,
    pageSize: DEFAULT_PAGE_SIZE
  };
}

export interface QueueEntry {
  readonly caseId?: string | null;
  /** Service pre-selected from a link (e.g. the dashboard breakdown); ignored unless the queue offers it. */
  readonly service?: string | null;
}

export function useCaseQueue(preset: QueuePreset, entry: QueueEntry = {}): CaseQueueController {
  const [filters, setFilters] = useState<QueueFilters>(() => {
    const service = preset.services.find((kind) => kind === entry.service) ?? 'ALL';
    return initialFilters(preset, preset.services.length > 1 ? service : 'ALL');
  });
  const query = useMemo(() => toCaseQuery(preset, filters), [preset, filters]);
  const load = useCallback(() => workflowApi.listCases(query), [query]);
  const resource = useWorkflowResource(load, 'Unable to load applications.');

  const setFilter = useCallback(<K extends keyof QueueFilters>(key: K, value: QueueFilters[K]) => {
    // Any filter change returns to the first page; changing the page keeps the other filters.
    // Changing the service clears a service type that no longer belongs to it.
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === 'service' ? { serviceType: 'ALL' } : {}),
      page: key === 'page' ? (value as number) : 1
    }));
  }, []);

  const resetFilters = useCallback(() => setFilters(initialFilters(preset)), [preset]);

  const applyKpi = useCallback(
    (kpi: KpiDefinition) =>
      setFilters({
        ...initialFilters(preset),
        status: kpi.filter?.statuses?.length === 1 ? kpi.filter.statuses[0] : 'ALL',
        unassignedOnly: kpi.filter?.unassignedOnly ?? false,
        overdueOnly: kpi.filter?.overdueOnly ?? false
      }),
    [preset]
  );

  const defaults = initialFilters(preset);
  const hasActiveFilters = (Object.keys(defaults) as (keyof QueueFilters)[]).some((key) => key !== 'page' && filters[key] !== defaults[key]);

  return {
    resource,
    filters,
    hasActiveFilters,
    setFilter,
    applyKpi,
    resetFilters
  };
}
