import { TdsRefundStatusDetails, NextStepTimelineItem } from "../types/status.types";

export const EMPTY_TDS_STATUS_DETAILS: TdsRefundStatusDetails = {
  applicationId: "",
  filedOn: "",
  estimatedRefund: "₹0",
  refundToBank: "",
  indicativeTimeline: "10–20 Business Days",
  currentStageIndex: 0,
  stages: [],
};

export const DEFAULT_TDS_STATUS_DETAILS = EMPTY_TDS_STATUS_DETAILS;

export const TDS_NEXT_STEPS: NextStepTimelineItem[] = [
  {
    id: 1,
    title: "Application & Document Verification",
    status: "In Progress",
    description: "Your documents and TDS records are being reconciled by our CA team.",
  },
  {
    id: 2,
    title: "Return Preparation & Review",
    status: "Upcoming",
    description: "Your draft return computation will be prepared and verified.",
  },
  {
    id: 3,
    title: "ITR Filing & Department Processing",
    status: "Upcoming",
    description: "Return is filed on the e-filing portal and processed by CPC Bangalore.",
  },
];
