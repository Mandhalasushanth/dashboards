import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./ItrStepIndicator.styles";

interface ItrStepIndicatorProps {
  currentStep: number; // 0 to 3 (representing steps 1 to 4)
  totalSteps?: number; // defaults to 4
  stepTitle: string;
  onBack: () => void;
  hideBackButton?: boolean;
  onSettings?: () => void;
  onSaveDraft?: () => void;
}

const STEP_LABELS = [
  "Personal & Filing Info",
  "Income Sources",
  "Documents",
  "Tax Summary & Review",
];

export const ItrStepIndicator: React.FC<ItrStepIndicatorProps> = ({
  currentStep,
  totalSteps = 4,
  stepTitle,
  onBack,
  hideBackButton = false,
  onSettings,
  onSaveDraft,
}) => {
  const displayStepNumber = currentStep + 1;
  const progressPercent = Math.min(100, Math.max(0, (displayStepNumber / totalSteps) * 100));
  const stepLabel = STEP_LABELS[currentStep] || stepTitle;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topRow}>
        {currentStep === totalSteps - 1 || hideBackButton ? (
          <View style={styles.rightSpacer} /> // Replaces back button with empty spacer for balance
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.circleBtn}
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={20} color="#0B1F3A" />
          </TouchableOpacity>
        )}

        <View style={styles.titleCenter}>
          <Text style={styles.mainTitle}>ITR Filing</Text>
          <Text style={styles.subTitle}>
            Step {displayStepNumber} of {totalSteps} • {stepLabel}
          </Text>
        </View>

        {currentStep === totalSteps - 1 ? (
          onSaveDraft ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onSaveDraft}
              style={styles.saveDraftHeaderBtn}
              accessibilityLabel="Save Draft"
            >
              <Ionicons name="bookmark-outline" size={14} color="#64748B" />
              <Text style={styles.saveDraftHeaderText}>Save Draft</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.rightSpacer} />
          )
        ) : (
          <View style={styles.rightSpacer} />
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
};

