import type { Application, TimelineStep } from "@/types/domain";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export function formatDisplayDate(dateStr?: string, timeStr?: string): string {
  if (!dateStr) return "Today";
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const formatted = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
      const timeFormatted =
        timeStr?.trim() ||
        (dateStr.includes("T") || dateStr.includes(":")
          ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
          : "");
      return timeFormatted ? `${formatted}, ${timeFormatted}` : formatted;
    }
  } catch (error) {
    logger.debug("Failed to format date string", { dateStr, error: getErrorMessage(error) });
  }
  if (timeStr?.trim() && !dateStr.includes(timeStr.trim())) {
    return `${dateStr}, ${timeStr.trim()}`;
  }
  return dateStr;
}

export function calculateExpectedDate(dateStr?: string): string {
  if (!dateStr || typeof dateStr !== "string" || !dateStr.trim()) {
    return "Unavailable";
  }
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return "Unavailable";
    }
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  } catch (error) {
    logger.debug("Failed to calculate expected date", { dateStr, error: getErrorMessage(error) });
    return "Unavailable";
  }
}

export function getNextStepsMessage(status?: string): string {
  const s = (status || "").toLowerCase();
  if (s.includes("draft")) {
    return "Your application draft has been saved. Complete the required details to submit.";
  }
  if (s.includes("reject") || s.includes("fail")) {
    return "Your application requires attention. Please check details or connect with our CA team for resolution.";
  }
  if (s.includes("complete") || s.includes("approv")) {
    return "Your application has been processed and approved. You can download certificates and final documents.";
  }
  if (
    s.includes("progress") ||
    s.includes("process") ||
    s.includes("verif") ||
    s.includes("review")
  ) {
    return "Your application is currently being reviewed and processed by our team. We’ll notify you as soon as its status changes.";
  }
  return "Your application has been submitted successfully. We’ll notify you when its status changes.";
}

export function getServiceSpecificTimeline(app: Application, appliedDate?: string): TimelineStep[] {
  const sid = (app.serviceId || "").toLowerCase();
  const cat = (app.category || "").toUpperCase();

  let baseSteps: { title: string; description: string }[] = [];

  const submittedDesc = appliedDate
    ? `Application successfully submitted on ${appliedDate}.`
    : "Application successfully submitted on the existing submission date.";

  if (sid.includes("amendment")) {
    baseSteps = [
      { title: "Amendment Submitted", description: submittedDesc },
      { title: "Document Collection", description: "Review of identity, premises and constitution proofs." },
      { title: "Verification", description: "TRN & ARN processing and tax officer scrutiny." },
      { title: "Payment", description: "The CA manager will assign the amount after verification. Payment progress will appear in the Payments tab." },
      { title: "Completed", description: "Processing continues after successful payment, according to the service workflow." },
    ];
  } else if (sid.includes("cancellation")) {
    baseSteps = [
      { title: "Cancellation Submitted", description: submittedDesc },
      { title: "Document Collection", description: "Review of identity, premises and constitution proofs." },
      { title: "Verification", description: "TRN & ARN processing and tax officer scrutiny." },
      { title: "Payment", description: "The CA manager will assign the amount after verification. Payment progress will appear in the Payments tab." },
      { title: "Completed", description: "Processing continues after successful payment, according to the service workflow." },
    ];
  } else if (sid.includes("filing") && cat === "GST") {
    baseSteps = [
      { title: "Filing Data Submitted", description: submittedDesc },
      { title: "Document Collection", description: "Review of identity, premises and constitution proofs." },
      { title: "Verification", description: "TRN & ARN processing and tax officer scrutiny." },
      { title: "Payment", description: "The CA manager will assign the amount after verification. Payment progress will appear in the Payments tab." },
      { title: "Completed", description: "Processing continues after successful payment, according to the service workflow." },
    ];
  } else if (cat === "GST" || sid.includes("gst")) {
    baseSteps = [
      { title: "Application Submitted", description: submittedDesc },
      { title: "Document Collection", description: "Review of identity, premises and constitution proofs." },
      { title: "Verification", description: "TRN & ARN processing and tax officer scrutiny." },
      { title: "Payment", description: "The CA manager will assign the amount after verification. Payment progress will appear in the Payments tab." },
      { title: "Completed", description: "Processing continues after successful payment, according to the service workflow." },
    ];
  } else if (sid.includes("notice")) {
    baseSteps = [
      { title: "Application Submitted", description: submittedDesc },
      { title: "Document Collection", description: "Review of identity, premises and constitution proofs." },
      { title: "Verification", description: "TRN & ARN processing and tax officer scrutiny." },
      { title: "Payment", description: "The CA manager will assign the amount after verification. Payment progress will appear in the Payments tab." },
      { title: "Completed", description: "Processing continues after successful payment, according to the service workflow." },
    ];
  } else if (cat === "ITR" || sid.includes("itr") || sid.includes("tds")) {
    baseSteps = [
      { title: "Application Submitted", description: submittedDesc },
      { title: "Document Collection", description: "Review of identity, premises and constitution proofs." },
      { title: "Verification", description: "TRN & ARN processing and tax officer scrutiny." },
      { title: "Payment", description: "The CA manager will assign the amount after verification. Payment progress will appear in the Payments tab." },
      { title: "Completed", description: "Processing continues after successful payment, according to the service workflow." },
    ];
  } else if (cat === "LOANS" || sid.startsWith("loan")) {
    baseSteps = [
      { title: "Loan Application Submitted", description: submittedDesc },
      { title: "Document Collection", description: "Review of identity, premises and constitution proofs." },
      { title: "Verification", description: "TRN & ARN processing and tax officer scrutiny." },
      { title: "Payment", description: "The CA manager will assign the amount after verification. Payment progress will appear in the Payments tab." },
      { title: "Completed", description: "Processing continues after successful payment, according to the service workflow." },
    ];
  } else if (cat === "BUSINESS" || sid.includes("company") || sid.includes("incorporation")) {
    baseSteps = [
      { title: "Application Submitted", description: submittedDesc },
      { title: "Document Collection", description: "Review of identity, premises and constitution proofs." },
      { title: "Verification", description: "TRN & ARN processing and tax officer scrutiny." },
      { title: "Payment", description: "The CA manager will assign the amount after verification. Payment progress will appear in the Payments tab." },
      { title: "Completed", description: "Processing continues after successful payment, according to the service workflow." },
    ];
  } else {
    baseSteps = [
      { title: "Application Submitted", description: submittedDesc },
      { title: "Document Collection", description: "Review of identity, premises and constitution proofs." },
      { title: "Verification", description: "TRN & ARN processing and tax officer scrutiny." },
      { title: "Payment", description: "The CA manager will assign the amount after verification. Payment progress will appear in the Payments tab." },
      { title: "Completed", description: "Processing continues after successful payment, according to the service workflow." },
    ];
  }

  const s = (app.status || "").toLowerCase().trim();

  // 1. DRAFT: Application draft saved, not submitted
  if (s.includes("draft")) {
    return baseSteps.map((step, idx) => ({
      title: step.title,
      description: step.description,
      status: idx === 0 ? ("current" as const) : ("pending" as const),
      date: undefined,
    }));
  }

  // 2. UNKNOWN / UNAVAILABLE / OTHER: Neutral treatment, do not fabricate stages or dates
  if (!s || s === "other" || s === "unknown" || s === "unavailable") {
    return baseSteps.map((step, idx) => ({
      title: step.title,
      description: step.description,
      status: idx === 0 ? ("current" as const) : ("pending" as const),
      date: undefined,
    }));
  }

  // 3. REJECTED: Show real rejection reason if available at rejection stage
  const isRejected =
    s.includes("reject") ||
    s.includes("fail") ||
    s.includes("cancel") ||
    s.includes("suspend");

  if (isRejected) {
    const isDocRejection = s.includes("doc") || s.includes("kyc");
    const reason =
      (app.formData?.rejectionReason as string) ||
      (app.formData?.reason as string) ||
      "";
    return baseSteps.map((step, idx) => ({
      title: step.title,
      description:
        (!isDocRejection && idx === 2) || (isDocRejection && idx === 1)
          ? reason
            ? `Rejected: ${reason}`
            : step.description
          : step.description,
      status:
        idx === 0
          ? ("completed" as const)
          : isDocRejection
            ? idx === 1
              ? ("current" as const)
              : ("pending" as const)
            : idx === 1
              ? ("completed" as const)
              : idx === 2
                ? ("current" as const)
                : ("pending" as const),
      date: idx === 0 ? appliedDate : undefined,
    }));
  }

  // 4. COMPLETED / APPROVED / DISBURSED / SANCTIONED / CERTIFICATE ISSUED / FILED
  const isCompleted =
    s.includes("complete") ||
    s.includes("approv") ||
    s.includes("disburs") ||
    s.includes("sanction") ||
    s.includes("certificate issued") ||
    s.includes("closed") ||
    s.includes("return filed") ||
    s.includes("everified") ||
    s.includes("e-verified");

  if (isCompleted) {
    return baseSteps.map((step, idx) => ({
      title: step.title,
      description: step.description,
      status: "completed" as const,
      date: idx === 0 ? appliedDate : undefined,
    }));
  }

  // 5. DOCUMENT COLLECTION / KYC STAGE / PENDING DOCUMENTS
  const isDocStage =
    s.includes("document") ||
    s.includes("kyc") ||
    s.includes("collection") ||
    s.includes("upload") ||
    s.includes("action required");

  if (isDocStage) {
    return baseSteps.map((step, idx) => ({
      title: step.title,
      description: step.description,
      status:
        idx === 0
          ? ("completed" as const)
          : idx === 1
            ? ("current" as const)
            : ("pending" as const),
      date: idx === 0 ? appliedDate : undefined,
    }));
  }

  // 6. UNDER VERIFICATION / REVIEW / SCRUTINY / IN PROGRESS / PROCESSING
  const isVerification =
    s.includes("verif") ||
    s.includes("review") ||
    s.includes("scrutiny") ||
    s.includes("underwrit") ||
    s.includes("assessment") ||
    s.includes("reconciliation") ||
    s.includes("progress") ||
    s.includes("process");

  if (isVerification) {
    return baseSteps.map((step, idx) => ({
      title: step.title,
      description: step.description,
      status:
        idx <= 1
          ? ("completed" as const)
          : idx === 2
            ? ("current" as const)
            : ("pending" as const),
      date: idx === 0 ? appliedDate : undefined,
    }));
  }

  // 7. PAYMENT STAGE
  const isPaymentStage =
    s.includes("payment") ||
    s.includes("pay") ||
    s.includes("fee");

  if (isPaymentStage) {
    return baseSteps.map((step, idx) => ({
      title: step.title,
      description: step.description,
      status:
        idx <= 2
          ? ("completed" as const)
          : idx === 3
            ? ("current" as const)
            : ("pending" as const),
      date: idx === 0 ? appliedDate : undefined,
    }));
  }

  // 8. DEFAULT (Submitted / New Request / etc.):
  return baseSteps.map((step, idx) => ({
    title: step.title,
    description: step.description,
    status:
      idx === 0
        ? ("completed" as const)
        : idx === 1
          ? ("current" as const)
          : ("pending" as const),
    date: idx === 0 ? appliedDate : undefined,
  }));
}

export function getDefaultTimeline(app: Application, appliedDate?: string): TimelineStep[] {
  return getServiceSpecificTimeline(app, appliedDate);
}

export {
  resolveApplicationStatusUI,
  type StatusVisualVariant,
  type StatusSummaryInfo,
  type StatusGuidanceInfo,
  type ResolvedApplicationStatusUI,
} from "./applicationStatusResolver";

