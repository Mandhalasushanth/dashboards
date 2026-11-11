import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { IncomeHousePropertyData } from "../../../types/itrFiling.types";
import { styles } from "../Step2IncomeSources.styles";
import { AmountTextInput } from "@/shared/components/AmountTextInput";

interface Step2HousePropertyIncomeProps {
  data: IncomeHousePropertyData;
  onUpdate: (data: Partial<IncomeHousePropertyData>) => void;
  onPressInfo?: () => void;
}

export const Step2HousePropertyIncome: React.FC<Step2HousePropertyIncomeProps> = ({
  data,
  onUpdate,
  onPressInfo,
}) => {
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
            <Ionicons name="home-outline" size={20} color={BrandColors.PRIMARY_ORANGE} />
          </View>
          <View style={styles.sourceTitleCol}>
            <View style={styles.sourceTitleRow}>
              <Text style={styles.sourceTitle}>House Property</Text>
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
            </View>
            <Text style={styles.sourceSubtitle}>Self-occupied home loan or rental income</Text>
          </View>
        </View>
        <View style={styles.checkboxBtn}>
          <Ionicons name="checkbox" size={22} color={BrandColors.PRIMARY_ORANGE} />
        </View>
      </TouchableOpacity>

      <View style={styles.expandedForm}>
        <View style={styles.labelWithInfoRow}>
          <Text style={styles.inputLabel}>Property Classification</Text>
          <Text style={styles.mandatoryAsterisk}>*</Text>
        </View>
        <View style={styles.pillRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.pill, data.propertyType === "self_occupied" && styles.pillSelected]}
            onPress={() => onUpdate({ propertyType: "self_occupied" })}
          >
            <Text style={[styles.pillText, data.propertyType === "self_occupied" && styles.pillTextSelected]}>
              Self-Occupied
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.pill, data.propertyType === "let_out" && styles.pillSelected]}
            onPress={() => onUpdate({ propertyType: "let_out" })}
          >
            <Text style={[styles.pillText, data.propertyType === "let_out" && styles.pillTextSelected]}>
              Let-Out (Rented)
            </Text>
          </TouchableOpacity>
        </View>

        {data.propertyType === "let_out" && (
          <View style={styles.inputRow}>
            <View style={styles.inputGroupHalf}>
              <View style={styles.labelWithInfoRow}>
                <Text style={styles.inputLabel}>Annual Rent Received</Text>
                <Text style={styles.mandatoryAsterisk}>*</Text>
              </View>
              <View style={styles.inputBox}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <AmountTextInput
                  style={styles.textInput}
                  placeholder="e.g. 2,40,000"
                  placeholderTextColor="#94A3B8"
                  value={data.annualRentReceived}
                  onChangeText={(raw) => onUpdate({ annualRentReceived: raw })}
                  maxLength={15}
                />
              </View>
            </View>

            <View style={styles.inputGroupHalf}>
              <View style={styles.labelWithInfoRow}>
                <Text style={styles.inputLabel}>Municipal Taxes Paid</Text>
                <Text style={styles.mandatoryAsterisk}>*</Text>
              </View>
              <View style={styles.inputBox}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <AmountTextInput
                  style={styles.textInput}
                  placeholder="e.g. 10,000 (0 if none)"
                  placeholderTextColor="#94A3B8"
                  value={data.municipalTaxesPaid}
                  onChangeText={(raw) => onUpdate({ municipalTaxesPaid: raw })}
                  maxLength={15}
                />
              </View>
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <View style={styles.labelWithInfoRow}>
            <Text style={styles.inputLabel}>Home Loan Interest Paid (Sec 24b)</Text>
            <Text style={styles.mandatoryAsterisk}>*</Text>
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <AmountTextInput
              style={styles.textInput}
              placeholder="e.g. 50,000 (0 if no loan)"
              placeholderTextColor="#94A3B8"
              value={data.homeLoanInterest}
              onChangeText={(raw) => onUpdate({ homeLoanInterest: raw })}
              maxLength={15}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
