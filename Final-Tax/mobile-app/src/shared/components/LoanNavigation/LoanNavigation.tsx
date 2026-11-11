import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleProp, ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./LoanNavigation.styles";

export interface LoanNavigationProps {
  onBack?: () => void;
  onNext: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isSubmitting?: boolean;
  nextText?: string;
  backText?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const LoanNavigation: React.FC<LoanNavigationProps> = ({
  onBack,
  onNext,
  isFirstStep = false,
  isLastStep = false,
  isSubmitting = false,
  nextText,
  backText = "Back",
  containerStyle,
}) => {
  const defaultNextText = isLastStep ? "Submit Application" : "Continue";
  const label = nextText || defaultNextText;

  return (
    <View style={[styles.bottomBar, containerStyle]}>
      {!isFirstStep && onBack ? (
        <TouchableOpacity style={styles.backButton} onPress={onBack} disabled={isSubmitting} activeOpacity={0.7}>
          <Text style={styles.backButtonText}>{backText}</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={[styles.nextButton, isSubmitting && styles.nextButtonDisabled]}
        onPress={onNext}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={BrandColors.WHITE} />
        ) : (
          <>
            <Text style={styles.nextButtonText}>{label}</Text>
            <Ionicons
              name={isLastStep ? "shield-checkmark" : "arrow-forward"}
              size={18}
              color={BrandColors.WHITE}
            />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default LoanNavigation;
