import React, { useCallback } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Dropdown } from "@/shared/components/Dropdown";
import { UniversalDatePicker } from "@/shared/components/UniversalDatePicker";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import { KeyboardStickyFooter } from "@/shared/components/KeyboardStickyFooter";
import { INDIAN_STATES_AND_UTS } from "@/components/screens/create-profile/types";
import { LoanFlowHeader } from "../../../components/LoanFlowHeader";
import { MoneyInputField } from "../../../components/MoneyInputField";
import { getContinueLabel } from "../../../constants/continueLabels";
import { getLoanFlowTotalSteps } from "../../../constants/loanFlow";
import { useLoansStore } from "../../../store/loansStore";
import {
  MSME_BUSINESS_ACTIVITY_OPTIONS,
  MSME_CONSTITUTION_OPTIONS,
  MSME_DURATION_OPTIONS,
  MSME_GST_STATUS_OPTIONS,
  MSME_OWNERSHIP_OPTIONS,
  MSME_REGISTRATION_STATUS_OPTIONS,
  type MsmeBusinessActivity,
  type MsmeConstitution,
  type MsmeGstStatus,
  type MsmeOperatingDuration,
  type MsmeOwnership,
  type MsmeRegistrationStatus,
} from "../../types/msmeLoan.types";
import {
  MSME_ACTIVITY_OTHER_MAX_LENGTH,
  MSME_BUSINESS_NAME_MAX_LENGTH,
  MSME_CITY_MAX_LENGTH,
  MSME_CONSTITUTION_OTHER_MAX_LENGTH,
  MSME_HOUSE_MAX_LENGTH,
  MSME_OWNERSHIP_OTHER_MAX_LENGTH,
  MSME_STREET_MAX_LENGTH,
} from "../../validation/msmeLoanValidation";
import { styles } from "./MsmeLoanScreen.styles";

export interface MsmeLoanScreenProps {
  onBackToKyc: () => void;
  onContinue: () => void;
  isEditMode?: boolean;
  isRevisit?: boolean;
}

export const MsmeLoanScreen: React.FC<MsmeLoanScreenProps> = ({
  onBackToKyc,
  onContinue,
  isEditMode = false,
  isRevisit = false,
}) => {
  const insets = useSafeAreaInsets();
  const form = useLoansStore((state) => state.msmeFormData);
  const errors = useLoansStore((state) => state.msmeErrors);
  const setField = useLoansStore((state) => state.setMsmeLoanField);
  const setAddressField = useLoansStore((state) => state.setMsmeAddressField);
  const validateForm = useLoansStore((state) => state.validateMsmeLoanForm);

  const handleContinue = useCallback(() => {
    if (validateForm()) {
      onContinue();
    }
  }, [onContinue, validateForm]);

  const continueLabel = getContinueLabel(
    isEditMode || isRevisit,
    "Continue →"
  );

  return (
    <View style={styles.container}>
      <LoanFlowHeader
        title="MSME Loan"
        currentStep={2}
        totalSteps={getLoanFlowTotalSteps("msme-loan")}
        subtitle="MSME & Business Details"
        isEditMode={isEditMode}
        onBack={onBackToKyc}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section 1: Business Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Business Details</Text>

          {/* Business / Trade Name */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Business / Trade Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.businessName ? styles.inputError : null]}
              value={form.businessName}
              onChangeText={(val) => setField("businessName", val)}
              placeholder="Enter business name"
              placeholderTextColor="#94A3B8"
              maxLength={MSME_BUSINESS_NAME_MAX_LENGTH}
              autoCapitalize="words"
              accessibilityLabel="Business / Trade Name"
            />
            {errors.businessName ? (
              <Text style={styles.errorText}>{errors.businessName}</Text>
            ) : null}
          </View>

          {/* Business Constitution */}
          <Dropdown
            label="Business Constitution"
            required
            options={[...MSME_CONSTITUTION_OPTIONS]}
            value={form.constitution}
            onSelect={(val) => setField("constitution", val as MsmeConstitution)}
            placeholder="Select business constitution"
            error={errors.constitution}
          />

          {form.constitution === "Other" ? (
            <View style={styles.field}>
              <Text style={styles.label}>
                Business Constitution <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors.constitutionOther ? styles.inputError : null,
                ]}
                value={form.constitutionOther}
                onChangeText={(val) => setField("constitutionOther", val)}
                placeholder="Enter business constitution"
                placeholderTextColor="#94A3B8"
                maxLength={MSME_CONSTITUTION_OTHER_MAX_LENGTH}
                autoCapitalize="words"
                accessibilityLabel="Business Constitution"
              />
              {errors.constitutionOther ? (
                <Text style={styles.errorText}>{errors.constitutionOther}</Text>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Section 2: Business Activity */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Business Activity</Text>

          {/* Primary Business Activity */}
          <Dropdown
            label="Primary Business Activity"
            required
            options={[...MSME_BUSINESS_ACTIVITY_OPTIONS]}
            value={form.businessActivity}
            onSelect={(val) =>
              setField("businessActivity", val as MsmeBusinessActivity)
            }
            placeholder="Select business activity"
            error={errors.businessActivity}
          />

          {form.businessActivity === "Other" ? (
            <View style={styles.field}>
              <Text style={styles.label}>
                Business Activity <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors.businessActivityOther ? styles.inputError : null,
                ]}
                value={form.businessActivityOther}
                onChangeText={(val) => setField("businessActivityOther", val)}
                placeholder="Enter business activity"
                placeholderTextColor="#94A3B8"
                maxLength={MSME_ACTIVITY_OTHER_MAX_LENGTH}
                autoCapitalize="words"
                accessibilityLabel="Business Activity"
              />
              {errors.businessActivityOther ? (
                <Text style={styles.errorText}>
                  {errors.businessActivityOther}
                </Text>
              ) : null}
            </View>
          ) : null}

          {/* Business Establishment Date */}
          <View style={styles.field}>
            <UniversalDatePicker
              label="Business Establishment Date"
              value={form.establishmentDate}
              onChange={(val) => setField("establishmentDate", val)}
              required
              placeholder="Select establishment date"
              valueFormat="DD-MM-YYYY"
              allowManualEntry
              maximumDate={new Date()}
              error={errors.establishmentDate}
            />
          </View>
        </View>

        {/* Section 3: Business Operating Address */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Business Operating Address</Text>

          {/* House / Flat / Building */}
          <View style={styles.field}>
            <Text style={styles.label}>
              House / Flat / Building <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors["operatingAddress.houseNumber"] ? styles.inputError : null,
              ]}
              value={form.operatingAddress.houseNumber}
              onChangeText={(val) => setAddressField("houseNumber", val)}
              placeholder="Enter house, flat or building"
              placeholderTextColor="#94A3B8"
              maxLength={MSME_HOUSE_MAX_LENGTH}
              accessibilityLabel="House / Flat / Building"
            />
            {errors["operatingAddress.houseNumber"] ? (
              <Text style={styles.errorText}>
                {errors["operatingAddress.houseNumber"]}
              </Text>
            ) : null}
          </View>

          {/* Street / Locality / Landmark */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Street / Locality / Landmark <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors["operatingAddress.street"] ? styles.inputError : null,
              ]}
              value={form.operatingAddress.street}
              onChangeText={(val) => setAddressField("street", val)}
              placeholder="Enter street, locality or landmark"
              placeholderTextColor="#94A3B8"
              maxLength={MSME_STREET_MAX_LENGTH}
              accessibilityLabel="Street / Locality / Landmark"
            />
            {errors["operatingAddress.street"] ? (
              <Text style={styles.errorText}>
                {errors["operatingAddress.street"]}
              </Text>
            ) : null}
          </View>

          {/* City / District */}
          <View style={styles.field}>
            <Text style={styles.label}>
              City / District <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors["operatingAddress.city"] ? styles.inputError : null,
              ]}
              value={form.operatingAddress.city}
              onChangeText={(val) => setAddressField("city", val)}
              placeholder="Enter city or district"
              placeholderTextColor="#94A3B8"
              maxLength={MSME_CITY_MAX_LENGTH}
              autoCapitalize="words"
              accessibilityLabel="City / District"
            />
            {errors["operatingAddress.city"] ? (
              <Text style={styles.errorText}>
                {errors["operatingAddress.city"]}
              </Text>
            ) : null}
          </View>

          {/* State / Union Territory */}
          <Dropdown
            label="State / Union Territory"
            required
            options={[...INDIAN_STATES_AND_UTS]}
            value={form.operatingAddress.state}
            onSelect={(val) => setAddressField("state", val)}
            placeholder="Select state or union territory"
            error={errors["operatingAddress.state"]}
          />

          {/* PIN Code */}
          <View style={styles.field}>
            <Text style={styles.label}>
              PIN Code <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors["operatingAddress.pincode"] ? styles.inputError : null,
              ]}
              value={form.operatingAddress.pincode}
              onChangeText={(val) => setAddressField("pincode", val)}
              placeholder="Enter PIN code"
              placeholderTextColor="#94A3B8"
              maxLength={6}
              keyboardType="number-pad"
              accessibilityLabel="PIN Code"
            />
            {errors["operatingAddress.pincode"] ? (
              <Text style={styles.errorText}>
                {errors["operatingAddress.pincode"]}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Section 4: MSME Registration */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>MSME Registration</Text>

          {/* Udyam / MSME Registration Status */}
          <Dropdown
            label="Udyam / MSME Registration Status"
            required
            options={[...MSME_REGISTRATION_STATUS_OPTIONS]}
            value={form.udyamStatus}
            onSelect={(val) =>
              setField("udyamStatus", val as MsmeRegistrationStatus)
            }
            placeholder="Select registration status"
            error={errors.udyamStatus}
          />

          {/* Udyam Registration Number */}
          {form.udyamStatus === "Registered" ? (
            <View style={styles.field}>
              <Text style={styles.label}>
                Udyam Registration Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors.udyamRegistrationNumber ? styles.inputError : null,
                ]}
                value={form.udyamRegistrationNumber}
                onChangeText={(val) =>
                  setField("udyamRegistrationNumber", val.toUpperCase())
                }
                placeholder="Enter Udyam registration number"
                placeholderTextColor="#94A3B8"
                maxLength={25}
                autoCapitalize="characters"
                accessibilityLabel="Udyam Registration Number"
              />
              {errors.udyamRegistrationNumber ? (
                <Text style={styles.errorText}>
                  {errors.udyamRegistrationNumber}
                </Text>
              ) : null}
            </View>
          ) : null}

          {/* GST Registration Status */}
          <Dropdown
            label="GST Registration Status"
            required
            options={[...MSME_GST_STATUS_OPTIONS]}
            value={form.gstStatus}
            onSelect={(val) => setField("gstStatus", val as MsmeGstStatus)}
            placeholder="Select GST status"
            error={errors.gstStatus}
          />

          {/* GSTIN */}
          {form.gstStatus === "Registered" ? (
            <View style={styles.field}>
              <Text style={styles.label}>
                GSTIN <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.gstin ? styles.inputError : null]}
                value={form.gstin}
                onChangeText={(val) => setField("gstin", val.toUpperCase())}
                placeholder="Enter GSTIN"
                placeholderTextColor="#94A3B8"
                maxLength={15}
                autoCapitalize="characters"
                accessibilityLabel="GSTIN"
              />
              {errors.gstin ? (
                <Text style={styles.errorText}>{errors.gstin}</Text>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Section 5: Business Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Business Information</Text>

          {/* Business Operating Duration */}
          <Dropdown
            label="Business Operating Duration"
            required
            options={[...MSME_DURATION_OPTIONS]}
            value={form.operatingDuration}
            onSelect={(val) =>
              setField("operatingDuration", val as MsmeOperatingDuration)
            }
            placeholder="Select operating duration"
            error={errors.operatingDuration}
          />

          {/* Number of Employees */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Number of Employees <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors.numberOfEmployees ? styles.inputError : null,
              ]}
              value={form.numberOfEmployees}
              onChangeText={(val) => setField("numberOfEmployees", val)}
              placeholder="Enter number of employees"
              placeholderTextColor="#94A3B8"
              maxLength={6}
              keyboardType="number-pad"
              accessibilityLabel="Number of Employees"
            />
            {errors.numberOfEmployees ? (
              <Text style={styles.errorText}>{errors.numberOfEmployees}</Text>
            ) : null}
          </View>

          {/* Annual Business Turnover */}
          <MoneyInputField
            label="Annual Business Turnover"
            required
            value={form.annualTurnover}
            onChange={(val) => setField("annualTurnover", val)}
            placeholder="Enter annual turnover"
            error={errors.annualTurnover}
          />

          {/* Business Ownership */}
          <Dropdown
            label="Business Ownership"
            required
            options={[...MSME_OWNERSHIP_OPTIONS]}
            value={form.ownershipType}
            onSelect={(val) =>
              setField("ownershipType", val as MsmeOwnership)
            }
            placeholder="Select ownership type"
            error={errors.ownershipType}
          />

          {form.ownershipType === "Other" ? (
            <View style={styles.field}>
              <Text style={styles.label}>
                Business Ownership Type <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors.ownershipTypeOther ? styles.inputError : null,
                ]}
                value={form.ownershipTypeOther}
                onChangeText={(val) => setField("ownershipTypeOther", val)}
                placeholder="Enter ownership type"
                placeholderTextColor="#94A3B8"
                maxLength={MSME_OWNERSHIP_OTHER_MAX_LENGTH}
                autoCapitalize="words"
                accessibilityLabel="Business Ownership Type"
              />
              {errors.ownershipTypeOther ? (
                <Text style={styles.errorText}>
                  {errors.ownershipTypeOther}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyFooter>
        <View
          style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={continueLabel}
          >
            <Text style={styles.continueButtonText}>{continueLabel}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardStickyFooter>
    </View>
  );
};

export default MsmeLoanScreen;
