import React from "react";
import { BUSINESS_TEXT_LIMITS } from "../../validation/businessLoanValidation";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Dropdown } from "@/shared/components/Dropdown";
import { UniversalDatePicker } from "@/shared/components/UniversalDatePicker";
import {
  BUSINESS_ACTIVITY_OPTIONS,
  BUSINESS_CONSTITUTION_OPTIONS,
} from "../../types/businessLoan.types";
import type {
  CommonBusinessProfile,
  BusinessLoanErrors,
  BusinessConstitution,
  BusinessActivity,
} from "../../types/businessLoan.types";
import { styles } from "./CommonBusinessProfileSection.styles";

interface CommonBusinessProfileSectionProps {
  data: CommonBusinessProfile;
  errors: BusinessLoanErrors;
  onChangeField: <K extends keyof CommonBusinessProfile>(
    field: K,
    value: CommonBusinessProfile[K]
  ) => void;
}

export const CommonBusinessProfileSection: React.FC<
  CommonBusinessProfileSectionProps
> = ({ data, errors, onChangeField }) => {
  const handlePincodeChange = (text: string) => {
    const clean = text.replace(/\D/g, "").slice(0, 6);
    onChangeField("pincode", clean);
  };

  const handleGstinChange = (text: string) => {
    const clean = text
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 15);
    onChangeField("gstin", clean);
  };

  const handleUdyamChange = (text: string) => {
    const clean = text
      .replace(/[^A-Za-z0-9-]/g, "")
      .toUpperCase()
      .slice(0, 19);
    onChangeField("udyamRegistration", clean);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <Ionicons name="storefront-outline" size={18} color="#083B75" />
        </View>
        <Text style={styles.title}>Business Profile</Text>
      </View>
      <Text style={styles.subtitle}>
        Official registered entity details and operational establishment
      </Text>

      {/* Trade Name */}
      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>
          Business / Trade Name <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.businessName && styles.inputError]}
          value={data.businessName}
          onChangeText={(val) => onChangeField("businessName", val)}
          maxLength={BUSINESS_TEXT_LIMITS.name}
          placeholder="e.g. Apex Enterprises"
          placeholderTextColor="#94A3B8"
          autoCapitalize="words"
        />
        {errors.businessName ? (
          <Text style={styles.errorText}>{errors.businessName}</Text>
        ) : null}
      </View>

      {/* Constitution */}
      <View style={styles.fieldWrapper}>
        <Dropdown
          label="Business Constitution"
          required
          options={[...BUSINESS_CONSTITUTION_OPTIONS]}
          value={data.constitution}
          onSelect={(val) => onChangeField("constitution", val as BusinessConstitution)}
          placeholder="Select legal entity constitution"
          error={errors.constitution}
        />
      </View>

      {data.constitution === "Other" && (
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>
            Specify Constitution <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.constitutionOther && styles.inputError]}
            value={data.constitutionOther}
            onChangeText={(val) => onChangeField("constitutionOther", val)}
            maxLength={BUSINESS_TEXT_LIMITS.other}
            placeholder="e.g. Trust, Society, Cooperative"
            placeholderTextColor="#94A3B8"
          />
          {errors.constitutionOther ? (
            <Text style={styles.errorText}>{errors.constitutionOther}</Text>
          ) : null}
        </View>
      )}

      {/* Activity */}
      <View style={styles.fieldWrapper}>
        <Dropdown
          label="Primary Business Activity"
          required
          options={[...BUSINESS_ACTIVITY_OPTIONS]}
          value={data.businessActivity}
          onSelect={(val) => onChangeField("businessActivity", val as BusinessActivity)}
          placeholder="Select core operational sector"
          error={errors.businessActivity}
        />
      </View>

      {data.businessActivity === "Other" && (
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>
            Specify Activity <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.activityOther && styles.inputError]}
            value={data.activityOther}
            onChangeText={(val) => onChangeField("activityOther", val)}
            maxLength={BUSINESS_TEXT_LIMITS.other}
            placeholder="e.g. Logistics, Consulting"
            placeholderTextColor="#94A3B8"
          />
          {errors.activityOther ? (
            <Text style={styles.errorText}>{errors.activityOther}</Text>
          ) : null}
        </View>
      )}

      {/* Establishment Date */}
      <View style={styles.fieldWrapper}>
        <UniversalDatePicker
          label="Business Establishment Date"
          value={data.establishmentDate}
          onChange={(val) => onChangeField("establishmentDate", val)}
          required
          placeholder="DD-MM-YYYY"
          valueFormat="DD-MM-YYYY"
          allowManualEntry
          maximumDate={new Date()}
          error={errors.establishmentDate}
          helperText="Date of formal registration or commencement"
        />
      </View>

      {/* Business Address & PIN Code */}
      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>
          Business Operating Address <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            errors.businessAddress && styles.inputError,
          ]}
          value={data.businessAddress}
          onChangeText={(val) => onChangeField("businessAddress", val)}
          maxLength={BUSINESS_TEXT_LIMITS.address}
          placeholder="Plot/Shop No, Commercial Complex, Street, City"
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={2}
        />
        {errors.businessAddress ? (
          <Text style={styles.errorText}>{errors.businessAddress}</Text>
        ) : null}
      </View>

      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>
          PIN Code <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.pincode && styles.inputError]}
          value={data.pincode}
          onChangeText={handlePincodeChange}
          placeholder="6 digits"
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
          maxLength={6}
        />
        {errors.pincode ? (
          <Text style={styles.errorText}>{errors.pincode}</Text>
        ) : null}
      </View>

      {/* GST Registered Toggle */}
      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>GST Registered Entity?</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              data.isGstRegistered && styles.toggleButtonActive,
            ]}
            onPress={() => onChangeField("isGstRegistered", true)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleText,
                data.isGstRegistered && styles.toggleTextActive,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              !data.isGstRegistered && styles.toggleButtonActive,
            ]}
            onPress={() => onChangeField("isGstRegistered", false)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleText,
                !data.isGstRegistered && styles.toggleTextActive,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conditional GSTIN */}
      {data.isGstRegistered && (
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>
            GSTIN <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.gstin && styles.inputError]}
            value={data.gstin}
            onChangeText={handleGstinChange}
            placeholder="15-character GSTIN (e.g. 29ABCDE1234F1Z5)"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
            maxLength={15}
          />
          {errors.gstin ? (
            <Text style={styles.errorText}>{errors.gstin}</Text>
          ) : (
            <Text style={styles.helperText}>
              Verified against Goods & Services Tax network
            </Text>
          )}
        </View>
      )}

      {/* Udyam / MSME Registration */}
      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>Udyam / MSME Registration</Text>
        <TextInput
          style={[styles.input, errors.udyamRegistration && styles.inputError]}
          value={data.udyamRegistration}
          onChangeText={handleUdyamChange}
          placeholder="UDYAM-XX-00-0000000"
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
          maxLength={19}
        />
        {errors.udyamRegistration ? (
          <Text style={styles.errorText}>{errors.udyamRegistration}</Text>
        ) : (
          <Text style={styles.helperText}>
            Optional for MSME interest subsidy benefits
          </Text>
        )}
      </View>
    </View>
  );
};

export default CommonBusinessProfileSection;
