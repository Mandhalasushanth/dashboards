import type { ComponentProps } from "react";
import type Ionicons from "@expo/vector-icons/Ionicons";

/**
 * The only status this screen can show. It deliberately has no approved / sanctioned
 * variant: an approval must never be displayed from a submission confirmation.
 */
export type ApplicationReviewStatus = "under_review";

export interface ApplicationSummaryRow {
  label: string;
  value: string;
  icon?: ComponentProps<typeof Ionicons>["name"];
}

export interface ApplicationSupportAction {
  label?: string;
  onPress: () => void;
}

export interface ApplicationUnderReviewProps {
  /** e.g. "Business Loan" */
  applicationType: string;
  applicationReference: string | null;
  /** ISO timestamp of the submission. */
  submittedAt: string | null;
  /** Extra summary rows shown between the reference and the status, e.g. amount. */
  summary?: ApplicationSummaryRow[];
  status?: ApplicationReviewStatus;
  /** Defaults to the three standard steps. */
  nextSteps?: readonly string[];
  /** Shown under the details when the reference is not yet confirmed by the service. */
  referenceNote?: string;
  homeLabel?: string;
  onGoHome: () => void;
  supportAction?: ApplicationSupportAction;
}
