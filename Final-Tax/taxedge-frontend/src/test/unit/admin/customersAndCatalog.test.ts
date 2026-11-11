import { describe, expect, it } from 'vitest';
import { entityTypeFromPan } from '@/modules/admin/shared/customers.types';
import type { CatalogServiceUpdate } from '@/modules/admin/shared/serviceCatalog.types';
import { parseCustomerList } from '@/modules/admin/validation/customersSchema';
import { describePrice, priceFor } from '@/modules/admin/shared/servicePricing';
import { parseServiceCatalog, validateCatalogUpdate } from '@/modules/admin/validation/serviceCatalogSchema';

describe('customer directory', () => {
  it('derives the holder type from the 4th PAN character', () => {
    expect(entityTypeFromPan('ABCPK1234L')).toBe('INDIVIDUAL');
    expect(entityTypeFromPan('AAACT1234F')).toBe('COMPANY');
    expect(entityTypeFromPan('AAKFK4821M')).toBe('FIRM');
    expect(entityTypeFromPan('AAAHX1234Q')).toBe('HUF');
    expect(entityTypeFromPan('AAAGX1234Q')).toBe('OTHER');
  });

  it('keeps valid customers and drops applications it cannot label', () => {
    const [customer] = parseCustomerList({
      items: [
        {
          name: 'Asha Traders',
          pan: 'AAKFA1234M',
          entityType: 'FIRM',
          applications: [
            { caseId: 'CASE-1', service: 'GST', status: 'SUBMITTED' },
            { caseId: 'CASE-2', service: 'CRYPTO', status: 'SUBMITTED' }
          ]
        },
        { name: '', pan: '' }
      ]
    });
    expect(customer.id).toBe('AAKFA1234M');
    expect(customer.applications).toHaveLength(1);
  });

  it('rejects a payload that is not a list', () => {
    expect(() => parseCustomerList({ data: 'nope' })).toThrow();
  });
});

describe('service catalog', () => {
  const none = { mode: 'AMOUNT', value: 0 } as const;
  const valid: CatalogServiceUpdate = {
    name: 'GST Filing',
    description: '',
    pricing: { model: 'FIXED', fee: 2500, percent: 0, percentOf: '', minimumFee: 0 },
    gstRate: 18,
    discount: none,
    promotion: { price: null, validUntil: null },
    commission: none,
    staffIncentive: none,
    slaDays: 5,
    active: true
  };
  const entry = (update: Partial<CatalogServiceUpdate>, serviceType = 'gst-filing') => {
    const [service] = parseServiceCatalog([{ serviceType, ...valid, ...update }]);
    return service;
  };

  it('accepts every pricing model the client asked for', () => {
    expect(validateCatalogUpdate(valid)).toEqual({});
    expect(validateCatalogUpdate({ ...valid, pricing: { ...valid.pricing, model: 'MINIMUM', fee: 3000 } })).toEqual({});
    expect(validateCatalogUpdate({ ...valid, pricing: { model: 'PERCENTAGE', fee: 0, percent: 15, percentOf: 'refund value', minimumFee: 0 } })).toEqual({});
    expect(validateCatalogUpdate({ ...valid, pricing: { ...valid.pricing, model: 'QUOTED', fee: 0 } })).toEqual({});
  });

  it('validates each field by its type', () => {
    const errors = validateCatalogUpdate({
      ...valid,
      name: 'G',
      pricing: { ...valid.pricing, fee: 12.5 },
      slaDays: 200,
      gstRate: 7 as CatalogServiceUpdate['gstRate'],
      discount: { mode: 'PERCENT', value: 120 },
      promotion: { price: 3000, validUntil: '2000-01-01' }
    });
    expect(Object.keys(errors).sort()).toEqual(['discount', 'fee', 'gstRate', 'name', 'promotionPrice', 'promotionUntil', 'slaDays']);
    expect(validateCatalogUpdate({ ...valid, pricing: { model: 'PERCENTAGE', fee: 0, percent: 15, percentOf: '', minimumFee: 0 } }).percentOf).toBeDefined();
    expect(validateCatalogUpdate({ ...valid, promotion: { price: 2500, validUntil: null } }).promotionPrice).toBeDefined();
  });

  it('works out the bill: GST Registration ₹5,000 fixed + 18% GST', () => {
    expect(priceFor(entry({ pricing: { ...valid.pricing, fee: 5000 } }, 'gst-registration'))).toMatchObject({ fee: 5000, gst: 900, total: 5900 });
  });

  it('charges 15% of the refund value for TDS refunds, and needs the refund to know the price', () => {
    const tds = entry({ pricing: { model: 'PERCENTAGE', fee: 0, percent: 15, percentOf: 'refund value', minimumFee: 0 } }, 'tds-refund');
    expect(priceFor(tds)).toBeNull();
    expect(priceFor(tds, 20000)).toMatchObject({ fee: 3000, total: 3540 });
    expect(describePrice(tds)).toBe('15% of refund value');
  });

  it('applies the promotional price and discount but never goes below a minimum price', () => {
    const itr = entry({ pricing: { ...valid.pricing, model: 'MINIMUM', fee: 3000 }, discount: { mode: 'PERCENT', value: 50 } }, 'itr-filing');
    expect(priceFor(itr)?.fee).toBe(3000);
    const offer = entry({ promotion: { price: 1999, validUntil: null }, discount: { mode: 'AMOUNT', value: 199 } });
    expect(priceFor(offer)).toMatchObject({ promotion: true, fee: 1800, total: 2124 });
    expect(priceFor(entry({ promotion: { price: 1999, validUntil: '2000-01-01' } }))?.promotion).toBe(false);
  });

  it('takes group, team and documents from the service configuration, not the server payload', () => {
    const [service] = parseServiceCatalog([{ serviceType: 'home-loan', team: 'CA', pricing: { model: 'QUOTED', fee: 0 } }]);
    expect(service.team).toBe('LOAN');
    expect(service.kind).toBe('LOAN');
    expect(describePrice(service)).toBe('Quoted per application');
    expect(parseServiceCatalog([{ serviceType: 'not-a-service' }])).toEqual([]);
  });
});
