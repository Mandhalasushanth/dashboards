import { useState } from 'react';
import { SERVICE_DEFINITIONS, SERVICE_KINDS } from '@/modules/workflow';
import { Button, DeferredContent, Icon, InlineAlert, KpiCard, KpiGrid, LoadingSpinner, useDocumentTitle } from '@/shared';
import { useServiceCatalog, type CatalogKindFilter } from '../../hooks/useServiceCatalog';
import { getAdminNavItem } from '../../shared/adminNavigation';
import type { CatalogService } from '../../shared/serviceCatalog.types';
import { PricingTable } from './PricingTable';
import { ServiceEditModal } from './ServiceEditModal';
import './ServiceCatalogSection.css';

const ITEM = getAdminNavItem('services');

const KIND_TABS: readonly { readonly value: CatalogKindFilter; readonly label: string }[] = [
  { value: 'ALL', label: 'All services' },
  ...SERVICE_KINDS.map((kind) => ({ value: kind, label: SERVICE_DEFINITIONS[kind].shortLabel }))
];

/**
 * Admin "Service Catalog": every service a customer can apply for, with the price, GST, offers, commission
 * and staff incentive the admin sets. Nothing is priced in code; payment requests start from these values.
 */
export default function ServiceCatalogSection() {
  useDocumentTitle(ITEM.label);
  const catalog = useServiceCatalog();
  const [editing, setEditing] = useState<CatalogService | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (catalog.status === 'loading') {
    return (
      <DeferredContent>
        <div className="tx-catalog__state">
          <LoadingSpinner size="lg" label="Loading service catalog" />
        </div>
      </DeferredContent>
    );
  }

  if (catalog.status === 'error') {
    return (
      <div className="tx-catalog__state" role="alert">
        <p>{catalog.error}</p>
        <Button variant="secondary" iconName="rotate-ccw" onClick={() => void catalog.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  const { summary } = catalog;
  const unpriced = summary.total - summary.priced;

  return (
    <div className="tx-catalog">
      <KpiGrid>
        <KpiCard label="Services" value={String(summary.total)} iconName="layers" />
        <KpiCard label="Accepting applications" value={`${summary.active} / ${summary.total}`} iconName="circle-check" tone="success" />
        <KpiCard label="Priced" value={`${summary.priced} / ${summary.total}`} iconName="receipt" tone="orange" />
        <KpiCard label="Offers running" value={String(summary.offers)} iconName="star" />
      </KpiGrid>

      {unpriced > 0 ? (
        <InlineAlert tone="info">
          {unpriced} service{unpriced === 1 ? ' is' : 's are'} quoted per application. Managers set the price when they send the payment request; set a price here to fix it for everyone.
        </InlineAlert>
      ) : null}

      <div className="tx-catalog__toolbar">
        <label className="tx-catalog__search">
          <Icon name="search" size="sm" />
          <span className="tx-sr-only">Search services</span>
          <input type="search" value={catalog.search} onChange={(event) => catalog.setSearch(event.target.value.slice(0, 60))} placeholder="Search a service" />
        </label>
        <div className="tx-catalog__tabs" role="group" aria-label="Filter by service">
          {KIND_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={catalog.kindFilter === tab.value}
              className={`tx-catalog__tab ${catalog.kindFilter === tab.value ? 'tx-catalog__tab--active' : ''}`}
              onClick={() => catalog.setKindFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {notice ? <InlineAlert tone="info">{notice}</InlineAlert> : null}

      {catalog.visible.length > 0 ? (
        <PricingTable
          services={catalog.visible}
          onEdit={(service) => {
            setNotice(null);
            setEditing(service);
          }}
        />
      ) : (
        <p className="tx-catalog__empty">No service matches “{catalog.search}”.</p>
      )}

      {editing ? (
        <ServiceEditModal
          service={editing}
          onSave={(update) => catalog.save(editing.serviceType, update)}
          onClose={() => setEditing(null)}
          onSaved={(name) => {
            setEditing(null);
            setNotice(`${name} was updated. New payment requests use the new price.`);
          }}
        />
      ) : null}
    </div>
  );
}
