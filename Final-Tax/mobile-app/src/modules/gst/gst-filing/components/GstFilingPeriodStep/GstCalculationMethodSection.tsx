import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import {
  formatIndianNumberInput,
  toRawNumericString,
} from "@/shared/formatters/currencyFormatter";
import { removeEmoji } from "@/modules/gst/utils/gstEmojiFilter";
import { styles } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingPeriodStep.styles";

interface GstCalculationMethodSectionProps {
  calculationMethod?: "ca_assisted" | "manual_estimates";
  taxableSales?: string;
  taxablePurchases?: string;
  eligibleItc?: string;
  errors?: Record<string, string>;
  onChange: (fields: {
    calculationMethod?: "ca_assisted" | "manual_estimates";
    taxableSales?: string;
    taxablePurchases?: string;
    eligibleItc?: string;
  }) => void;
  onBlurField?: (field: "taxableSales" | "taxablePurchases" | "eligibleItc") => void;
}

export const GstCalculationMethodSection: React.FC<GstCalculationMethodSectionProps> = ({
  calculationMethod,
  taxableSales,
  taxablePurchases,
  eligibleItc,
  errors = {},
  onChange,
  onBlurField,
}) => {
  const getDisplayValue = (val: string | undefined) => {
    if (!val) return "";
    const formatted = formatIndianNumberInput(val);
    return formatted ? `₹ ${formatted}` : "";
  };

  const hasFigures = Boolean(
    (taxableSales && String(taxableSales).trim() !== "" && String(taxableSales).trim() !== "0") ||
    (taxablePurchases && String(taxablePurchases).trim() !== "" && String(taxablePurchases).trim() !== "0") ||
    (eligibleItc && String(eligibleItc).trim() !== "" && String(eligibleItc).trim() !== "0")
  );
  const isManual = calculationMethod === "manual_estimates" || (!calculationMethod && hasFigures);
  const isCaAssisted = !isManual;

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>Tax Calculation Method</Text>

      <TouchableOpacity
        style={[styles.methodCard, isCaAssisted && styles.methodCardActive]}
        onPress={() => onChange({ calculationMethod: "ca_assisted" })}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isCaAssisted ? "radio-button-on" : "radio-button-off"}
          size={18}
          color={isCaAssisted ? BrandColors.PRIMARY_ORANGE : "#94A3B8"}
        />
        <View style={styles.methodContent}>
          <Text style={styles.methodTitle}>
            Let Finsolz CA calculate from documents
          </Text>
          <Text style={styles.methodSubtitle}>
            Upload your invoices & GSTR-2B; our CA computes sales, purchases & ITC
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.methodCard,
          isManual && styles.methodCardActive,
          styles.methodCardSecond,
        ]}
        onPress={() => onChange({ calculationMethod: "manual_estimates" })}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isManual ? "radio-button-on" : "radio-button-off"}
          size={18}
          color={isManual ? BrandColors.PRIMARY_ORANGE : "#94A3B8"}
        />
        <View style={styles.methodContent}>
          <Text style={styles.methodTitle}>
            I already have estimated figures (Optional)
          </Text>
          <Text style={styles.methodSubtitle}>
            Quickly provide estimated sales, purchases, or ITC summary
          </Text>
        </View>
      </TouchableOpacity>

      {isManual ? (
        <View style={styles.estimatesContainer}>
          <View style={styles.estimateInputRow}>
            <Text style={styles.estimateLabel}>
              Estimated Taxable Sales (₹) <Text style={styles.star}>*</Text>
            </Text>
            <TextInput
              style={[styles.estimateInput, errors.taxableSales && styles.inputError]}
              placeholder="₹ 0"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              maxLength={20}
              value={getDisplayValue(taxableSales)}
              onBlur={() => onBlurField?.("taxableSales")}
              onChangeText={(val) =>
                onChange({
                  taxableSales: toRawNumericString(removeEmoji(val)),
                  calculationMethod: "manual_estimates",
                })
              }
            />
            {errors.taxableSales ? (
              <Text style={styles.errorText}>{errors.taxableSales}</Text>
            ) : null}
          </View>

          <View style={styles.estimateInputRow}>
            <Text style={styles.estimateLabel}>
              Estimated Taxable Purchases (₹) <Text style={styles.star}>*</Text>
            </Text>
            <TextInput
              style={[styles.estimateInput, errors.taxablePurchases && styles.inputError]}
              placeholder="₹ 0"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              maxLength={20}
              value={getDisplayValue(taxablePurchases)}
              onBlur={() => onBlurField?.("taxablePurchases")}
              onChangeText={(val) =>
                onChange({
                  taxablePurchases: toRawNumericString(removeEmoji(val)),
                  calculationMethod: "manual_estimates",
                })
              }
            />
            {errors.taxablePurchases ? (
              <Text style={styles.errorText}>{errors.taxablePurchases}</Text>
            ) : null}
          </View>

          <View style={styles.estimateInputRow}>
            <Text style={styles.estimateLabel}>
              Estimated Eligible ITC (₹) <Text style={styles.star}>*</Text>
            </Text>
            <TextInput
              style={[styles.estimateInput, errors.eligibleItc && styles.inputError]}
              placeholder="₹ 0"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              maxLength={20}
              value={getDisplayValue(eligibleItc)}
              onBlur={() => onBlurField?.("eligibleItc")}
              onChangeText={(val) =>
                onChange({
                  eligibleItc: toRawNumericString(removeEmoji(val)),
                  calculationMethod: "manual_estimates",
                })
              }
            />
            {errors.eligibleItc ? (
              <Text style={styles.errorText}>{errors.eligibleItc}</Text>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
};
