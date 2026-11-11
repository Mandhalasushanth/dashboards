import { Icon } from '@/shared';
import type { CatalogService } from '../../shared/serviceCatalog.types';
import { adjustmentOn, describePrice, formatAdjustment, formatInr, priceFor, promotionActive } from '../../shared/servicePricing';
import './PricingTable.css';

export interface PricingTableProps {
  readonly services: readonly CatalogService[];
  readonly onEdit: (service: CatalogService) => void;
}

const DATE = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** The offer cell: a running promotion and/or a discount, or a dash. */
function offerOf(service: CatalogService): string {
  const parts: string[] = [];
  if (promotionActive(service) && service.promotion.price !== null) {
    parts.push(`${formatInr(service.promotion.price)} offer${service.promotion.validUntil ? ` till ${DATE.format(new Date(service.promotion.validUntil))}` : ''}`);
  }
  if (service.discount.value > 0) parts.push(`${formatAdjustment(service.discount)} off`);
  return parts.join(' · ') || '—';
}

/** "Customer pays": the full bill when the price is known; percentage and quoted prices depend on the case. */
function totalOf(service: CatalogService): { readonly value: string; readonly note: string } {
  const bill = priceFor(service);
  if (bill) return { value: formatInr(bill.total), note: `incl. ${service.gstRate}% GST` };
  return { value: 'Per application', note: service.pricing.model === 'PERCENTAGE' ? `+ ${service.gstRate}% GST` : `set by the manager · + ${service.gstRate}% GST` };
}

/** An earning shown as typed ("10%", "₹500"), with its rupee value when the fee is known. */
function earningOf(service: CatalogService, which: 'commission' | 'staffIncentive'): string {
  const adjustment = service[which];
  if (adjustment.value <= 0) return '—';
  const bill = priceFor(service);
  return adjustment.mode === 'PERCENT' && bill ? `${formatAdjustment(adjustment)} · ${formatInr(adjustmentOn(adjustment, bill.fee))}` : formatAdjustment(adjustment);
}

/** Services grouped under their category (GST, ITR...), one row each, with everything the admin prices. */
export function PricingTable({ services, onEdit }: PricingTableProps) {
  const groups = services.reduce<Map<string, CatalogService[]>>((map, service) => map.set(service.category, [...(map.get(service.category) ?? []), service]), new Map());

  const renderRow = (service: CatalogService) => {
    const total = totalOf(service);
    const quotedWithoutPrice = service.pricing.model === 'QUOTED' && service.pricing.fee === 0;
    return (
      <tr key={service.serviceType} className={service.active ? undefined : 'tx-pricing__row--paused'}>
        <td data-label="Service">
          <span className="tx-pricing__stack">
            <span className="tx-pricing__name">{service.name}</span>
            <span className="tx-pricing__muted">{service.slaDays} day{service.slaDays === 1 ? '' : 's'} · {service.requiredDocuments.length} document{service.requiredDocuments.length === 1 ? '' : 's'}</span>
          </span>
        </td>
        <td data-label="Price">
          <span className="tx-pricing__stack">
            <span className={quotedWithoutPrice ? 'tx-pricing__muted' : 'tx-pricing__price'}>{describePrice(service)}</span>
          </span>
        </td>
        <td data-label="Offer">
          <span className={offerOf(service) === '—' ? 'tx-pricing__muted' : 'tx-pricing__offer'}>{offerOf(service)}</span>
        </td>
        <td data-label="Customer pays">
          <span className="tx-pricing__stack">
            <span className="tx-pricing__strong">{total.value}</span>
            <span className="tx-pricing__muted">{total.note}</span>
          </span>
        </td>
        <td data-label="Commission">{earningOf(service, 'commission')}</td>
        <td data-label="Staff incentive">{earningOf(service, 'staffIncentive')}</td>
        <td data-label="Status">
          <span className={`tx-pricing__status ${service.active ? 'tx-pricing__status--on' : ''}`}>{service.active ? 'Active' : 'Paused'}</span>
        </td>
        <td data-label="Actions" className="tx-pricing__actions">
          <button type="button" className="tx-pricing__edit" onClick={() => onEdit(service)} aria-label={`Edit pricing for ${service.name}`}>
            <Icon name="sliders" size="sm" />
            Edit
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="tx-pricing">
      {[...groups].map(([category, items]) => (
        <section key={category} className="tx-pricing__group" aria-label={category}>
          <h2 className="tx-pricing__group-title">
            {category}
            <span className="tx-pricing__count">{items.length}</span>
          </h2>
          <div className="tx-pricing__scroll">
            <table className="tx-pricing__table">
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">Price</th>
                  <th scope="col">Offer</th>
                  <th scope="col">Customer pays</th>
                  <th scope="col">Commission</th>
                  <th scope="col">Staff incentive</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="tx-sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>{items.map(renderRow)}</tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
