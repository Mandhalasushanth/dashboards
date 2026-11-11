import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TaxCalculationBreakdown } from "../../types/itrFiling.types";
import { styles } from "./CustomerApprovalModal.styles";

interface CustomerApprovalModalProps {
  visible: boolean;
  calculation: TaxCalculationBreakdown;
  formType: string;
  onApprove: () => void;
  onRequestChange: () => void;
  onClose: () => void;
}

export const CustomerApprovalModal: React.FC<CustomerApprovalModalProps> = ({
  visible,
  calculation,
  formType,
  onApprove,
  onRequestChange,
  onClose,
}) => {
  const isRefund = calculation.finalType === "REFUND";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeaderRow}>
            <View style={styles.modalTitleCol}>
              <Ionicons name="checkmark-done-circle" size={24} color="#083B75" />
              <Text style={styles.modalTitle}>Tax Executive Prepared Return</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* CA Verification Badge */}
            <View style={styles.caBadgeRow}>
              <Ionicons name="shield-checkmark" size={24} color="#0284C7" />
              <View style={styles.caBadgeTextCol}>
                <Text style={styles.caBadgeTitle}>Verified by Senior Tax CA</Text>
                <Text style={styles.caBadgeSubtitle}>
                  Form {formType} has been calculated, reconciled against AIS/TIS and Form 26AS, and optimized for maximum tax refund.
                </Text>
              </View>
            </View>

            {/* Summary Breakdown */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Gross Total Income</Text>
                <Text style={styles.summaryValue}>
                  ₹ {calculation.grossTotalIncome.toLocaleString("en-IN")}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Deductions Claimed</Text>
                <Text style={styles.summaryValue}>
                  ₹ {calculation.totalDeductions.toLocaleString("en-IN")}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Net Taxable Income</Text>
                <Text style={styles.summaryValue}>
                  ₹ {calculation.taxableIncome.toLocaleString("en-IN")}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Tax Liability</Text>
                <Text style={styles.summaryValue}>
                  ₹ {calculation.totalTaxLiability.toLocaleString("en-IN")}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Taxes Credited / Paid</Text>
                <Text style={styles.summaryValue}>
                  ₹ {calculation.totalTaxesPaid.toLocaleString("en-IN")}
                </Text>
              </View>

              <View style={styles.finalHighlightBox}>
                <Text style={styles.finalLabel}>
                  {isRefund ? "Refund Claimed" : "Tax Payable"}
                </Text>
                <Text style={styles.finalAmount}>
                  ₹ {calculation.finalAmount.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.approveButton}
                onPress={onApprove}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.approveButtonText}>Approve & Authorize IT Portal Filing</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.requestChangeButton}
                onPress={onRequestChange}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#475569" />
                <Text style={styles.requestChangeButtonText}>Request Changes / Ask Query</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
