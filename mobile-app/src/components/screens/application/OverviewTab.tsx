import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "@/styles/app/application/[id].styles";
import type { Application } from "@/types/domain";
import { getStatusBadgeStyle } from "@/components/screens/applications/ApplicationCardItem";
import { formatDisplayDate, getNextStepsMessage } from "./applicationDetailsUtils";
import type { DetailTab } from "./ApplicationHeader";

export { getNextStepsMessage };

interface OverviewTabProps {
  app: Application;
  displayId?: string;
  appliedDate?: string;
  onChatWithCA?: () => void;
  onNavigateTab?: (tab: DetailTab) => void;
}

export function OverviewTab({
  app,
  displayId,
  appliedDate,
  onChatWithCA,
  onNavigateTab,
}: OverviewTabProps) {
  const statusBadge = getStatusBadgeStyle(app.status);
  const formData = (app.formData || {}) as Record<string, any>;
  const isGstAmendment = app.serviceId === "gst-amendment";

  const resolvedDisplayId =
    displayId ||
    (isGstAmendment && formData.arn ? String(formData.arn) : null) ||
    formData.applicationId ||
    app.id;

  const resolvedServiceName =
    (isGstAmendment && formData.section
      ? `GST Amendment — ${formData.section}`
      : app.serviceName) || "Finsolz Service";

  const resolvedAppliedDate =
    appliedDate ||
    formData.submissionDate ||
    formData.appliedDate ||
    formatDisplayDate(app.createdAt);

  const applicationDetailsRows = [
    {
      label: "Service",
      value: resolvedServiceName,
      icon: "document-text-outline" as const,
    },
    ...(formData.tradeName
      ? [
        {
          label: "Trade Name",
          value: String(formData.tradeName),
          icon: "business-outline" as const,
        },
      ]
      : formData.gstin
        ? [
          {
            label: "GSTIN",
            value: String(formData.gstin),
            icon: "receipt-outline" as const,
          },
        ]
        : formData.itrAcknowledgementNumber
          ? [
            {
              label: "ITR Acknowledgement Number",
              value: String(formData.itrAcknowledgementNumber),
              icon: "receipt-outline" as const,
            },
          ]
          : formData.assessmentYear
            ? [
              {
                label: "Assessment Year",
                value: String(formData.assessmentYear),
                icon: "calendar-outline" as const,
              },
            ]
            : formData.pan || formData.businessPan
              ? [
                {
                  label: "PAN",
                  value: String(formData.pan || formData.businessPan),
                  icon: "card-outline" as const,
                },
              ]
              : []),
    {
      label: "Submission Date",
      value: resolvedAppliedDate,
      icon: "calendar-outline" as const,
    },
    {
      label: "Status",
      value: app.status || "Submitted",
      icon: "shield-checkmark-outline" as const,
      isStatus: true,
    },
  ];

  const handleChatPress = () => {
    if (onChatWithCA) {
      onChatWithCA();
    } else if (onNavigateTab) {
      onNavigateTab("CHAT");
    }
  };

  const nextStepsMessage = getNextStepsMessage(app.status);

  return (
    <>
      {/* ── Screen Heading: Overview ── */}
      <Text style={styles.screenHeading}>Overview</Text>

      {/* ── 1. Application Details Card ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Application Details</Text>
        <View style={styles.detailsRowsWrap}>
          {applicationDetailsRows.map((row) => (
            <View key={row.label} style={styles.itemRow}>
              <View style={styles.itemRowLeft}>
                <View style={styles.itemRowIconWrap}>
                  <Ionicons name={row.icon} size={15} color="#475569" />
                </View>
                <Text style={styles.itemRowLabel}>{row.label}</Text>
              </View>
              <View style={styles.itemRowRight}>
                <Text
                  style={[
                    styles.itemRowValue,
                    row.isStatus ? { color: statusBadge.text } : null,
                    (row as any).isAppId ? styles.appIdRowValue : null,
                  ]}
                >
                  {row.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ── 2. What Happens Next? Card ── */}
      <View style={styles.card}>
        <View style={styles.nextStepTopRow}>
          <View style={styles.nextStepIconCircle}>
            <Ionicons name="time-outline" size={24} color="#EA580C" />
          </View>
          <View style={styles.nextStepContent}>
            <Text style={styles.nextStepTitle}>What happens next?</Text>
            <Text style={styles.nextStepDesc}>{nextStepsMessage}</Text>
          </View>
        </View>

        <View style={styles.nextStepDivider} />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleChatPress}
          style={styles.nextStepActionRow}
          accessibilityRole="button"
          accessibilityLabel="Have questions? Chat with CA"
        >
          <Text style={styles.nextStepActionText}>
            Have questions? Chat with CA ›
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
