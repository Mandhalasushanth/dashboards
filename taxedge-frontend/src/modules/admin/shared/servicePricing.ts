import type { Adjustment, CatalogService } from './serviceCatalog.types';

/**
 * Price arithmetic for the service catalog, shared by the catalog page and the payment request, so every
 * screen charges what the admin set. Amounts are whole rupees, rounded at each step the way an invoice is.
 */
const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const formatInr = (rupees: number): string => INR.format(rupees);

const percentText = (value: number) => `${Number(value.toFixed(2))}%`;
export const formatAdjustment = (adjustment: Adjustment): string =>
  adjustment.value <= 0 ? '—' : adjustment.mode === 'PERCENT' ? percentText(adjustment.value) : formatInr(adjustment.value);

/** The offer counts until the end of its last day. */
export function promotionActive(service: CatalogService, now = new Date()): boolean {
  const { price, validUntil } = service.promotion;
  if (price === null) return false;
  if (!validUntil) return true;
  return now.getTime() <= new Date(`${validUntil}T23:59:59`).getTime();
}

/** The price as a customer reads it: "₹5,000", "From ₹3,000", "15% of refund value (min ₹500)", "Quoted per application". */
export function describePrice(service: CatalogService): string {
  const { model, fee, percent, percentOf, minimumFee } = service.pricing;
  switch (model) {
    case 'FIXED':
      return formatInr(fee);
    case 'MINIMUM':
      return `From ${formatInr(fee)}`;
    case 'PERCENTAGE':
      return `${percentText(percent)} of ${percentOf || 'the amount'}${minimumFee > 0 ? ` (min ${formatInr(minimumFee)})` : ''}`;
    case 'QUOTED':
      return fee > 0 ? `Quoted · usually ${formatInr(fee)}` : 'Quoted per application';
  }
}

export interface PriceBreakdown {
  /** The service's own price before any offer. */
  readonly listPrice: number;
  /** True when the promotional price replaced the list price. */
  readonly promotion: boolean;
  readonly discount: number;
  /** What the professional fee comes to after the offer and the discount. */
  readonly fee: number;
  readonly gst: number;
  /** What the customer pays, GST included. */
  readonly total: number;
}

/**
 * The fee for one application. A percentage service needs the amount it is taken of (`baseAmount`), and a
 * quoted service needs the quote; without them the result is null, because the price is not known yet.
 */
export function priceFor(service: CatalogService, baseAmount?: number, now = new Date()): PriceBreakdown | null {
  const { model, fee, percent, minimumFee } = service.pricing;
  let listPrice: number | null;
  if (model === 'PERCENTAGE') {
    listPrice = baseAmount && baseAmount > 0 ? Math.max(Math.round((baseAmount * percent) / 100), minimumFee) : null;
  } else if (model === 'QUOTED') {
    listPrice = baseAmount && baseAmount > 0 ? Math.round(baseAmount) : fee > 0 ? fee : null;
  } else {
    listPrice = fee;
  }
  if (listPrice === null) return null;
  const promotion = promotionActive(service, now) && service.promotion.price !== null && service.promotion.price < listPrice;
  const start = promotion ? (service.promotion.price as number) : listPrice;
  const { mode, value } = service.discount;
  const discount = Math.min(start, Math.round(mode === 'PERCENT' ? (start * value) / 100 : value));
  const afterDiscount = start - discount;
  // A minimum price is a floor: offers and discounts never take the fee below it.
  const floor = model === 'MINIMUM' ? Math.min(fee, listPrice) : model === 'PERCENTAGE' ? Math.min(minimumFee, listPrice) : 0;
  const finalFee = Math.max(afterDiscount, floor);
  const gst = Math.round((finalFee * service.gstRate) / 100);
  return { listPrice, promotion, discount: start - finalFee, fee: finalFee, gst, total: finalFee + gst };
}

/** What an adjustment (commission or incentive) comes to on a fee, in rupees. */
export const adjustmentOn = (adjustment: Adjustment, fee: number): number =>
  adjustment.value <= 0 ? 0 : Math.round(adjustment.mode === 'PERCENT' ? (fee * adjustment.value) / 100 : adjustment.value);
