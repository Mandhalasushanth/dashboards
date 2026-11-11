import { API_ENDPOINTS, apiClient } from '@/core/api';
import { environment } from '@/core/config/environment';
import type { Customer } from '../shared/customers.types';
import { parseCustomerList } from '../validation/customersSchema';

interface CustomersGateway {
  list(): Promise<unknown>;
}

const httpGateway: CustomersGateway = Object.freeze({
  list: () => apiClient.get<unknown>(API_ENDPOINTS.admin.customers)
});

async function getGateway(): Promise<CustomersGateway> {
  // Statically removed from production builds, like the other admin demo stores.
  if (import.meta.env.DEV && environment.demoAuthEnabled) {
    const { demoCustomersStore } = await import('../dev/demoCustomersStore');
    return demoCustomersStore;
  }
  return httpGateway;
}

/** Every customer with their applications across CA and loan services (ADMIN only, enforced by the server). */
export async function fetchCustomers(): Promise<Customer[]> {
  return parseCustomerList(await (await getGateway()).list());
}
