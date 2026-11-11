import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./RefundProgressTracker.styles";

export interface RefundProgressTrackerProps {
  currentStageIndex?: number; // 0-indexed, default 2 (Under Verification)
}

export const RefundProgressTracker: React.FC<RefundProgressTrackerProps> = ({
  currentStageIndex = 2,
}) => {
  const stages = [
    {
      title: "Application Submitted",
      description: "Application details and documents securely recorded.",
    },
    {
      title: "Payment Completed",
      description: "Finsolz assistance fee confirmed and assigned to CA team.",
    },
    {
      title: "Under Verification",
      description: "CA reviewing Form 16, 26AS, AIS and reconciling TDS claims.",
    },
    {
      title: "ITR Preparation",
      description: "Computation sheet and return preparation in progress.",
    },
    {
      title: "Customer Review",
      description: "Draft computation will be shared for customer confirmation.",
    },
    {
      title: "ITR Filing",
      description: "Return submitted to the Income Tax Department e-Filing portal.",
    },
    {
      title: "ITR Verification",
      description: "Aadhaar OTP / EVC verification of filed return.",
    },
    {
      title: "Income Tax Processing",
      description: "Income Tax Department CPC Bangalore processes refund claim.",
    },
    {
      title: "Refund Credited",
      description: "Refund amount directly transferred to verified bank account.",
    },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Application Progress Timeline</Text>

      <View style={styles.timelineList}>
        {stages.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isActive = index === currentStageIndex;
          const isUpcoming = index > currentStageIndex;
          const isLast = index === stages.length - 1;

          return (
            <View key={index} style={styles.stageItem}>
              {/* Left Column: Icon Node + Vertical Line */}
              <View style={styles.leftColumn}>
                {isCompleted && (
                  <View style={styles.stepCircleCompleted}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}

                {isActive && (
                  <View style={styles.stepCircleActive}>
                    <View style={styles.activeInnerDot} />
                  </View>
                )}

                {isUpcoming && <View style={styles.stepCircleUpcoming} />}

                {!isLast && (
                  <View
                    style={[
                      styles.connectorLine,
                      isCompleted
                        ? styles.connectorCompleted
                        : isActive
                        ? styles.connectorActive
                        : null,
                    ]}
                  />
                )}
              </View>

              {/* Right Column: Title + Description + Status Badge */}
              <View style={styles.rightColumn}>
                <Text
                  style={[
                    styles.stageTitle,
                    isActive && styles.stageTitleActive,
                    isUpcoming && styles.stageTitleUpcoming,
                  ]}
                >
                  {stage.title}
                </Text>

                <Text style={styles.stageDesc}>{stage.description}</Text>

                {isCompleted && (
                  <View style={[styles.badgePill, styles.badgeCompleted]}>
                    <Text style={styles.badgeCompletedText}>Completed</Text>
                  </View>
                )}

                {isActive && (
                  <View style={[styles.badgePill, styles.badgeActive]}>
                    <Text style={styles.badgeActiveText}>In Progress</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default RefundProgressTracker;
