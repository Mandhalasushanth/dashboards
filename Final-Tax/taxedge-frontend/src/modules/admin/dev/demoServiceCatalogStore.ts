import { ApiError } from '@/core/api';
import { SERVICE_TYPES } from '@/modules/workflow';
import type { CatalogService, CatalogServiceUpdate } from '../shared/serviceCatalog.types';
import { catalogEntryFor, validateCatalogUpdate } from '../validation/serviceCatalogSchema';

/**
 * DEVELOPMENT ONLY. The service catalog and its prices, kept in this browser's localStorage because the
 * backend has no pricing endpoint yet. Every value is editable by the admin; the starting prices below are
 * the client's examples (GST Registration ₹5,000, GST Filing ₹2,500, ITR Filing minimum ₹3,000, TDS Refund
 * 15% of the refund, loans quoted per application). Every other service starts as "quoted" until priced.
 * Loaded through a dynamic import guarded by `import.meta.env.DEV`; excluded from production builds.
 */
const STORAGE_KEY = 'taxedge.demo.serviceCatalog.v2';
const NO_ADJUSTMENT = { mode: 'AMOUNT', value: 0 } as const;

const STARTING_PRICES: Readonly<Record<string, Record<string, unknown>>> = Object.freeze({
  'gst-registration': { pricing: { model: 'FIXED', fee: 5000 } },
  'gst-filing': { pricing: { model: 'FIXED', fee: 2500 } },
  'itr-filing': { pricing: { model: 'MINIMUM', fee: 3000 } },
  'tds-refund': { pricing: { model: 'PERCENTAGE', percent: 15, percentOf: 'refund value', minimumFee: 0 } }
});

function seed(): CatalogService[] {
  return SERVICE_TYPES.map((type) =>
    catalogEntryFor(type, {
      pricing: { model: 'QUOTED', fee: 0 },
      discount: NO_ADJUSTMENT,
      commission: NO_ADJUSTMENT,
      staffIncentive: NO_ADJUSTMENT,
      ...STARTING_PRICES[type.id]
    })
  );
}

/** Saved entries keep their values; services added to the app since are filled in from the seed. */
function load(): CatalogService[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as Record<string, unknown>[]) : [];
    return seed().map((entry) => {
      const stored = saved.find((item) => item.serviceType === entry.serviceType);
      const type = SERVICE_TYPES.find((item) => item.id === entry.serviceType);
      return stored && type ? catalogEntryFor(type, stored) : entry;
    });
  } catch {
    return seed();
  }
}

function persist(items: CatalogService[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked: the change applies for this page view only.
  }
}

export const demoServiceCatalogStore = Object.freeze({
  async list(): Promise<CatalogService[]> {
    return load();
  },

  async update(serviceType: string, update: CatalogServiceUpdate): Promise<CatalogService> {
    const firstError = Object.values(validateCatalogUpdate(update))[0];
    if (firstError) {
      throw new ApiError('VALIDATION_FAILED', firstError, 422);
    }
    const items = load();
    const current = items.find((item) => item.serviceType === serviceType);
    if (!current) {
      throw new ApiError('VALIDATION_FAILED', 'This service no longer exists.', 404);
    }
    const updated: CatalogService = {
      ...current,
      ...update,
      name: update.name.trim(),
      description: update.description.trim(),
      pricing: { ...update.pricing, percentOf: update.pricing.percentOf.trim() },
      updatedAt: new Date().toISOString()
    };
    persist(items.map((item) => (item.serviceType === serviceType ? updated : item)));
    return updated;
  }
});
