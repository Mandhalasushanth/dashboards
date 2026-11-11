import React from "react";
import { useRouter } from "expo-router";
import { GstStepHeader } from "@/modules/gst/components/GstStepHeader";

export interface ComplianceHeaderProps {
  title?: string;
  onBackPress?: () => void;
  showProgressLine?: boolean;
  currentStep?: number;
  totalSteps?: number;
  stepLabel?: string;
  showBack?: boolean;
}

export const ComplianceHeader: React.FC<ComplianceHeaderProps> = ({
  title = "GST Compliance",
  onBackPress,
  currentStep = 1,
  totalSteps = 2,
  stepLabel = "Request Details",
  showBack = true,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <GstStepHeader
      title={title}
      currentStep={currentStep}
      totalSteps={totalSteps}
      stepLabel={stepLabel}
      onBack={handleBack}
      showBack={showBack}
    />
  );
};

export default ComplianceHeader;
