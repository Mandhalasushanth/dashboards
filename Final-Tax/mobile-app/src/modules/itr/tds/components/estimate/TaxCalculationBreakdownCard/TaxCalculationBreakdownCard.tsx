import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TaxCalculationBreakdown } from "../../../types/estimate.types";
import { formatCurrency } from "../../../utils/tdsValidation";
import { styles } from "./TaxCalculationBreakdownCard.styles";

export interface TaxCalculationBreakdownCardProps {
  breakdown: TaxCalculationBreakdown;
}

export const TaxCalculationBreakdownCard: React.FC<TaxCalculationBreakdownCardProps> = ({
  breakdown,
}) => {
  const isPayable = breakdown.isAdditionalTaxPayable || breakdown.estimatedRefund <= 0;
  const heroAmount = isPayable ? breakdown.estimatedTaxPayable : breakdown.estimatedRefund;

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.headerTitle}>Estimated Tax Computation</Text>
        <View style={styles.badgeEstimate}>
          <Text style={styles.badgeEstimateText}>Preliminary</Text>
        </View>
      </View>

      {/* Breakdown Rows */}
      <View style={styles.rowsList}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Gross Total Income</Text>
          <Text style={styles.rowValue}>{formatCurrency(breakdown.grossTotalIncome)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Less: Eligible Deductions</Text>
          <Text style={[styles.rowValue, styles.deductionValue]}>
            - {formatCurrency(breakdown.totalEligibleDeductions)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={[styles.row, styles.taxableRow]}>
          <Text style={styles.taxableLabel}>Taxable Income</Text>
          <Text style={styles.taxableValue}>{formatCurrency(breakdown.taxableIncome)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Estimated Tax Liability (incl. 4% Cess)</Text>
          <Text style={styles.rowValue}>{formatCurrency(breakdown.estimatedTaxLiability)}</Text>
        </View>

        {/* Tax Credits Section */}
        <View style={styles.creditsSection}>
          <Text style={styles.sectionSubhead}>Tax Credits & Prepaid Taxes</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>TDS Deducted</Text>
            <Text style={styles.rowValue}>{formatCurrency(breakdown.tdsDeducted)}</Text>
          </View>

          {breakdown.tcsAmount > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>TCS (Tax Collected at Source)</Text>
              <Text style={styles.rowValue}>{formatCurrency(breakdown.tcsAmount)}</Text>
            </View>
          )}

          {breakdown.advanceTaxPaid > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Advance Tax Paid</Text>
              <Text style={styles.rowValue}>{formatCurrency(breakdown.advanceTaxPaid)}</Text>
            </View>
          )}

          {breakdown.selfAssessmentTaxPaid > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Self-Assessment Tax Paid</Text>
              <Text style={styles.rowValue}>
                {formatCurrency(breakdown.selfAssessmentTaxPaid)}
              </Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.taxableLabel}>Total Eligible Tax Credits</Text>
            <Text style={[styles.taxableValue, styles.deductionValue]}>
              {formatCurrency(breakdown.totalTaxCredits)}
            </Text>
          </View>
        </View>
      </View>

      {/* Dynamic Hero Box: Refund vs Additional Tax Payable */}
      <View
        style={[
          styles.finalHeroBox,
          isPayable ? styles.finalHeroPayable : styles.finalHeroRefund,
        ]}
      >
        <Text
          style={[
            styles.finalHeroLabel,
            isPayable ? styles.finalHeroLabelPayable : styles.finalHeroLabelRefund,
          ]}
        >
          {isPayable ? "Estimated Additional Tax Payable" : "Estimated Refund"}
        </Text>
        <Text
          style={[
            styles.finalHeroAmount,
            isPayable ? styles.finalHeroAmountPayable : styles.finalHeroAmountRefund,
          ]}
        >
          {formatCurrency(heroAmount)}
        </Text>
      </View>

      {/* Clear CA Disclaimer */}
      <View style={styles.disclaimerBox}>
        <Ionicons name="information-circle-outline" size={16} color="#64748B" />
        <Text style={styles.disclaimerText}>{breakdown.disclaimer}</Text>
      </View>
    </View>
  );
};

export default TaxCalculationBreakdownCard;
