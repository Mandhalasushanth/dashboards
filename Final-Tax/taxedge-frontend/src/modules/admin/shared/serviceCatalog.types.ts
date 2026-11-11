import type { ServiceKind, WorkflowTeam } from '@/modules/workflow';

/** GST slabs; professional and financial-facilitation services normally attract 18%. */
export const GST_RATES = Object.freeze([0, 5, 12, 18, 28] as const);
export type GstRate = (typeof GST_RATES)[number];

/**
 * How a service is priced. The admin chooses this per service; nothing in the app assumes a price.
 * - FIXED: one price ("GST Filing → ₹2,500").
 * - MINIMUM: a starting price the manager may go above ("ITR Filing → minimum ₹3,000").
 * - PERCENTAGE: a share of an amount, with an optional minimum ("TDS Refund → 15% of refund value").
 * - QUOTED: set for each application when the manager sends the payment request ("Loan Processing → configurable").
 */
export const PRICING_MODELS = Object.freeze(['FIXED', 'MINIMUM', 'PERCENTAGE', 'QUOTED'] as const);
export type PricingModel = (typeof PRICING_MODELS)[number];

export const PRICING_MODEL_LABELS: Readonly<Record<PricingModel, string>> = Object.freeze({
  FIXED: 'Fixed price',
  MINIMUM: 'Minimum price',
  PERCENTAGE: 'Percentage of an amount',
  QUOTED: 'Quoted per application'
});

/** A rupee amount or a percentage, for discounts, commissions and staff incentives. */
export type AmountMode = 'AMOUNT' | 'PERCENT';

export interface Adjustment {
  readonly mode: AmountMode;
  /** Whole rupees, or a percentage with up to two decimals; 0 means none. */
  readonly value: number;
}

export interface ServicePricing {
  readonly model: PricingModel;
  /** Rupees: the price (FIXED), the minimum (MINIMUM) or a suggested quote (QUOTED, 0 for none). */
  readonly fee: number;
  /** PERCENTAGE only: the share charged, e.g. 15. */
  readonly percent: number;
  /** PERCENTAGE only: what the percentage is taken of, e.g. "refund value". */
  readonly percentOf: string;
  /** PERCENTAGE only: the least that is charged, in rupees (0 for no minimum). */
  readonly minimumFee: number;
}

export interface Promotion {
  /** Rupees charged instead of the normal price while the offer runs; null for no offer. */
  readonly price: number | null;
  /** Last day of the offer (YYYY-MM-DD); null runs until it is switched off. */
  readonly validUntil: string | null;
}

/** One service a customer can apply for (e.g. GST Registration), with everything the admin controls. */
export interface CatalogService {
  /** The customer app's service id, e.g. "gst-registration". */
  readonly serviceType: string;
  readonly kind: ServiceKind;
  readonly name: string;
  /** The service group shown above it, e.g. "GST Registration & Returns". */
  readonly category: string;
  readonly team: WorkflowTeam;
  readonly description: string;
  readonly pricing: ServicePricing;
  readonly gstRate: GstRate;
  readonly discount: Adjustment;
  readonly promotion: Promotion;
  /** What the firm earns per application (e.g. a lender's payout on a loan). */
  readonly commission: Adjustment;
  /** What the assigned agent earns per completed application. */
  readonly staffIncentive: Adjustment;
  /** Target turnaround the due date is set from when an application arrives. */
  readonly slaDays: number;
  readonly requiredDocuments: readonly string[];
  /** Inactive services stop accepting new applications; existing ones continue. */
  readonly active: boolean;
  readonly updatedAt: string | null;
}

export type CatalogServiceUpdate = Pick<
  CatalogService,
  'name' | 'description' | 'pricing' | 'gstRate' | 'discount' | 'promotion' | 'commission' | 'staffIncentive' | 'slaDays' | 'active'
>;
