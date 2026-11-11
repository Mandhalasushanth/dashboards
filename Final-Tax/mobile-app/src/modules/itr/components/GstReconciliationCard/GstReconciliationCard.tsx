import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GstReconciliationSummary } from "../../itr-filing/types/itrFiling.types";
import { styles } from "./GstReconciliationCard.styles";

interface GstReconciliationCardProps {
  reconciliation: GstReconciliationSummary;
  onEditTurnover?: () => void;
}

export const GstReconciliationCard: React.FC<GstReconciliationCardProps> = ({
  reconciliation,
  onEditTurnover,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const rows = [
    {
      id: "gstr1",
      title: "GSTR-1 Outward Supplies",
      sub: "Invoice-level filed returns (FY 2024-25)",
      amount: `₹ ${reconciliation.gstr1Turnover.toLocaleString("en-IN")}`,
    },
    {
      id: "gstr3b",
      title: "GSTR-3B Outward Supplies",
      sub: "Monthly summary return filings",
      amount: `₹ ${reconciliation.gstr3bTurnover.toLocaleString("en-IN")}`,
    },
    {
      id: "books",
      title: "Books of Account Turnover",
      sub: "Audited ledger / sales register",
      amount: `₹ ${reconciliation.booksTurnover.toLocaleString("en-IN")}`,
    },
    {
      id: "itr",
      title: "Proposed ITR Business Turnover",
      sub: "Turnover declared for Income Tax computation",
      amount: `₹ ${reconciliation.proposedItrTurnover.toLocaleString("en-IN")}`,
    },
  ];

  return (
    <View style={styles.card}>
      {/* Header with Verified GSTIN */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="storefront" size={18} color="#083B75" />
          <Text style={styles.title}>GST ↔ ITR Turnover Reconciliation</Text>
        </View>
        <View style={styles.gstBadge}>
          <Ionicons name="shield-checkmark" size={12} color="#083B75" />
          <Text style={styles.gstBadgeText}>{reconciliation.gstin}</Text>
        </View>
      </View>

      <Text style={styles.description}>
        Finsolz imported business turnover from your filed GST returns. GST reporting and income tax computation can differ due to credit notes or advances.
      </Text>

      {/* Comparison Table */}
      <View style={styles.reconciliationBox}>
        <View style={styles.tableHeader}>
          <View style={styles.tableColSource}>
            <Text style={styles.tableHeaderText}>Source / Ledger</Text>
          </View>
          <View style={styles.tableColAmount}>
            <Text style={styles.tableHeaderText}>Amount</Text>
          </View>
        </View>

        {rows.map((row) => (
          <View key={row.id} style={styles.tableRow}>
            <View style={styles.tableColSource}>
              <Text style={styles.sourceTitle}>{row.title}</Text>
              <Text style={styles.sourceSub}>{row.sub}</Text>
            </View>
            <View style={styles.tableColAmount}>
              <Text style={styles.amountText}>{row.amount}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Variance Alert Card */}
      {reconciliation.hasVariance && (
        <View style={styles.varianceAlertCard}>
          <Ionicons name="alert-circle" size={18} color="#C2410C" />
          <View style={styles.varianceAlertTextCol}>
            <Text style={styles.varianceTitle}>
              Difference Detected: ₹ {reconciliation.variance.toLocaleString("en-IN")}
            </Text>
            <Text style={styles.varianceDescription}>
              {reconciliation.varianceExplanation ||
                "A difference exists between GSTR-1 filings and accounting books. Reconcile before filing."}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.reconcileActionBtn}
              onPress={() =>
                Alert.alert(
                  "GST Reconciliation Note",
                  "Income tax turnover matches financial books of account. The difference is attributable to annual credit notes and year-end discount adjustments."
                )
              }
            >
              <Ionicons name="information-circle-outline" size={14} color="#083B75" />
              <Text style={styles.reconcileActionText}>View Reconciliation Notes</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* CA Verification Notice */}
      <View style={styles.noticeBox}>
        <Ionicons name="checkmark-circle" size={14} color="#166534" />
        <Text style={styles.noticeText}>
          Your Tax Executive will independently cross-verify turnover with GSTR-9 annual return records.
        </Text>
      </View>
    </View>
  );
};
