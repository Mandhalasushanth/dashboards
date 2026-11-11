import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { useApplicationStore } from "@/store/applicationStore";
import { TdsCustomerIncomeFormData } from "../../types/customerIncome.types";
import { TdsChecklistItem } from "../../types/checklist.types";
import { TaxCalculationBreakdown } from "../../types/estimate.types";
import { formatCurrency } from "../../utils/tdsValidation";
import { tdsDraftService, INITIAL_TDS_FORM_DATA } from "../../services/tdsDraftService";
import { tdsApiService } from "../../services/tdsApiService";
import { useTdsProgressStore } from "../../store/tdsProgressStore";
import { loadTdsReviewData } from "./tdsEstimateHelpers";
import { styles } from "./TdsRefundEstimateScreen.styles";

export const TdsRefundEstimateScreen: React.FC = () => {
  const router = useRouter();
  const { applicationId: routeAppId, id: routeId } = useLocalSearchParams<{ applicationId?: string; id?: string }>();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<TdsCustomerIncomeFormData>(INITIAL_TDS_FORM_DATA);
  const [documents, setDocuments] = useState<TdsChecklistItem[]>([]);
  const [calculation, setCalculation] = useState<TaxCalculationBreakdown | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAppId, setCurrentAppId] = useState<string | null>((routeId || routeAppId) as string | null);
  const loadCountRef = useRef(0);
  const {
    showDraftModal,
    markSubmitted,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
  } = useUniversalDraftGuard({
    // BUG_B24_003: estimate screen is a read-only calculation view — never dirty so back is always free
    isDirty: () => false,
    onSaveDraft: async () => {
      await useApplicationStore.getState().saveTdsDraft({ step: "ESTIMATE" });
    },
    onDiscardDraft: async () => {
      await tdsDraftService.clearDraft();
      await useApplicationStore.getState().clearTdsDraft();
    },
    isSubmitted: () => isSubmitting || useTdsProgressStore.getState().isSubmitted,
  });

  const loadReviewData = useCallback(async () => {
    const loadId = ++loadCountRef.current;
    setIsLoading(true);
    try {
      const data = await loadTdsReviewData(routeId, routeAppId);
      if (loadId !== loadCountRef.current) return;
      if (data.appId) {
        setCurrentAppId(data.appId);
      }
      setFormData(data.formData);
      setDocuments(data.documents);
      setCalculation(data.calculation);
    } catch (err) {
      console.error("[TDS Estimate] Error loading review data:", err);
    } finally {
      if (loadId === loadCountRef.current) {
        setIsLoading(false);
      }
    }
  }, [routeId, routeAppId]);

  useFocusEffect(
    useCallback(() => {
      useTdsProgressStore.getState().setMaxStepReached(3);
      loadReviewData();
    }, [loadReviewData])
  );

  const handleEditSection = async (section: "personal" | "business" | "bank" | "income") => {
    try {
      await tdsDraftService.saveFormDraft(formData, "REVIEW");
      useApplicationStore.getState().saveTdsDraft({
        formData,
        step: "ESTIMATE",
        updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    } catch (e) {
      console.warn("[TDS Review] Error saving draft before edit navigation:", e);
    }
    router.push({
      pathname: "/service/tds-form" as any,
      params: {
        isEditing: "true",
        id: currentAppId || routeId || routeAppId || "",
        section,
      },
    });
  };

  const handleEditDocuments = async () => {
    try {
      await tdsDraftService.saveFormDraft(formData, "REVIEW");
      await tdsDraftService.saveDocumentsDraft(documents as any);
      useApplicationStore.getState().saveTdsDraft({
        formData,
        documents: documents as any,
        step: "ESTIMATE",
        updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    } catch (e) {
      console.warn("[TDS Review] Error saving docs draft before edit navigation:", e);
    }
    router.push({
      pathname: "/service/tds-checklist" as any,
      params: { isEditing: "true", id: currentAppId || routeId || routeAppId || "" },
    });
  };

  const handleSubmitApplication = async () => {
    if (!calculation) return;
    setIsSubmitting(true);

    try {
      const existingAppId = await tdsDraftService.getApplicationId();
      const response = await tdsApiService.submitApplicationDraft(
        formData,
        documents as any,
        calculation,
        existingAppId || undefined
      );

      const targetAppId = response?.applicationId || existingAppId;
      if (!targetAppId) {
        throw new Error("Unable to create application record on server. Please try again.");
      }

      await tdsDraftService.saveApplicationId(targetAppId);

      // 1. Get Push Token
      let pushToken: string | undefined;
      try {
        const { registerForPushNotificationsAsync } = await import(
          "@/utils/pushNotificationService"
        );
        pushToken = (await registerForPushNotificationsAsync()) || undefined;
      } catch (pushErr) {
        console.warn("[TDS Review] Push token warning:", pushErr);
      }

      // 2. Submit to backend /tds-refund/submit
      try {
        await tdsApiService.submitTdsRefund(targetAppId, pushToken);
        console.log("✅ [TDS Review] Successfully submitted TDS refund to backend:", targetAppId);
      } catch (subErr: any) {
        console.warn("[TDS Review] Backend submit warning:", subErr);
      }

      // 3. Update global application store
      try {
        useApplicationStore.getState().addApplication({
          id: targetAppId,
          serviceId: "tds-refund",
          serviceName: "TDS Refund",
          category: "ITR",
          status: "Submitted",
          createdAt: new Date().toISOString(),
          paymentAmount: calculation.estimatedRefund,
        } as any);
      } catch (storeErr) {
        console.warn("[TDS Review] Application store update error:", storeErr);
      }

      // 4. In-App Notification
      try {
        const { useNotificationStore } = await import("@/store/notificationStore");
        useNotificationStore.getState().addNotification(
          "TDS Refund Submitted",
          `Your TDS refund application (${targetAppId}) has been successfully submitted for CA review.`,
          "itr"
        );
      } catch (notifErr) {
        console.warn("[TDS Review] Notification dispatch warning:", notifErr);
      }

      // 5. Clear draft & mark submitted in progress store
      await tdsDraftService.clearDraft();
      useApplicationStore.getState().clearTdsDraft();
      useTdsProgressStore.getState().setIsSubmitted(true);

      // Disable draft prevention upon successful submission
      markSubmitted();

      // 6. Navigate directly to Application Status screen
      router.replace({
        pathname: "/service/tds-status" as any,
        params: {
          applicationId: targetAppId,
          refundAmount: formatCurrency(calculation.estimatedRefund),
          isAdditionalPayable: calculation.isAdditionalTaxPayable ? "1" : "0",
        },
      });
    } catch (err: any) {
      Alert.alert(
        "Application Submission Failed",
        err?.message || "Failed to submit application to the server. Please check your network and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadedDocs = documents.filter((d) => (d.status === "uploaded" || d.status === "verified") || !!d.fileUri || !!d.fileName);

  const maskAccount = (num: string) => {
    if (!num || num.length < 4) return "••••";
    return `••••${num.slice(-4)}`;
  };

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <View style={{ width: 38, height: 38 }} />

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Review Application</Text>
          <Text style={styles.headerSubtitle}>Step 2 of 2: Review & Submit</Text>
        </View>

        <View style={{ width: 38, height: 38 }} />
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>

      {/* Loading overlay while data fetches */}
      {isLoading && (
        <View style={{ position: "absolute", top: 80, left: 0, right: 0, bottom: 80, justifyContent: "center", alignItems: "center", zIndex: 10 }}>
          <ActivityIndicator size="large" color={BrandColors.PRIMARY_BLUE} />
        </View>
      )}

      {/* Main Scroll Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 85 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================
            SECTION 1: PERSONAL DETAILS
        ======================================================== */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleGroup}>
              <Ionicons name="person-outline" size={18} color={BrandColors.PRIMARY_BLUE} />
              <Text style={styles.cardTitle}>Personal Details</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleEditSection("personal")}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={12} color={BrandColors.PRIMARY_ORANGE_DARK} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{formData.personal.fullName || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>PAN</Text>
              <Text style={styles.infoValue}>{formData.personal.pan || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mobile Number</Text>
              <Text style={styles.infoValue}>{formData.personal.mobileNumber ? `+91 ${formData.personal.mobileNumber}` : "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{formData.personal.email || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {[formData.personal.city, formData.personal.state, formData.personal.pinCode].filter(Boolean).join(", ") || "—"}
              </Text>
            </View>
          </View>
        </View>
        {/* ========================================================
            SECTION 2: BUSINESS DETAILS
        ======================================================== */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleGroup}>
              <Ionicons name="briefcase-outline" size={18} color={BrandColors.PRIMARY_BLUE} />
              <Text style={styles.cardTitle}>Business Details</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleEditSection("business")}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={12} color={BrandColors.PRIMARY_ORANGE_DARK} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Legal Name</Text>
              <Text style={styles.infoValue}>{formData.business?.legalName || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>PAN</Text>
              <Text style={styles.infoValue}>{formData.business?.pan || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Aadhaar</Text>
              <Text style={styles.infoValue}>{formData.business?.aadhaar || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mobile Number</Text>
              <Text style={styles.infoValue}>{formData.business?.mobileNumber ? `+91 ${formData.business.mobileNumber}` : "—"}</Text>
            </View>
          </View>
        </View>
        {/* ========================================================
            SECTION 5: BANK DETAILS
        ======================================================== */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleGroup}>
              <Ionicons name="business-outline" size={18} color={BrandColors.PRIMARY_BLUE} />
              <Text style={styles.cardTitle}>Bank Details</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleEditSection("bank")}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={12} color={BrandColors.PRIMARY_ORANGE_DARK} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bank Name</Text>
              <Text style={styles.infoValue}>{formData.bank.bankName || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Branch</Text>
              <Text style={styles.infoValue}>{formData.bank.branchName || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Number</Text>
              <Text style={styles.infoValue}>
                {maskAccount(formData.bank.accountNumber)} ({formData.bank.accountType})
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>IFSC Code</Text>
              <Text style={styles.infoValue}>{formData.bank.ifscCode || "—"}</Text>
            </View>
          </View>
        </View>

        {/* ========================================================
            SECTION 6: DOCUMENTS
        ======================================================== */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleGroup}>
              <Ionicons name="document-attach-outline" size={18} color={BrandColors.PRIMARY_BLUE} />
              <Text style={styles.cardTitle}>
                Documents ({uploadedDocs.length})
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleEditDocuments}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={12} color={BrandColors.PRIMARY_ORANGE_DARK} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.docPillList}>
            {uploadedDocs.length > 0 ? (
              uploadedDocs.map((doc) => (
                <View key={doc.id} style={styles.docPill}>
                  <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
                  <Text style={styles.docPillText}>{doc.title}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.infoLabel}>No documents uploaded yet</Text>
            )}
          </View>
        </View>

      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmitApplication}
          disabled={isSubmitting}
          style={styles.proceedButton}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={BrandColors.WHITE} />
          ) : (
            <>
              <Text style={styles.proceedButtonText}>Submit for CA Review</Text>
              <Ionicons name="checkmark-circle" size={18} color={BrandColors.WHITE} />
            </>
          )}
        </TouchableOpacity>
      </View>
      <UniversalDraftModal
        visible={showDraftModal}
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onCancel={handleCancel}
      />
    </View>
  );
};

export default TdsRefundEstimateScreen;


