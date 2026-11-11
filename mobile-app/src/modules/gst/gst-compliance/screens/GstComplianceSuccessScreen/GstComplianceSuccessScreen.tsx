import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { BrandColors } from "@/shared/theme";
import { GstApplicationStatusStep } from "@/modules/gst/gst-status/components/GstApplicationStatusStep/GstApplicationStatusStep";
import { formatSubmissionDate } from "@/shared/formatters/dateFormatter";
import { useApplicationStore } from "@/store/applicationStore";
import { styles } from "./GstComplianceSuccessScreen.styles";

export function GstComplianceSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    referenceId?: string;
    requestType?: string;
    gstin?: string;
    submittedAt?: string;
    estimatedResponse?: string;
  }>();

  const refId = params.referenceId || "Not available";
  const gstin = params.gstin || "";
  const submittedAtRaw = params.submittedAt || new Date().toISOString();
  const formattedDate = formatSubmissionDate(submittedAtRaw) || "Today";
  const estimatedResponse = params.estimatedResponse || "Within 24 Hours";

  // Lookup application details from store if present to get user's business name
  const existingApp = useApplicationStore
    .getState()
    .applications.find((a) => a.id === refId || a.formData?.referenceId === refId);

  const businessName =
    existingApp?.formData?.businessName ||
    existingApp?.formData?.tradeName ||
    (gstin ? `GSTIN: ${gstin}` : "Registered Business");

  return (
    <View style={styles.root}>
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
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 16) + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <GstApplicationStatusStep
          appId={refId}
          businessName={businessName}
          serviceName="GST Compliance"
          appliedDate={formattedDate}
          estCompletion={estimatedResponse}
          statusText="Under Verification"
          onGoHome={() => router.replace("/(main)/home")}
          onGoApplications={() => router.replace("/(main)/applications")}
          onContactSupport={() => router.push("/chat/support")}
        />
      </ScrollView>
    </View>
  );
}

export default GstComplianceSuccessScreen;
