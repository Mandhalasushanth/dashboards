import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useRevisedProgressStore } from "@/modules/itr/revisedItr/store/revisedProgressStore";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import {
  CommonPostSubmissionScreen,
  PostSubmissionConfig,
} from "../../components/submission/CommonPostSubmissionScreen";

export interface ApplicationSuccessScreenProps {
  config?: PostSubmissionConfig;
  onTrackStatus?: () => void;
  onDownloadAcknowledgement?: () => void;
  onGoHome?: () => void;
  onContactSupport?: () => void;
}

export const ApplicationSuccessScreen: React.FC<ApplicationSuccessScreenProps> = ({
  config: providedConfig,
  onTrackStatus,
  onDownloadAcknowledgement,
  onGoHome,
  onContactSupport,
}) => {
  const params = useLocalSearchParams<{
    applicationId?: string;
    customerName?: string;
    businessName?: string;
    serviceType?: string;
    serviceTitle?: string;
    formType?: string;
    assessmentYear?: string;
    incomeType?: string;
    regime?: string;
    uploadedDocsCount?: string;
    totalDocsCount?: string;
    refundBank?: string;
    originalAckNumber?: string;
    revisionReason?: string;
    status?: string;
    appliedDate?: string;
    estCompletion?: string;
  }>();

  const storeDocuments = useRevisedProgressStore((s) => s.documents);
  const authCustomer = useAuthStore((s) => s.customer);
  const authUser = useAuthStore((s) => s.authenticatedUser);

  const resolvedCustomerName =
    params.customerName ||
    params.businessName ||
    authCustomer?.name ||
    authUser?.name ||
    (authCustomer as any)?.fullName ||
    (authUser as any)?.fullName ||
    "Valued Client";

  const isRevised = params.serviceType === "revised" || params.serviceTitle === "Revised ITR";

  const resolvedConfig: PostSubmissionConfig =
    providedConfig ||
    (isRevised
      ? {
        moduleType: "revised-itr",
        referenceId: params.applicationId || "",
        customerName: resolvedCustomerName,
        serviceName: "Revised ITR",
        headerTitle: "Revised ITR",
        headerSubtitle: "Application Status",
        title: "Application Submitted!",
        description: "Your Revised ITR application has been successfully filed with Finsolz.",
        assessmentYear: params.assessmentYear || "AY 2025–26",
        formType: params.formType || "Revised ITR",
        incomeType: params.incomeType || "Revised Return Filing",
        revisionReason: params.revisionReason,
        originalAckNumber: params.originalAckNumber,
        uploadedDocsCount: storeDocuments
          ? storeDocuments.filter((d) => d.status === "uploaded" || !!d.fileUri).length
          : params.uploadedDocsCount || "0",
        totalDocsCount: storeDocuments
          ? storeDocuments.length
          : params.totalDocsCount || "0",
        status: params.status || "Under Verification",
        appliedDate: params.appliedDate,
        estCompletion: params.estCompletion || "1-2 Business Days",
      }
      : {
        moduleType: "itr",
        referenceId: params.applicationId || "",
        customerName: resolvedCustomerName,
        serviceName: params.serviceTitle || "ITR Filing",
        headerTitle: params.serviceTitle || "ITR Filing",
        headerSubtitle: "Application Status",
        title: "Application Submitted!",
        description: "Your ITR Filing application has been successfully filed with Finsolz.",
        assessmentYear: params.assessmentYear || "AY 2025–26",
        formType: params.formType || "ITR Form",
        incomeType: params.incomeType || "Declared Income",
        taxRegime: params.regime || "New Tax Regime",
        uploadedDocsCount: params.uploadedDocsCount || "0",
        totalDocsCount: params.totalDocsCount || "0",
        refundBank: params.refundBank || "Verified Primary Bank",
        status: params.status || "Under Verification",
        appliedDate: params.appliedDate,
        estCompletion: params.estCompletion || "1-2 Business Days",
      });

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

export default ApplicationSuccessScreen;
