import React from "react";
import { View, Text } from "react-native";
import { TdsRefundCardIllustration } from "../TdsRefundCardIllustration";
import { styles } from "./EstimatedRefundHeroCard.styles";

interface EstimatedRefundHeroCardProps {
  amount: number;
}

export const EstimatedRefundHeroCard: React.FC<EstimatedRefundHeroCardProps> = ({
  amount,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.contentLeft}>
        <Text style={styles.label}>Estimated Refund</Text>
        <Text style={styles.amount}>₹{amount.toLocaleString("en-IN")}</Text>
        <Text style={styles.caption}>
          Based on the documents you uploaded and the information provided.
        </Text>
      </View>

      <View style={styles.illustrationWrapper}>
        <TdsRefundCardIllustration />
      </View>
    </View>
  );
};
