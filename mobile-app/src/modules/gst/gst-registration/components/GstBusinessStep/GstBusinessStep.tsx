/**
 * Component: GstBusinessStep
 * Refactored: Functional modular architecture with strict TypeScript concepts,
 * helper functions, DRY renderers, and robust exception handling (< 400 lines).
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { styles } from "./GstBusinessStep.styles";
import { UniversalDatePicker } from "@/shared/components/UniversalDatePicker";
import { GstinInfoIcon } from "@/modules/gst/components/common";
import {
  FormInput,
  FormSelect,
  SectionCard,
  AccordionSection,
  sanitizeAlphanumericUpper,
} from "./GstFormElements";
import { BANK_FIELD_NAMES, SIGNATORY_FIELD_NAMES, isTextFormField } from "../../utils/gstDraftLifecycle";
import { formatUiDate } from "../../utils/gstRegistrationMapper";
import { GstValidators } from "@/modules/gst/utils/gstValidators";
import { logger } from "@/core/logging/logger";
import { hsnSacPolicy } from "@/modules/gst/utils/hsnSacPolicy";
import { useGstFieldLookups } from "@/modules/gst/gst-registration/hooks/useGstFieldLookups";
import {
  STATE_OPTIONS, BANK_OPTIONS, BUSINESS_TYPES, NATURE_OF_BUSINESS, REASONS,
  COMPOSITION_OPTIONS, PLACE_OPTIONS, ACCOUNT_TYPES,
  type BusinessType, type NatureOfBusiness, type ReasonForRegistration,
  type CompositionOption, type PlaceOption, type AccountType,
} from "../../constants/gstOptionConstants";

export {
  BUSINESS_TYPES, NATURE_OF_BUSINESS, REASONS, COMPOSITION_OPTIONS, PLACE_OPTIONS, ACCOUNT_TYPES,
  type BusinessType, type NatureOfBusiness, type ReasonForRegistration,
  type CompositionOption, type PlaceOption, type AccountType,
};

export interface GstBusinessFormData {
  gstId?: string; customerId?: string; legalName: string; businessName: string; businessType: string;
  natureOfBusiness: string; placeOfBusiness: string; businessStartDate: string; reasonForRegistration: string;
  compositionScheme: string; businessAddress: string; city: string; district: string; state: string; pinCode: string;
  hsnCode: string; accountHolderName: string; bankAccountNumber: string; confirmBankAccountNumber: string;
  ifscCode: string; bankName: string; branchName: string; accountType: string; signatoryName: string;
  signatoryPan: string; signatoryDob: string; signatoryDesignation: string; signatoryMobile: string;
  signatoryEmail: string; addressProofType: string; aadhaarConsent: boolean; businessPan: string;
}

export type FormErrors = Partial<Record<keyof GstBusinessFormData, string>>;

const BANK_FIELD_KEYS = BANK_FIELD_NAMES as readonly (keyof GstBusinessFormData)[]; const SIGNATORY_FIELD_KEYS = SIGNATORY_FIELD_NAMES as readonly (keyof GstBusinessFormData)[];

interface Props {
  data: GstBusinessFormData; onChange: (fields: Partial<GstBusinessFormData>) => void;
  onBlurField?: (field: keyof GstBusinessFormData) => void; errors?: FormErrors;
  onRequestScrollToSection?: (sectionKey: "bank" | "signatory", y?: number) => void;
  initialExpandedSection?: string | null; onSectionLayout?: (section: "bank" | "signatory" | "consent", y: number) => void;
  onFieldLayout?: (field: string, y: number) => void; focusedField?: string | null;
}

export const GstBusinessStep: React.FC<Props> = ({
  data,
  onChange,
  onBlurField,
  errors = {},
  onRequestScrollToSection,
  initialExpandedSection,
  onSectionLayout,
  onFieldLayout,
  focusedField,
}) => {
  const [userToggledBank, setUserToggledBank] = useState<boolean | null>(null);
  const [userToggledSignatory, setUserToggledSignatory] = useState<boolean | null>(null);
  const bankYRef = useRef(0);
  const signatoryYRef = useRef(0);
  const consentYRef = useRef(0);
  const inputRefs = useRef<Record<string, { focus?: () => void } | any>>({});
  const fieldOffsetsRef = useRef<Record<string, number>>({});

  const bankErrorCount = useMemo(() => BANK_FIELD_KEYS.filter((f) => Boolean(errors[f])).length, [errors]);
  const signatoryErrorCount = useMemo(() => SIGNATORY_FIELD_KEYS.filter((f) => Boolean(errors[f])).length, [errors]);
  const hasBankErrors = bankErrorCount > 0;
  const hasSignatoryErrors = signatoryErrorCount > 0;

  const isBankExpanded = hasBankErrors || (userToggledBank !== null ? userToggledBank : initialExpandedSection === "bank");
  const isSignatoryExpanded = hasSignatoryErrors || (userToggledSignatory !== null ? userToggledSignatory : initialExpandedSection === "signatory");

  useEffect(() => {
    if (!focusedField) return;
    if (isTextFormField(focusedField) && inputRefs.current[focusedField]) {
      const timer = setTimeout(() => { inputRefs.current[focusedField]?.focus(); }, 180);
      return () => clearTimeout(timer);
    }
  }, [focusedField]);

  useEffect(() => {
    const shouldExpandBank = initialExpandedSection === "bank" || hasBankErrors;
    const shouldExpandSignatory = initialExpandedSection === "signatory" || hasSignatoryErrors;
    const target = shouldExpandBank ? "bank" : shouldExpandSignatory ? "signatory" : null;
    if (!target) return;
    const timer = setTimeout(() => {
      if (shouldExpandBank) setUserToggledBank(true);
      if (shouldExpandSignatory) setUserToggledSignatory(true);
      const y = target === "bank" ? bankYRef.current : signatoryYRef.current;
      if (y > 0) onRequestScrollToSection?.(target, y);
    }, 150);
    return () => clearTimeout(timer);
  }, [initialExpandedSection, hasBankErrors, hasSignatoryErrors, onRequestScrollToSection]);

  const updateField = useCallback(<K extends keyof GstBusinessFormData>(field: K, value: GstBusinessFormData[K]) => {
    try { onChange({ [field]: value }); } catch (err) { logger.warn("[GstBusinessStep] Error updating field:", { field: String(field), error: err }); }
  }, [onChange]);

  const blurField = useCallback((field: keyof GstBusinessFormData) => {
    try { onBlurField?.(field); } catch (err) { logger.warn("[GstBusinessStep] Error blurring field:", { field: String(field), error: err }); }
  }, [onBlurField]);

  const handleInputChange = useCallback((f: string, t: string) => updateField(f as keyof GstBusinessFormData, t), [updateField]);
  const handleInputBlur = useCallback((f: string) => blurField(f as keyof GstBusinessFormData), [blurField]);
  const handleSelectField = useCallback((f: string, v: string) => updateField(f as keyof GstBusinessFormData, v), [updateField]);

  const renderInput = useCallback(
    (
      field: keyof GstBusinessFormData,
      label: string,
      placeholder: string,
      options?: {
        keyboardType?: "default" | "numeric" | "email-address";
        maxLength?: number;
        autoCapitalize?: "none" | "sentences" | "words" | "characters";
        transform?: (val: string) => string;
        onChangeOverride?: (val: string) => void;
        onBlurOverride?: (val: string) => void;
        errorOverride?: string;
        infoIcon?: React.ReactNode;
      },
    ) => {
      const val = (data?.[field] as string) ?? "";
      return (
        <FormInput
          key={field}
          field={field}
          label={label}
          value={val}
          inputRef={(node) => { inputRefs.current[field] = node; }}
          onChangeField={
            options?.onChangeOverride
              ? (_f, t) => options.onChangeOverride?.(options?.transform ? options.transform(t) : t)
              : options?.transform
              ? (_f, t) => handleInputChange(field, options.transform!(t))
              : handleInputChange
          }
          onBlurField={options?.onBlurOverride ? (_f) => { options.onBlurOverride?.(val); handleInputBlur(field); } : handleInputBlur}
          error={options?.errorOverride ?? errors?.[field]}
          placeholder={placeholder}
          keyboardType={options?.keyboardType}
          maxLength={options?.maxLength}
          autoCapitalize={options?.autoCapitalize}
          infoIcon={options?.infoIcon}
        />
      );
    },
    [data, errors, handleInputChange, handleInputBlur],
  );

  const renderSelect = useCallback(
    (field: keyof GstBusinessFormData, label: string, placeholder: string, options: readonly string[], cfg?: { searchable?: boolean; allowCustom?: boolean; searchPlaceholder?: string }) => (
      <FormSelect
        key={field}
        field={field}
        label={label}
        value={(data?.[field] as string) ?? ""}
        options={options as string[]}
        onSelectField={handleSelectField}
        error={errors?.[field]}
        placeholder={placeholder}
        searchable={cfg?.searchable}
        allowCustom={cfg?.allowCustom}
        searchPlaceholder={cfg?.searchPlaceholder}
      />
    ),
    [data, errors, handleSelectField],
  );

  const getYesterdayDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  };

  const renderDatePicker = useCallback(
    (field: keyof GstBusinessFormData, label: string, opts?: { maximumDate?: Date }) => (
      <UniversalDatePicker
        key={field}
        label={label}
        value={formatUiDate((data?.[field] as string) ?? "")}
        onChange={(d: string) => updateField(field, formatUiDate(d) || d)}
        error={errors?.[field]}
        valueFormat="DD-MM-YYYY"
        placeholder="DD-MM-YYYY"
        maximumDate={opts?.maximumDate}
      />
    ),
    [data, errors, updateField],
  );

  const renderBusinessIdentity = () => (
    <SectionCard
      iconName="storefront-outline"
      title="Business Identity"
      subtitle="Legal name and constitutional details"
    >
      {renderInput("legalName", "Legal Name of Business (as per PAN) *", "Exactly as on the PAN card", { maxLength: 100, onBlurOverride: (v) => updateField("legalName", v.trim()) })}
      {renderInput("businessName", "Trade Name *", "Enter your business / trade name", {
        maxLength: 100,
        onBlurOverride: (v) => updateField("businessName", v.trim()),
        infoIcon: <GstinInfoIcon fieldType="tradeName" />,
      })}
      {renderSelect("businessType", "Constitution of Business *", "Select business type", BUSINESS_TYPES)}
      {renderSelect("natureOfBusiness", "Nature of Business *", "Select nature of business", NATURE_OF_BUSINESS)}
      {renderDatePicker("businessStartDate", "Date of Commencement of Business *", { maximumDate: new Date() })}
      {renderInput("businessPan", "Business PAN *", "Enter PAN (e.g., ABCPE1234F)", { autoCapitalize: "characters", maxLength: 10, transform: sanitizeAlphanumericUpper })}
    </SectionCard>
  );

  const renderRegistrationScheme = () => (
    <SectionCard
      iconName="ribbon-outline"
      title="Registration & Scheme"
      subtitle="Registration purpose and tax scheme"
    >
      {renderSelect("reasonForRegistration", "Reason for Registration *", "Select a reason", REASONS)}
      {renderSelect("compositionScheme", "Opting for Composition Scheme? *", "Select yes or no", COMPOSITION_OPTIONS)}
    </SectionCard>
  );

  const { pinLoading, handlePinLookup } = useGstFieldLookups({
    data,
    onChange,
  });

  const renderAddressSection = () => {
    const hsnClassification = hsnSacPolicy.classify(data?.hsnCode || "");
    return (
      <SectionCard
        iconName="location-outline"
        title="Principal Place of Business"
        subtitle="Registered business address & HSN details"
      >
        {renderSelect("placeOfBusiness", "Place of Business *", "Select place type", PLACE_OPTIONS)}
        {renderInput("businessAddress", "Business Address *", "Building, street, locality", { maxLength: 250, onBlurOverride: (v) => updateField("businessAddress", v.trim()) })}
        <View style={styles.row}>
          <View style={styles.halfField}>{renderInput("city", "City *", "City", { maxLength: 50, onBlurOverride: (v) => updateField("city", v.trim()) })}</View>
          <View style={styles.halfField}>{renderInput("district", "District *", "District", { maxLength: 50, onBlurOverride: (v) => updateField("district", v.trim()) })}</View>
        </View>
        <View style={styles.row}>
          <View style={styles.halfField}>
            {renderSelect("state", "State / UT *", "Select", STATE_OPTIONS, {
              searchable: true, searchPlaceholder: "Search state or UT...",
            })}
          </View>
          <View style={styles.halfField}>
            {renderInput("pinCode", "PIN Code *", "560001", {
              keyboardType: "numeric",
              maxLength: 6,
              onChangeOverride: (pin) => {
                updateField("pinCode", pin);
                if (GstValidators.isValidPinCode(pin)) handlePinLookup(pin);
              },
            })}
            {pinLoading && <Text style={styles.lookupInfoText}>Looking up PIN code...</Text>}
          </View>
        </View>
        {renderInput("hsnCode", "Primary HSN / SAC Code *", "e.g. 998311", {
          keyboardType: "numeric",
          maxLength: 8,
          infoIcon: <GstinInfoIcon fieldType="sacCode" />,
        })}
        {hsnClassification?.isValid && (
          <View style={{ marginTop: -8, marginBottom: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: hsnClassification.type === "SAC" ? "#EFF6FF" : "#F0FDF4", alignSelf: "flex-start", borderWidth: 1, borderColor: hsnClassification.type === "SAC" ? "#BFDBFE" : "#BBF7D0" }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: hsnClassification.type === "SAC" ? "#1D4ED8" : "#15803D" }}>
              ✓ {hsnClassification.label}
            </Text>
          </View>
        )}
      </SectionCard>
    );
  };

  const renderBankDetails = () => (
    <View
      onLayout={(e) => {
        const y = e.nativeEvent.layout.y;
        bankYRef.current = y;
        onSectionLayout?.("bank", y);
      }}
    >
      <AccordionSection
        iconName="wallet-outline"
        title="Bank Details"
        subtitle="Account for refunds & credits"
        isExpanded={isBankExpanded}
        errorCount={bankErrorCount}
        onToggle={() => {
          const next = !isBankExpanded;
          setUserToggledBank(next);
          if (next) {
            Keyboard.dismiss();
            if (bankYRef.current > 0) onRequestScrollToSection?.("bank", bankYRef.current);
          }
        }}
      >
        {renderInput("accountHolderName", "Account Holder Name *", "As per bank records", { maxLength: 100, onBlurOverride: (v) => updateField("accountHolderName", v.trim()) })}
        {renderInput("bankAccountNumber", "Bank Account Number *", "Enter account number", {
          keyboardType: "numeric", maxLength: 18,
          onChangeOverride: (acc) => data?.confirmBankAccountNumber ? onChange({ bankAccountNumber: acc, confirmBankAccountNumber: data.confirmBankAccountNumber }) : updateField("bankAccountNumber", acc),
          onBlurOverride: (acc) => { updateField("bankAccountNumber", acc.trim()); if (data?.confirmBankAccountNumber) blurField("confirmBankAccountNumber"); },
        })}
        {renderInput("confirmBankAccountNumber", "Confirm Account Number *", "Re-enter account number", { keyboardType: "numeric", maxLength: 18, onBlurOverride: (acc) => updateField("confirmBankAccountNumber", acc.trim()) })}
        {renderInput("ifscCode", "IFSC Code *", "e.g. HDFC0001234", { autoCapitalize: "characters", maxLength: 11, transform: sanitizeAlphanumericUpper })}
        <View style={styles.row}>
          <View style={styles.halfField}>{renderInput("bankName", "Bank Name *", "Enter Bank Name (e.g. HDFC Bank)", { maxLength: 100, onBlurOverride: (v) => updateField("bankName", v.trim()) })}</View>
          <View style={styles.halfField}>{renderInput("branchName", "Branch Name *", "Enter Branch Name", { maxLength: 100, onBlurOverride: (v) => updateField("branchName", v.trim()) })}</View>
        </View>
        {renderSelect("accountType", "Account Type *", "Select account type", ACCOUNT_TYPES)}
      </AccordionSection>
    </View>
  );

  const renderSignatoryDetails = () => (
    <View
      onLayout={(e) => {
        const y = e.nativeEvent.layout.y;
        signatoryYRef.current = y;
        onSectionLayout?.("signatory", y);
      }}
    >
      <AccordionSection
        iconName="person-circle-outline"
        title="Authorised Signatory"
        subtitle="Primary contact & PAN verification"
        isExpanded={isSignatoryExpanded}
        errorCount={signatoryErrorCount}
        onToggle={() => {
          const next = !isSignatoryExpanded;
          setUserToggledSignatory(next);
          if (next) {
            Keyboard.dismiss();
            if (signatoryYRef.current > 0) onRequestScrollToSection?.("signatory", signatoryYRef.current);
          }
        }}
      >
        <View onLayout={(e) => { const y = signatoryYRef.current + e.nativeEvent.layout.y; fieldOffsetsRef.current.signatoryName = y; onFieldLayout?.("signatoryName", y); }}>
          {renderInput("signatoryName", "Signatory Name *", "Full name", { maxLength: 100 })}
        </View>
        <View style={styles.row} onLayout={(e) => { const y = signatoryYRef.current + e.nativeEvent.layout.y; fieldOffsetsRef.current.signatoryPan = y; fieldOffsetsRef.current.signatoryDob = y; onFieldLayout?.("signatoryPan", y); onFieldLayout?.("signatoryDob", y); }}>
          <View style={styles.halfField}>{renderInput("signatoryPan", "Signatory PAN *", "ABCPE1234F", { autoCapitalize: "characters", maxLength: 10, transform: sanitizeAlphanumericUpper })}</View>
          <View style={styles.halfField}>{renderDatePicker("signatoryDob", "Date of Birth *", { maximumDate: getYesterdayDate() })}</View>
        </View>
        <View onLayout={(e) => { const y = signatoryYRef.current + e.nativeEvent.layout.y; fieldOffsetsRef.current.signatoryDesignation = y; onFieldLayout?.("signatoryDesignation", y); }}>
          {renderInput("signatoryDesignation", "Designation *", "Proprietor / Director / Partner", { maxLength: 50 })}
        </View>
        <View style={styles.row} onLayout={(e) => { const y = signatoryYRef.current + e.nativeEvent.layout.y; fieldOffsetsRef.current.signatoryMobile = y; fieldOffsetsRef.current.signatoryEmail = y; onFieldLayout?.("signatoryMobile", y); onFieldLayout?.("signatoryEmail", y); }}>
          <View style={styles.halfField}>{renderInput("signatoryMobile", "Signatory Mobile *", "10-digit", { keyboardType: "numeric", maxLength: 10 })}</View>
          <View style={styles.halfField}>{renderInput("signatoryEmail", "Signatory Email *", "email@business.com", { keyboardType: "email-address", maxLength: 150, autoCapitalize: "none", onBlurOverride: (email) => updateField("signatoryEmail", email.trim()) })}</View>
        </View>
      </AccordionSection>
    </View>
  );

  const renderConsentSection = () => {
    const isChecked = Boolean(data?.aadhaarConsent);
    return (
      <View style={styles.sectionCard} onLayout={(e) => { const y = e.nativeEvent.layout.y; consentYRef.current = y; fieldOffsetsRef.current.aadhaarConsent = y; onSectionLayout?.("consent", y); onFieldLayout?.("aadhaarConsent", y); }}>
        <View style={styles.consentRow}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => updateField("aadhaarConsent", !isChecked)} style={styles.checkboxTouch} accessibilityRole="checkbox" accessibilityState={{ checked: isChecked }} accessibilityLabel="Aadhaar authentication consent">
            <Ionicons name={isChecked ? "checkbox" : "square-outline"} size={24} color={isChecked ? BrandColors.PRIMARY_ORANGE : "#94A3B8"} />
          </TouchableOpacity>
          <Text style={styles.consentText}>I consent to Aadhaar authentication (e-KYC) for this GST registration.</Text>
        </View>
        {errors?.aadhaarConsent ? <Text style={[styles.errorText, styles.errorTextMarginBottom]}>{errors.aadhaarConsent}</Text> : null}
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {renderBusinessIdentity()}
        {renderRegistrationScheme()}
        {renderAddressSection()}
        {renderBankDetails()}
        {renderSignatoryDetails()}
        {renderConsentSection()}
      </View>
    </TouchableWithoutFeedback>
  );
};