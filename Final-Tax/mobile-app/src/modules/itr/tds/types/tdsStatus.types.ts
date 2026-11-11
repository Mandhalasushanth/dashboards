/**
 * TDS Status & Timeline Types
 * Advanced Modular Architecture - Strictly Typed
 */

export type TimelineStepStatus = "completed" | "active" | "pending";

export interface TdsTimelineStepItem {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  status: TimelineStepStatus;
  timestamp?: string;
}

export interface TdsStatusBadgeConfig {
  label: string;
  textColor: string;
  bgColor: string;
  dotColor: string;
}

export interface TdsApplicationSummary {
  applicationId: string;
  statusBadge: TdsStatusBadgeConfig;
  service: string;
  assessmentYear: string;
  appliedDate: string;
  progressPercent: number;
}

export interface TdsRefundStatusScreenParams {
  applicationId?: string;
  serviceName?: string;
  assessmentYear?: string;
  appliedDate?: string;
  refundAmount?: string;
  uploadedCount?: string;
}
