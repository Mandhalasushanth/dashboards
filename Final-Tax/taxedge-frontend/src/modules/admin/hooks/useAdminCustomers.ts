import { useCallback, useEffect, useMemo, useState } from 'react';
import { logger } from '@/core/logging/logger';
import { onWorkflowChanged } from '@/modules/workflow';
import { fetchCustomers } from '../api/adminCustomersApi';
import type { Customer, CustomerActivityFilter, CustomerServiceFilter, CustomerTypeFilter } from '../shared/customers.types';

export interface CustomersSummary {
  readonly total: number;
  readonly withOpen: number;
  readonly businesses: number;
  readonly applications: number;
}

export interface AdminCustomersController {
  readonly status: 'loading' | 'success' | 'error';
  readonly error: string | null;
  readonly customers: readonly Customer[];
  readonly visible: readonly Customer[];
  readonly summary: CustomersSummary;
  readonly search: string;
  readonly setSearch: (value: string) => void;
  readonly typeFilter: CustomerTypeFilter;
  readonly setTypeFilter: (value: CustomerTypeFilter) => void;
  readonly serviceFilter: CustomerServiceFilter;
  readonly setServiceFilter: (value: CustomerServiceFilter) => void;
  readonly activityFilter: CustomerActivityFilter;
  readonly setActivityFilter: (value: CustomerActivityFilter) => void;
  readonly resetFilters: () => void;
  readonly reload: () => Promise<void>;
}

const SEARCH_MAX_LENGTH = 60;

function matches(customer: Customer, query: string, type: CustomerTypeFilter, service: CustomerServiceFilter, activity: CustomerActivityFilter): boolean {
  const checks: readonly boolean[] = [
    !query || [customer.name, customer.pan, customer.email, customer.mobile, customer.city].some((value) => value.toLowerCase().includes(query)),
    type === 'ALL' || customer.entityType === type,
    service === 'ALL' || customer.applications.some((application) => application.service === service),
    activity === 'ALL' || (activity === 'OPEN' ? customer.openCount > 0 : customer.openCount === 0)
  ];
  return checks.every(Boolean);
}

/** Customer directory: loads once, refreshes after any workflow change, filters locally. */
export function useAdminCustomers(): AdminCustomersController {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<readonly Customer[]>([]);
  const [search, setSearchState] = useState('');
  const [typeFilter, setTypeFilter] = useState<CustomerTypeFilter>('ALL');
  const [serviceFilter, setServiceFilter] = useState<CustomerServiceFilter>('ALL');
  const [activityFilter, setActivityFilter] = useState<CustomerActivityFilter>('ALL');

  const reload = useCallback(async () => {
    try {
      setError(null);
      const list = await fetchCustomers();
      setCustomers([...list].sort((a, b) => Date.parse(b.lastActivityAt) - Date.parse(a.lastActivityAt)));
      setStatus('success');
    } catch (cause) {
      logger.warn('Customers could not be loaded.', { cause });
      setError(cause instanceof Error ? cause.message : 'Unable to load customers.');
      setStatus((current) => (current === 'success' ? current : 'error'));
    }
  }, []);

  useEffect(() => {
    void reload();
    return onWorkflowChanged(() => {
      void reload();
    });
  }, [reload]);

  const setSearch = useCallback((value: string) => setSearchState(value.replace(/[^A-Za-z0-9 .@_-]/g, '').slice(0, SEARCH_MAX_LENGTH)), []);

  const visible = useMemo(
    () => customers.filter((customer) => matches(customer, search.trim().toLowerCase(), typeFilter, serviceFilter, activityFilter)),
    [customers, search, typeFilter, serviceFilter, activityFilter]
  );

  const summary = useMemo<CustomersSummary>(
    () => ({
      total: customers.length,
      withOpen: customers.filter((customer) => customer.openCount > 0).length,
      businesses: customers.filter((customer) => customer.entityType !== 'INDIVIDUAL').length,
      applications: customers.reduce((sum, customer) => sum + customer.applications.length, 0)
    }),
    [customers]
  );

  const resetFilters = useCallback(() => {
    setSearchState('');
    setTypeFilter('ALL');
    setServiceFilter('ALL');
    setActivityFilter('ALL');
  }, []);

  return {
    status,
    error,
    customers,
    visible,
    summary,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    serviceFilter,
    setServiceFilter,
    activityFilter,
    setActivityFilter,
    resetFilters,
    reload
  };
}
