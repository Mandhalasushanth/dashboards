import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { BrandColors } from "@/shared/theme";
import { GstApplicationStatusStep } from "@/modules/gst/gst-status/components/GstApplicationStatusStep/GstApplicationStatusStep";
import { SubmissionResult } from "../../types/gstAmendmentTypes";
import { formatAmendmentSubmissionDate, isValidBusinessName } from "../../utils/gstAmendmentHelpers";
import { formatSubmissionDate } from "@/shared/formatters/dateFormatter";
import { useApplicationStore } from "@/store/applicationStore";
import { styles } from "./GstAmendmentSuccess.styles";

interface GstAmendmentSuccessProps {
  submissionResult: SubmissionResult;
  insets: { top: number; bottom: number };
  onTrack: () => void;
  onGoHome?: () => void;
  onOpenApplications?: () => void;
}

export const GstAmendmentSuccess: React.FC<GstAmendmentSuccessProps> = ({
  submissionResult,
  insets,
  onTrack,
  onGoHome,
  onOpenApplications,
}) => {
  const router = useRouter();

  const handleGoHome = () => {
    if (onGoHome) onGoHome();
    else router.replace("/(main)/home");
  };

  const handleGoApplications = () => {
    if (onOpenApplications) onOpenApplications();
    else if (onTrack) onTrack();
    else router.replace("/(main)/applications");
  };

  const handleContactSupport = () => {
    router.push("/chat/support");
  };

  const appId = submissionResult.arn || submissionResult.appId || "Not available";
  const formattedDate = formatAmendmentSubmissionDate(submissionResult.date) || formatSubmissionDate(submissionResult.date) || "Today";

  // Lookup application details from store if present to get user's business name
  const existingApp = useApplicationStore
    .getState()
    .applications.find((a) => a.id === appId || a.formData?.arn === appId || a.id === submissionResult.appId);

  const candidateName = [
    submissionResult.businessName,
    existingApp?.formData?.businessName,
    existingApp?.formData?.applicantName,
  ].find(isValidBusinessName);

  const businessName = candidateName ? candidateName.trim() : "Registered Business";

  return (
    <View style={styles.successContainer}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header matching GST Filing Application Status */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 12) + 6,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#FFFFFF",
        }}
      >
        <View style={{ width: 38 }} />
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: BrandColors.TEXT_PRIMARY,
          }}
        >
          Application Status
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.modalScrollView}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 16) + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <GstApplicationStatusStep
          appId={appId}
          businessName={businessName}
          serviceName="GST Certificate Amendment"
          appliedDate={formattedDate}
          estCompletion={submissionResult.estCompletion || "1-2 Business Days"}
          statusText="Under Verification"
          onGoHome={handleGoHome}
          onGoApplications={handleGoApplications}
          onContactSupport={handleContactSupport}
        />
      </ScrollView>
    </View>
  );
};

export default GstAmendmentSuccess;
