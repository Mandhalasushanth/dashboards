export type TdsTimelineStatus = "completed" | "in_progress" | "upcoming";

export interface TdsTimelineStage {
  id: number;
  stageKey: string;
  title: string;
  status: TdsTimelineStatus;
  description: string;
  date?: string;
}

export interface TdsRefundStatusDetails {
  applicationId: string;
  filedOn: string;
  estimatedRefund: string;
  isAdditionalTaxPayable?: boolean;
  refundToBank: string;
  indicativeTimeline: string;
  currentStageIndex: number;
  stages: TdsTimelineStage[];
}

export interface NextStepTimelineItem {
  id: number;
  title: string;
  status: "Completed" | "In Progress" | "Upcoming";
  description?: string;
}
