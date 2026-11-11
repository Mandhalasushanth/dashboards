import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRevisedProgressStore } from "../../store/revisedProgressStore";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RevisedItrApiService } from "../../services/RevisedItrApiService";
import { RevisedItrHeader, RevisedItrAckInfoIcon } from "../../components/common";
import { RevisedFormField } from "../../components/update";
import { DEFAULT_REVISED_FORM_FIELDS } from "../../mock/revisedItrData";
import { RevisedFormFields } from "../../types/revisedItr.types";
import { formatIndianAmount } from "@/shared/formatters/currencyFormatter";
import {
  validateSingleField,
  validateAllRevisedFields,
} from "../../utils/revisedFieldValidation";
import {
  styles,
  getContainerInsetsStyle,
  getScrollContentInsetsStyle,
} from "./UpdateRevisedDetailsScreen.styles";

export const UpdateRevisedDetailsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    acknowledgementNumber?: string;
    assessmentYear?: string;
    revisionReason?: string;
    otherReasonText?: string;
    revisedDetails?: string;
    isEditing?: string;
  }>();

  const reason = params.revisionReason || "missed_income";
  const originalValues: RevisedFormFields = DEFAULT_REVISED_FORM_FIELDS;

  const storeFormData = useRevisedProgressStore((s) => s.formData);
  const setStoreFormData = useRevisedProgressStore((s) => s.setFormData);

  const getInitialForm = (): RevisedFormFields => {
    if (params.revisedDetails) {
      try {
        const parsed: unknown = JSON.parse(params.revisedDetails);
        if (parsed && typeof parsed === "object") {
          return { ...DEFAULT_REVISED_FORM_FIELDS, ...(parsed as Partial<RevisedFormFields>) };
        }
      } catch { }
    }
    if (storeFormData) {
      return { ...DEFAULT_REVISED_FORM_FIELDS, ...storeFormData };
    }
    return DEFAULT_REVISED_FORM_FIELDS;
  };

  const [form, setForm] = useState<RevisedFormFields>(getInitialForm());

  useEffect(() => {
    if (!storeFormData) {
      setStoreFormData(DEFAULT_REVISED_FORM_FIELDS);
    }
  }, [setStoreFormData, storeFormData]);

  // Update store when form changes
  useEffect(() => {
    setStoreFormData(form);
  }, [form, setStoreFormData]);

  const [errors, setErrors] = useState<Partial<Record<keyof RevisedFormFields, string>>>({});

  const handleChange = (field: keyof RevisedFormFields, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    const fieldError = validateSingleField(field, value, reason);
    setErrors((prev) => ({ ...prev, [field]: fieldError }));
  };

  const validate = (): boolean => {
    const newErrors = validateAllRevisedFields(form, reason);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { revisedItrId, detailsId, setBackendIds, setMaxStepReached } = useRevisedProgressStore();

  // POST Method - Normal Flow (Continue)
  const handleContinue = async () => {
    if (!validate()) return;

    if (!revisedItrId) {
      Alert.alert("Error", "Missing revised ITR ID. Please start from Step 1.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        revisedItrId,
        salaryBusinessIncome: form.salaryBusinessIncome || "0",
        otherIncome: form.otherIncome || "0",
        deduction80C: form.sec80c || "0",
        deduction80D: form.sec80d || "0",
        homeLoanInterest: form.homeLoanInterest || "0",
        taxableIncome: form.taxableIncome || "0",
        bankAccountForRefund: form.bankAccount || "1234567890",
        ifscCode: form.ifsc || "SBIN0001234",
      };

      const response = await RevisedItrApiService.saveRevisedDetails(payload);
      if (response && response.detailsId) {
        setBackendIds({ detailsId: response.detailsId });
      }
      setMaxStepReached(4);

      // Navigate to Screen 4: Upload Supporting Documents
      router.push({
        pathname: "/service/revised-itr-documents" as any,
        params: {
          acknowledgementNumber: params.acknowledgementNumber,
          assessmentYear: params.assessmentYear || "AY 2026-27",
          revisionReason: params.revisionReason,
          revisedDetails: JSON.stringify(form),
        },
      });
    } catch (e) {
      console.error("Error saving revised details:", e);
      Alert.alert("Error", "Failed to save revised details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // PUT Method - Editing Flow (Update & Continue)
  const handleUpdateAndContinue = async () => {
    if (!validate()) return;

    if (!detailsId) {
      Alert.alert("Error", "No revised details ID found to update.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        revisedItrId,
        salaryBusinessIncome: form.salaryBusinessIncome || "0",
        otherIncome: form.otherIncome || "0",
        deduction80C: form.sec80c || "0",
        deduction80D: form.sec80d || "0",
        homeLoanInterest: form.homeLoanInterest || "0",
        taxableIncome: form.taxableIncome || "0",
        bankAccountForRefund: form.bankAccount || "1234567890",
        ifscCode: form.ifsc || "SBIN0001234",
      };

      await RevisedItrApiService.updateRevisedDetails(detailsId, payload);

      // Redirect back to Review screen
      router.push({
        pathname: "/service/revised-itr-review" as any,
        params: {
          acknowledgementNumber: params.acknowledgementNumber,
          assessmentYear: params.assessmentYear || "AY 2026-27",
          revisionReason: params.revisionReason,
          revisedDetails: JSON.stringify(form),
        },
      });
    } catch (e) {
      console.error("Error updating revised details:", e);
      Alert.alert("Error", "Failed to update revised details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, getContainerInsetsStyle(insets.top)]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <RevisedItrHeader
        subtitle="Update Revised Details"
        currentStep={3}
        totalSteps={5}
        hideBackButton={params.isEditing === "true"}
      />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          getScrollContentInsetsStyle(insets.bottom),
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Update Revised Details</Text>
          <Text style={styles.pageSubtitle}>
            Enter the updated figures that require correction in your return.
          </Text>
        </View>

        {params.otherReasonText ? (
          <View style={styles.reasonNotice}>
            <Text style={styles.reasonNoticeText}>
              Reason: {params.otherReasonText}
            </Text>
          </View>
        ) : null}

        {/* 1. Missed Income Fields Card */}
        {(reason === "missed_income" || reason === "other") && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="cash-outline" size={18} color="#083B75" />
                <Text style={styles.cardTitle}>Income Correction</Text>
                <RevisedItrAckInfoIcon
                  title="Income Correction Info"
                  text="Update your corrected salary, business, or other income figures. Taxable income will be recomputed accordingly."
                  style={styles.infoIconSpacing}
                />
              </View>
            </View>
            <Text style={styles.cardDescription}>
              Update the corrected income amounts for this assessment year.
            </Text>

            {/* Field 1: Salary / Business Income */}
            <RevisedFormField
              label="Salary / Business income"
              value={form.salaryBusinessIncome}
              originalValue={
                originalValues.salaryBusinessIncome
                  ? `₹${formatIndianAmount(originalValues.salaryBusinessIncome)}`
                  : undefined
              }
              onChangeText={(val) => handleChange("salaryBusinessIncome", val)}
              maxLength={12}
              isMandatory
              isAmount
              placeholder="Enter revised income"
              error={errors.salaryBusinessIncome}
            />

            {/* Field 2: Taxable Income (Placed above Other Income as requested) */}
            <RevisedFormField
              label="Taxable income"
              value={form.taxableIncome}
              originalValue={
                originalValues.taxableIncome
                  ? `₹${formatIndianAmount(originalValues.taxableIncome)}`
                  : undefined
              }
              onChangeText={(val) => handleChange("taxableIncome", val)}
              maxLength={12}
              isMandatory
              isAmount
              placeholder="Enter taxable income"
              error={errors.taxableIncome}
            />

            {/* Field 3: Other Income with Helper Description */}
            <RevisedFormField
              label="Other income"
              value={form.otherIncome}
              originalValue={
                originalValues.otherIncome
                  ? `₹${formatIndianAmount(originalValues.otherIncome)}`
                  : undefined
              }
              onChangeText={(val) => handleChange("otherIncome", val)}
              maxLength={12}
              isAmount
              placeholder="Enter revised other income"
              error={errors.otherIncome}
              helperText="Includes interest from savings/FD, dividend income, capital gains, gifts, or freelance income."
            />
          </View>
        )}

        {/* 2. Wrong Deduction Fields Card */}
        {(reason === "wrong_deduction" || reason === "other") && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="document-text-outline" size={18} color="#083B75" />
                <Text style={styles.cardTitle}>Deduction Correction</Text>
                <RevisedItrAckInfoIcon
                  title="Deduction Correction Info"
                  text="Enter revised deductions under Chapter VI-A (80C, 80D, home loan interest) that were missed or wrongly claimed."
                  style={styles.infoIconSpacing}
                />
              </View>
            </View>
            <Text style={styles.cardDescription}>
              Enter the revised eligible deduction amounts under Chapter VI-A and Section 24.
            </Text>

            <RevisedFormField
              label="80C deduction"
              value={form.sec80c}
              originalValue={
                originalValues.sec80c
                  ? `₹${formatIndianAmount(originalValues.sec80c)}`
                  : undefined
              }
              onChangeText={(val) => handleChange("sec80c", val)}
              maxLength={12}
              isAmount
              placeholder="Enter amount"
              error={errors.sec80c}
              infoTooltip={{
                title: "80C Deduction Info",
                text: "Tax deductions up to ₹1,50,000 for investments in PPF, EPF, ELSS mutual funds, life insurance premiums, and NSC.",
              }}
            />

            <RevisedFormField
              label="80D deduction"
              value={form.sec80d}
              originalValue={
                originalValues.sec80d
                  ? `₹${formatIndianAmount(originalValues.sec80d)}`
                  : undefined
              }
              onChangeText={(val) => handleChange("sec80d", val)}
              maxLength={12}
              isAmount
              placeholder="Enter amount"
              error={errors.sec80d}
              infoTooltip={{
                title: "80D Deduction Info",
                text: "Tax deductions for medical insurance premiums paid for self, family (up to ₹25,000/₹50,000) and senior citizen parents.",
              }}
            />

            <RevisedFormField
              label="Home loan interest"
              value={form.homeLoanInterest}
              originalValue={
                originalValues.homeLoanInterest
                  ? `₹${formatIndianAmount(originalValues.homeLoanInterest)}`
                  : undefined
              }
              onChangeText={(val) => handleChange("homeLoanInterest", val)}
              maxLength={12}
              isAmount
              placeholder="Enter amount"
              error={errors.homeLoanInterest}
              infoTooltip={{
                title: "Home Loan Interest Info",
                text: "Tax deduction up to ₹2,00,000 for interest paid on home loan for a self-occupied property.",
              }}
            />

            {/* Taxable Income for Wrong Deduction */}
            {reason === "wrong_deduction" && (
              <RevisedFormField
                label="Taxable income"
                value={form.taxableIncome}
                originalValue={
                  originalValues.taxableIncome
                    ? `₹${formatIndianAmount(originalValues.taxableIncome)}`
                    : undefined
                }
                onChangeText={(val) => handleChange("taxableIncome", val)}
                maxLength={12}
                isMandatory
                isAmount
                placeholder="Enter taxable income"
                error={errors.taxableIncome}
              />
            )}
          </View>
        )}

        {/* 3. Incorrect Bank Fields Card */}
        {(reason === "incorrect_bank" || reason === "other") && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="business-outline" size={18} color="#083B75" />
                <Text style={styles.cardTitle}>Bank Details Correction</Text>
                <RevisedItrAckInfoIcon
                  title="Bank Details Correction Info"
                  text="Provide the updated bank account number and IFSC where you wish to receive any approved income tax refund."
                  style={styles.infoIconSpacing}
                />
              </View>
            </View>
            <Text style={styles.cardDescription}>
              Provide the correct bank account details to receive your income tax refund.
            </Text>

            <RevisedFormField
              label="Bank account for refund"
              value={form.bankAccount}
              originalValue={originalValues.bankAccount}
              onChangeText={(val) => handleChange("bankAccount", val)}
              maxLength={18}
              isMandatory
              placeholder="Enter bank account number"
              error={errors.bankAccount}
            />

            <RevisedFormField
              label="IFSC"
              value={form.ifsc}
              originalValue={originalValues.ifsc}
              onChangeText={(val) => handleChange("ifsc", val.toUpperCase())}
              maxLength={11}
              isMandatory
              autoCapitalize="characters"
              placeholder="Enter 11-digit IFSC"
              error={errors.ifsc}
            />
          </View>
        )}

        {/* Action Button — In Scroll Flow (Matching GST Filing) */}
        <View style={styles.buttonWrapper}>
          {params.isEditing === "true" ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleUpdateAndContinue}
              style={styles.continueButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.continueButtonText}>Update & Continue</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleContinue}
              style={styles.continueButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default UpdateRevisedDetailsScreen;
