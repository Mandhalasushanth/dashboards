import { ApiError } from '@/core/api';
import { SERVICE_DEFINITIONS, SERVICE_TYPES, type ServiceTypeDefinition } from '@/modules/workflow';
import {
  GST_RATES,
  PRICING_MODELS,
  type Adjustment,
  type CatalogService,
  type CatalogServiceUpdate,
  type GstRate,
  type PricingModel,
  type Promotion,
  type ServicePricing
} from '../shared/serviceCatalog.types';

export const CATALOG_LIMITS = Object.freeze({
  nameMin: 3,
  nameMax: 80,
  descriptionMax: 300,
  /** ₹1 crore: the largest single fee the catalog accepts. */
  maxFee: 10_000_000,
  maxPercent: 100,
  percentOfMax: 40,
  slaMin: 1,
  slaMax: 90
});

type Raw = Record<string, unknown>;
const isObject = (value: unknown): value is Raw => typeof value === 'object' && value !== null;
const isGstRate = (value: unknown): value is GstRate => GST_RATES.includes(value as GstRate);
const isModel = (value: unknown): value is PricingModel => PRICING_MODELS.includes(value as PricingModel);
const num = (value: unknown, fallback = 0) => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseAdjustment(value: unknown): Adjustment {
  const raw = isObject(value) ? value : {};
  return { mode: raw.mode === 'PERCENT' ? 'PERCENT' : 'AMOUNT', value: Math.max(0, num(raw.value)) };
}

function parsePricing(value: unknown): ServicePricing {
  const raw = isObject(value) ? value : {};
  return {
    model: isModel(raw.model) ? raw.model : 'QUOTED',
    fee: Math.max(0, num(raw.fee)),
    percent: Math.max(0, num(raw.percent)),
    percentOf: typeof raw.percentOf === 'string' ? raw.percentOf : '',
    minimumFee: Math.max(0, num(raw.minimumFee))
  };
}

function parsePromotion(value: unknown): Promotion {
  const raw = isObject(value) ? value : {};
  return {
    price: typeof raw.price === 'number' && Number.isFinite(raw.price) && raw.price >= 0 ? raw.price : null,
    validUntil: typeof raw.validUntil === 'string' && DATE_PATTERN.test(raw.validUntil) ? raw.validUntil : null
  };
}

/** Group, team and documents always come from the service configuration, never from the payload. */
export function catalogEntryFor(type: ServiceTypeDefinition, raw: Raw = {}): CatalogService {
  const definition = SERVICE_DEFINITIONS[type.service];
  return {
    serviceType: type.id,
    kind: type.service,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name : type.label,
    category: definition.label,
    team: definition.team,
    description: typeof raw.description === 'string' ? raw.description : '',
    pricing: parsePricing(raw.pricing),
    gstRate: isGstRate(raw.gstRate) ? raw.gstRate : 18,
    discount: parseAdjustment(raw.discount),
    promotion: parsePromotion(raw.promotion),
    commission: parseAdjustment(raw.commission),
    staffIncentive: parseAdjustment(raw.staffIncentive),
    slaDays: Math.round(num(raw.slaDays, definition.slaDays)) || definition.slaDays,
    requiredDocuments: type.documents.filter((doc) => doc.required).map((doc) => doc.label),
    active: raw.active !== false,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : null
  };
}

/** Unknown service ids are dropped. */
function parseService(value: unknown): CatalogService | null {
  if (!isObject(value)) return null;
  const type = SERVICE_TYPES.find((entry) => entry.id === value.serviceType);
  return type ? catalogEntryFor(type, value) : null;
}

export function parseServiceCatalog(payload: unknown): CatalogService[] {
  const list = Array.isArray(payload) ? payload : isObject(payload) && Array.isArray(payload.items) ? payload.items : null;
  if (!list) {
    throw new ApiError('INVALID_RESPONSE', 'The server returned an invalid service catalog.');
  }
  return list.map(parseService).filter((entry): entry is CatalogService => entry !== null);
}

export function parseCatalogService(payload: unknown): CatalogService {
  const parsed = parseService(payload);
  if (!parsed) {
    throw new ApiError('INVALID_RESPONSE', 'The server returned an invalid service.');
  }
  return parsed;
}

const NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 &()/,.'-]*$/;
const rupeesError = (value: number, label: string, allowZero = true) =>
  !Number.isInteger(value) || value < (allowZero ? 0 : 1) || value > CATALOG_LIMITS.maxFee
    ? `${label}: enter a whole rupee amount${allowZero ? '' : ' above 0'} up to ₹${CATALOG_LIMITS.maxFee.toLocaleString('en-IN')}.`
    : null;
const percentError = (value: number, label: string, allowZero = true) =>
  !Number.isFinite(value) || value < 0 || (!allowZero && value === 0) || value > CATALOG_LIMITS.maxPercent || Math.round(value * 100) !== value * 100
    ? `${label}: enter a percentage${allowZero ? '' : ' above 0'} up to ${CATALOG_LIMITS.maxPercent}, with at most two decimals.`
    : null;
const adjustmentError = (adjustment: Adjustment, label: string) =>
  adjustment.mode === 'PERCENT' ? percentError(adjustment.value, label) : rupeesError(adjustment.value, label);

/** Field id → message for every invalid field; empty means the update can be saved. */
export function validateCatalogUpdate(update: CatalogServiceUpdate, today = new Date()): Record<string, string> {
  const name = update.name.trim();
  const { model, fee, percent, percentOf, minimumFee } = update.pricing;
  const { price, validUntil } = update.promotion;
  const todayIso = today.toISOString().slice(0, 10);
  const checks: readonly [string, string | null][] = [
    ['name', name.length < CATALOG_LIMITS.nameMin || name.length > CATALOG_LIMITS.nameMax ? `Use ${CATALOG_LIMITS.nameMin}–${CATALOG_LIMITS.nameMax} characters.` : null],
    ['name', name && !NAME_PATTERN.test(name) ? "Use letters, digits, spaces and & ( ) / , . ' - only." : null],
    ['description', update.description.trim().length > CATALOG_LIMITS.descriptionMax ? `Keep the description under ${CATALOG_LIMITS.descriptionMax} characters.` : null],
    ['fee', model === 'FIXED' || model === 'MINIMUM' ? rupeesError(fee, 'Price', false) : model === 'QUOTED' ? rupeesError(fee, 'Usual quote') : null],
    ['percent', model === 'PERCENTAGE' ? percentError(percent, 'Percentage', false) : null],
    ['percentOf', model === 'PERCENTAGE' && (!percentOf.trim() || percentOf.trim().length > CATALOG_LIMITS.percentOfMax) ? `Say what the percentage is of, e.g. "refund value" (up to ${CATALOG_LIMITS.percentOfMax} characters).` : null],
    ['minimumFee', model === 'PERCENTAGE' ? rupeesError(minimumFee, 'Minimum fee') : null],
    ['gstRate', isGstRate(update.gstRate) ? null : 'Choose a valid GST rate.'],
    ['discount', adjustmentError(update.discount, 'Discount')],
    ['promotionPrice', price !== null ? rupeesError(price, 'Promotional price', false) : null],
    ['promotionPrice', price !== null && (model === 'FIXED' || model === 'MINIMUM') && price >= fee ? 'The promotional price must be lower than the normal price.' : null],
    ['promotionUntil', validUntil !== null && (!DATE_PATTERN.test(validUntil) || validUntil < todayIso) ? 'Choose today or a later date, or leave it empty to run until switched off.' : null],
    ['commission', adjustmentError(update.commission, 'Commission')],
    ['staffIncentive', adjustmentError(update.staffIncentive, 'Staff incentive')],
    ['slaDays', !Number.isInteger(update.slaDays) || update.slaDays < CATALOG_LIMITS.slaMin || update.slaDays > CATALOG_LIMITS.slaMax ? `Turnaround must be ${CATALOG_LIMITS.slaMin}–${CATALOG_LIMITS.slaMax} days.` : null]
  ];
  return checks.reduce<Record<string, string>>((errors, [field, message]) => (message && !errors[field] ? { ...errors, [field]: message } : errors), {});
}
