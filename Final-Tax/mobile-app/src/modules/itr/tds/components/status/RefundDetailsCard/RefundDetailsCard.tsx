import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TdsRefundStatusDetails } from "../../../types/status.types";
import { BrandColors } from "@/shared/theme";
import { styles } from "./RefundDetailsCard.styles";

export interface RefundDetailsCardProps {
  details: TdsRefundStatusDetails;
}

export const RefundDetailsCard: React.FC<RefundDetailsCardProps> = ({ details }) => {
  const isPayable = Boolean(details.isAdditionalTaxPayable);

  const rows = [
    {
      id: "appId",
      label: "Application ID",
      value: details.applicationId || "Pending",
      iconName: "id-card-outline" as const,
      isHighlight: false,
    },
    {
      id: "submittedOn",
      label: "Submitted Date",
      value: details.filedOn || "Today",
      iconName: "calendar-outline" as const,
      isHighlight: false,
    },
    {
      id: "refund",
      label: isPayable ? "Estimated Tax Payable" : "Estimated Refund",
      value: details.estimatedRefund || "₹0",
      iconName: "cash-outline" as const,
      isHighlight: true,
    },
    {
      id: "refundTo",
      label: "Refund Bank",
      value: details.refundToBank || "Registered Bank Account",
      iconName: "business-outline" as const,
      isHighlight: false,
    },
    {
      id: "time",
      label: "Indicative Finsolz processing timeline",
      value: details.indicativeTimeline || "10–20 Business Days",
      iconName: "time-outline" as const,
      isHighlight: false,
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
                <Ionicons
                  name={row.iconName}
                  size={18}
                  color={row.isHighlight ? BrandColors.PRIMARY_ORANGE : BrandColors.PRIMARY_BLUE}
                />
              </View>
              <Text style={styles.label}>{row.label}</Text>
            </View>

            <Text
              style={[
                styles.value,
                row.isHighlight ? styles.orangeValue : styles.normalValue,
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

export default RefundDetailsCard;
