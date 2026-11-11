import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { BusinessLoanType } from "../../types/businessLoan.types";
import { styles } from "./LoanTypeSelector.styles";

interface LoanTypeSelectorProps {
  selectedType: BusinessLoanType;
  onSelectType: (type: BusinessLoanType) => void;
}

interface LoanTypeOption {
  type: BusinessLoanType;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const OPTIONS: LoanTypeOption[] = [
  {
    type: "business-loan",
    title: "Business Loan",
    description: "Term loan for expansion, equipment & new setups.",
    icon: "business-outline",
  },
  {
    type: "working-capital",
    title: "Working Capital",
    description: "Revolving liquidity for inventory, bills & payroll.",
    icon: "wallet-outline",
  },
];

export const LoanTypeSelector: React.FC<LoanTypeSelectorProps> = ({
  selectedType,
  onSelectType,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Select Financing Facility</Text>
      <Text style={styles.sectionSubtitle}>
        Tailored terms based on your capital requirement structure
      </Text>
      <View style={styles.cardGrid}>
        {OPTIONS.map((opt) => {
          const isActive = selectedType === opt.type;
          return (
            <TouchableOpacity
              key={opt.type}
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => onSelectType(opt.type)}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={opt.title}
            >
              <View style={styles.iconRow}>
                <View
                  style={[
                    styles.iconBox,
                    isActive && styles.iconBoxActive,
                  ]}
                >
                  <Ionicons
                    name={opt.icon}
                    size={20}
                    color={isActive ? "#FFFFFF" : "#083B75"}
                  />
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    isActive && styles.radioCircleActive,
                  ]}
                >
                  {isActive && <View style={styles.radioDot} />}
                </View>
              </View>
              <Text
                style={[
                  styles.cardTitle,
                  isActive && styles.cardTitleActive,
                ]}
              >
                {opt.title}
              </Text>
              <Text style={styles.cardDesc}>{opt.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default LoanTypeSelector;
