import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors, Spacing } from "@/shared/theme";
import {
  PaymentOrderSummaryCard,
  PaymentMethodSelector,
  PaymentMethodType,
  CardFormData,
  NetBankingFormData,
} from "../components";
import { styles } from "./PaymentsHomeScreen.styles";
import { PaymentValidators } from "@/shared/validators/paymentValidators";
import type { PaymentOutcomeViews } from "@/shared/types/paymentOutcome.types";

type PaymentScreenView = "checkout" | "success" | "receipt" | "status";

export interface PaymentsHomeScreenProps {
  /** Service-specific success / receipt / status views shown after checkout. */
  outcomeViews?: PaymentOutcomeViews;
}

export function PaymentsHomeScreen({ outcomeViews }: PaymentsHomeScreenProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentView, setCurrentView] = useState<PaymentScreenView>("checkout");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("upi");

  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");

  const [cardData, setCardData] = useState<CardFormData>({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const [netBankingData, setNetBankingData] = useState<NetBankingFormData>({
    selectedBank: "",
    customerId: "",
  });
  const [netBankingErrors, setNetBankingErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBack = () => {
    if (currentView === "receipt" || currentView === "status") {
      setCurrentView("success");
    } else if (currentView === "success") {
      setCurrentView("checkout");
    } else {
      router.back();
    }
  };

  const handlePay = () => {
    let isValid = false;

    if (selectedMethod === "upi") {
      if (!PaymentValidators.isValidUpi(upiId)) {
        setUpiError("Enter a valid UPI ID (e.g. pavan@ybl / yourname@bank)");
        return;
      }
      setUpiError("");
      isValid = true;
    } else if (selectedMethod === "debit" || selectedMethod === "credit") {
      const errs = PaymentValidators.validateCard(cardData);
      setCardErrors(errs);
      if (Object.keys(errs).length > 0) return;
      isValid = true;
    } else if (selectedMethod === "netbanking") {
      const errs = PaymentValidators.validateNetBanking(netBankingData);
      setNetBankingErrors(errs);
      if (Object.keys(errs).length > 0) return;
      isValid = true;
    }

    if (!isValid) {
      Alert.alert("Validation Error", "Please fill in all required payment details.");
      return;
    }

    setIsProcessing(true);
    Alert.alert(
      "Payment Gateway Unavailable",
      "Online payment processing is not yet available. Please contact support or pay via bank transfer.",
      [{ text: "OK", onPress: () => setIsProcessing(false) }],
    );
  };

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, Spacing.md) }]}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={BrandColors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentView === "receipt" ? "Payment Receipt" : currentView === "status" ? "Application Status" : "Complete Payment"}
        </Text>
        <View style={styles.placeholderBox} />
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        overScrollMode="always"
        nestedScrollEnabled={true}
      >
        {currentView === "checkout" && (
          <>
            <PaymentOrderSummaryCard
              serviceTitle="Payment"
              businessSubtitle="Application payment details unavailable"
              professionalFee="Unavailable"
              gstAmount="Unavailable"
              discountAmount="Unavailable"
              totalAmount="Amount unavailable"
            />

            <PaymentMethodSelector
              selectedMethod={selectedMethod}
              onSelectMethod={(m: PaymentMethodType) => {
                setSelectedMethod(m);
                setUpiError("");
                setCardErrors({});
                setNetBankingErrors({});
              }}
              upiId={upiId}
              onChangeUpiId={(id: string) => {
                setUpiId(id);
                setUpiError("");
              }}
              upiError={upiError}
              cardData={cardData}
              onChangeCardData={(f: Partial<CardFormData>) => {
                setCardData((prev: CardFormData) => ({ ...prev, ...f }));
                setCardErrors((prev) => {
                  const next = { ...prev };
                  Object.keys(f).forEach((k) => delete next[k]);
                  return next;
                });
              }}
              cardErrors={cardErrors}
              netBankingData={netBankingData}
              onChangeNetBankingData={(f: Partial<NetBankingFormData>) => {
                setNetBankingData((prev: NetBankingFormData) => ({ ...prev, ...f }));
                setNetBankingErrors((prev) => {
                  const next = { ...prev };
                  Object.keys(f).forEach((k) => delete next[k]);
                  return next;
                });
              }}
              netBankingErrors={netBankingErrors}
            />

            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePay}
                style={styles.payBtn}
                disabled={isProcessing}
              >
                <Text style={styles.payBtnText}>
                  {isProcessing ? "Processing..." : "Payment unavailable"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {currentView === "success" &&
          outcomeViews?.renderSuccess({
            onViewReceipt: () => setCurrentView("receipt"),
            onViewApplication: () => setCurrentView("status"),
          })}

        {currentView === "receipt" && outcomeViews?.renderReceipt()}

        {currentView === "status" && outcomeViews?.renderStatus()}
      </ScrollView>
    </View>
  );
}

export default PaymentsHomeScreen;
