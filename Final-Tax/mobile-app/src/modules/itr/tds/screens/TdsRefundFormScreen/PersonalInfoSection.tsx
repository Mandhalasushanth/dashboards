import React from "react";
import { PersonalDetails } from "../../types/customerIncome.types";
import { CustomerFormErrors } from "../../validation/tdsCustomerSchema";
import { TdsRefundPersonalInfoCard } from "../../components/personal/TdsRefundPersonalInfoCard";

interface PersonalInfoSectionProps {
  personal: PersonalDetails;
  // BUG_B23_003: errors must flow down so personal field errors display inline
  errors: CustomerFormErrors;
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  onSaveProfile: (updated: PersonalDetails) => Promise<void>;
  onBlurField?: (key: string) => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  personal,
  errors,
  isLoading,
  errorMessage,
  onRetry,
  onSaveProfile,
  onBlurField,
}) => (
  <TdsRefundPersonalInfoCard
    personalData={personal}
    personalErrors={errors}
    isLoading={isLoading}
    isError={Boolean(errorMessage)}
    errorMessage={errorMessage || undefined}
    onRetry={onRetry}
    onSaveProfile={onSaveProfile}
    onBlurField={onBlurField}
  />
);

