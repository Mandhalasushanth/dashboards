import React from "react";
import { View, Text } from "react-native";
import { TdsHeroIllustration } from "../TdsHeroIllustration";
import { styles } from "./TdsHeroCard.styles";

export const TdsHeroCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.contentLeft}>
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>Income Tax Services</Text>
        </View>

        <Text style={styles.title}>TDS Refund</Text>

        <Text style={styles.description}>
          Claim excess TDS deducted from your salary, investments, or payments with certified CA verification and live status tracking.
        </Text>
      </View>

      <View style={styles.illustrationWrapper}>
        <TdsHeroIllustration />
      </View>
    </View>
  );
};
