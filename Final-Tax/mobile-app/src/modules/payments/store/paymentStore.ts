import { create } from 'zustand';
import type { PaymentTransaction } from '../types/payment.types';

interface PaymentState {
  transactions: PaymentTransaction[];
  addTransaction: (tx: PaymentTransaction) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  transactions: [],
  addTransaction: (tx) => set((s) => ({ transactions: [tx, ...s.transactions] })),
}));
