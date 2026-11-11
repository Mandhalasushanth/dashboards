import { toInitials } from '@/core/utils/stringUtils';
import { SERVICE_DEFINITIONS, SERVICE_TYPES, getServiceType, type ServiceKind } from '@/modules/workflow';
import { Button, Icon } from '@/shared';
import { ENTITY_TYPE_LABELS, type Customer } from '../../shared/customers.types';
import './CustomersTable.css';

export interface CustomersTableProps {
  readonly customers: readonly Customer[];
  readonly onView: (customer: Customer) => void;
}

/** Position of each service type in the catalogue, so every row lists services in the same order. */
const SERVICE_ORDER = new Map(SERVICE_TYPES.map((type, index) => [type.id, index]));

interface ServiceGroup {
  readonly kind: ServiceKind;
  readonly label: string;
  /** How many of the customer's applications are for this service. */
  readonly count: number;
  /** The service types applied for, in catalogue order, for the tag's tooltip. */
  readonly types: readonly string[];
}

/** What the customer applied for, as one tag per service (GST, ITR...) in catalogue order. */
function servicesOf(customer: Customer): ServiceGroup[] {
  const byKind = new Map<ServiceKind, { count: number; types: Set<string> }>();
  const sorted = [...customer.applications].sort(
    (a, b) => (SERVICE_ORDER.get(a.serviceType) ?? 999) - (SERVICE_ORDER.get(b.serviceType) ?? 999)
  );
  for (const application of sorted) {
    const entry = byKind.get(application.service) ?? { count: 0, types: new Set<string>() };
    entry.count += 1;
    entry.types.add(getServiceType(application.serviceType, application.service).label);
    byKind.set(application.service, entry);
  }
  return [...byKind].map(([kind, entry]) => ({ kind, label: SERVICE_DEFINITIONS[kind].shortLabel, count: entry.count, types: [...entry.types] }));
}

/** The backend customer id, when the row has one (rows without a profile fall back to the PAN or email). */
const customerIdOf = (customer: Customer): string | null =>
  customer.id && customer.id !== customer.pan && !customer.id.includes('@') ? customer.id : null;

/** Customer list: a table on desktop, stacked cards (labels from data-label) on small screens. */
export function CustomersTable({ customers, onView }: CustomersTableProps) {
  const renderServices = (customer: Customer) => (
    <span className="tx-customers-table__services">
      {servicesOf(customer).map((group) => (
        <span key={group.kind} className="tx-customers-table__service" title={group.types.join(', ')}>
          {group.label}
          <span className="tx-customers-table__service-count">{group.count}</span>
        </span>
      ))}
    </span>
  );

  const renderRow = (customer: Customer) => {
    const customerId = customerIdOf(customer);
    const completed = customer.completedCount;
    return (
      <tr key={customer.id}>
        <td data-label="Customer">
          <div className="tx-customers-table__who">
            <span className="tx-customers-table__avatar" aria-hidden="true">
              {toInitials(customer.name)}
            </span>
            <span className="tx-customers-table__stack">
              <span className="tx-customers-table__name tx-customers-table__clip" title={customer.name}>{customer.name}</span>
              {customerId ? <span className="tx-customers-table__muted tx-customers-table__clip">ID {customerId}</span> : null}
            </span>
          </div>
        </td>
        <td data-label="Type & PAN">
          <span className="tx-customers-table__stack">
            <span className="tx-customers-table__type">{ENTITY_TYPE_LABELS[customer.entityType]}</span>
            <span className="tx-customers-table__pan">{customer.pan || '—'}</span>
          </span>
        </td>
        <td data-label="Contact">
          <span className="tx-customers-table__stack">
            <span className="tx-customers-table__line" title={customer.email || undefined}>
              <Icon name="mail" size="sm" />
              <span className="tx-customers-table__clip">{customer.email || '—'}</span>
            </span>
            <span className="tx-customers-table__line tx-customers-table__muted">
              <Icon name="phone" size="sm" />
              <span className="tx-customers-table__clip">
                {customer.mobile || '—'}
                {customer.city ? ` · ${customer.city}` : ''}
              </span>
            </span>
          </span>
        </td>
        <td data-label="Applied For">{renderServices(customer)}</td>
        <td data-label="Applications">
          <span className="tx-customers-table__stack">
            {customer.openCount > 0 ? (
              <span className="tx-customers-table__open">{customer.openCount} in progress</span>
            ) : (
              <span className="tx-customers-table__done">All completed</span>
            )}
            <span className="tx-customers-table__muted">
              {completed} of {customer.applications.length} done
            </span>
          </span>
        </td>
        <td data-label="Details" className="tx-customers-table__action">
          <Button variant="secondary" iconName="eye" onClick={() => onView(customer)} aria-label={`View ${customer.name}`}>
            View
          </Button>
        </td>
      </tr>
    );
  };

  return (
    <div className="tx-customers-table-card">
      <div className="tx-customers-table-scroll">
        <table className="tx-customers-table">
          <caption className="tx-sr-only">Customers</caption>
          {/* Fixed column widths keep every row the same shape, however long a name or email is. */}
          <colgroup>
            <col className="tx-customers-table__col-customer" />
            <col className="tx-customers-table__col-type" />
            <col className="tx-customers-table__col-contact" />
            <col className="tx-customers-table__col-services" />
            <col className="tx-customers-table__col-apps" />
            <col className="tx-customers-table__col-action" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Customer</th>
              <th scope="col">Type &amp; PAN</th>
              <th scope="col">Contact</th>
              <th scope="col">Applied For</th>
              <th scope="col">Applications</th>
              <th scope="col" className="tx-customers-table__action">Details</th>
            </tr>
          </thead>
          <tbody>{customers.map(renderRow)}</tbody>
        </table>
      </div>
    </div>
  );
}
