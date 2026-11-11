import React from "react";
import { View, Text, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./FilingProgressTracker.styles";

interface ItrProgressStage {
  id: string;
  stageNumber: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  status: "completed" | "active" | "pending";
  description: string;
}

interface FilingProgressTrackerProps {
  isRevised?: boolean;
}

export const FilingProgressTracker: React.FC<FilingProgressTrackerProps> = ({
  isRevised = false,
}) => {
  const revisedStages: ItrProgressStage[] = [
    {
      id: "rev-stage-1",
      stageNumber: 1,
      label: "Application\nReceived",
      icon: "document-text-outline",
      status: "completed",
      description: "Your Revised ITR application has been received.",
    },
    {
      id: "rev-stage-2",
      stageNumber: 2,
      label: "Payment\nCompleted",
      icon: "card-outline",
      status: "completed",
      description: "Payment has been successfully verified.",
    },
    {
      id: "rev-stage-3",
      stageNumber: 3,
      label: "CA\nVerification",
      icon: "search-outline",
      status: "active",
      description: "Certified CA verifying original filing and revised declaration.",
    },
    {
      id: "rev-stage-4",
      stageNumber: 4,
      label: "Revised ITR\nPreparation",
      icon: "create-outline",
      status: "pending",
      description: "CA preparing revised computation and optimal regime.",
    },
    {
      id: "rev-stage-5",
      stageNumber: 5,
      label: "Filing",
      icon: "paper-plane-outline",
      status: "pending",
      description: "Revised return will be filed with Income Tax Department.",
    },
    {
      id: "rev-stage-6",
      stageNumber: 6,
      label: "Income Tax\nProcessing",
      icon: "sync-outline",
      status: "pending",
      description: "CPC processing and intimation issuance.",
    },
  ];

  const standardStages: ItrProgressStage[] = [
    {
      id: "stage-1",
      stageNumber: 1,
      label: "Application\nReceived",
      icon: "document-text-outline",
      status: "completed",
      description: "Your application and declared details have been received.",
    },
    {
      id: "stage-2",
      stageNumber: 2,
      label: "Documents\nUnder Review",
      icon: "search-outline",
      status: "active",
      description: "Assigned CA is reviewing your Form 16, AIS, and uploaded records.",
    },
    {
      id: "stage-3",
      stageNumber: 3,
      label: "CA Preparing\nReturn",
      icon: "create-outline",
      status: "pending",
      description: "Computation of total income, deductions, and tax calculation.",
    },
    {
      id: "stage-4",
      stageNumber: 4,
      label: "Ready for\nConfirmation",
      icon: "shield-checkmark-outline",
      status: "pending",
      description: "Draft return prepared for your review and approval before filing.",
    },
    {
      id: "stage-5",
      stageNumber: 5,
      label: "Return Filed\n& e-Verified",
      icon: "paper-plane-outline",
      status: "pending",
      description: "Return filed and e-verified with the Income Tax Department.",
    },
    {
      id: "stage-6",
      stageNumber: 6,
      label: "Processing &\nRefund",
      icon: "sync-outline",
      status: "pending",
      description: "CPC Bangalore processing and direct refund credit.",
    },
  ];

  const stages = isRevised ? revisedStages : standardStages;
  const totalStageCount = stages.length;
  const activeStage = stages.find((s) => s.status === "active") || stages[1];

  return (
    <View style={styles.card}>
      {/* Tracker Header */}
      <View style={styles.trackerHeaderRow}>
        <Text style={styles.trackerTitle}>
          {isRevised ? "Revised ITR Timeline" : "Filing Progress Tracker"}
        </Text>
        <View style={styles.trackerBadge}>
          <Text style={styles.trackerBadgeText}>Stage {activeStage.stageNumber} of {totalStageCount}</Text>
        </View>
      </View>

      {/* Step Nodes */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.stepsRow}>
          {stages.map((step, index) => {
            const isLast = index === stages.length - 1;
            const isCompleted = step.status === "completed";
            const isActive = step.status === "active";

            return (
              <React.Fragment key={step.id}>
                {/* Step Node */}
                <View style={styles.stepNode}>
                  <View
                    style={[
                      styles.iconCircle,
                      isCompleted && styles.completedCircle,
                      isActive && styles.activeCircle,
                      !isCompleted && !isActive && styles.inactiveCircle,
                    ]}
                  >
                    <Ionicons
                      name={step.icon}
                      size={14}
                      color={isCompleted || isActive ? "#FFFFFF" : "#64748B"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      isCompleted && styles.completedLabel,
                      isActive && styles.activeLabel,
                      !isCompleted && !isActive && styles.inactiveLabel,
                    ]}
                    numberOfLines={2}
                  >
                    {step.label}
                  </Text>
                </View>

                {/* Connector line */}
                {!isLast && <View style={styles.connector} />}
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>

      {/* Underneath Context Box for Active Stage */}
      <View style={styles.activeStageBox}>
        <View style={styles.activeStageTitleRow}>
          <Ionicons name="information-circle" size={15} color="#083B75" />
          <Text style={styles.activeStageTitle}>
            Current Stage {activeStage.stageNumber}: {activeStage.label.replace(/\n/g, " ")}
          </Text>
        </View>
        <Text style={styles.activeStageDesc}>{activeStage.description}</Text>
      </View>
    </View>
  );
};

export default FilingProgressTracker;
