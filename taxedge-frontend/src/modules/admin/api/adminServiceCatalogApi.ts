import { API_ENDPOINTS, apiClient } from '@/core/api';
import { environment } from '@/core/config/environment';
import type { CatalogService, CatalogServiceUpdate } from '../shared/serviceCatalog.types';
import { parseCatalogService, parseServiceCatalog } from '../validation/serviceCatalogSchema';

interface ServiceCatalogGateway {
  list(): Promise<unknown>;
  update(serviceType: string, update: CatalogServiceUpdate): Promise<unknown>;
}

const httpGateway: ServiceCatalogGateway = Object.freeze({
  list: () => apiClient.get<unknown>(API_ENDPOINTS.admin.serviceCatalog),
  update: (serviceType: string, update: CatalogServiceUpdate) =>
    apiClient.put<unknown>(`${API_ENDPOINTS.admin.serviceCatalog}/${encodeURIComponent(serviceType)}`, update)
});

async function getGateway(): Promise<ServiceCatalogGateway> {
  // Statically removed from production builds, like the other admin demo stores.
  if (import.meta.env.DEV && environment.demoAuthEnabled) {
    const { demoServiceCatalogStore } = await import('../dev/demoServiceCatalogStore');
    return demoServiceCatalogStore;
  }
  return httpGateway;
}

export async function fetchServiceCatalog(): Promise<CatalogService[]> {
  return parseServiceCatalog(await (await getGateway()).list());
}

/** The server re-validates every field and records the change in the audit log. */
export async function updateCatalogService(serviceType: string, update: CatalogServiceUpdate): Promise<CatalogService> {
  return parseCatalogService(await (await getGateway()).update(serviceType, update));
}

/** The catalog entry for one service, so a payment request can start from the admin's price. */
export async function fetchCatalogEntry(serviceType: string): Promise<CatalogService | null> {
  return (await fetchServiceCatalog()).find((entry) => entry.serviceType === serviceType) ?? null;
}
