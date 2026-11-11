import { useState } from 'react';
import { Button, DeferredContent, EmptyState, InlineAlert, KpiCard, KpiGrid, LoadingSpinner, useDocumentTitle } from '@/shared';
import { useAdminCustomers } from '../../hooks/useAdminCustomers';
import type { Customer } from '../../shared/customers.types';
import { getAdminNavItem } from '../../shared/adminNavigation';
import { CustomerDetailDrawer } from './CustomerDetailDrawer';
import { CustomersTable } from './CustomersTable';
import { CustomersToolbar } from './CustomersToolbar';
import './CustomersSection.css';

const ITEM = getAdminNavItem('customers');

/** Admin "Customers": every client once (by PAN), with their applications across all five services. */
export default function CustomersSection() {
  useDocumentTitle(ITEM.label);
  const customers = useAdminCustomers();
  const [viewing, setViewing] = useState<Customer | null>(null);

  if (customers.status === 'loading') {
    return (
      <DeferredContent>
        <div className="tx-customers__state">
          <LoadingSpinner size="lg" label="Loading customers" />
        </div>
      </DeferredContent>
    );
  }

  if (customers.status === 'error') {
    return (
      <div className="tx-customers__state" role="alert">
        <p>{customers.error}</p>
        <Button variant="secondary" iconName="rotate-ccw" onClick={() => void customers.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  const { summary } = customers;
  const hasFilters = Boolean(customers.search) || customers.typeFilter !== 'ALL' || customers.serviceFilter !== 'ALL' || customers.activityFilter !== 'ALL';

  return (
    <div className="tx-customers">
      <KpiGrid>
        <KpiCard label="Total customers" value={summary.total.toLocaleString()} iconName="users" />
        <KpiCard label="With open applications" value={summary.withOpen.toLocaleString()} iconName="briefcase" tone="orange" />
        <KpiCard label="Business entities" value={summary.businesses.toLocaleString()} iconName="building" />
        <KpiCard label="Applications" value={summary.applications.toLocaleString()} iconName="file-spreadsheet" tone="success" />
      </KpiGrid>

      <CustomersToolbar controller={customers} hasFilters={hasFilters} />
      {customers.error ? <InlineAlert tone="warning">Showing the last loaded list. {customers.error}</InlineAlert> : null}

      {customers.visible.length > 0 ? (
        <CustomersTable customers={customers.visible} onView={setViewing} />
      ) : (
        <div className="tx-customers__empty">
          <EmptyState
            iconName="users"
            title={customers.customers.length ? 'No customers match these filters' : 'No customers yet'}
            message={customers.customers.length ? 'Clear the search or change the filters.' : 'Customers appear here when their first application is submitted.'}
          />
        </div>
      )}

      {viewing ? <CustomerDetailDrawer customer={viewing} onClose={() => setViewing(null)} /> : null}
    </div>
  );
}
