import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "@/styles/app/application/[id].styles";
import type { Application } from "@/types/domain";
import {
  getPaymentDisplayState,
  getAssignedPaymentAmount,
  getTransactionDetails,
  getPaymentBadgeConfig,
  getPaymentNotice,
  canInitiatePayment,
  type PaymentDisplayState,
} from "@/modules/applications/utils/paymentWorkflowUtils";

interface PaymentsTabProps {
  app: Application;
  isGstAmendment?: boolean;
  appliedDate?: string;
  onInitiatePayment?: (app: Application) => void;
}

function getBadgeStyle(state: PaymentDisplayState) {
  switch (state) {
    case "PAID":
      return styles.paymentPaidBadge;
    case "PAYMENT_FAILED":
      return styles.paymentBadgeFailed;
    case "PAYMENT_CANCELLED":
      return styles.paymentBadgeCancelled;
    case "PAYMENT_PENDING":
    case "AWAITING_CA_ASSIGNMENT":
      return styles.paymentBadgePending;
    case "PAYMENT_PROCESSING":
    case "VERIFICATION_PENDING":
    default:
      return styles.paymentBadgeAwaiting;
  }
}

function getBadgeTextStyle(state: PaymentDisplayState) {
  switch (state) {
    case "PAID":
      return styles.paymentPaidBadgeText;
    case "PAYMENT_FAILED":
      return styles.paymentBadgeFailedText;
    case "PAYMENT_CANCELLED":
      return styles.paymentBadgeCancelledText;
    case "PAYMENT_PENDING":
    case "AWAITING_CA_ASSIGNMENT":
      return styles.paymentBadgePendingText;
    case "PAYMENT_PROCESSING":
    case "VERIFICATION_PENDING":
    default:
      return styles.paymentBadgeAwaitingText;
  }
}

export function PaymentsTab({
  app,
  onInitiatePayment,
}: PaymentsTabProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayState = getPaymentDisplayState(app);
  const assignedAmount = getAssignedPaymentAmount(app);
  const badge = getPaymentBadgeConfig(displayState);
  const notice = getPaymentNotice(displayState);
  const details = getTransactionDetails(app);
  const canPay = canInitiatePayment(displayState, assignedAmount);

  const handlePay = () => {
    if (isSubmitting || !canPay) return;
    setIsSubmitting(true);
    if (onInitiatePayment) {
      onInitiatePayment(app);
      setIsSubmitting(false);
      return;
    }
    router.push({
      pathname: `/payment/${app.id}` as any,
    });
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Payment Summary</Text>

      {/* ── Highlight Box ── */}
      <View style={styles.paymentSummaryBox}>
        <View style={styles.paymentSummaryLeft}>
          <View style={styles.rupeeCircle}>
            <Text style={styles.rupeeSymbol}>₹</Text>
          </View>
          <View>
            <Text style={styles.paymentTotalLabel}>Total Amount</Text>
            <Text style={styles.paymentTotalAmount}>{details.amountFormatted}</Text>
          </View>
        </View>

        <View style={[styles.paymentPaidBadge, getBadgeStyle(displayState)]}>
          <Text style={[styles.paymentPaidBadgeText, getBadgeTextStyle(displayState)]}>
            {badge.label}
          </Text>
        </View>
      </View>

      {/* ── Guidance Note Banner (States A, B, D) ── */}
      {notice && (
        <View style={styles.paymentNoticeBanner}>
          <Ionicons name={notice.iconName as any} size={18} color={notice.iconColor} />
          <Text style={styles.paymentNoticeText}>{notice.message}</Text>
        </View>
      )}

      {/* ── Payment Details Section ── */}
      <Text style={styles.paymentDetailsTitle}>Payment Details</Text>

      <View style={styles.cardRowsGap12}>
        <View style={styles.itemRow}>
          <Text style={styles.itemRowLabel}>Fee Type</Text>
          <Text style={styles.itemRowValue}>{details.feeType}</Text>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.itemRowLabel}>Amount</Text>
          <Text style={styles.itemRowValue}>{details.amountFormatted}</Text>
        </View>

        {displayState === "PAID" && details.paymentMode && (
          <View style={styles.itemRow}>
            <Text style={styles.itemRowLabel}>Payment Mode</Text>
            <Text style={styles.itemRowValue}>{details.paymentMode}</Text>
          </View>
        )}

        {displayState === "PAID" && details.paymentDate && (
          <View style={styles.itemRow}>
            <Text style={styles.itemRowLabel}>Payment Date</Text>
            <Text style={styles.itemRowValue}>{details.paymentDate}</Text>
          </View>
        )}

        {displayState === "PAID" && details.transactionId && (
          <View style={styles.itemRow}>
            <Text style={styles.itemRowLabel}>Transaction ID</Text>
            <Text style={styles.paymentTransactionIdValue} selectable>
              {details.transactionId}
            </Text>
          </View>
        )}
      </View>

      {/* ── Pay / Retry Action (State C or Failed State D) ── */}
      {canPay && (
        <TouchableOpacity
          style={[styles.paymentActionBtn, isSubmitting && styles.paymentActionBtnDisabled]}
          onPress={handlePay}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="card-outline" size={18} color="#FFFFFF" />
              <Text style={styles.paymentActionBtnText}>
                {displayState === "PAYMENT_FAILED" ? "Retry Payment" : "Pay Now"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* ── Payment Success Banner (State E) ── */}
      {displayState === "PAID" && (
        <View style={styles.paymentSuccessBanner}>
          <Ionicons name="checkmark-circle" size={17} color="#16A34A" />
          <Text style={styles.paymentSuccessText}>
            Payment completed successfully.
          </Text>
        </View>
      )}
    </View>
  );
}
