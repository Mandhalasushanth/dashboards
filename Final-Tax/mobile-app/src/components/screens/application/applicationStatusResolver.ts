import type { Application, TimelineStep } from "@/types/domain";
import { getServiceSpecificTimeline } from "./applicationDetailsUtils";

export type StatusVisualVariant = "blue" | "lightBlue" | "orange" | "green" | "red" | "gray";

export interface StatusSummaryInfo {
  variant: StatusVisualVariant;
  title: string;
  description: string;
  badgeLabel: string;
  iconName: string;
}

export interface StatusGuidanceInfo {
  variant: StatusVisualVariant;
  heading: string;
  description: string;
  iconName: string;
  action?: {
    label: string;
    tab: "DOCUMENTS" | "CHAT" | "OVERVIEW" | "PAYMENTS";
  };
}

export interface ResolvedApplicationStatusUI {
  normalizedStatus:
    | "SUBMITTED"
    | "IN_PROGRESS"
    | "UNDER_VERIFICATION"
    | "PENDING_DOCUMENTS"
    | "COMPLETED"
    | "REJECTED"
    | "UNKNOWN";
  summary: StatusSummaryInfo;
  guidance: StatusGuidanceInfo;
  timelineSteps: TimelineStep[];
}

function getCompletionOutcome(app?: Application): { summaryDesc: string; guidanceDesc: string } {
  const sid = (app?.serviceId || "").toLowerCase();
  const cat = (app?.category || "").toUpperCase();

  if (sid.includes("amendment")) {
    return {
      summaryDesc: "Amended GST registration certificate issued and approved.",
      guidanceDesc: "Your amendment application has been processed and your updated registration certificate is ready.",
    };
  }
  if (sid.includes("cancellation")) {
    return {
      summaryDesc: "Registration cancellation order (REG-19) issued.",
      guidanceDesc: "Your GST cancellation has been approved and final order REG-19 is available.",
    };
  }
  if (sid.includes("filing") && cat === "GST") {
    return {
      summaryDesc: "Portal e-filing completed and ARN generated successfully.",
      guidanceDesc: "Your GST return has been filed on the official portal and acknowledgment is generated.",
    };
  }
  if (cat === "GST" || sid.includes("gst")) {
    return {
      summaryDesc: "GST certificate and GSTIN issued successfully.",
      guidanceDesc: "Your GST registration is complete and your official GSTIN certificate is available.",
    };
  }
  if (cat === "ITR" || sid.includes("itr") || sid.includes("tds")) {
    return {
      summaryDesc: "ITR filed and CPC acknowledgment generated successfully.",
      guidanceDesc: "Your tax return has been verified and e-filed with the Income Tax Department.",
    };
  }
  if (cat === "LOANS" || sid.startsWith("loan")) {
    return {
      summaryDesc: "Loan sanction and disbursement confirmation completed.",
      guidanceDesc: "Your loan has been sanctioned and disbursement processing has been completed.",
    };
  }
  if (cat === "BUSINESS" || sid.includes("company")) {
    return {
      summaryDesc: "Certificate of Incorporation (COI), PAN & TAN issued.",
      guidanceDesc: "Company incorporation is complete. Your MCA certificate and tax IDs are ready.",
    };
  }
  return {
    summaryDesc: "Application completed and approved successfully.",
    guidanceDesc: "All stages have been completed. You can view or download your finalized documents.",
  };
}

export function resolveApplicationStatusUI(
  app?: Application,
  appliedDate?: string
): ResolvedApplicationStatusUI {
  const rawStatus = (app?.status || "").trim();
  const s = rawStatus.toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ");

  // 1. REJECTED
  if (
    s.includes("reject") ||
    s.includes("fail") ||
    s.includes("cancel") ||
    s.includes("suspend")
  ) {
    const reason =
      (app?.formData?.rejectionReason as string) ||
      (app?.formData?.reason as string) ||
      ((app as any)?.notes as string) ||
      "";
    return {
      normalizedStatus: "REJECTED",
      summary: {
        variant: "red",
        title: "Application Rejected",
        description: reason
          ? `Rejection reason: ${reason}`
          : "Your application could not be processed and has been rejected.",
        badgeLabel: "Rejected",
        iconName: "close-circle-outline",
      },
      guidance: {
        variant: "red",
        heading: "Application rejected",
        description: reason
          ? `Application was rejected: ${reason}. Please contact our team for assistance.`
          : "Your application could not be approved. Please review details or contact our CA team.",
        iconName: "alert-circle-outline",
        action: { label: "Chat with CA ›", tab: "CHAT" },
      },
      timelineSteps: app ? getServiceSpecificTimeline(app, appliedDate) : [],
    };
  }

  // 2. PENDING DOCUMENTS
  if (
    s.includes("pending doc") ||
    s.includes("doc pending") ||
    s.includes("documents pending") ||
    s.includes("pending documents") ||
    s.includes("kyc pending") ||
    s.includes("upload pending") ||
    s.includes("action required")
  ) {
    return {
      normalizedStatus: "PENDING_DOCUMENTS",
      summary: {
        variant: "lightBlue",
        title: "Pending Documents",
        description: "Additional documents or clarifications are required to proceed.",
        badgeLabel: "Action Needed",
        iconName: "folder-open-outline",
      },
      guidance: {
        variant: "lightBlue",
        heading: "Action required",
        description: "Pending documents need your attention. Please upload them to continue processing.",
        iconName: "alert-circle-outline",
        action: { label: "View Required Documents ›", tab: "DOCUMENTS" },
      },
      timelineSteps: app ? getServiceSpecificTimeline(app, appliedDate) : [],
    };
  }

  // 3. COMPLETED / APPROVED
  const isCompleted =
    s.includes("complete") ||
    s.includes("approv") ||
    s.includes("disburs") ||
    s.includes("sanction") ||
    s.includes("certificate issued") ||
    s.includes("closed") ||
    s.includes("return filed") ||
    s.includes("everified") ||
    s.includes("e-verified") ||
    s.includes("e verified");

  if (isCompleted) {
    const outcome = getCompletionOutcome(app);
    const isApproved = s.includes("approv") || s.includes("sanction");
    return {
      normalizedStatus: "COMPLETED",
      summary: {
        variant: "green",
        title: isApproved ? "Application Approved" : "Application Completed",
        description: outcome.summaryDesc,
        badgeLabel: isApproved ? "Approved" : "Completed",
        iconName: "checkmark-circle-outline",
      },
      guidance: {
        variant: "green",
        heading: "Application completed",
        description: outcome.guidanceDesc,
        iconName: "ribbon-outline",
        action: { label: "View Documents ›", tab: "DOCUMENTS" },
      },
      timelineSteps: app ? getServiceSpecificTimeline(app, appliedDate) : [],
    };
  }

  // 4. UNDER VERIFICATION
  const isVerification =
    !s.includes("customer review") &&
    (s === "review" ||
      s.includes("under verification") ||
      s.includes("under review") ||
      s.includes("under scrutiny") ||
      s.includes("officer review") ||
      s.includes("officer scrutiny") ||
      s.includes("ca review") ||
      s.includes("documents under verification") ||
      s.includes("verification") ||
      s.includes("scrutiny") ||
      s.includes("underwriting"));

  if (isVerification) {
    return {
      normalizedStatus: "UNDER_VERIFICATION",
      summary: {
        variant: "orange",
        title: "Under Verification",
        description: "Application details and documents are undergoing official verification.",
        badgeLabel: "Under Review",
        iconName: "shield-checkmark-outline",
      },
      guidance: {
        variant: "orange",
        heading: "Verification in progress",
        description: "Our compliance team is currently verifying your submitted details. We’ll notify you as soon as review finishes.",
        iconName: "time-outline",
      },
      timelineSteps: app ? getServiceSpecificTimeline(app, appliedDate) : [],
    };
  }

  // 5. IN PROGRESS
  const isInProgress =
    s.includes("in progress") ||
    s.includes("progress") ||
    s.includes("processing") ||
    s.includes("document collection") ||
    s.includes("pending payment") ||
    s.includes("payment pending") ||
    s.includes("ready for filing") ||
    s.includes("return preparation") ||
    s.includes("data preparation") ||
    s.includes("customer review");

  if (isInProgress) {
    return {
      normalizedStatus: "IN_PROGRESS",
      summary: {
        variant: "orange",
        title: "In Progress",
        description: "Your application is actively being processed by our operations team.",
        badgeLabel: "In Progress",
        iconName: "hourglass-outline",
      },
      guidance: {
        variant: "orange",
        heading: "Processing in progress",
        description: "Your application is actively being processed. No additional action is required at this time.",
        iconName: "sync-outline",
      },
      timelineSteps: app ? getServiceSpecificTimeline(app, appliedDate) : [],
    };
  }

  // 6. SUBMITTED
  const isSubmitted =
    s.includes("submit") ||
    s.includes("new request") ||
    s.includes("application received");

  if (isSubmitted) {
    return {
      normalizedStatus: "SUBMITTED",
      summary: {
        variant: "blue",
        title: "Application Submitted",
        description: appliedDate
          ? `Application submitted successfully on ${appliedDate}.`
          : "Your application has been received and queued for review.",
        badgeLabel: "Submitted",
        iconName: "paper-plane-outline",
      },
      guidance: {
        variant: "blue",
        heading: "Application received",
        description: appliedDate
          ? `Your application was received on ${appliedDate} and is queued for verification.`
          : "Your application has been received and is queued for verification.",
        iconName: "information-circle-outline",
      },
      timelineSteps: app ? getServiceSpecificTimeline(app, appliedDate) : [],
    };
  }

  // 7. UNKNOWN / UNAVAILABLE / DRAFT
  return {
    normalizedStatus: "UNKNOWN",
    summary: {
      variant: "gray",
      title: rawStatus || "Status Unavailable",
      description: s.includes("draft")
        ? "Application details have been saved as a draft."
        : "Latest status information could not be determined.",
      badgeLabel: rawStatus || "Unavailable",
      iconName: s.includes("draft") ? "create-outline" : "help-circle-outline",
    },
    guidance: {
      variant: "gray",
      heading: s.includes("draft") ? "Application in draft" : "Status information unavailable",
      description: s.includes("draft")
        ? "Complete the remaining details and submit to start the verification process."
        : "The latest status could not be determined. Please check back later.",
      iconName: "help-circle-outline",
    },
    timelineSteps: app ? getServiceSpecificTimeline(app, appliedDate) : [],
  };
}
