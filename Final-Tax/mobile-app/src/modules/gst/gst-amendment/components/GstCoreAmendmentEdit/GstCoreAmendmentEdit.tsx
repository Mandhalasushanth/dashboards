import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  type ScrollViewInstance,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { KeyboardStickyFooter } from "@/shared/components/KeyboardStickyFooter";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import {
  styles,
  getHeaderBarStyle,
  getBottomBarStyle,
} from "./GstCoreAmendmentEdit.styles";
import {
  AmendmentSectionConfig,
  AmendmentFormData,
  RegisteredDetails,
  SupportingDoc,
} from "../../types/gstAmendmentTypes";
import {
  INDIAN_STATES_AND_UTS,
  NATURE_OF_PREMISES_OPTIONS,
  CORE_ACCEPTED_PROOFS,
} from "../../config/gstCoreAmendmentConfig";
import { InputField, DropdownField } from "../GstAmendmentFields";
import { GstAmendmentProofs } from "../GstAmendmentProofs";

interface GstCoreAmendmentEditProps {
  selectedSection: AmendmentSectionConfig;
  registeredDetails: RegisteredDetails;
  formData: AmendmentFormData;
  errors: Record<string, string>;
  supportingDoc: SupportingDoc | null;
  isProofsExpanded: boolean;
  insets: { top: number; bottom: number };
  scrollViewRef: React.Ref<ScrollViewInstance> | React.RefObject<any>;
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

export const GstCoreAmendmentEdit: React.FC<GstCoreAmendmentEditProps> = ({
  selectedSection,
  registeredDetails,
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
  const acceptedProofConfig = CORE_ACCEPTED_PROOFS[sectionId];

  return (
    <View style={styles.root}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

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
          <Text style={styles.headerSubtitle}>Core field amendment</Text>
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
          {/* Current Registered Info */}
          <View style={styles.currentRegisteredCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardIconBox}>
                <Ionicons name="business" size={18} color={BrandColors.PRIMARY_ORANGE} />
              </View>
              <View style={styles.cardTitleWrap}>
                <Text style={styles.currentRegisteredHeader}>Currently Registered on Portal</Text>
                <Text style={styles.currentRegisteredSubtitle}>Read-only baseline from GST profile</Text>
              </View>
            </View>

            {sectionId === "legal-name" && (
              <View style={styles.currentFieldRow}>
                <Text style={styles.currentFieldLabel}>Legal Name</Text>
                <Text style={styles.currentFieldValue}>{registeredDetails.legalBusinessName}</Text>
              </View>
            )}

            {sectionId === "principal-place" && (
              <>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>Address</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.principalAddress}</Text>
                </View>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>City / State</Text>
                  <Text style={styles.currentFieldValue}>{`${registeredDetails.principalCity}, ${registeredDetails.principalState} - ${registeredDetails.principalPincode}`}</Text>
                </View>
              </>
            )}

            {sectionId === "additional-place" && (
              <>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>Additional Address</Text>
                  <Text style={styles.currentFieldValue}>{registeredDetails.additionalAddress || "None recorded"}</Text>
                </View>
                <View style={styles.currentFieldRow}>
                  <Text style={styles.currentFieldLabel}>City / PIN</Text>
                  <Text style={styles.currentFieldValue}>{`${registeredDetails.additionalCity || "—"} - ${registeredDetails.additionalPincode || "—"}`}</Text>
                </View>
              </>
            )}
          </View>

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

            {sectionId === "legal-name" && (
            <InputField
              label="New Legal Business Name"
              value={formData.newLegalBusinessName}
              onChangeText={(val) => onUpdateField("newLegalBusinessName", val)}
              placeholder="Enter legal business name"
              error={errors.newLegalBusinessName}
            />
          )}

          {sectionId === "principal-place" && (
            <>
              <InputField
                label="New Principal Business Address"
                value={formData.newPrincipalAddress}
                onChangeText={(val) => onUpdateField("newPrincipalAddress", val)}
                placeholder="Enter principal business address"
                error={errors.newPrincipalAddress}
              />
              <InputField
                label="City / Town"
                value={formData.newPrincipalCity}
                onChangeText={(val) => onUpdateField("newPrincipalCity", val)}
                placeholder="Enter city or town"
                error={errors.newPrincipalCity}
              />
              <InputField
                label="District"
                value={formData.newPrincipalDistrict}
                onChangeText={(val) => onUpdateField("newPrincipalDistrict", val)}
                placeholder="Enter district"
                error={errors.newPrincipalDistrict}
              />
              <DropdownField
                label="State / Union Territory"
                value={formData.newPrincipalState}
                placeholder="Select state or union territory"
                error={errors.newPrincipalState}
                onPress={() =>
                  onOpenPicker("Select state or union territory", INDIAN_STATES_AND_UTS, formData.newPrincipalState, (val) => {
                    onUpdateField("newPrincipalState", val);
                    onClearError("newPrincipalState");
                  })
                }
              />
              <InputField
                label="PIN Code"
                value={formData.newPrincipalPincode}
                onChangeText={(val) => onUpdateField("newPrincipalPincode", val.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="Enter 6-digit PIN code"
                keyboardType="number-pad"
                maxLength={6}
                error={errors.newPrincipalPincode}
              />
              <DropdownField
                label="Nature of Possession of Premises"
                value={formData.newPrincipalNatureOfPremises}
                placeholder="Select nature of possession"
                error={errors.newPrincipalNatureOfPremises}
                onPress={() =>
                  onOpenPicker(
                    "Select nature of possession",
                    NATURE_OF_PREMISES_OPTIONS,
                    formData.newPrincipalNatureOfPremises,
                    (val) => {
                      onUpdateField("newPrincipalNatureOfPremises", val);
                      onClearError("newPrincipalNatureOfPremises");
                    }
                  )
                }
              />
            </>
          )}

          {sectionId === "additional-place" && (
            <>
              <InputField
                label="New Additional Place Address"
                value={formData.newAdditionalAddress}
                onChangeText={(val) => onUpdateField("newAdditionalAddress", val)}
                placeholder="Enter additional business address"
                error={errors.newAdditionalAddress}
              />
              <InputField
                label="City / Town"
                value={formData.newAdditionalCity}
                onChangeText={(val) => onUpdateField("newAdditionalCity", val)}
                placeholder="Enter city or town"
                error={errors.newAdditionalCity}
              />
              <InputField
                label="PIN Code"
                value={formData.newAdditionalPincode}
                onChangeText={(val) => onUpdateField("newAdditionalPincode", val.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="Enter 6-digit PIN code"
                keyboardType="number-pad"
                maxLength={6}
                error={errors.newAdditionalPincode}
              />
              <DropdownField
                label="Nature of Possession"
                value={formData.newAdditionalNatureOfPremises}
                placeholder="Select nature of possession"
                error={errors.newAdditionalNatureOfPremises}
                onPress={() =>
                  onOpenPicker(
                    "Select nature of possession",
                    NATURE_OF_PREMISES_OPTIONS,
                    formData.newAdditionalNatureOfPremises,
                    (val) => {
                      onUpdateField("newAdditionalNatureOfPremises", val);
                      onClearError("newAdditionalNatureOfPremises");
                    }
                  )
                }
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
