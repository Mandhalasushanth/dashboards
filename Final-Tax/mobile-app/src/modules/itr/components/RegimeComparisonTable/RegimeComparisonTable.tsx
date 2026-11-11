import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import {
  TaxRegimeType,
  TaxCalculationBreakdown,
} from "../../itr-filing/types/itrFiling.types";
import { styles } from "./RegimeComparisonTable.styles";

interface RegimeComparisonTableProps {
  calculation: TaxCalculationBreakdown;
  selectedRegime: TaxRegimeType;
  onChangeRegime: (regime: TaxRegimeType) => void;
  assessmentYear: string;
}

export const RegimeComparisonTable: React.FC<RegimeComparisonTableProps> = ({
  calculation,
  selectedRegime,
  onChangeRegime,
  assessmentYear,
}) => {
  const isNewSelected = selectedRegime === "new";

  const comparisonRows = [
    {
      id: "gross",
      label: "Gross Total Income",
      newVal: `₹ ${calculation.grossTotalIncome.toLocaleString("en-IN")}`,
      oldVal: `₹ ${calculation.grossTotalIncome.toLocaleString("en-IN")}`,
      isBold: true,
      isDeduction: false,
    },
    {
      id: "std_ded",
      label: "Standard Deduction",
      newVal: `- ₹ ${(calculation.newRegimeStdDeduction ?? calculation.standardDeduction ?? 0).toLocaleString("en-IN")}`,
      oldVal: `- ₹ ${(calculation.oldRegimeStdDeduction ?? 0).toLocaleString("en-IN")}`,
      isBold: false,
      isDeduction: true,
    },
    {
      id: "ch_via",
      label: "Chapter VI-A Deductions",
      newVal: "Not Applicable",
      oldVal: `- ₹ ${calculation.totalChapterVIA.toLocaleString("en-IN")}`,
      isBold: false,
      isDeduction: true,
    },
    {
      id: "taxable",
      label: "Net Taxable Income",
      newVal: `₹ ${Math.max(0, calculation.grossTotalIncome - (calculation.newRegimeStdDeduction ?? calculation.standardDeduction ?? 0)).toLocaleString("en-IN")}`,
      oldVal: `₹ ${Math.max(0, calculation.grossTotalIncome - (calculation.oldRegimeStdDeduction ?? 0) - calculation.totalChapterVIA).toLocaleString("en-IN")}`,
      isBold: true,
      isDeduction: false,
      isHighlight: true,
    },
    {
      id: "total_tax",
      label: "Estimated Tax Liability",
      newVal: `₹ ${calculation.taxUnderNewRegime.toLocaleString("en-IN")}`,
      oldVal: `₹ ${calculation.taxUnderOldRegime.toLocaleString("en-IN")}`,
      isBold: true,
      isTax: true,
    },
  ];

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="git-compare-outline" size={18} color="#083B75" />
          <Text style={styles.title}>Compare Tax Regimes</Text>
        </View>
        <View style={styles.ayBadge}>
          <Text style={styles.ayBadgeText}>AY {assessmentYear}</Text>
        </View>
      </View>

      <Text style={styles.description}>
        Compare your estimated tax computation between the New and Old Tax Regimes for AY {assessmentYear} before finalizing your selection.
      </Text>

      {/* Side-by-Side Comparison Table */}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeaderRow}>
          <View style={styles.tableHeaderColParam}>
            <Text style={styles.tableHeaderText}>Tax Parameter</Text>
          </View>
          <View style={styles.tableHeaderColRegime}>
            <Text style={styles.tableHeaderText}>New Regime</Text>
          </View>
          <View style={styles.tableHeaderColRegime}>
            <Text style={styles.tableHeaderText}>Old Regime</Text>
          </View>
        </View>

        {comparisonRows.map((row) => (
          <View
            key={row.id}
            style={[styles.tableRow, row.isHighlight ? styles.tableRowHighlight : null]}
          >
            <View style={styles.tableHeaderColParam}>
              <Text style={row.isBold ? styles.paramLabelBold : styles.paramLabel}>
                {row.label}
              </Text>
            </View>

            <View style={styles.tableHeaderColRegime}>
              <Text
                style={[
                  styles.valueText,
                  row.isBold ? styles.valueTextBold : null,
                  row.isDeduction ? styles.valueTextDeduction : null,
                  row.isTax ? styles.valueTextTax : null,
                ]}
              >
                {row.newVal}
              </Text>
            </View>

            <View style={styles.tableHeaderColRegime}>
              <Text
                style={[
                  styles.valueText,
                  row.isBold ? styles.valueTextBold : null,
                  row.isDeduction ? styles.valueTextDeduction : null,
                  row.isTax ? styles.valueTextTax : null,
                ]}
              >
                {row.oldVal}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Savings Summary Banner - only show when actual income exists and there are savings */}
      {calculation.grossTotalIncome > 0 && calculation.savingsAmount > 0 && (
        <View style={styles.savingsBanner}>
          <Ionicons name="sparkles" size={18} color="#166534" />
          <View style={styles.savingsBannerTextCol}>
            <Text style={styles.savingsBannerTitle}>
              {`${calculation.recommendedRegime === "new" ? "New Tax Regime" : "Old Tax Regime"} estimated to save ₹ ${calculation.savingsAmount.toLocaleString("en-IN")}`}
            </Text>
            {Boolean(calculation.savingsExplanation) && (
              <Text style={styles.savingsBannerSub}>{calculation.savingsExplanation}</Text>
            )}
          </View>
        </View>
      )}

      {/* User Selection Radio Cards */}
      <Text style={styles.selectionSectionTitle}>Your Regime Selection</Text>
      <View style={styles.regimeOptionCards}>
        {/* Option A: New Tax Regime */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.regimeCard, isNewSelected && styles.regimeCardSelected]}
          onPress={() => onChangeRegime("new")}
        >
          <Ionicons
            name={isNewSelected ? "radio-button-on" : "radio-button-off"}
            size={20}
            color={isNewSelected ? BrandColors.PRIMARY_ORANGE : "#64748B"}
          />
          <View style={styles.regimeCardContent}>
            <View style={styles.regimeCardTitleRow}>
              <Text style={styles.regimeName}>New Tax Regime (Default)</Text>
              <View style={styles.regimeTag}>
                <Text style={styles.regimeTagText}>AY {assessmentYear} Slabs</Text>
              </View>
            </View>
            <Text style={styles.regimeBullet}>
              • Lower tax slab rates across income brackets.
            </Text>
            <Text style={styles.regimeBullet}>
              • Standard deduction of ₹75,000 for salaried employees automatically applied.
            </Text>
            <Text style={styles.regimeBullet}>
              • Section 87A rebate covers taxable income up to ₹7,00,000 (tax liability is ₹0).
            </Text>
          </View>
        </TouchableOpacity>

        {/* Option B: Old Tax Regime */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.regimeCard, !isNewSelected && styles.regimeCardSelected]}
          onPress={() => onChangeRegime("old")}
        >
          <Ionicons
            name={!isNewSelected ? "radio-button-on" : "radio-button-off"}
            size={20}
            color={!isNewSelected ? BrandColors.PRIMARY_ORANGE : "#64748B"}
          />
          <View style={styles.regimeCardContent}>
            <View style={styles.regimeCardTitleRow}>
              <Text style={styles.regimeName}>Old Tax Regime</Text>
              <View style={styles.regimeTag}>
                <Text style={styles.regimeTagText}>With Deductions</Text>
              </View>
            </View>
            <Text style={styles.regimeBullet}>
              • Standard deduction of ₹50,000 for salaried employees.
            </Text>
            <Text style={styles.regimeBullet}>
              • Claim 80C deductions (EPF, PPF, LIC, ELSS, Housing loan principal up to ₹1.5L).
            </Text>
            <Text style={styles.regimeBullet}>
              • Claim 80D health insurance & 24(b) home loan interest (up to ₹2L).
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
