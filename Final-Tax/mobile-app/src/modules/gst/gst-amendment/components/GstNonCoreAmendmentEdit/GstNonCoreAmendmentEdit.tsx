import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { KeyboardStickyFooter } from "@/shared/components/KeyboardStickyFooter";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import {
  styles,
  getHeaderBarStyle,
  getBottomBarStyle,
} from "./GstNonCoreAmendmentEdit.styles";
import {
  AmendmentSectionConfig,
  AmendmentFormData,
  RegisteredDetails,
  SupportingDoc,
} from "../../types/gstAmendmentTypes";
import { BANK_ACCOUNT_TYPES, NON_CORE_ACCEPTED_PROOFS } from "../../config/gstNonCoreAmendmentConfig";
import { InputField, DropdownField, DateField, PhoneField } from "../GstAmendmentFields";
import { GstAmendmentProofs } from "../GstAmendmentProofs";

interface GstNonCoreAmendmentEditProps {
  selectedSection: AmendmentSectionConfig;
  registeredDetails?: RegisteredDetails;
  formData: AmendmentFormData;
  errors: Record<string, string>;
  supportingDoc: SupportingDoc | null;
  isProofsExpanded: boolean;
  insets: { top: number; bottom: number };
  scrollViewRef: React.RefObject<ScrollView | null>;
  onBack: () => void;
  onUpdateField: (field: keyof AmendmentFormData, value: string) => void;
  onClearError: (key: string) => void;
  onOpenPicker: (title: string, options: string[], selectedVal: string, onSelect: (val: string) => void) => void;
  onUploadSuccess?: (doc: SupportingDoc) => void;
  onBrowseFiles: () => void;
  onScanFile: () => void;
  onDeleteDoc: () => void;
  onToggleExpandProofs: () => void;
  onReviewChanges: () => void;
  isEditMode?: boolean;
  isSaving?: boolean;
}

export const GstNonCoreAmendmentEdit: React.FC<GstNonCoreAmendmentEditProps> = ({
  selectedSection,
  formData,
  errors,
  supportingDoc,
  isProofsExpanded,
  insets,
  scrollViewRef,
  onBack,
  onUpdateField,
  onClearError,
  onOpenPicker,
  onUploadSuccess,
  onBrowseFiles,
  onScanFile,
  onDeleteDoc,
  onToggleExpandProofs,
  onReviewChanges,
  isEditMode = false,
  isSaving = false,
}) => {
  const sectionId = selectedSection.id;
  const acceptedProofConfig = NON_CORE_ACCEPTED_PROOFS[sectionId];
  const maxDob = useMemo(() => new Date(), []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header (Back button hidden when returned from review to preserve edit mode integrity) */}
      <View style={[styles.headerBar, getHeaderBarStyle(insets.top)]}>
        {!isEditMode ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.roundBackButton}
          >
            <Ionicons name="chevron-back" size={22} color={BrandColors.PRIMARY_BLUE} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderBox} />
        )}
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerMainTitle}>{selectedSection.title}</Text>
          <Text style={styles.headerSubtitle}>Non-core field amendment</Text>
        </View>
        <View style={styles.placeholderBox} />
      </View>

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.editContainer}>
          {/* Form Fields Section */}
          <View style={styles.amendedDetailsCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardIconBox}>
                <Ionicons name="create-outline" size={18} color={BrandColors.PRIMARY_ORANGE} />
              </View>
              <View style={styles.cardTitleWrap}>
                <Text style={styles.currentRegisteredHeader}>Amended details</Text>
                <Text style={styles.currentRegisteredSubtitle}>Enter revised information for verification</Text>
              </View>
            </View>

            {sectionId === "bank-accounts" && (
              <>
                <InputField
                  label="New Bank Name"
                  value={formData.newBankName}
                  onChangeText={(val) => onUpdateField("newBankName", val)}
                  placeholder="Enter bank name"
                  error={errors.newBankName}
                />
                <InputField
                  label="New Bank Account Number"
                  value={formData.newBankAccountNumber}
                  onChangeText={(val) => onUpdateField("newBankAccountNumber", val.replace(/[^0-9]/g, "").slice(0, 18))}
                  placeholder="Enter bank account number"
                  keyboardType="number-pad"
                  error={errors.newBankAccountNumber}
                />
                <InputField
                  label="Confirm Bank Account Number"
                  value={formData.confirmBankAccountNumber}
                  onChangeText={(val) => onUpdateField("confirmBankAccountNumber", val.replace(/[^0-9]/g, "").slice(0, 18))}
                  placeholder="Re-enter bank account number"
                  keyboardType="number-pad"
                  error={errors.confirmBankAccountNumber}
                />
                <InputField
                  label="IFSC Code"
                  value={formData.newIfscCode}
                  onChangeText={(val) => onUpdateField("newIfscCode", val.toUpperCase())}
                  placeholder="Enter IFSC code"
                  autoCapitalize="characters"
                  maxLength={11}
                  error={errors.newIfscCode}
                />
                <DropdownField
                  label="Account Type"
                  value={formData.newAccountType}
                  placeholder="Select Account Type"
                  error={errors.newAccountType}
                  onPress={() =>
                    onOpenPicker("Select Account Type", BANK_ACCOUNT_TYPES, formData.newAccountType, (val) => {
                      onUpdateField("newAccountType", val);
                      onClearError("newAccountType");
                    })
                  }
                />
              </>
            )}

            {sectionId === "authorised-signatories" && (
              <>
                <InputField
                  label="Full Name of Signatory"
                  value={formData.newSignatoryName}
                  onChangeText={(val) => onUpdateField("newSignatoryName", val)}
                  placeholder="Enter full name"
                  error={errors.newSignatoryName}
                />
                <InputField
                  label="PAN Number"
                  value={formData.newSignatoryPan}
                  onChangeText={(val) => onUpdateField("newSignatoryPan", val.toUpperCase())}
                  placeholder="Enter PAN number"
                  autoCapitalize="characters"
                  maxLength={10}
                  keyboardType="default"
                  error={errors.newSignatoryPan}
                />
                <DateField
                  label="Date of Birth (as on PAN)"
                  value={formData.newSignatoryDob}
                  onChangeText={(val) => onUpdateField("newSignatoryDob", val)}
                  placeholder="Select date of birth"
                  error={errors.newSignatoryDob}
                  maximumDate={maxDob}
                />
                <InputField
                  label="Designation / Status"
                  value={formData.newSignatoryDesignation}
                  onChangeText={(val) => onUpdateField("newSignatoryDesignation", val.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 3))}
                  placeholder="MR / MS / DR"
                  autoCapitalize="characters"
                  maxLength={3}
                  error={errors.newSignatoryDesignation}
                />
                <PhoneField
                  label="Mobile Number"
                  value={formData.newSignatoryMobile}
                  onChangeText={(val) => onUpdateField("newSignatoryMobile", val.replace(/[^0-9]/g, "").slice(0, 10))}
                  placeholder="Enter mobile number"
                  error={errors.newSignatoryMobile}
                />
                <InputField
                  label="Email Address"
                  value={formData.newSignatoryEmail}
                  onChangeText={(val) => onUpdateField("newSignatoryEmail", val.toLowerCase())}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.newSignatoryEmail}
                />
              </>
            )}

            {sectionId === "contact-details" && (
              <>
                <PhoneField
                  label="New Primary Contact Mobile"
                  value={formData.newContactMobile}
                  onChangeText={(val) => onUpdateField("newContactMobile", val.replace(/[^0-9]/g, "").slice(0, 10))}
                  placeholder="Enter mobile number"
                  error={errors.newContactMobile}
                />
                <InputField
                  label="New Primary Contact Email"
                  value={formData.newContactEmail}
                  onChangeText={(val) => onUpdateField("newContactEmail", val.toLowerCase())}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.newContactEmail}
                />
              </>
            )}
          </View>

          {/* Supporting Proof Upload */}
          <GstAmendmentProofs
            supportingDoc={supportingDoc}
            onUploadSuccess={onUploadSuccess}
            onBrowseFiles={onBrowseFiles}
            onScanFile={onScanFile}
            onDeleteDoc={onDeleteDoc}
            error={errors.supportingDoc}
            acceptedProofs={acceptedProofConfig}
            isProofsExpanded={isProofsExpanded}
            onToggleExpandProofs={onToggleExpandProofs}
          />
        </View>
      </KeyboardAwareScrollView>

      {/* Bottom Bar */}
      <KeyboardStickyFooter style={[styles.bottomBar, getBottomBarStyle(insets.bottom)]}>
        <TouchableOpacity
          style={[styles.primaryBtn, isSaving && { opacity: 0.65 }]}
          activeOpacity={0.8}
          onPress={onReviewChanges}
          disabled={isSaving}
        >
          <Text style={styles.primaryBtnText}>
            {isSaving
              ? (isEditMode ? "Updating Changes..." : "Saving Changes...")
              : (isEditMode ? "Update and Save Your Changes" : "Review Changes")}
          </Text>
        </TouchableOpacity>
      </KeyboardStickyFooter>
    </View>
  );
};

