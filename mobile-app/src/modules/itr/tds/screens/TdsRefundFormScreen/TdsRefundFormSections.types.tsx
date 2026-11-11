import React, { RefObject } from "react";
import { View, Text } from "react-native";
import { BankRefundDetails } from "../../types/customerIncome.types";
import { styles } from "./TdsRefundFormScreen.styles";

export type UpdateBankField = <K extends keyof BankRefundDetails>(
  field: K,
  value: BankRefundDetails[K]
) => void;

export interface TdsFormInputRefs {
  accHolderRef: RefObject<any>;
  accNumRef: RefObject<any>;
  confirmAccNumRef: RefObject<any>;
  ifscRef: RefObject<any>;
}

export const SectionHeader: React.FC<{ number: number; title: string }> = ({ number, title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionNumberBadge}>
      <Text style={styles.sectionNumberText}>{number}</Text>
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

