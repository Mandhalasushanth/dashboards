import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { AmountTextInput } from "@/shared/components/AmountTextInput";
import { IncomeOtherSourcesData } from "../../../types/itrFiling.types";
import { styles } from "../Step2IncomeSources.styles";

interface OtherSourcesFormProps {
  otherSources: IncomeOtherSourcesData;
  onUpdateOtherSources: (data: Partial<IncomeOtherSourcesData>) => void;
  onPressInfo?: () => void;
}

export const OtherSourcesIncomeForm: React.FC<OtherSourcesFormProps> = ({
  otherSources,
  onUpdateOtherSources,
  onPressInfo,
}) => {
  if (!otherSources.enabled) return null;

  return (
    <View style={[styles.card, styles.cardActive]}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.sourceHeaderRow}
        onPress={() => onUpdateOtherSources({ enabled: !otherSources.enabled })}
      >
        <View style={styles.sourceHeaderLeft}>
          <View style={[styles.sourceIconBox, styles.sourceIconBoxActive]}>
            <Ionicons name="wallet-outline" size={20} color={BrandColors.PRIMARY_ORANGE} />
          </View>
          <View style={styles.sourceTitleCol}>
            <View style={styles.sourceTitleRow}>
              <Text style={styles.sourceTitle}>Income from Other Sources</Text>
              {onPressInfo && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.infoIconBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    onPressInfo();
                  }}
                >
                  <Ionicons name="information-circle-outline" size={18} color="#083B75" />
                </TouchableOpacity>
              )}
              {otherSources.source === "AIS_TIS" && (
                <View style={styles.sourceTagWarning}>
                  <Ionicons name="alert-circle" size={10} color="#B45309" />
                  <Text style={styles.sourceTagWarningText}>AIS Imported</Text>
                </View>
              )}
            </View>
            <Text style={styles.sourceSubtitle}>Bank interest, dividends, family pension</Text>
          </View>
        </View>
        <View style={styles.checkboxBtn}>
          <Ionicons name="checkbox" size={22} color={BrandColors.PRIMARY_ORANGE} />
        </View>
      </TouchableOpacity>

      <View style={styles.expandedForm}>
        {otherSources.source === "AIS_TIS" &&
          (Number(otherSources.savingsInterest || 0) > 0 ||
            Number(otherSources.fdInterest || 0) > 0 ||
            Number(otherSources.dividendIncome || 0) > 0) && (
            <View style={styles.aisTable}>
              {Number(otherSources.savingsInterest || 0) > 0 && (
                <View style={styles.aisRow}>
                  <Text style={styles.aisLabel}>Savings Bank Interest (AIS)</Text>
                  <Text style={styles.aisValue}>
                    ₹ {Number(otherSources.savingsInterest).toLocaleString("en-IN")}
                  </Text>
                </View>
              )}
              {Number(otherSources.fdInterest || 0) > 0 && (
                <View style={styles.aisRow}>
                  <Text style={styles.aisLabel}>FD / Term Interest (AIS)</Text>
                  <Text style={styles.aisValue}>
                    ₹ {Number(otherSources.fdInterest).toLocaleString("en-IN")}
                  </Text>
                </View>
              )}
              {Number(otherSources.dividendIncome || 0) > 0 && (
                <View style={styles.aisRow}>
                  <Text style={styles.aisLabel}>Dividend Income (AIS)</Text>
                  <Text style={styles.aisValue}>
                    ₹ {Number(otherSources.dividendIncome).toLocaleString("en-IN")}
                  </Text>
                </View>
              )}
              <View style={styles.aisNotice}>
                <Ionicons name="information-circle-outline" size={14} color="#64748B" />
                <Text style={styles.aisNoticeText}>
                  Please verify these values against your bank account statements.
                </Text>
              </View>
            </View>
          )}

        <View style={styles.inputRow}>
          <View style={styles.inputGroupHalf}>
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.inputLabel}>Savings Interest</Text>
              <Text style={styles.mandatoryAsterisk}>*</Text>
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <AmountTextInput
                style={styles.textInput}
                placeholder="e.g. 10,000 (0 if none)"
                placeholderTextColor="#94A3B8"
                value={otherSources.savingsInterest}
                onChangeText={(val) => onUpdateOtherSources({ savingsInterest: val })}
                maxLength={15}
              />
            </View>
          </View>

          <View style={styles.inputGroupHalf}>
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.inputLabel}>FD / Term Interest</Text>
              <Text style={styles.mandatoryAsterisk}>*</Text>
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <AmountTextInput
                style={styles.textInput}
                placeholder="e.g. 25,000 (0 if none)"
                placeholderTextColor="#94A3B8"
                value={otherSources.fdInterest}
                onChangeText={(val) => onUpdateOtherSources({ fdInterest: val })}
                maxLength={15}
              />
            </View>
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroupHalf}>
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.inputLabel}>Dividend Income</Text>
              <Text style={styles.mandatoryAsterisk}>*</Text>
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <AmountTextInput
                style={styles.textInput}
                placeholder="e.g. 5,000 (0 if none)"
                placeholderTextColor="#94A3B8"
                value={otherSources.dividendIncome}
                onChangeText={(val) => onUpdateOtherSources({ dividendIncome: val })}
                maxLength={15}
              />
            </View>
          </View>

          <View style={styles.inputGroupHalf}>
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.inputLabel}>Family Pension</Text>
              <Text style={styles.mandatoryAsterisk}>*</Text>
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <AmountTextInput
                style={styles.textInput}
                placeholder="e.g. 0 if none"
                placeholderTextColor="#94A3B8"
                value={otherSources.familyPension}
                onChangeText={(val) => onUpdateOtherSources({ familyPension: val })}
                maxLength={15}
              />
            </View>
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroupHalf}>
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.inputLabel}>Other Miscellaneous</Text>
              <Text style={styles.mandatoryAsterisk}>*</Text>
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <AmountTextInput
                style={styles.textInput}
                placeholder="e.g. 0 if none"
                placeholderTextColor="#94A3B8"
                value={otherSources.otherIncome}
                onChangeText={(val) => onUpdateOtherSources({ otherIncome: val })}
                maxLength={15}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
