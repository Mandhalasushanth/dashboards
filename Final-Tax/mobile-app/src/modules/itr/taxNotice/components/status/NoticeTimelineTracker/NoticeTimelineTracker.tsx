import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NoticeTrackingStep } from "../../../types/taxNotice.types";
import { styles } from "./NoticeTimelineTracker.styles";

interface NoticeTimelineTrackerProps {
  steps: NoticeTrackingStep[];
}

export const NoticeTimelineTracker: React.FC<NoticeTimelineTrackerProps> = ({
  steps,
}) => {
  return (
    <View style={styles.card}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCompleted = step.status === "completed";

        return (
          <View key={step.id} style={styles.stepRow}>
            {/* Left Node & Connector */}
            <View style={styles.nodeColumn}>
              {isCompleted ? (
                <View style={styles.completedCircle}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.pendingCircle} />
              )}
              {!isLast && (
                <View
                  style={[
                    styles.connectorLine,
                    isCompleted ? styles.completedLine : styles.pendingLine,
                  ]}
                />
              )}
            </View>

            {/* Right Text Details */}
            <View style={styles.contentColumn}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.stepTitle,
                    isCompleted ? styles.completedTitle : styles.pendingTitle,
                  ]}
                >
                  {step.title}
                </Text>
                <Text style={styles.stepDate}>{step.date}</Text>
              </View>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};
