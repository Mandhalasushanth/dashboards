import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useApplicationStore } from "@/store/applicationStore";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import {
  CommonPostSubmissionScreen,
  TdsRefundPostSubmissionConfig,
} from "@/modules/itr/components/submission/CommonPostSubmissionScreen";
import { TdsRefundStatusScreenParams } from "../../types/tdsStatus.types";

export interface TdsRefundStatusScreenProps {
  config?: TdsRefundPostSubmissionConfig;
  onTrackStatus?: () => void;
  onDownloadAcknowledgement?: () => void;
  onGoHome?: () => void;
  onContactSupport?: () => void;
}

export const TdsRefundStatusScreen: React.FC<TdsRefundStatusScreenProps> = ({
  config: providedConfig,
  onTrackStatus,
  onDownloadAcknowledgement,
  onGoHome,
  onContactSupport,
}) => {
  const params = useLocalSearchParams() as unknown as TdsRefundStatusScreenParams & {
    customerName?: string;
    businessName?: string;
  };
  const tdsDraft = useApplicationStore((state) => state.tdsDraft);
  const authCustomer = useAuthStore((state) => state.customer);
  const authUser = useAuthStore((state) => state.authenticatedUser);

  const draftForm = (tdsDraft?.formData || {}) as Record<string, any>;

  const bankName =
    draftForm?.bankDetails?.bankName ||
    draftForm?.bankName ||
    "Verified Primary Bank";

  const refundEstimate =
    draftForm?.estimatedRefund ||
    draftForm?.refundAmount ||
    (params as any)?.refundEstimate ||
    (params as any)?.refundAmount;

  const resolvedCustomerName =
    params.customerName ||
    params.businessName ||
    draftForm?.personalInfo?.fullName ||
    draftForm?.fullName ||
    draftForm?.name ||
    authCustomer?.name ||
    authUser?.name ||
    (authCustomer as any)?.fullName ||
    (authUser as any)?.fullName ||
    "Valued Client";

  const resolvedConfig: TdsRefundPostSubmissionConfig = providedConfig || {
    moduleType: "tds-refund",
    referenceId: params.applicationId || "",
    customerName: resolvedCustomerName,
    serviceName: params.serviceName || "TDS Refund",
    headerTitle: "TDS Refund",
    headerSubtitle: "Application Status",
    title: "Application Submitted!",
    description: "Your TDS Refund application has been successfully filed with Finsolz.",
    assessmentYear: params.assessmentYear || "AY 2025–26",
    appliedDate:
      params.appliedDate ||
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    submissionDate:
      params.appliedDate ||
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    estCompletion: "1-2 Business Days",
    estimatedRefund: refundEstimate,
    refundBank: bankName,
    uploadedDocsCount: Array.isArray(draftForm?.documents) ? draftForm.documents.length : 0,
    totalDocsCount: Array.isArray(draftForm?.documents) ? draftForm.documents.length : 0,
    status: "Under Verification",
    primaryCta: {
      label: "Track My Claim",
      destination: "/(main)/applications",
    },
    secondaryCta: {
      label: "Go Home",
      destination: "/(main)/home",
    },
  };

  return (
    <CommonPostSubmissionScreen
      config={resolvedConfig}
      onTrackStatus={onTrackStatus}
      onDownloadAcknowledgement={onDownloadAcknowledgement}
      onGoHome={onGoHome}
      onContactSupport={onContactSupport}
    />
  );
};

export default TdsRefundStatusScreen;
