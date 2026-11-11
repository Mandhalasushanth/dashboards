export type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'wallet';

export interface PaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  method: PaymentMethodType;
  date: string;
  serviceName: string;
  receiptUrl?: string;
}
