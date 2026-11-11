import React from "react";
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { LoanFlowHeader } from "../LoanFlowHeader";
import { styles } from "./LoanNextStepPlaceholder.styles";

interface LoanNextStepPlaceholderProps {
  title: string;
  stepTitle: string;
  currentStep: number;
  totalSteps: number;
  subtitle: string;
  onBack: () => void;
  message?: string;
}

/** Marks the point where a flow continues once its next screen is built. */
export const LoanNextStepPlaceholder: React.FC<LoanNextStepPlaceholderProps> = ({
  title,
  stepTitle,
  currentStep,
  totalSteps,
  subtitle,
  onBack,
  message = "This step is coming soon.",
}) => (
  <View style={styles.container}>
    <LoanFlowHeader
      title={title}
      currentStep={currentStep}
      totalSteps={totalSteps}
      subtitle={subtitle}
      onBack={onBack}
    />
    <View style={styles.body}>
      <View style={styles.card}>
        <Ionicons name="construct-outline" size={36} color={BrandColors.PRIMARY_BLUE} />
        <Text style={styles.title}>{stepTitle}</Text>
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  </View>
);

export default LoanNextStepPlaceholder;
