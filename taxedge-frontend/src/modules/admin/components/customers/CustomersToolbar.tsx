import { SERVICE_KINDS, getServiceDefinition } from '@/modules/workflow';
import { Button, Icon } from '@/shared';
import type { AdminCustomersController } from '../../hooks/useAdminCustomers';
import { ENTITY_TYPE_LABELS, type CustomerActivityFilter, type CustomerEntityType, type CustomerServiceFilter, type CustomerTypeFilter } from '../../shared/customers.types';
import './CustomersToolbar.css';

const ACTIVITY_OPTIONS: readonly { readonly value: CustomerActivityFilter; readonly label: string }[] = [
  { value: 'ALL', label: 'Any activity' },
  { value: 'OPEN', label: 'Has open applications' },
  { value: 'NO_OPEN', label: 'No open applications' }
];

export interface CustomersToolbarProps {
  readonly controller: AdminCustomersController;
  readonly hasFilters: boolean;
}

export function CustomersToolbar({ controller, hasFilters }: CustomersToolbarProps) {
  return (
    <div className="tx-customers-toolbar" role="search">
      <label className="tx-customers-toolbar__search">
        <Icon name="search" size="sm" />
        <span className="tx-sr-only">Search customers</span>
        <input
          type="search"
          placeholder="Search name, PAN, email, mobile or city"
          value={controller.search}
          maxLength={60}
          onChange={(event) => controller.setSearch(event.target.value)}
        />
      </label>
      <select aria-label="Entity type" className="tx-customers-toolbar__select" value={controller.typeFilter} onChange={(event) => controller.setTypeFilter(event.target.value as CustomerTypeFilter)}>
        <option value="ALL">All entity types</option>
        {(Object.keys(ENTITY_TYPE_LABELS) as CustomerEntityType[]).map((type) => (
          <option key={type} value={type}>
            {ENTITY_TYPE_LABELS[type]}
          </option>
        ))}
      </select>
      <select aria-label="Service" className="tx-customers-toolbar__select" value={controller.serviceFilter} onChange={(event) => controller.setServiceFilter(event.target.value as CustomerServiceFilter)}>
        <option value="ALL">All services</option>
        {SERVICE_KINDS.map((kind) => (
          <option key={kind} value={kind}>
            {getServiceDefinition(kind).label}
          </option>
        ))}
      </select>
      <select aria-label="Activity" className="tx-customers-toolbar__select" value={controller.activityFilter} onChange={(event) => controller.setActivityFilter(event.target.value as CustomerActivityFilter)}>
        {ACTIVITY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasFilters ? (
        <Button variant="secondary" iconName="rotate-ccw" onClick={controller.resetFilters}>
          Reset
        </Button>
      ) : null}
    </div>
  );
}
