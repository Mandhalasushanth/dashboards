import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./CertificateSectionCard.styles";

interface CertificateSectionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function CertificateSectionCard({
  icon,
  title,
  action,
  children,
}: CertificateSectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.contactHeaderRow}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardIconBox}>
            <Ionicons name={icon} size={18} color="#1E5EFF" />
          </View>
          <Text style={styles.cardLabel}>{title}</Text>
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}
