import React from "react";
import { PaymentsHomeScreen, type PaymentsHomeScreenProps } from "./PaymentsHomeScreen";

export function PaymentDetailsScreen(props: PaymentsHomeScreenProps = {}) {
  return <PaymentsHomeScreen {...props} />;
}

export default PaymentDetailsScreen;
