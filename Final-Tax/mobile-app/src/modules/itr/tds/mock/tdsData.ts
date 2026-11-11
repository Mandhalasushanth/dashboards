import { TdsBenefitItem, TdsProcessStep, TdsDocumentItem } from "../types/tds.types";

export const TDS_BENEFITS: TdsBenefitItem[] = [
  {
    id: "maximization",
    title: "Maximum Refund",
    description: "Identifies all eligible tax credits to maximize refund.",
    iconName: "wallet-outline",
  },
  {
    id: "expert_filing",
    title: "Expert CA Review",
    description: "Verified by certified tax professionals.",
    iconName: "ribbon-outline",
  },
  {
    id: "quick_processing",
    title: "Fast Filing",
    description: "Prompt verification and swift return submission.",
    iconName: "time-outline",
  },
  {
    id: "live_tracking",
    title: "Live Tracking",
    description: "Real-time updates from filing to refund credit.",
    iconName: "analytics-outline",
  },
];

export const TDS_PROCESS_STEPS: TdsProcessStep[] = [
  {
    id: 1,
    label: "Submit Details",
    iconName: "create-outline",
  },
  {
    id: 2,
    label: "Upload Documents",
    iconName: "cloud-upload-outline",
  },
  {
    id: 3,
    label: "Executive Verification",
    iconName: "person-outline",
  },
  {
    id: 4,
    label: "Refund Filing",
    iconName: "send-outline",
  },
  {
    id: 5,
    label: "Refund Credited",
    iconName: "business-outline",
  },
];

export const TDS_REQUIRED_DOCUMENTS: TdsDocumentItem[] = [
  {
    id: "pan",
    title: "PAN Card",
    iconType: "card",
  },
  {
    id: "aadhaar",
    title: "Aadhaar Card",
    iconType: "aadhaar",
  },
  {
    id: "more",
    title: "More",
    iconType: "more",
    isMore: true,
  },
];
