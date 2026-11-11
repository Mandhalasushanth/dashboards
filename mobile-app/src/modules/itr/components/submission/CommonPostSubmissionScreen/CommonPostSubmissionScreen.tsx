import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useApplicationStore } from "@/store/applicationStore";
import {
  CommonPostSubmissionScreenProps,
  PostSubmissionConfig,
  SummaryRowItem,
} from "./postSubmission.types";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
} from "./CommonPostSubmissionScreen.styles";

export const buildSummaryRows = (config: PostSubmissionConfig): SummaryRowItem[] => {
  const rows: SummaryRowItem[] = [];
  const todayFormatted = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  switch (config.moduleType) {
    case "revised-itr": {
      const rawAy = config.assessmentYear || "";
      const ay = rawAy ? (rawAy.startsWith("AY") ? rawAy : `AY ${rawAy}`) : "Current AY";
      rows.push({ label: "Assessment Year", value: ay });
      rows.push({ label: "Return Form", value: config.formType || "Revised ITR" });
      rows.push({ label: "Filing Purpose", value: config.incomeType || "Revised Return Filing" });
      if (config.revisionReason) {
        rows.push({ label: "Revision Reason", value: config.revisionReason });
      }
      if (config.originalAckNumber) {
        rows.push({ label: "Original Ack No.", value: config.originalAckNumber });
      }
      const upCount = config.uploadedDocsCount ?? 0;
      const totCount = config.totalDocsCount ?? 0;
      rows.push({ label: "Documents", value: `${upCount} of ${totCount} received` });
      rows.push({ label: "Submission Date", value: config.submissionDate || todayFormatted });
      rows.push({ label: "Status", value: config.status || "Received" });
      break;
    }
    case "tds-refund": {
      const rawAy = config.assessmentYear || "";
      const ay = rawAy ? (rawAy.startsWith("AY") ? rawAy : `AY ${rawAy}`) : "Current AY";
      rows.push({ label: "Service", value: config.serviceName || "TDS Refund" });
      rows.push({ label: "Assessment Year", value: ay });
      if (config.estimatedRefund !== undefined) {
        const formattedRefund = String(config.estimatedRefund).startsWith("₹")
          ? String(config.estimatedRefund)
          : `₹${config.estimatedRefund}`;
        rows.push({ label: "Estimated Refund", value: formattedRefund });
      }
      rows.push({ label: "Refund Bank", value: config.refundBank || "Verified Primary Bank" });
      const upCount = config.uploadedDocsCount ?? 0;
      const totCount = config.totalDocsCount ?? 0;
      if (Number(totCount) > 0) {
        rows.push({ label: "Documents", value: `${upCount} of ${totCount} received` });
      }
      rows.push({ label: "Applied Date", value: config.submissionDate || todayFormatted });
      rows.push({ label: "Status", value: config.status || "Under Verification" });
      break;
    }
    case "itr":
    default: {
      const rawAy = config.assessmentYear || "";
      const ay = rawAy ? (rawAy.startsWith("AY") ? rawAy : `AY ${rawAy}`) : "Current AY";
      rows.push({ label: "Assessment Year", value: ay });
      rows.push({ label: "Return Form", value: config.formType || "ITR Form" });
      rows.push({ label: "Income Sources", value: config.incomeType || "Declared Income" });
      rows.push({ label: "Tax Regime", value: config.taxRegime || "New Tax Regime" });
      const upCount = config.uploadedDocsCount ?? 0;
      const totCount = config.totalDocsCount ?? 0;
      rows.push({ label: "Documents", value: `${upCount} of ${totCount} received` });
      rows.push({ label: "Refund Bank", value: config.refundBank || "Verified Primary Bank" });
      rows.push({ label: "Submission Date", value: config.submissionDate || todayFormatted });
      rows.push({ label: "Status", value: config.status || "Received" });
      break;
    }
  }

  return rows;
};

export const CommonPostSubmissionScreen: React.FC<CommonPostSubmissionScreenProps> = ({
  config,
  onTrackStatus,
  onGoHome,
  onContactSupport,
  onDownloadAcknowledgement,
  onBack,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const referenceId = config.referenceId ? String(config.referenceId).trim() : "";
  const isSubmissionConfirmed = Boolean(referenceId && referenceId.length > 0);

  const todayFormatted = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const getServiceName = useCallback((): string => {
    if (config.serviceName) return config.serviceName;
    if (config.headerTitle) return config.headerTitle;
    switch (config.moduleType) {
      case "revised-itr":
        return "Revised ITR";
      case "tds-refund":
        return "TDS Refund";
      case "itr":
      default:
        return "ITR Filing";
    }
  }, [config.serviceName, config.headerTitle, config.moduleType]);

  const serviceName = getServiceName();
  const appliedDate = config.appliedDate || config.submissionDate || todayFormatted;
  const estCompletion = config.estCompletion || "1-2 Business Days";
  const statusText = config.status || "Under Verification";
  const customerOrBusinessName =
    config.customerName ||
    config.businessName ||
    "Valued Client";
  const nameLabel = config.businessName ? "Business" : "Customer";

  // Safe Back & Exit Navigation: Never allow back-stepping into completed wizard
  const handleGoHome = useCallback(() => {
    if (onGoHome) {
      onGoHome();
    } else if (config.secondaryCta?.onPress) {
      config.secondaryCta.onPress();
    } else {
      router.replace("/(main)/home" as any);
    }
  }, [onGoHome, config.secondaryCta, router]);

  const handleBackPress = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      handleGoHome();
    }
  }, [onBack, handleGoHome]);

  const handleGoApplications = useCallback(() => {
    if (onTrackStatus) {
      onTrackStatus();
      return;
    }
    if (config.primaryCta?.onPress) {
      config.primaryCta.onPress();
      return;
    }
    if (referenceId) {
      useApplicationStore.getState().setSelectedApplicationId(referenceId);
      router.push(`/application/${encodeURIComponent(referenceId)}` as any);
    } else {
      const target = config.primaryCta?.destination || "/(main)/applications";
      router.replace(target as any);
    }
  }, [onTrackStatus, config.primaryCta, referenceId, router]);

  const handleContactSupport = useCallback(() => {
    if (onContactSupport) {
      onContactSupport();
    } else if (config.tertiaryCta?.onPress) {
      config.tertiaryCta.onPress();
    } else {
      router.push("/chat/support" as any);
    }
  }, [onContactSupport, config.tertiaryCta, router]);

  useEffect(() => {
    const backSub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleBackPress();
      return true;
    });
    return () => backSub.remove();
  }, [handleBackPress]);

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBackPress}
          style={styles.backButton}
          testID="post-submission-back-button"
        >
          <Ionicons name="chevron-back" size={20} color="#0B1F3A" />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>
            {config.headerTitle || "Application Status"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {config.headerSubtitle || "Application Received"}
          </Text>
        </View>

        <View style={styles.headerRightSpacer} />
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom, true),
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!isSubmissionConfirmed ? (
          <View style={styles.unconfirmedCard} testID="unconfirmed-submission-warning">
            <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
            <Text style={styles.unconfirmedTitle}>Submission Not Confirmed</Text>
            <Text style={styles.unconfirmedDescription}>
              We could not find a confirmed application reference ID. If you just submitted your
              return, please check your applications list or contact support.
            </Text>
          </View>
        ) : (
          <>
            {/* Success Celebration Banner */}
            <View style={styles.successBanner} testID="post-submission-success-banner">
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.successTextContainer}>
                <Text style={styles.successTitle}>Application Submitted!</Text>
                <Text style={styles.successSubtitle}>
                  {config.description ||
                    `Your ${serviceName} application has been successfully filed with Finsolz.`}
                </Text>
              </View>
            </View>

            {/* Navy-Blue Application Status Hero Card */}
            <View style={styles.heroCard} testID="post-submission-hero-card">
              <View style={styles.heroTopRow}>
                <Text style={styles.heroAppIdLabel}>APPLICATION ID</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{statusText}</Text>
                </View>
              </View>

              <Text
                style={styles.heroAppIdValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {referenceId}
              </Text>

              <View style={styles.heroDivider} />

              <View style={styles.heroRow}>
                <Text style={styles.rowLabel}>{nameLabel}</Text>
                <Text style={styles.rowValue} numberOfLines={1}>
                  {customerOrBusinessName}
                </Text>
              </View>

              <View style={styles.heroDivider} />

              <View style={styles.heroRow}>
                <Text style={styles.rowLabel}>Service</Text>
                <Text style={styles.rowValue} numberOfLines={1}>
                  {serviceName}
                </Text>
              </View>

              <View style={styles.heroDivider} />

              <View style={styles.heroRow}>
                <Text style={styles.rowLabel}>Applied On</Text>
                <Text style={styles.rowValue}>{appliedDate}</Text>
              </View>

              <View style={styles.heroDivider} />

              <View style={styles.heroRow}>
                <Text style={styles.rowLabel}>Est. Completion</Text>
                <Text style={styles.rowValue}>{estCompletion}</Text>
              </View>
            </View>
          </>
        )}

        {/* Action Buttons Column */}
        <View style={styles.actionButtonsCol}>
          <TouchableOpacity
            style={styles.primaryHomeBtn}
            activeOpacity={0.85}
            onPress={handleGoHome}
            testID="post-submission-secondary-cta"
          >
            <Ionicons name="home" size={19} color="#FFFFFF" />
            <Text style={styles.primaryHomeBtnText}>Go to Home Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryAppBtn}
            activeOpacity={0.8}
            onPress={handleGoApplications}
            testID="post-submission-primary-cta"
          >
            <Ionicons name="folder-outline" size={19} color="#083B75" />
            <Text style={styles.secondaryAppBtnText}>Track in My Applications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactSupportBtn}
            activeOpacity={0.8}
            onPress={handleContactSupport}
            testID="post-submission-tertiary-cta"
          >
            <Ionicons name="chatbubble-outline" size={18} color="#64748B" />
            <Text style={styles.contactSupportBtnText}>Contact Support / CA</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default CommonPostSubmissionScreen;
