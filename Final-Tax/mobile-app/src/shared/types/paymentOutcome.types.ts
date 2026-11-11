import type { ReactNode } from "react";

/** Navigation callbacks the checkout passes to the success view. */
export interface PaymentSuccessActions {
  onViewReceipt: () => void;
  onViewApplication: () => void;
}

/**
 * Service-specific views shown after a successful checkout.
 * The owning service module supplies the implementation; the Payments
 * module renders it without depending on that service.
 */
export interface PaymentOutcomeViews {
  renderSuccess: (actions: PaymentSuccessActions) => ReactNode;
  renderReceipt: () => ReactNode;
  renderStatus: () => ReactNode;
}
