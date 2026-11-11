import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./LoanProgressHeader.styles";

export interface LoanProgressHeaderProps {
  /** Loan application title, e.g. "Machinery Loan" or "Working Capital Loan" */
  title: string;
  /** Current step number. Supports 1-based (e.g., 1) or 0-based index (e.g., 0) */
  currentStep: number;
  /** Total number of steps in the loan flow */
  totalSteps: number;
  /** Name of the current active step, e.g. "Loan Details" */
  subtitle: string;
  /** Optional back button press handler */
  onBack?: () => void;
  /** Optional settings press handler */
  onSettings?: () => void;
  /** Replaces the "Step X of Y • subtitle" line when set. */
  stepLabel?: string;
  /** Hides the progress bar, e.g. on a stand-alone edit screen. */
  hideProgress?: boolean;
}

export const LOAN_PROGRESS_CONFIG = {
  workingCapital: {
    title: "Working Capital Loan",
    steps: ["Financials", "Business & Banking", "Documents", "Review"],
  },
  machinery: {
    title: "Machinery Loan",
    steps: ["Loan Details", "Business Details", "Banking", "Documents", "Review"],
  },
  projectFinance: {
    title: "Project Finance",
    steps: [
      "Applicant & Project",
      "Location, Land & Technical",
      "Cost & Funding Details",
      "Market & Financials",
      "Loan Requirement & Repayment",
      "Security & Compliance",
      "Documents, Review & Submit",
    ],
  },
} as const;

export const LoanProgressHeader: React.FC<LoanProgressHeaderProps> = ({
  title,
  currentStep,
  totalSteps,
  subtitle,
  onBack,
  onSettings,
  stepLabel,
  hideProgress = false,
}) => {
  // Determine 1-based step number cleanly
  const displayStep = currentStep === 0 ? 1 : currentStep;
  const progressRatio = totalSteps > 0 ? displayStep / totalSteps : 0;
  const progressPercent = Math.min(Math.max(progressRatio * 100, 0), 100);

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.topRow}>
        {onBack ? (
          <TouchableOpacity
            style={styles.circleBackButton}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={18} color="#0B1B36" />
          </TouchableOpacity>
        ) : (
          <View style={styles.rightSpacer} />
        )}

        <View style={styles.centerContent}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.stepText}>
            {stepLabel ?? `Step ${displayStep} of ${totalSteps} • ${subtitle}`}
          </Text>
        </View>

        {onSettings ? (
          <TouchableOpacity
            style={styles.circleBackButton}
            onPress={onSettings}
            activeOpacity={0.7}
            accessibilityLabel="Settings"
          >
            <Ionicons name="settings-outline" size={18} color="#0B1B36" />
          </TouchableOpacity>
        ) : (
          <View style={styles.rightSpacer} />
        )}
      </View>

      {hideProgress ? null : (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
      )}
    </View>
  );
};

export default LoanProgressHeader;
