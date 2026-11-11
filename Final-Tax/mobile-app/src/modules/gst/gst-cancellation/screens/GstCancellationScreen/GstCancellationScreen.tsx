import React from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { GstServiceBanner, GstSelectModal, GstinInfoIcon } from "@/modules/gst/components/common";
import { DatePickerDialog } from "@/shared/components/DatePickerDialog";
import { formatDateDDMMYYYY, parseDDMMYYYY } from "@/shared/formatters/dateFormatter";
import { removeEmoji } from "@/modules/gst/utils/gstEmojiFilter";
import { GstStepHeader } from "@/modules/gst/components/GstStepHeader";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";

import { useGstCancellationFlow } from "../../hooks/useGstCancellationFlow";
import {
  GstAcceptedProofs,
  GstSupportingProof,
  GstCancellationReview,
  GstCancellationSuccess,
} from "../../components";
import {
  styles,
  CANCELLATION_REASONS,
} from "./GstCancellationScreen.styles";

export function GstCancellationScreen() {
  const flow = useGstCancellationFlow();

  const renderChoiceButton = (
    key: "isVoluntaryUnderOneYear" | "areAllReturnsFiled",
    value: boolean
  ) => (
    <TouchableOpacity
      key={String(value)}
      style={[
        styles.selectBox,
        styles.selectBoxChoice,
        flow.form[key] === value && styles.selectBoxChoiceSelected,
      ]}
      activeOpacity={0.7}
      onPress={() => {
        flow.setFormField(key, value);
        flow.clearError(key);
      }}
    >
      <Text
        style={[
          styles.selectText,
          flow.form[key] === value && styles.selectTextSelected,
        ]}
      >
        {value ? "Yes" : "No"}
      </Text>
    </TouchableOpacity>
  );

  const renderError = (field: string) =>
    flow.errors[field] ? (
      <Text style={styles.errorText}>{flow.errors[field]}</Text>
    ) : null;

  return (
    <>
      {flow.step === "FORM" && (
        <View style={styles.root}>
          {/* Step Header Bar */}
          <GstStepHeader
            title="GST Cancellation"
            currentStep={1}
            totalSteps={2}
            stepLabel="Cancellation Details"
            onBack={() => {
              if (flow.isEditMode) {
                flow.setStep("REVIEW");
              } else {
                flow.router.back();
              }
            }}
          />

          <KeyboardAwareScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <GstServiceBanner
              text="Need to surrender your GSTIN? Fast & error-free cancellation with verified liability assessment."
            />

            <GstAcceptedProofs
              isProofsExpanded={flow.proofsOpen}
              setIsProofsExpanded={flow.setProofsOpen}
            />

            {/* Card 1: Cancellation Details */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBox}>
                  <Ionicons name="document-text-outline" size={18} color={BrandColors.PRIMARY_ORANGE} />
                </View>
                <View style={styles.sectionTitleWrap}>
                  <Text style={styles.sectionMainTitle}>Cancellation Details</Text>
                  <Text style={styles.sectionSubtitle}>GSTIN, reason & effective cancellation date</Text>
                </View>
              </View>

              {/* GSTIN Input */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>
                    GSTIN to Cancel <Text style={styles.star}>*</Text>
                  </Text>
                  <GstinInfoIcon />
                </View>
                <TextInput
                  style={[styles.input, Boolean(flow.errors.gstin) && styles.inputError]}
                  placeholder="Enter your GSTIN number"
                  placeholderTextColor="#94A3B8"
                  value={flow.form.gstin}
                  onChangeText={(t) => {
                    flow.setFormField("gstin", t.toUpperCase().replace(/[^A-Z0-9]/g, ""));
                    flow.clearError("gstin");
                  }}
                  maxLength={15}
                  autoCapitalize="characters"
                />
                {renderError("gstin")}
              </View>

              {/* Reason Selection */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Reason for Cancellation <Text style={styles.star}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.selectBox, Boolean(flow.errors.reason) && styles.inputError]}
                  activeOpacity={0.7}
                  onPress={() => flow.setReasonOpen(true)}
                >
                  <Text
                    style={flow.form.reason ? styles.selectTextSelected : styles.placeholderText}
                  >
                    {flow.form.reason || "Select Cancellation Reason"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#64748B" />
                </TouchableOpacity>
                {renderError("reason")}
              </View>

              {flow.form.reason === "Other Valid Reason" && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    Specify Reason <Text style={styles.star}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textArea, Boolean(flow.errors.otherReason) && styles.inputError]}
                    placeholder="Describe your reason for cancelling GSTIN"
                    placeholderTextColor="#94A3B8"
                    value={flow.form.otherReason}
                    onChangeText={(t) => {
                      flow.setFormField("otherReason", removeEmoji(t));
                      flow.clearError("otherReason");
                    }}
                    multiline
                  />
                  {renderError("otherReason")}
                </View>
              )}

              {/* Cancellation Date */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Date Cancellation is Sought <Text style={styles.star}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.selectBox, Boolean(flow.errors.cancellationDate) && styles.inputError]}
                  activeOpacity={0.7}
                  onPress={() => flow.setDateOpen(true)}
                >
                  <Text
                    style={
                      flow.form.cancellationDate
                        ? styles.selectTextSelected
                        : styles.placeholderText
                    }
                  >
                    {flow.form.cancellationDate || "Select effective date"}
                  </Text>
                  <View style={styles.calendarIconBox}>
                    <Ionicons name="calendar-outline" size={17} color="#0284C7" />
                  </View>
                </TouchableOpacity>
                {renderError("cancellationDate")}
              </View>
            </View>

            {/* Card 2: Financial Assessment */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBox}>
                  <Ionicons name="cash-outline" size={18} color={BrandColors.PRIMARY_ORANGE} />
                </View>
                <View style={styles.sectionTitleWrap}>
                  <Text style={styles.sectionMainTitle}>Financial Assessment</Text>
                  <Text style={styles.sectionSubtitle}>Closing stock, tax reversal & pending dues</Text>
                </View>
              </View>

              {/* Closing Stock */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Closing Stock & Input Tax Reversal (₹) <Text style={styles.star}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, Boolean(flow.errors.closingStock) && styles.inputError]}
                  placeholder="Enter closing stock amount (₹)"
                  placeholderTextColor="#94A3B8"
                  value={flow.form.closingStock}
                  onChangeText={(t) => {
                    flow.setFormField("closingStock", removeEmoji(t));
                    flow.clearError("closingStock");
                  }}
                  keyboardType="numeric"
                />
                {renderError("closingStock")}
              </View>

              {/* Pending Liabilities */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Pending Tax Dues / Liabilities (₹) <Text style={styles.star}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, Boolean(flow.errors.pendingLiabilities) && styles.inputError]}
                  placeholder="Enter pending tax due (₹)"
                  placeholderTextColor="#94A3B8"
                  value={flow.form.pendingLiabilities}
                  onChangeText={(t) => {
                    flow.setFormField("pendingLiabilities", removeEmoji(t));
                    flow.clearError("pendingLiabilities");
                  }}
                  keyboardType="numeric"
                />
                {renderError("pendingLiabilities")}
              </View>

              {/* Last GSTR-3B */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Last GSTR-3B Filed ARN / Period <Text style={styles.star}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, Boolean(flow.errors.lastGstr3b) && styles.inputError]}
                  placeholder="Enter last filed ARN or period"
                  placeholderTextColor="#94A3B8"
                  value={flow.form.lastGstr3b}
                  onChangeText={(t) => {
                    flow.setFormField("lastGstr3b", removeEmoji(t));
                    flow.clearError("lastGstr3b");
                  }}
                />
                {renderError("lastGstr3b")}
              </View>
            </View>

            {/* Card 3: Supporting Proofs */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBox}>
                  <Ionicons name="cloud-upload-outline" size={18} color={BrandColors.PRIMARY_ORANGE} />
                </View>
                <View style={styles.sectionTitleWrap}>
                  <Text style={styles.sectionMainTitle}>Supporting Documentation</Text>
                  <Text style={styles.sectionSubtitle}>Upload business closure or transfer proof</Text>
                </View>
              </View>

              <GstSupportingProof
                supportingDoc={flow.form.supportingDoc}
                setSupportingDoc={(doc) => flow.setFormField("supportingDoc", doc)}
                handleBrowseFiles={flow.pickDoc}
                handleScanFile={flow.scanDoc}
              />
            </View>

            {/* Card 4: Compliance Verification */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBox}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={BrandColors.PRIMARY_ORANGE} />
                </View>
                <View style={styles.sectionTitleWrap}>
                  <Text style={styles.sectionMainTitle}>Compliance Verification</Text>
                  <Text style={styles.sectionSubtitle}>Eligibility criteria & final return declaration</Text>
                </View>
              </View>

              {/* Eligibility Questions */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Is cancellation voluntary and within 1 year of registration? <Text style={styles.star}>*</Text>
                </Text>
                <View style={styles.rowGap12}>
                  {renderChoiceButton("isVoluntaryUnderOneYear", true)}
                  {renderChoiceButton("isVoluntaryUnderOneYear", false)}
                </View>
                {renderError("voluntary")}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Are all returns filed up to cancellation date? <Text style={styles.star}>*</Text>
                </Text>
                <View style={styles.rowGap12}>
                  {renderChoiceButton("areAllReturnsFiled", true)}
                  {renderChoiceButton("areAllReturnsFiled", false)}
                </View>
                {renderError("returns")}
              </View>

              {/* Final Return Declaration */}
              <TouchableOpacity
                style={styles.declarationRow}
                activeOpacity={0.8}
                onPress={() => {
                  flow.setFormField("isFinalReturnDeclared", !flow.form.isFinalReturnDeclared);
                  flow.clearError("finalReturn");
                }}
              >
                <View
                  style={[
                    styles.checkbox,
                    flow.form.isFinalReturnDeclared && styles.checkboxActive,
                  ]}
                >
                  {flow.form.isFinalReturnDeclared && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.declarationLabel}>
                    Final Return Declaration (GSTR-10) <Text style={styles.star}>*</Text>
                  </Text>
                  <Text style={styles.declarationSubText}>
                    I confirm all outward tax dues are settled and will file final return GSTR-10 within 3 months of cancellation order.
                  </Text>
                </View>
              </TouchableOpacity>
              {renderError("finalReturn")}
            </View>

            {/* Review Button */}
            <TouchableOpacity
              style={[styles.primaryBtn, flow.isSaving && styles.primaryBtnDisabled]}
              activeOpacity={0.8}
              onPress={flow.handleProceedToReview}
              disabled={flow.isSaving}
            >
              {flow.isSaving ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Please wait...</Text>
                </View>
              ) : (
                <Text style={styles.primaryBtnText}>
                  {flow.isEditMode ? "Review Updated Details" : "Review Cancellation Application"}
                </Text>
              )}
            </TouchableOpacity>
          </KeyboardAwareScrollView>

          {/* Modals */}
          <GstSelectModal
            visible={flow.reasonOpen}
            title="Reason for Cancellation"
            options={CANCELLATION_REASONS}
            selectedValue={flow.form.reason}
            onSelect={(val: string) => {
              flow.setFormField("reason", val);
              flow.clearError("reason");
              flow.setReasonOpen(false);
            }}
            onClose={() => flow.setReasonOpen(false)}
          />

          <DatePickerDialog
            visible={flow.dateOpen}
            title="Effective Date of Cancellation"
            value={parseDDMMYYYY(flow.form.cancellationDate) || new Date()}
            onConfirm={(date: Date) => {
              flow.setFormField("cancellationDate", formatDateDDMMYYYY(date));
              flow.clearError("cancellationDate");
              flow.setDateOpen(false);
            }}
            onCancel={() => flow.setDateOpen(false)}
          />
        </View>
      )}

      {flow.step === "REVIEW" && (
        <GstCancellationReview
          formData={flow.form}
          dbReviewData={flow.dbReviewData}
          isReviewDeclared={flow.reviewDeclared}
          setIsReviewDeclared={flow.setReviewDeclared}
          isSubmitting={flow.submitting}
          handleSubmitCancellation={flow.handleSubmit}
          onBack={() => flow.setStep("FORM")}
          onEdit={flow.handleEditFromReview}
        />
      )}

      {flow.step === "SUCCESS" && flow.result && (
        <GstCancellationSuccess
          submissionResult={flow.result}
          gstin={flow.form.gstin}
          cancellationDate={flow.form.cancellationDate}
        />
      )}

      <UniversalDraftModal
        visible={flow.draftGuard.showDraftModal}
        title="Save Cancellation Draft?"
        message="You have unsaved changes in your GST cancellation request. Save your progress so you can resume anytime."
        saveButtonText="Save as Draft & Exit"
        discardButtonText="Discard & Exit"
        cancelButtonText="Keep Editing"
        onSaveAndExit={flow.draftGuard.handleSaveAndExit}
        onDiscardAndExit={flow.draftGuard.handleDiscardAndExit}
        onCancel={flow.draftGuard.handleCancel}
      />
    </>
  );
}

export default GstCancellationScreen;