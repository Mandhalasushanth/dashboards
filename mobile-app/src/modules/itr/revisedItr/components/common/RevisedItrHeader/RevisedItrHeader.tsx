import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./RevisedItrHeader.styles";

interface RevisedItrHeaderProps {
  subtitle: string;
  currentStep?: number;
  totalSteps?: number;
  onBack?: () => void;
  hideBackButton?: boolean;
}

export const RevisedItrHeader: React.FC<RevisedItrHeaderProps> = ({
  subtitle,
  currentStep,
  totalSteps = 5,
  onBack,
  hideBackButton = false,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const progressPercent = currentStep
    ? Math.min(100, Math.max(0, (currentStep / totalSteps) * 100))
    : 0;

  const stepSubtitle = currentStep
    ? `Step ${currentStep} of ${totalSteps} • ${subtitle}`
    : subtitle;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {!hideBackButton ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            style={styles.backButton}
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={20} color="#0B1F3A" />
          </TouchableOpacity>
        ) : (
          <View style={styles.rightSpacer} />
        )}

        <View style={styles.titleGroup} pointerEvents="none">
          <Text style={styles.title}>Revised ITR</Text>
          <Text style={styles.subtitle}>{stepSubtitle}</Text>
        </View>

        <View style={styles.rightSpacer} />
      </View>

      {currentStep ? (
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercent}%` },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
};
