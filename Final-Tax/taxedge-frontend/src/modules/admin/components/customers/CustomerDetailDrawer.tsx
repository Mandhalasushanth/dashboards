import { useEffect, useId } from 'react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/core/config/routePaths';
import { formatDateTime } from '@/core/utils/dateUtils';
import { CaseStatusBadge, getServiceType, ServiceBadge } from '@/modules/workflow';
import { Icon } from '@/shared';
import { ENTITY_TYPE_LABELS, type Customer, type CustomerApplication } from '../../shared/customers.types';
import './CustomerDetailDrawer.css';

export interface CustomerDetailDrawerProps {
  readonly customer: Customer;
  readonly onClose: () => void;
}

/** Customer profile and full service history; each application opens in the Applications workspace. */
export function CustomerDetailDrawer({ customer, onClose }: CustomerDetailDrawerProps) {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const profile: readonly [string, string][] = [
    ['PAN', customer.pan],
    ['Entity type', ENTITY_TYPE_LABELS[customer.entityType]],
    ['Email', customer.email || '—'],
    ['Mobile', customer.mobile || '—'],
    ['City', customer.city || '—'],
    ['Customer since', formatDateTime(customer.firstSeenAt)]
  ];

  const applications = [...customer.applications].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

  const renderApplication = (application: CustomerApplication) => (
    <li key={application.caseId} className="tx-customer-drawer__app">
      <div className="tx-customer-drawer__app-main">
        <span className="tx-customer-drawer__ref">{application.referenceNumber}</span>
        <span className="tx-customer-drawer__type">{getServiceType(application.serviceType, application.service).label}</span>
        <span className="tx-customer-drawer__badges">
          <ServiceBadge service={application.service} />
          <CaseStatusBadge status={application.status} />
        </span>
        <span className="tx-customer-drawer__muted">
          Submitted {formatDateTime(application.submittedAt)} · Updated {formatDateTime(application.updatedAt)}
        </span>
      </div>
      <Link className="tx-customer-drawer__open" to={`${ROUTE_PATHS.adminApplications}?case=${encodeURIComponent(application.caseId)}`}>
        <Icon name="eye" size="sm" />
        View
      </Link>
    </li>
  );

  return (
    <div className="tx-customer-drawer__overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="tx-customer-drawer" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="tx-customer-drawer__header">
          <div>
            <p className="tx-customer-drawer__eyebrow">Customer</p>
            <h2 id={titleId} className="tx-customer-drawer__title">
              {customer.name}
            </h2>
          </div>
          <button type="button" className="tx-customer-drawer__close" onClick={onClose} aria-label="Close customer">
            <Icon name="x" />
          </button>
        </header>

        <div className="tx-customer-drawer__body">
          <div className="tx-customer-drawer__stats">
            <span><strong>{customer.applications.length}</strong> {customer.applications.length === 1 ? "application" : "applications"}</span>
            <span><strong>{customer.openCount}</strong> open</span>
            <span><strong>{customer.completedCount}</strong> completed</span>
          </div>

          <section>
            <h3 className="tx-customer-drawer__section">Profile</h3>
            <dl className="tx-customer-drawer__grid">
              {profile.map(([label, value]) => (
                <div key={label} className="tx-customer-drawer__field">
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h3 className="tx-customer-drawer__section">Applications</h3>
            <ul className="tx-customer-drawer__apps">{applications.map(renderApplication)}</ul>
          </section>
        </div>
      </aside>
    </div>
  );
}
