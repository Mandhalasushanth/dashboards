import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatIndianCurrency } from "@/shared/formatters/currencyFormatter";
import {
  styles,
  getThemedCardStyle,
} from "@/styles/app/payment/[id].styles";
import type { useTheme } from "@/hooks/use-theme";

interface OrderSummaryCardProps {
  serviceName: string;
  appId: string;
  businessName: string;
  fee: number;
  gst: number;
  total: number;
  hasValidAmount: boolean;
  gstRatePercent: number;
  colors: ReturnType<typeof useTheme>;
}

export function OrderSummaryCard({
  serviceName,
  appId,
  businessName,
  fee,
  gst,
  total,
  hasValidAmount,
  gstRatePercent,
  colors,
}: OrderSummaryCardProps) {
  const renderSummaryRow = (label: string, value: string, muted = true) => (
    <View style={styles.summaryRow}>
      <Text
        style={[
          styles.summaryLabel,
          { color: muted ? colors.textSecondary : colors.text },
        ]}
      >
        {label}
      </Text>
      <Text style={[styles.summaryValue, { color: colors.text }]}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.card, getThemedCardStyle(colors)]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>
        Order Summary
      </Text>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.serviceRow}>
        <View style={[styles.serviceIcon, { backgroundColor: "#E8EFF7" }]}>
          <Ionicons name="document-text" size={20} color={colors.primary} />
        </View>
        <View style={styles.serviceText}>
          <Text style={[styles.serviceName, { color: colors.text }]}>
            {serviceName}
          </Text>
          <Text style={[styles.serviceMeta, { color: colors.textSecondary }]}>
            {businessName} • {appId}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {renderSummaryRow(
        "Professional Fee",
        hasValidAmount ? formatIndianCurrency(fee) : "Unavailable"
      )}
      {renderSummaryRow(
        `GST (${gstRatePercent}%)`,
        hasValidAmount ? formatIndianCurrency(gst) : "Unavailable"
      )}
      {renderSummaryRow("Discount", formatIndianCurrency(0))}

      <View style={[styles.totalRow, { backgroundColor: "#E8EFF7" }]}>
        <Text style={[styles.totalLabel, { color: colors.primary }]}>
          Total Amount
        </Text>
        <Text style={[styles.totalValue, { color: colors.primary }]}>
          {hasValidAmount ? formatIndianCurrency(total) : "Fee pending calculation"}
        </Text>
      </View>
    </View>
  );
}
