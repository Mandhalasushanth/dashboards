import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { styles } from "./GstStepHeader.styles";

export interface GstStepHeaderProps {
  title: string;
  currentStep: number; // 1-indexed (e.g. 1 to 4)
  totalSteps: number; // e.g. 4
  stepLabel: string;
  onBack?: () => void;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const GstStepHeader: React.FC<GstStepHeaderProps> = ({
  title,
  currentStep,
  totalSteps,
  stepLabel,
  onBack,
  showBack = true,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const safeStep = Math.max(1, Math.min(currentStep, totalSteps));
  const progressPercent = Math.min(100, Math.max(0, (safeStep / totalSteps) * 100));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FocusAwareStatusBar barStyle="dark-content" />
      {/* Top App Bar */}
      <View style={styles.topRow}>
        {showBack && onBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.circleBtn}
            accessibilityLabel="Back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={20} color="#0B1F3A" />
          </TouchableOpacity>
        ) : (
          <View style={styles.rightSpacer} />
        )}

        <View style={styles.titleCenter}>
          <Text style={styles.mainTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subTitle} numberOfLines={1}>
            Step {safeStep} of {totalSteps} • {stepLabel}
          </Text>
        </View>

        {rightAction ? (
          rightAction
        ) : (
          <View style={styles.rightSpacer} />
        )}
      </View>

      {/* Progress Line Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
};

export default GstStepHeader;
