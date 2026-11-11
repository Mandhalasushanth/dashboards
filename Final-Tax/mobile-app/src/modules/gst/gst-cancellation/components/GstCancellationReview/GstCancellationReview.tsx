import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { GstStepHeader } from "@/modules/gst/components/GstStepHeader";
import { styles, getBottomBarStyle } from "./GstCancellationReview.styles";
import { CancellationFormData } from "../../types/gstCancellationTypes";

interface GstCancellationReviewProps {
  formData: CancellationFormData;
  dbReviewData?: any;
  isReviewDeclared: boolean;
  setIsReviewDeclared: (val: boolean) => void;
  isSubmitting: boolean;
  handleSubmitCancellation: () => void;
  onBack: () => void;
  onEdit: () => void;
}

export function GstCancellationReview({
  formData,
  dbReviewData,
  isReviewDeclared,
  setIsReviewDeclared,
  isSubmitting,
  handleSubmitCancellation,
  onBack,
  onEdit,
}: GstCancellationReviewProps) {
  const insets = useSafeAreaInsets();

  const gstin = dbReviewData?.gstin || formData.gstin;
  const reason =
    dbReviewData?.reasonForCancellation ||
    (formData.reason === "Other Valid Reason"
      ? formData.otherReason
      : formData.reason);
  const cancellationDate =
    dbReviewData?.dateCancellationIsSought || formData.cancellationDate;
  const closingStock =
    dbReviewData?.closingStockAndInputTaxReversal !== undefined
      ? String(dbReviewData.closingStockAndInputTaxReversal)
      : formData.closingStock;
  const pendingLiabilities =
    dbReviewData?.pendingDuesLiabilities !== undefined
      ? String(dbReviewData.pendingDuesLiabilities)
      : formData.pendingLiabilities;
  const lastGstr3b =
    dbReviewData?.lastGstr3bFiledArnPeriod || formData.lastGstr3b;
  const supportingDoc = formData.supportingDoc;

  const reviewRows = [
    { k: "Form", v: "REG-16 (Cancellation)" },
    ...(dbReviewData?.cancellationId
      ? [{ k: "Reference ID", v: dbReviewData.cancellationId, isBlue: true }]
      : []),
    { k: "GSTIN", v: gstin, isBlue: true },
    {
      k: "Reason",
      v: reason,
    },
    { k: "Effective Date", v: cancellationDate },
    { k: "Closing Stock & ITC", v: closingStock },
    { k: "Pending Liabilities", v: pendingLiabilities || "Nil" },
    { k: "Last GSTR-3B Filed", v: lastGstr3b },
    {
      k: "Supporting Document",
      v:
        supportingDoc?.name ||
        (dbReviewData?.supportingProofDocument
          ? "Attached Document"
          : "None (Optional)"),
    },
  ];

  return (
    <View style={styles.root}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Step Header */}
      <GstStepHeader
        title="Review Cancellation"
        currentStep={2}
        totalSteps={2}
        stepLabel="Review & Submit"
        onBack={onBack}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.reviewCard}>
          <View style={styles.reviewCardEditRow}>
            <View style={styles.reviewCardHeader}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color="#083B75"
              />
              <Text style={styles.reviewCardTitle}>Application Summary</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onEdit}
              style={styles.editOptionBtn}
            >
              <Ionicons name="create-outline" size={15} color={BrandColors.PRIMARY_ORANGE} />
              <Text style={styles.editOptionText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {reviewRows.map((row, i) => (
            <React.Fragment key={row.k}>
              {i > 0 && <View style={styles.reviewDivider} />}
              <View style={styles.reviewRow}>
                <Text style={styles.reviewKey}>{row.k}</Text>
                <Text
                  style={[
                    styles.reviewVal,
                    Boolean(row.isBlue) && { color: BrandColors.PRIMARY_BLUE },
                  ]}
                >
                  {row.v || "—"}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Declaration Box */}
        <TouchableOpacity
          style={styles.declarationBox}
          activeOpacity={0.8}
          onPress={() => setIsReviewDeclared(!isReviewDeclared)}
        >
          <View style={[styles.checkbox, isReviewDeclared && styles.checkboxActive]}>
            {isReviewDeclared && (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            )}
          </View>
          <Text style={styles.declarationText}>
            I hereby declare that all returns up to the date of cancellation have been / will be
            filed, all liabilities will be discharged, and the information given is correct.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, getBottomBarStyle(insets.bottom)]}>
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            (!isReviewDeclared || isSubmitting) && styles.primaryBtnDisabled,
          ]}
          activeOpacity={0.8}
          onPress={handleSubmitCancellation}
          disabled={!isReviewDeclared || isSubmitting}
        >
          <Text style={styles.primaryBtnText}>
            {isSubmitting ? "Submitting Request..." : "Confirm & Submit Cancellation"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
