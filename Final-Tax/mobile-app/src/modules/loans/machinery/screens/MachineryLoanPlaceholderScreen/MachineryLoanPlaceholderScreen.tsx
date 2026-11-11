import React from "react";
import { LoanNextStepPlaceholder } from "../../../components/LoanNextStepPlaceholder";
import { getLoanFlowTotalSteps } from "../../../constants/loanFlow";

export interface MachineryLoanPlaceholderScreenProps {
  onBackToKyc: () => void;
  onContinue?: () => void;
  isEditMode?: boolean;
  isRevisit?: boolean;
}

/**
 * Machinery Loan Screen 2: Next-step placeholder awaiting dedicated Screen 2 implementation.
 * Never routes to or renders Business or Working Capital screens.
 */
export const MachineryLoanPlaceholderScreen: React.FC<
  MachineryLoanPlaceholderScreenProps
> = ({ onBackToKyc }) => (
  <LoanNextStepPlaceholder
    title="Tell us about your machinery requirement"
    stepTitle="Machinery Details"
    subtitle="Machinery Loan Step 2"
    currentStep={2}
    totalSteps={getLoanFlowTotalSteps("machinery-loan")}
    onBack={onBackToKyc}
    message="Machinery and equipment details form is coming soon."
  />
);

export default MachineryLoanPlaceholderScreen;
