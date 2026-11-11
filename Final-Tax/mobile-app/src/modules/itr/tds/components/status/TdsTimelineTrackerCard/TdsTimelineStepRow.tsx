import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TdsTimelineStepItem } from "../../../types/tdsStatus.types";
import { styles } from "./TdsTimelineTrackerCard.styles";

interface TdsTimelineStepRowProps {
  step: TdsTimelineStepItem;
  isLast: boolean;
  nextStepStatus?: "completed" | "active" | "pending";
}

export const TdsTimelineStepRow: React.FC<TdsTimelineStepRowProps> = ({
  step,
  isLast,
  nextStepStatus,
}) => {
  const isCompleted = step.status === "completed";
  const isActive = step.status === "active";
  const isPending = step.status === "pending";

  // Connecting line is green if this step is completed AND the next step is completed or active
  const isLineGreen =
    isCompleted && (nextStepStatus === "completed" || nextStepStatus === "active");

  return (
    <View style={styles.stepRow}>
      {/* Left Column: Status Circle & Vertical Connecting Line */}
      <View style={styles.indicatorColumn}>
        <View
          style={[
            styles.circleBase,
            isCompleted && styles.circleCompleted,
            isActive && styles.circleActive,
            isPending && styles.circlePending,
          ]}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.stepNumberText,
                isActive ? styles.stepNumberActive : styles.stepNumberPending,
              ]}
            >
              {step.stepNumber}
            </Text>
          )}
        </View>

        {!isLast && (
          <View
            style={[
              styles.connectingLine,
              isLineGreen
                ? styles.connectingLineCompleted
                : styles.connectingLinePending,
            ]}
          />
        )}
      </View>

      {/* Right Column: Step Title & Subtitle */}
      <View
        style={[
          styles.contentColumn,
          isLast && styles.contentColumnLast,
        ]}
      >
        <Text
          style={[
            styles.stepTitle,
            isCompleted && styles.stepTitleCompleted,
            isActive && styles.stepTitleActive,
            isPending && styles.stepTitlePending,
          ]}
        >
          {step.title}
        </Text>

        <Text
          style={[
            styles.stepSubtitle,
            isCompleted && styles.stepSubtitleCompleted,
            isActive && styles.stepSubtitleActive,
            isPending && styles.stepSubtitlePending,
          ]}
        >
          {step.subtitle}
        </Text>
      </View>
    </View>
  );
};

export default TdsTimelineStepRow;
