import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "../Step2IncomeSources.styles";
import { IncomeSalaryData } from "../../../types/itrFiling.types";
import { BrandColors } from "@/shared/theme";
import { AmountTextInput } from "@/shared/components/AmountTextInput";
import { sanitizeNameInput, sanitizeNameOnBlur } from "@/shared/validators/nameValidator";

interface Props {
  data: IncomeSalaryData;
  onUpdate: (data: Partial<IncomeSalaryData>) => void;
  onPressInfo?: () => void;
}

export const Step2SalaryIncome: React.FC<Props> = ({ data, onUpdate, onPressInfo }) => {
  if (!data.enabled) return null;
  return (
    <View style={[styles.card, styles.cardActive]}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.sourceHeaderRow}
        onPress={() => onUpdate({ enabled: !data.enabled })}
      >
        <View style={styles.sourceHeaderLeft}>
          <View style={[styles.sourceIconBox, styles.sourceIconBoxActive]}>
            <Ionicons
              name="briefcase-outline"
              size={20}
              color={BrandColors.PRIMARY_ORANGE}
            />
          </View>
          <View style={styles.sourceTitleCol}>
            <View style={styles.sourceTitleRow}>
              <Text style={styles.sourceTitle}>Salary Income</Text>
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
              {data.isVerified &&
                data.source === "FORM_16" && (
                  <View style={styles.sourceTagVerified}>
                    <Ionicons
                      name="shield-checkmark"
                      size={10}
                      color="#166534"
                    />
                    <Text style={styles.sourceTagVerifiedText}>
                      Form 16 Imported
                    </Text>
                  </View>
                )}
            </View>
            <Text style={styles.sourceSubtitle}>
              Employer Form 16, payslips, TDS credits
            </Text>
          </View>
        </View>
        <View style={styles.checkboxBtn}>
          <Ionicons
            name="checkbox"
            size={22}
            color={BrandColors.PRIMARY_ORANGE}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.expandedForm}>
        {/* Form 16 Import Snapshot Card */}
        {data.isVerified &&
          data.source === "FORM_16" &&
          Boolean(data.employerName) && (
            <View style={styles.form16Card}>
              <View style={styles.form16TopRow}>
                <Text style={styles.form16Title}>
                  Form 16: {data.employerName}
                </Text>
              </View>

              <View style={styles.form16StatsRow}>
                <Text style={styles.form16StatLabel}>Gross Salary:</Text>
                <Text style={styles.form16StatValue}>
                  ₹ {Number(data.grossSalary || 0).toLocaleString("en-IN")}
                </Text>
              </View>

              <View style={styles.form16StatsRow}>
                <Text style={styles.form16StatLabel}>TDS Deducted:</Text>
                <Text style={styles.form16StatValue}>
                  ₹ {Number(data.tdsDeducted || 0).toLocaleString("en-IN")}
                </Text>
              </View>
            </View>
          )}

        {/* Employer Legal Name */}
        <View style={styles.inputGroup}>
          <View style={styles.labelWithInfoRow}>
            <Text style={styles.inputLabel}>Employer Legal Name</Text>
            <Text style={styles.mandatoryAsterisk}>*</Text>
          </View>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Acme Technologies Ltd"
              placeholderTextColor="#94A3B8"
              value={data.employerName}
              onChangeText={(val) =>
                onUpdate({
                  employerName: sanitizeNameInput(val),
                })
              }
              onBlur={() => {
                if (data.employerName) {
                  onUpdate({
                    employerName: sanitizeNameOnBlur(data.employerName),
                  });
                }
              }}
              maxLength={100}
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          {/* Gross Salary */}
          <View style={styles.inputGroupHalf}>
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.inputLabel}>Gross Salary (Annual)</Text>
              <Text style={styles.mandatoryAsterisk}>*</Text>
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <AmountTextInput
                style={styles.textInput}
                placeholder="e.g. 8,50,000"
                placeholderTextColor="#94A3B8"
                value={data.grossSalary}
                onChangeText={(raw) => onUpdate({ grossSalary: raw })}
                maxLength={15}
              />
            </View>
          </View>

          {/* Exempt Allowances */}
          <View style={styles.inputGroupHalf}>
            <View style={styles.labelWithInfoRow}>
              <Text style={styles.inputLabel}>Exempt Allowances</Text>
              <Text style={styles.mandatoryAsterisk}>*</Text>
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <AmountTextInput
                style={styles.textInput}
                placeholder="e.g. 50,000 (0 if none)"
                placeholderTextColor="#94A3B8"
                value={data.allowances}
                onChangeText={(raw) => onUpdate({ allowances: raw })}
                maxLength={15}
              />
            </View>
          </View>
        </View>

        {/* TDS Deducted */}
        <View style={styles.inputGroup}>
          <View style={styles.labelWithInfoRow}>
            <Text style={styles.inputLabel}>TDS Deducted by Employer</Text>
            <Text style={styles.mandatoryAsterisk}>*</Text>
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <AmountTextInput
              style={styles.textInput}
              placeholder="e.g. 45,000 (0 if none)"
              placeholderTextColor="#94A3B8"
              value={data.tdsDeducted}
              onChangeText={(raw) => onUpdate({ tdsDeducted: raw })}
              maxLength={15}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
