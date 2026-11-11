import { create } from 'zustand';
import type { CustomerProfile } from '../types/customer.types';

interface CustomerState {
  profile: CustomerProfile | null;
  setProfile: (profile: CustomerProfile | null) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));
export default useCustomerStore;
