import type { Application } from "@/types/domain";

export type PaymentDisplayState =
  | "VERIFICATION_PENDING"
  | "AWAITING_CA_ASSIGNMENT"
  | "PAYMENT_PENDING"
  | "PAYMENT_PROCESSING"
  | "PAYMENT_FAILED"
  | "PAYMENT_CANCELLED"
  | "PAID";

export interface PaymentBadgeConfig {
  label: string;
  backgroundColor: string;
  textColor: string;
  iconName: string;
}

export interface PaymentNoticeConfig {
  message: string;
  iconName: string;
  iconColor: string;
}

export interface GenuineTransactionDetails {
  feeType: string;
  amountFormatted: string;
  paymentMode: string | null;
  paymentDate: string | null;
  transactionId: string | null;
}

export function isVerificationCompleted(app?: Application): boolean {
  if (!app) return false;
  const formData = (app.formData || {}) as Record<string, unknown>;

  const formVerif = String(formData.verificationStatus || "").toLowerCase();
  if (formVerif === "completed" || formVerif === "verified" || formVerif === "approved") return true;
  if (formVerif === "pending" || formVerif === "under_verification" || formVerif === "in_progress") return false;
  if (formData.isVerified === true) return true;
  if (formData.isVerified === false) return false;

  if (Array.isArray(app.timeline) && app.timeline.length > 0) {
    const verifStep = app.timeline.find((step) => (step.title || "").toLowerCase().includes("verif"));
    if (verifStep) {
      if (verifStep.status === "completed") return true;
      if (verifStep.status === "current" || verifStep.status === "pending") return false;
    }
  }

  const rawStatus = (app.status || "").toLowerCase().trim();
  const isPendingStatus = [
    "under verif", "under review", "under scrutiny", "review",
    "scrutiny", "draft", "submitted", "document collection", "pending doc",
  ].some((kw) => rawStatus.includes(kw));

  if (isPendingStatus) return false;

  return [
    "verified", "verification completed", "verification done",
    "payment pending", "pending payment", "ready for filing", "approved", "completed",
  ].some((kw) => rawStatus.includes(kw));
}

export function getAssignedPaymentAmount(app?: Application): number | null {
  if (!app) return null;
  const formData = (app.formData || {}) as Record<string, unknown>;

  if (formData.caAssignedAmount !== undefined && formData.caAssignedAmount !== null) {
    const val = Number(formData.caAssignedAmount);
    return isNaN(val) ? null : val;
  }
  if (formData.assignedAmount !== undefined && formData.assignedAmount !== null) {
    const val = Number(formData.assignedAmount);
    return isNaN(val) ? null : val;
  }
  if (formData.amountAssigned === false || formData.isAmountAssigned === false) {
    return null;
  }

  const appAmount = Number(app.paymentAmount);
  if (!isNaN(appAmount) && appAmount > 0) return appAmount;

  const formAmount = Number(formData.paymentAmount);
  if (!isNaN(formAmount) && formAmount > 0) return formAmount;

  if (formData.isZeroFee === true || formData.amountAssigned === true || formData.isAmountAssigned === true) {
    if (appAmount === 0 || formAmount === 0) return 0;
  }

  return null;
}

export function formatPaymentAmount(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "Not Assigned";
  }
  return `₹ ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function checkStatusFlags(app: Application | undefined, target: string): boolean {
  if (!app) return false;
  const formData = (app.formData || {}) as Record<string, unknown>;
  return (
    (app.paymentStatus || "").toLowerCase() === target ||
    String(formData.paymentStatus || "").toLowerCase() === target ||
    String(formData.transactionStatus || "").toLowerCase() === target ||
    String(formData.paymentState || "").toLowerCase() === target
  );
}

export function isPaymentPaid(app?: Application): boolean {
  if (!app) return false;
  const formData = (app.formData || {}) as Record<string, unknown>;
  return checkStatusFlags(app, "paid") || checkStatusFlags(app, "success") || formData.paymentCompleted === true;
}

export function isPaymentProcessing(app?: Application): boolean {
  return checkStatusFlags(app, "processing");
}

export function isPaymentFailed(app?: Application): boolean {
  if (!app) return false;
  const formData = (app.formData || {}) as Record<string, unknown>;
  return checkStatusFlags(app, "failed") || Boolean(formData.paymentError);
}

export function isPaymentCancelled(app?: Application): boolean {
  return checkStatusFlags(app, "cancelled") || checkStatusFlags(app, "canceled");
}

export function getPaymentDisplayState(app?: Application): PaymentDisplayState {
  if (!app) return "VERIFICATION_PENDING";
  if (isPaymentPaid(app)) return "PAID";
  if (isPaymentProcessing(app)) return "PAYMENT_PROCESSING";
  if (isPaymentFailed(app)) return "PAYMENT_FAILED";
  if (isPaymentCancelled(app)) return "PAYMENT_CANCELLED";

  const assignedAmount = getAssignedPaymentAmount(app);
  if (assignedAmount !== null) return "PAYMENT_PENDING";
  if (isVerificationCompleted(app)) return "AWAITING_CA_ASSIGNMENT";

  return "VERIFICATION_PENDING";
}

export function canInitiatePayment(state: PaymentDisplayState, amount: number | null | undefined): boolean {
  if (state === "PAID" || state === "VERIFICATION_PENDING" || state === "AWAITING_CA_ASSIGNMENT" || state === "PAYMENT_PROCESSING") {
    return false;
  }
  if (amount === null || amount === undefined || isNaN(amount) || amount <= 0) {
    return false;
  }
  return state === "PAYMENT_PENDING" || state === "PAYMENT_FAILED";
}

export function getGenuineTransactionId(app?: Application): string | null {
  if (!app) return null;
  const formData = (app.formData || {}) as Record<string, unknown>;
  const candidates = [
    formData.transactionId, formData.txnId, formData.paymentReference,
    formData.gatewayTransactionId, formData.razorpay_payment_id, formData.paymentId, formData.referenceId,
  ];
  const found = candidates.find((c) => typeof c === "string" && c.trim().length > 0 && !c.trim().startsWith("DRAFT-"));
  return typeof found === "string" ? found.trim() : null;
}

export function getGenuinePaymentDate(app?: Application): string | null {
  if (!app) return null;
  const formData = (app.formData || {}) as Record<string, unknown>;
  const d = formData.paymentDate || formData.paidAt || formData.transactionDate;
  return typeof d === "string" && d.trim().length > 0 ? d.trim() : null;
}

export function getGenuinePaymentMode(app?: Application): string | null {
  if (!app) return null;
  const formData = (app.formData || {}) as Record<string, unknown>;
  const m = formData.paymentMethod || formData.paymentMode || formData.method;
  return typeof m === "string" && m.trim().length > 0 ? m.trim() : null;
}

export function getFeeType(app?: Application): string {
  const formData = (app?.formData || {}) as Record<string, unknown>;
  if (typeof formData.feeType === "string" && formData.feeType.trim().length > 0) {
    return formData.feeType.trim();
  }
  const sid = (app?.serviceId || "").toLowerCase();
  const cat = (app?.category || "").toUpperCase();

  if (sid.includes("amendment")) return "Amendment Fee";
  if (sid.includes("filing") || cat === "GST") return "Filing Fee";
  if (sid.includes("loan") || cat === "LOANS") return "Processing Fee";
  if (sid.includes("itr") || sid.includes("tds") || cat === "ITR") return "Tax Filing Fee";
  return "Registration Fee";
}

export function getTransactionDetails(app?: Application): GenuineTransactionDetails {
  return {
    feeType: getFeeType(app),
    amountFormatted: formatPaymentAmount(getAssignedPaymentAmount(app)),
    paymentMode: getGenuinePaymentMode(app),
    paymentDate: getGenuinePaymentDate(app),
    transactionId: getGenuineTransactionId(app),
  };
}

export function getPaymentBadgeConfig(state: PaymentDisplayState): PaymentBadgeConfig {
  switch (state) {
    case "PAID":
      return { label: "Paid", backgroundColor: "#DCFCE7", textColor: "#16A34A", iconName: "checkmark-circle" };
    case "PAYMENT_PROCESSING":
      return { label: "Processing", backgroundColor: "#EFF6FF", textColor: "#2563EB", iconName: "sync-outline" };
    case "PAYMENT_FAILED":
      return { label: "Payment Failed", backgroundColor: "#FEE2E2", textColor: "#DC2626", iconName: "alert-circle-outline" };
    case "PAYMENT_CANCELLED":
      return { label: "Cancelled", backgroundColor: "#F1F5F9", textColor: "#64748B", iconName: "close-circle-outline" };
    case "PAYMENT_PENDING":
      return { label: "Payment Pending", backgroundColor: "#FFEDD5", textColor: "#EA580C", iconName: "card-outline" };
    case "AWAITING_CA_ASSIGNMENT":
      return { label: "Awaiting CA Assignment", backgroundColor: "#FFEDD5", textColor: "#EA580C", iconName: "person-outline" };
    case "VERIFICATION_PENDING":
    default:
      return { label: "Awaiting Verification", backgroundColor: "#EFF6FF", textColor: "#0284C7", iconName: "hourglass-outline" };
  }
}

export function getPaymentNotice(state: PaymentDisplayState): PaymentNoticeConfig | null {
  switch (state) {
    case "VERIFICATION_PENDING":
      return {
        message: "The CA manager will assign the payment amount after verification is completed.",
        iconName: "time-outline",
        iconColor: "#0284C7",
      };
    case "AWAITING_CA_ASSIGNMENT":
      return {
        message: "Your verification is complete. The CA manager will assign your payment amount shortly.",
        iconName: "information-circle-outline",
        iconColor: "#EA580C",
      };
    case "PAYMENT_FAILED":
      return {
        message: "Your previous payment attempt was unsuccessful. Please retry to complete your payment.",
        iconName: "alert-circle-outline",
        iconColor: "#DC2626",
      };
    case "PAID":
      return {
        message: "Payment completed successfully.",
        iconName: "checkmark-circle",
        iconColor: "#16A34A",
      };
    default:
      return null;
  }
}
