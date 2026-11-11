import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FilingVerificationData } from "../../../types/verification.types";
import { styles } from "./FilingDetailsCard.styles";

interface FilingDetailsCardProps {
  data: FilingVerificationData;
}

export const FilingDetailsCard: React.FC<FilingDetailsCardProps> = ({ data }) => {
  const rows = [
    {
      id: "ack",
      icon: "ribbon-outline" as const,
      label: "Acknowledgement number",
      value: data.acknowledgementNumber,
      isHighlight: false,
    },
    {
      id: "filed",
      icon: "calendar-outline" as const,
      label: "Filed on",
      value: data.filedDate,
      isHighlight: false,
    },
    {
      id: "form",
      icon: "document-text-outline" as const,
      label: "Form",
      value: `${data.itrForm} • ${data.assessmentYear}`,
      isHighlight: false,
    },
    {
      id: "refund",
      icon: "cash-outline" as const,
      label: data.isRefund ? "Refund claimed" : "Tax paid",
      value: data.refundClaimed,
      isHighlight: true,
    },
  ];

  return (
    <View style={styles.card}>
      {rows.map((row, index) => {
        const isLast = index === rows.length - 1;

        return (
          <View
            key={row.id}
            style={[styles.row, !isLast && styles.rowBorder]}
          >
            <View style={styles.leftGroup}>
              <View style={styles.iconBox}>
                <Ionicons name={row.icon} size={18} color="#0B1F3A" />
              </View>
              <Text style={styles.label}>{row.label}</Text>
            </View>

            <Text
              style={[
                styles.value,
                row.isHighlight ? styles.highlightValue : styles.normalValue,
              ]}
            >
              {row.value}
            </Text>
          </View>
        );
      })}
    </View>
  );
};
