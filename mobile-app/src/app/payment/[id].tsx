import React, { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/hooks/use-theme";
import { useApplicationStore } from "@/store/applicationStore";
import { useAuthStore } from "@/store/authStore";
import { paymentService } from "@/modules/payments/services/paymentService";
import { AppHeader } from "@/shared/components/AppHeader";
import { styles } from "@/styles/app/payment/[id].styles";

import { OrderSummaryCard } from "@/components/screens/payment/OrderSummaryCard";
import {
  PaymentMethodSelector,
  type PaymentMethodId,
} from "@/components/screens/payment/PaymentMethodSelector";
import { UpiPaymentSection } from "@/components/screens/payment/UpiPaymentSection";
import { CardPaymentSection } from "@/components/screens/payment/CardPaymentSection";
import {
  NetBankingSection,
  POPULAR_BANKS,
} from "@/components/screens/payment/NetBankingSection";
import {
  PaymentPayBar,
  PaymentSecurityNote,
} from "@/components/screens/payment/PaymentPayBar";

const GST_RATE = 0.18;

export default function PaymentScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const applications = useApplicationStore((state) => state.applications);
  const customer = useAuthStore((state) => state.customer);

  const app = applications.find((a) => a.id === id);

  const [method, setMethod] = useState<PaymentMethodId>("UPI");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [bank, setBank] = useState(POPULAR_BANKS[0]);
  const [processing, setProcessing] = useState(false);

  if (!app) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Complete Payment" showBack showNotification={false} />
        <View style={styles.errorContent}>
          <Ionicons name="warning-outline" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            This payment could not be loaded.
          </Text>
        </View>
      </View>
    );
  }

  const total = Number(app.paymentAmount);
  const hasValidAmount = Number.isFinite(total) && total > 0;
  const fee = Math.round(total / (1 + GST_RATE));
  const gst = total - fee;
  const businessName =
    app.formData.businessName ?? customer?.name ?? "Finsolz Client";

  const alreadyPaid = app.paymentStatus === "Paid";

  const handlePay = async () => {
    if (!hasValidAmount) {
      Alert.alert(
        "Fee Pending",
        "The payment amount for this application is being calculated or verified. Payment will be enabled once your application is reviewed."
      );
      return;
    }
    if (method === "UPI" && !upiId.trim()) {
      Alert.alert("UPI ID required", "Enter the UPI ID you want to pay from.");
      return;
    }
    if (
      (method === "DEBIT" || method === "CREDIT") &&
      (cardNumber.trim().length < 12 ||
        !cardExpiry.trim() ||
        cardCvv.trim().length < 3)
    ) {
      Alert.alert(
        "Card details incomplete",
        "Enter the card number, expiry and CVV to continue."
      );
      return;
    }

    setProcessing(true);
    const order = await paymentService.createOrder(total, app.id);
    setProcessing(false);
    if (!order) {
      Alert.alert(
        "Payment unavailable",
        "Online payment processing is not configured yet. Your application was not marked as paid."
      );
      return;
    }

    Alert.alert(
      "Payment provider unavailable",
      "A payment order was created, but no provider checkout or verification flow is configured. Your application was not marked as paid."
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Complete Payment" showBack showNotification={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order summary card */}
        <OrderSummaryCard
          serviceName={app.serviceName}
          appId={app.id}
          businessName={businessName}
          fee={fee}
          gst={gst}
          total={total}
          hasValidAmount={hasValidAmount}
          gstRatePercent={GST_RATE * 100}
          colors={colors}
        />

        {/* Payment method selector */}
        <PaymentMethodSelector
          selectedMethod={method}
          onSelectMethod={setMethod}
          colors={colors}
        />

        {/* Selected method detail forms */}
        {method === "UPI" && (
          <UpiPaymentSection
            upiId={upiId}
            setUpiId={setUpiId}
            colors={colors}
          />
        )}

        {(method === "DEBIT" || method === "CREDIT") && (
          <CardPaymentSection
            cardNumber={cardNumber}
            setCardNumber={setCardNumber}
            cardExpiry={cardExpiry}
            setCardExpiry={setCardExpiry}
            cardCvv={cardCvv}
            setCardCvv={setCardCvv}
            colors={colors}
          />
        )}

        {method === "NETBANKING" && (
          <NetBankingSection
            selectedBank={bank}
            onSelectBank={setBank}
            colors={colors}
          />
        )}

        {/* Reassurance security guarantee */}
        <PaymentSecurityNote colors={colors} />
      </ScrollView>

      {/* Sticky pay bar */}
      <PaymentPayBar
        alreadyPaid={alreadyPaid}
        hasValidAmount={hasValidAmount}
        total={total}
        processing={processing}
        onPay={handlePay}
        colors={colors}
        bottomInset={insets.bottom}
      />
    </View>
  );
}
