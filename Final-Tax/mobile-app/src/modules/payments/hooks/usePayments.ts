import { usePaymentStore } from '../store/paymentStore';
import { paymentService } from '../services/paymentService';

export function usePayments() {
  const transactions = usePaymentStore((s) => s.transactions);
  const addTransaction = usePaymentStore((s) => s.addTransaction);

  return {
    transactions,
    addTransaction,
    createOrder: paymentService.createOrder,
    verifyPayment: paymentService.verifyPayment,
  };
}
export default usePayments;
