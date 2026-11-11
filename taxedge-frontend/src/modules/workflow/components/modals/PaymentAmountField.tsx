import { useEffect, useState } from 'react';
import { InputField } from '@/shared';
import type { WorkflowCase } from '../../shared/workflow.types';
import type { CatalogService } from '@/modules/admin/shared/serviceCatalog.types';

export interface PaymentAmountFieldProps {
  readonly item: WorkflowCase;
  readonly amount: string;
  readonly onAmountChange: (value: string) => void;
  /** The least the customer may be charged (a minimum price, with GST), or null when there is none. */
  readonly onMinimumChange: (minimum: number | null) => void;
  readonly error?: string;
}

type Pricing = typeof import('@/modules/admin/shared/servicePricing');

const digitsOnly = (value: string) => value.replace(/\D/g, '').slice(0, 7);

/**
 * The amount on a payment request, started from the price the admin set for this service in the Service
 * Catalog, so no price is typed from memory or written into the app. Fixed and minimum prices fill the amount
 * in; a percentage price is worked out from the amount it is taken of; a quoted service is typed by the manager.
 */
export function PaymentAmountField({ item, amount, onAmountChange, onMinimumChange, error }: PaymentAmountFieldProps) {
  const [service, setService] = useState<CatalogService | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [base, setBase] = useState('');

  // Loaded when the dialog opens: the admin module is only needed here, and only for this one service.
  useEffect(() => {
    let alive = true;
    void Promise.all([import('@/modules/admin/api/adminServiceCatalogApi'), import('@/modules/admin/shared/servicePricing')])
      .then(async ([api, prices]) => {
        const entry = await api.fetchCatalogEntry(item.serviceType);
        if (!alive || !entry) return;
        setService(entry);
        setPricing(prices);
        const bill = prices.priceFor(entry);
        // Known prices (fixed, minimum, or a quoted service's usual quote) start the amount off.
        if (bill) onAmountChange(String(bill.total));
        onMinimumChange(entry.pricing.model === 'MINIMUM' && bill ? bill.total : null);
      })
      .catch(() => {
        // Without the catalog the manager types the amount, as before.
      });
    return () => {
      alive = false;
    };
    // The catalog is read once per dialog; the callbacks only update the parent's state.
  }, [item.serviceType]);

  const percentage = service?.pricing.model === 'PERCENTAGE';

  const handleBase = (value: string) => {
    const clean = digitsOnly(value);
    setBase(clean);
    if (!service || !pricing) return;
    const bill = pricing.priceFor(service, Number(clean));
    onAmountChange(bill ? String(bill.total) : '');
  };

  const hint = (() => {
    if (!service || !pricing) return null;
    const price = pricing.describePrice(service);
    const bill = pricing.priceFor(service, percentage ? Number(base) : undefined);
    const breakdown = bill ? ` · fee ${pricing.formatInr(bill.fee)} + GST ${pricing.formatInr(bill.gst)}${bill.promotion ? ' (offer price)' : ''}${bill.discount > 0 ? `, ${pricing.formatInr(bill.discount)} off` : ''}` : '';
    switch (service.pricing.model) {
      case 'FIXED':
        return `Catalog price ${price}${breakdown}.`;
      case 'MINIMUM':
        return `${price}${breakdown}. You can charge more for this application, not less.`;
      case 'PERCENTAGE':
        return `${price}${breakdown}. Enter the ${service.pricing.percentOf || 'amount'} to work it out.`;
      case 'QUOTED':
        return `Quoted per application · + ${service.gstRate}% GST. Type the amount for this application.`;
    }
  })();

  return (
    <>
      {percentage ? (
        <InputField
          id="tx-transition-base"
          label={`${service?.pricing.percentOf ? service.pricing.percentOf.charAt(0).toUpperCase() + service.pricing.percentOf.slice(1) : 'Amount'} (₹)`}
          value={base}
          onChange={handleBase}
          inputMode="numeric"
          placeholder="e.g. 20000"
          maxLength={7}
        />
      ) : null}
      <InputField
        id="tx-transition-amount"
        label="Amount the customer pays, incl. GST (₹) *"
        value={amount}
        onChange={(value) => onAmountChange(digitsOnly(value))}
        inputMode="numeric"
        placeholder="e.g. 5900"
        maxLength={7}
        error={error}
      />
      {hint ? <p className="tx-transition__hint">{hint}</p> : null}
    </>
  );
}
