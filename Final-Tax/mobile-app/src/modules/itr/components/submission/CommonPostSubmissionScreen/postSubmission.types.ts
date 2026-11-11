/**
 * Post-Submission Types and Strongly-Typed Discriminated Union
 * for ITR Filing, Revised ITR, and TDS Refund modules.
 */

export type SubmissionModuleType = "itr" | "revised-itr" | "tds-refund";

export interface PostSubmissionCta {
  label: string;
  onPress?: () => void;
  destination?: string;
  iconName?: string;
}

export interface SummaryRowItem {
  label: string;
  value: string;
}

export interface ProgressStage {
  id: string;
  stageNumber: number;
  label: string;
  status: "completed" | "active" | "pending";
  description: string;
}

export interface BasePostSubmissionConfig {
  moduleType: SubmissionModuleType;
  referenceId: string;
  customerName?: string;
  businessName?: string;
  serviceName?: string;
  submissionDate?: string;
  appliedDate?: string;
  estCompletion?: string;
  status?: string;
  title?: string;
  description?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  nextSteps?: string[];
  primaryCta?: PostSubmissionCta;
  secondaryCta?: PostSubmissionCta;
  tertiaryCta?: PostSubmissionCta;
}

export interface ItrPostSubmissionConfig extends BasePostSubmissionConfig {
  moduleType: "itr";
  assessmentYear?: string;
  formType?: string;
  incomeType?: string;
  taxRegime?: string;
  uploadedDocsCount?: string | number;
  totalDocsCount?: string | number;
  refundBank?: string;
}

export interface RevisedItrPostSubmissionConfig extends BasePostSubmissionConfig {
  moduleType: "revised-itr";
  assessmentYear?: string;
  formType?: string;
  incomeType?: string;
  taxRegime?: string;
  uploadedDocsCount?: string | number;
  totalDocsCount?: string | number;
  originalAckNumber?: string;
  revisionReason?: string;
}

export interface TdsRefundPostSubmissionConfig extends BasePostSubmissionConfig {
  moduleType: "tds-refund";
  serviceName?: string;
  assessmentYear?: string;
  estimatedRefund?: string | number;
  refundBank?: string;
  uploadedDocsCount?: string | number;
  totalDocsCount?: string | number;
  progressPercent?: number;
}

export type PostSubmissionConfig =
  | ItrPostSubmissionConfig
  | RevisedItrPostSubmissionConfig
  | TdsRefundPostSubmissionConfig;

export interface CommonPostSubmissionScreenProps {
  config: PostSubmissionConfig;
  onTrackStatus?: () => void;
  onGoHome?: () => void;
  onContactSupport?: () => void;
  onDownloadAcknowledgement?: () => void;
  onBack?: () => void;
}

