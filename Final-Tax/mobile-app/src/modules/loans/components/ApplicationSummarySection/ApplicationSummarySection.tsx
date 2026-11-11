import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import type { LoanKycData } from "../../types/loanKyc.types";
import type { BusinessLoanFormData } from "../../businessWorkingCapital/types/businessLoan.types";
import type { PersonalLoanFormData } from "../../personalLoan/types/personalLoan.types";
import type { HomeLoanRequirementFormData } from "../../homeLoan/types/homeLoan.types";
import type { PropertyLoanFormData } from "../../property/types/property.types";
import type { VehicleLoanFormData } from "../../vehicle/types/vehicleLoan.types";
import type { MachineryLoanFormData } from "../../machinery/types/machinery.types";
import type { MsmeLoanFormData } from "../../msme/types/msmeLoan.types";
import type { LoanCategoryId } from "../../types/loanCategory.types";
import {
  buildReviewSections,
  type ReviewSectionId,
} from "../../utils/loanReviewSummary";
import { styles } from "./ApplicationSummarySection.styles";

interface ApplicationSummarySectionProps {
  kycData: LoanKycData;
  businessFormData: BusinessLoanFormData;
  personalFormData?: PersonalLoanFormData;
  homeLoanFormData?: HomeLoanRequirementFormData;
  propertyFormData?: PropertyLoanFormData;
  vehicleFormData?: VehicleLoanFormData;
  machineryFormData?: MachineryLoanFormData;
  msmeFormData?: MsmeLoanFormData;
  categoryId?: LoanCategoryId;
  onEditKyc: () => void;
  onEditBusiness: () => void;
  onEditPersonal?: () => void;
  onEditHomeRequirement?: () => void;
  /** Section-level problems found when submission was attempted. */
  sectionErrors?: Partial<Record<ReviewSectionId, string>>;
}

/** Read-only summary cards (applicant, business/personal, loan) with an Edit action each. */
export const ApplicationSummarySection: React.FC<
  ApplicationSummarySectionProps
> = ({
  kycData,
  businessFormData,
  personalFormData,
  homeLoanFormData,
  propertyFormData,
  vehicleFormData,
  machineryFormData,
  msmeFormData,
  categoryId,
  onEditKyc,
  onEditBusiness,
  onEditPersonal,
  onEditHomeRequirement,
  sectionErrors = {},
}) => {
  const sections = buildReviewSections(
    kycData,
    businessFormData,
    personalFormData,
    categoryId,
    homeLoanFormData,
    propertyFormData,
    vehicleFormData,
    machineryFormData,
    msmeFormData
  );

  return (
    <View style={styles.container}>
      {sections.map((section) => {
        const error = sectionErrors[section.id];
        return (
          <View
            key={section.id}
            style={[styles.card, error ? styles.cardError : null]}
          >
            <View style={styles.headerRow}>
              <View style={styles.titleGroup}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name={section.icon}
                    size={18}
                    color={BrandColors.PRIMARY_BLUE}
                  />
                </View>
                <View style={styles.titleText}>
                  <Text style={styles.title}>{section.title}</Text>
                  <Text style={styles.subtitle}>{section.subtitle}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={
                  section.editTarget === "kyc"
                    ? onEditKyc
                    : section.editTarget === "personal-employment"
                      ? (onEditPersonal ?? onEditBusiness)
                      : onEditBusiness
                }
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={section.editLabel}
              >
                <Ionicons
                  name="pencil-outline"
                  size={13}
                  color={BrandColors.PRIMARY_ORANGE}
                />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={15} color="#B91C1C" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.infoList}>
              {section.rows.map((row) => (
                <View key={row.label} style={styles.infoRow}>
                  <Text style={styles.label}>{row.label}</Text>
                  <Text
                    style={[styles.value, row.highlight && styles.highlightValue]}
                  >
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default ApplicationSummarySection;
