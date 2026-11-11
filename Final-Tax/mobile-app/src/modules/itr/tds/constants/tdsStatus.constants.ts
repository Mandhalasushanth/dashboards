import { TdsTimelineStepItem, TdsApplicationSummary } from "../types/tdsStatus.types";

/**
 * Exact 9-step timeline matching user application tracker
 */
export const DEFAULT_TDS_TIMELINE_STEPS: TdsTimelineStepItem[] = [
  {
    id: "step-1",
    stepNumber: 1,
    title: "New Request Received",
    subtitle: "Application submitted",
    status: "completed",
  },
  {
    id: "step-2",
    stepNumber: 2,
    title: "Documents Received",
    subtitle: "All documents uploaded",
    status: "completed",
  },
  {
    id: "step-3",
    stepNumber: 3,
    title: "Under Verification",
    subtitle: "Documents being verified by CA",
    status: "active",
  },
  {
    id: "step-4",
    stepNumber: 4,
    title: "ITR Preparation",
    subtitle: "Return computation by CA",
    status: "pending",
  },
  {
    id: "step-5",
    stepNumber: 5,
    title: "Customer Approval",
    subtitle: "Review and approve the return",
    status: "pending",
  },
  {
    id: "step-6",
    stepNumber: 6,
    title: "ITR Filed",
    subtitle: "Submitted on IT Department portal",
    status: "pending",
  },
  {
    id: "step-7",
    stepNumber: 7,
    title: "E-Verification Pending",
    subtitle: "Verify using Aadhaar OTP / DSC",
    status: "pending",
  },
  {
    id: "step-8",
    stepNumber: 8,
    title: "Processing by IT Dept.",
    subtitle: "Department processing",
    status: "pending",
  },
  {
    id: "step-9",
    stepNumber: 9,
    title: "Refund / Tax Payable",
    subtitle: "Final status communicated",
    status: "pending",
  },
];

/**
 * Default Application Summary template
 */
export const DEFAULT_APPLICATION_SUMMARY: TdsApplicationSummary = {
  applicationId: "",
  statusBadge: {
    label: "Under Verification",
    textColor: "#7C3AED",
    bgColor: "#EDE9FE",
    dotColor: "#7C3AED",
  },
  service: "TDS Refund",
  assessmentYear: "",
  appliedDate: "",
  progressPercent: 30,
};

/**
 * Helper to build dynamic application summary functionally (zero loops)
 */
export const createApplicationSummary = (
  params?: {
    applicationId?: string;
    serviceName?: string;
    assessmentYear?: string;
    appliedDate?: string;
  },
  draftData?: Record<string, any>
): TdsApplicationSummary => {
  const formattedToday = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return {
    applicationId:
      params?.applicationId ||
      draftData?.applicationId ||
      "",
    statusBadge: DEFAULT_APPLICATION_SUMMARY.statusBadge,
    service:
      params?.serviceName ||
      (draftData?.serviceName ? String(draftData.serviceName) : "TDS Refund"),
    assessmentYear:
      params?.assessmentYear ||
      draftData?.assessmentYear ||
      "",
    appliedDate:
      params?.appliedDate ||
      draftData?.appliedDate ||
      formattedToday,
    progressPercent: 30,
  };
};
