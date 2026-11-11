import { apiClient } from '../../../core/api/apiClient';

export const paymentService = {
  createOrder: async (amount: number, serviceId: string): Promise<{ orderId: string } | null> => {
    try {
      return await apiClient.post<{ orderId: string }>('/payments/order', { amount, serviceId });
    } catch {
      return null;
    }
  },
  verifyPayment: async (paymentDetails: any): Promise<boolean> => {
    try {
      await apiClient.post('/payments/verify', paymentDetails);
      return true;
    } catch {
      return false;
    }
  },
};
export default paymentService;
