import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "@/styles/app/application/[id].styles";
import type { Application, TimelineStep } from "@/types/domain";
import type { DetailTab } from "./ApplicationHeader";
import {
  resolveApplicationStatusUI,
  type StatusVisualVariant,
} from "./applicationStatusResolver";

interface StatusTabProps {
  app?: Application;
  timelineSteps?: TimelineStep[];
  currentStatus?: string;
  appliedDate?: string;
  onNavigateTab?: (tab: DetailTab) => void;
}

const STAGE_DEFAULT_ICONS = [
  "document-text-outline",
  "folder-open-outline",
  "shield-checkmark-outline",
  "card-outline",
  "ribbon-outline",
] as const;

export function getStageIcon(title?: string, index: number = 0): string {
  const t = (title || "").toLowerCase();
  if (t.includes("submit") || t.includes("filing") || t.includes("request")) {
    return "document-text-outline";
  }
  if (
    t.includes("document") ||
    t.includes("kyc") ||
    t.includes("collect") ||
    t.includes("upload")
  ) {
    return "folder-open-outline";
  }
  if (
    t.includes("verif") ||
    t.includes("review") ||
    t.includes("scrutiny") ||
    t.includes("underwrit") ||
    t.includes("officer") ||
    t.includes("reconciliation")
  ) {
    return "shield-checkmark-outline";
  }
  if (t.includes("payment") || t.includes("fee") || t.includes("pay")) {
    return "card-outline";
  }
  if (
    t.includes("complet") ||
    t.includes("approv") ||
    t.includes("certificate") ||
    t.includes("sanction") ||
    t.includes("disburse") ||
    t.includes("order") ||
    t.includes("arn")
  ) {
    return "ribbon-outline";
  }
  return STAGE_DEFAULT_ICONS[index % STAGE_DEFAULT_ICONS.length];
}

export interface StageVisualConfig {
  iconName: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  connectorColor: string;
}

const STAGE_CONFIGS: StageVisualConfig[] = [
  // 1. Application Submitted (Green icon and connector)
  {
    iconName: "document-text-outline",
    iconColor: "#16A34A",
    bgColor: "#DCFCE7",
    borderColor: "#16A34A",
    connectorColor: "#16A34A",
  },
  // 2. Document Collection (Orange icon and connector)
  {
    iconName: "folder-open-outline",
    iconColor: "#EA580C",
    bgColor: "#FFEDD5",
    borderColor: "#EA580C",
    connectorColor: "#EA580C",
  },
  // 3. Verification (Blue icon and connector)
  {
    iconName: "shield-checkmark-outline",
    iconColor: "#0284C7",
    bgColor: "#E0F2FE",
    borderColor: "#0284C7",
    connectorColor: "#0284C7",
  },
  // 4. Payment (Purple payment icon and connector)
  {
    iconName: "card-outline",
    iconColor: "#7C3AED",
    bgColor: "#EDE9FE",
    borderColor: "#7C3AED",
    connectorColor: "#7C3AED",
  },
  // 5. Completed (Grey icon and connector)
  {
    iconName: "ribbon-outline",
    iconColor: "#94A3B8",
    bgColor: "#F8FAFC",
    borderColor: "#CBD5E1",
    connectorColor: "#CBD5E1",
  },
];

export function getStageVisualConfig(
  step: TimelineStep,
  index: number,
  isRejected: boolean
): StageVisualConfig {
  if (isRejected && step.status === "current") {
    return {
      iconName: "close-circle-outline",
      iconColor: "#DC2626",
      bgColor: "#FEE2E2",
      borderColor: "#DC2626",
      connectorColor: "#CBD5E1",
    };
  }

  const baseConfig = STAGE_CONFIGS[index % STAGE_CONFIGS.length];
  const iconName = getStageIcon(step.title, index);

  if (index === 4 && step.status === "completed") {
    return {
      iconName: "checkmark-circle-outline",
      iconColor: "#16A34A",
      bgColor: "#DCFCE7",
      borderColor: "#16A34A",
      connectorColor: "#16A34A",
    };
  }

  return {
    ...baseConfig,
    iconName,
  };
}

const VARIANT_MAP: Record<
  StatusVisualVariant,
  {
    card: any;
    iconBox: any;
    iconColor: string;
    badgeBox: any;
    badgeText: string;
  }
> = {
  blue: {
    card: styles.summaryBlue, iconBox: styles.iconBoxBlue, iconColor: "#1D4ED8",
    badgeBox: styles.iconBoxBlue, badgeText: "#1D4ED8",
  },
  lightBlue: {
    card: styles.summaryLightBlue, iconBox: styles.iconBoxLightBlue, iconColor: "#0284C7",
    badgeBox: styles.iconBoxLightBlue, badgeText: "#0284C7",
  },
  orange: {
    card: styles.summaryOrange, iconBox: styles.iconBoxOrange, iconColor: "#EA580C",
    badgeBox: styles.iconBoxOrange, badgeText: "#EA580C",
  },
  green: {
    card: styles.summaryGreen, iconBox: styles.iconBoxGreen, iconColor: "#16A34A",
    badgeBox: styles.iconBoxGreen, badgeText: "#16A34A",
  },
  red: {
    card: styles.summaryRed, iconBox: styles.iconBoxRed, iconColor: "#DC2626",
    badgeBox: styles.iconBoxRed, badgeText: "#DC2626",
  },
  gray: {
    card: styles.summaryGray, iconBox: styles.iconBoxGray, iconColor: "#64748B",
    badgeBox: styles.iconBoxGray, badgeText: "#64748B",
  },
};

export function StatusTab({
  app,
  timelineSteps,
  currentStatus,
  appliedDate,
  onNavigateTab,
}: StatusTabProps) {
  const statusUI = resolveApplicationStatusUI(app, appliedDate);
  const resolvedSteps =
    timelineSteps && timelineSteps.length > 0 && !app
      ? timelineSteps
      : statusUI.timelineSteps;

  const { summary, normalizedStatus } = statusUI;
  const isOverallRejected = normalizedStatus === "REJECTED";
  const isPendingDocs = normalizedStatus === "PENDING_DOCUMENTS";
  const vTheme = VARIANT_MAP[summary.variant] || VARIANT_MAP.gray;

  return (
    <View style={styles.statusTabWrap}>
      {/* 1. Dynamic Status Summary Card */}
      <View style={[styles.statusSummaryCard, vTheme.card]}>
        <View style={[styles.statusSummaryIconBox, vTheme.iconBox]}>
          <Ionicons
            name={summary.iconName as any}
            size={22}
            color={vTheme.iconColor}
          />
        </View>
        <View style={styles.statusSummaryContent}>
          <View style={styles.statusSummaryTitleRow}>
            <Text style={styles.statusSummaryTitle} numberOfLines={1}>
              {summary.title}
            </Text>
            <View style={[styles.statusSummaryBadge, vTheme.badgeBox]}>
              <Text
                style={[
                  styles.statusSummaryBadgeText,
                  { color: vTheme.badgeText },
                ]}
              >
                {summary.badgeLabel}
              </Text>
            </View>
          </View>
          <Text style={styles.statusSummaryDesc}>{summary.description}</Text>
        </View>
      </View>

      {/* 2. Vertical Timeline Card */}
      <View style={styles.card}>
        <View style={styles.timelineContainer}>
          {resolvedSteps.map((step, index) => {
            const isLast = index === resolvedSteps.length - 1;
            const isCompleted = step.status === "completed";
            const isCurrent = step.status === "current";
            const isPending = !isCompleted && !isCurrent;
            const isStepRejected = isCurrent && isOverallRejected;
            const stageConfig = getStageVisualConfig(step, index, isStepRejected);

            const baseCircleStyle = isCompleted
              ? styles.circleCompleted
              : isStepRejected
                ? styles.circleRejected
                : isCurrent
                  ? styles.circleCurrent
                  : styles.circlePending;

            return (
              <View key={index} style={styles.timelineStepRow}>
                {/* Left Column: Icon Circle + Connecting Line */}
                <View style={styles.timelineLeftCol}>
                  <View
                    style={[
                      baseCircleStyle,
                      {
                        backgroundColor: stageConfig.bgColor,
                        borderColor: stageConfig.borderColor,
                      },
                    ]}
                  >
                    <Ionicons
                      name={stageConfig.iconName as any}
                      size={17}
                      color={stageConfig.iconColor}
                    />
                  </View>

                  {!isLast && (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor: stageConfig.connectorColor,
                        },
                      ]}
                    />
                  )}
                </View>

                {/* Right Column: Title Row, Date, Description */}
                <View
                  style={[
                    styles.timelineRightCol,
                    isLast ? { paddingBottom: 6 } : null,
                  ]}
                >
                  <View style={styles.timelineStepTitleRow}>
                    <Text
                      style={[
                        styles.timelineStepTitle,
                        {
                          color: isPending ? "#64748B" : "#0F172A",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {step.title}
                    </Text>

                    {isCompleted ? (
                      <View style={styles.timelineBadgeCompleted}>
                        <Text style={styles.timelineBadgeCompletedText}>
                          Completed
                        </Text>
                      </View>
                    ) : isStepRejected ? (
                      <View style={styles.timelineBadgeRejected}>
                        <Text style={styles.timelineBadgeRejectedText}>
                          Rejected
                        </Text>
                      </View>
                    ) : isCurrent ? (
                      <View style={styles.timelineBadgeCurrent}>
                        <Text
                          style={styles.timelineBadgeCurrentText}
                          numberOfLines={1}
                        >
                          {isPendingDocs ? "Action Needed" : "In Progress"}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.timelineBadgePending}>
                        <Text style={styles.timelineBadgePendingText}>
                          Pending
                        </Text>
                      </View>
                    )}
                  </View>

                  {step.date && (
                    <Text style={styles.timelineStepDate}>{step.date}</Text>
                  )}

                  {step.description && (
                    <Text style={styles.timelineStepDesc}>
                      {step.description}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
