import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/design-system/colors";

export interface ProgressStepperProps {
  steps: string[];
  currentStep: number;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <React.Fragment key={index}>
            <View style={styles.stepWrapper}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isActive && styles.circleActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    (isCompleted || isActive) && styles.stepNumberActive,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepTitle,
                  (isCompleted || isActive) && styles.stepTitleActive,
                ]}
                numberOfLines={1}
              >
                {step}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.connector,
                  isCompleted && styles.connectorCompleted,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  stepWrapper: {
    alignItems: "center",
    maxWidth: 70,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  circleCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  circleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  stepNumberActive: {
    color: "#FFFFFF",
  },
  stepTitle: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  stepTitleActive: {
    color: Colors.text,
    fontWeight: "600",
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginBottom: 16,
    marginHorizontal: 4,
  },
  connectorCompleted: {
    backgroundColor: Colors.success,
  },
});

export default ProgressStepper;
