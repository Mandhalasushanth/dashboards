import React from "react";
import { LoanProgressHeader } from "@/shared/components/LoanProgressHeader";

export interface LinearLoanStepIndicatorProps {
  variant?: "linear";
  title: string;
  currentStepIndex: number;
  totalSteps: number;
  subtitle?: string;
  onBack?: () => void;
  onSettings?: () => void;
}

export interface NumberedLoanStepIndicatorProps {
  variant: "numbered";
  title?: string;
  steps: readonly string[];
  currentStepIndex: number;
  onStepPress?: (index: number) => void;
  onBack?: () => void;
}

export type LoanStepIndicatorProps = LinearLoanStepIndicatorProps | NumberedLoanStepIndicatorProps;

export const LoanStepIndicator: React.FC<LoanStepIndicatorProps> = (props) => {
  if (props.variant === "numbered") {
    const title = props.title || "Loan Application";
    const subtitle = props.steps[props.currentStepIndex] || "";
    return (
      <LoanProgressHeader
        title={title}
        currentStep={props.currentStepIndex + 1}
        totalSteps={props.steps.length}
        subtitle={subtitle}
        onBack={props.onBack}
      />
    );
  }

  return (
    <LoanProgressHeader
      title={props.title}
      currentStep={props.currentStepIndex + 1}
      totalSteps={props.totalSteps}
      subtitle={props.subtitle || ""}
      onBack={props.onBack}
      onSettings={props.onSettings}
    />
  );
};

export default LoanStepIndicator;
