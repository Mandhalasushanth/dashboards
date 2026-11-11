import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./PreviousYearStepperTimeline.styles";

export const PreviousYearStepperTimeline: React.FC = () => {
  const steps = [
    { id: "received", label: "Received", type: "completed" as const },
    { id: "verification", label: "Verification", type: "active" as const },
    { id: "filed", label: "Filed", type: "upcoming" as const },
    { id: "processing", label: "Processing", type: "upcoming" as const },
    { id: "credited", label: "Refund\nCredited", type: "upcoming" as const },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.stepsRow}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isFirstConnector = index === 0;

          return (
            <React.Fragment key={step.id}>
              {/* Step Node */}
              <View style={styles.stepNode}>
                {step.type === "completed" && (
                  <View style={styles.completedCircle}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}

                {step.type === "active" && (
                  <View style={styles.activeCircle}>
                    <View style={styles.activeInnerDot} />
                  </View>
                )}

                {step.type === "upcoming" && (
                  <View style={styles.upcomingCircle} />
                )}

                <Text
                  style={[
                    styles.stepLabel,
                    step.type === "completed" && styles.completedLabel,
                    step.type === "active" && styles.activeLabel,
                    step.type === "upcoming" && styles.upcomingLabel,
                  ]}
                  numberOfLines={2}
                >
                  {step.label}
                </Text>
              </View>

              {/* Connector */}
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    isFirstConnector
                      ? styles.completedConnector
                      : styles.upcomingConnector,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};
