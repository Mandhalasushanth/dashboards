import React from "react";
import { normalizeIndianMobile } from "../../utils/textInput";
import { View, Text, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { UniversalDatePicker } from "@/shared/components/UniversalDatePicker";
import type {
  LoanKycData,
  LoanKycErrors,
  KycRequirementConfig,
} from "../../types/loanKyc.types";
import { styles } from "./CustomerIdentitySection.styles";

interface CustomerIdentitySectionProps {
  data: LoanKycData;
  errors: LoanKycErrors;
  requirements?: KycRequirementConfig;
  onChangeField: <K extends keyof LoanKycData>(field: K, value: LoanKycData[K]) => void;
  isLocked?: boolean;
}

export const CustomerIdentitySection: React.FC<CustomerIdentitySectionProps> = ({
  data,
  errors,
  requirements,
  onChangeField,
  isLocked: propIsLocked,
}) => {
  const reqs = requirements || {};
  const isLocked = propIsLocked === true;

  const handlePanChange = (text: string) => {
    onChangeField("pan", text.toUpperCase());
  };

  const handleMobileChange = (text: string) => {
    onChangeField("mobile", normalizeIndianMobile(text));
  };

  const handleAadhaarChange = (text: string) => {
    const trimmed = text.trim();
    const clean = /^\d{4}[\s-]\d{4}[\s-]\d{4}$/.test(trimmed)
      ? trimmed.replace(/\D/g, "")
      : text;
    onChangeField("aadhaar", clean);
  };

  if (isLocked) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="lock-closed" size={17} color="#083B75" />
            </View>
            <Text style={styles.title}>Verified Customer Details</Text>
          </View>
        </View>

        <View style={styles.lockNoteRow}>
          <Ionicons name="information-circle-outline" size={14} color="#64748B" />
          <Text style={styles.lockNoteText}>
            Identity information fetched from verified KYC records cannot be edited.
          </Text>
        </View>

        {/* Full Legal Name - Locked */}
        <View style={styles.fieldWrapper}>
          <View style={styles.lockedLabelRow}>
            <Text style={styles.fieldLabel}>Full Legal Name</Text>
            <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
          </View>
          <View style={styles.lockedField}>
            <Text style={styles.lockedFieldValue}>{data.fullName || "—"}</Text>
          </View>
        </View>

        {/* Mobile Number - Locked */}
        <View style={styles.fieldWrapper}>
          <View style={styles.lockedLabelRow}>
            <Text style={styles.fieldLabel}>Mobile Number</Text>
            <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
          </View>
          <View style={styles.lockedField}>
            <Text style={styles.lockedFieldValue}>
              {data.mobile ? `+91 ${data.mobile}` : "—"}
            </Text>
          </View>
        </View>

        {/* Email Address - Locked */}
        <View style={styles.fieldWrapper}>
          <View style={styles.lockedLabelRow}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
          </View>
          <View style={styles.lockedField}>
            <Text style={styles.lockedFieldValue}>{data.email || "—"}</Text>
          </View>
        </View>

        {/* PAN & Aadhaar - Locked */}
        <View style={styles.twoColRow}>
          <View style={[styles.col, styles.fieldWrapper]}>
            <View style={styles.lockedLabelRow}>
              <Text style={styles.fieldLabel}>PAN Number</Text>
              <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
            </View>
            <View style={styles.lockedField}>
              <Text style={styles.lockedFieldValue}>
                {data.pan ? data.pan.toUpperCase() : "—"}
              </Text>
            </View>
          </View>

          {reqs.showAadhaar !== false ? (
            <View style={[styles.col, styles.fieldWrapper]}>
              <View style={styles.lockedLabelRow}>
                <Text style={styles.fieldLabel}>Aadhaar Number</Text>
                <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
              </View>
              <View style={styles.lockedField}>
                <Text style={styles.lockedFieldValue}>
                  {data.aadhaar
                    ? data.aadhaar.length >= 4
                      ? `XXXX XXXX ${data.aadhaar.slice(-4)}`
                      : data.aadhaar
                    : "—"}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Date of Birth - Locked */}
        <View style={styles.fieldWrapper}>
          <View style={styles.lockedLabelRow}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
          </View>
          <View style={styles.lockedField}>
            <Text style={styles.lockedFieldValue}>{data.dob || "—"}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Ionicons name="person-outline" size={18} color="#083B75" />
          </View>
          <Text style={styles.title}>Customer Identity</Text>
        </View>
        {data.isProfilePrefilled && (
          <View style={styles.prefilledBadge}>
            <Ionicons name="document-text-outline" size={13} color="#475569" />
            <Text style={styles.prefilledText}>Pre-filled from Profile</Text>
          </View>
        )}
      </View>

      {/* Full Legal Name - Mandatory */}
      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>
          Full Legal Name <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.fullName && styles.inputError]}
          value={data.fullName}
          onChangeText={(val) => onChangeField("fullName", val)}
          placeholder="e.g. Rahul Sharma"
          placeholderTextColor="#94A3B8"
          autoCapitalize="words"
          autoCorrect={false}
        />
        {errors.fullName ? (
          <Text style={styles.errorText}>{errors.fullName}</Text>
        ) : null}
      </View>

      {/* Mobile - Mandatory */}
      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>
          Mobile Number <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.mobile && styles.inputError]}
          value={data.mobile}
          onChangeText={handleMobileChange}
          placeholder="10-digit mobile number"
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
        />
        {errors.mobile ? (
          <Text style={styles.errorText}>{errors.mobile}</Text>
        ) : null}
      </View>

      {/* Email - Conditional */}
      <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>
          Email Address {reqs.requireEmail && <Text style={styles.requiredStar}>*</Text>}
        </Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={data.email}
          onChangeText={(val) => onChangeField("email", val.trim())}
          placeholder="e.g. rahul.sharma@example.com"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : reqs.requireEmail ? null : (
          <Text style={styles.helperText}>Optional</Text>
        )}
      </View>

      {/* PAN & Aadhaar - Conditional */}
      <View style={styles.twoColRow}>
        <View style={[styles.col, styles.fieldWrapper]}>
          <Text style={styles.fieldLabel}>
            PAN Number {reqs.requirePan && <Text style={styles.requiredStar}>*</Text>}
          </Text>
          <TextInput
            style={[styles.input, errors.pan && styles.inputError]}
            value={data.pan}
            onChangeText={handlePanChange}
            placeholder="ABCDE1234F"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
            autoCorrect={false}
          />
          {errors.pan ? (
            <Text style={styles.errorText}>{errors.pan}</Text>
          ) : null}
        </View>

        {reqs.showAadhaar === false ? null : (
          <View style={[styles.col, styles.fieldWrapper]}>
            <Text style={styles.fieldLabel}>
              Aadhaar Number {reqs.requireAadhaar && <Text style={styles.requiredStar}>*</Text>}
            </Text>
            <TextInput
              style={[styles.input, errors.aadhaar && styles.inputError]}
              value={data.aadhaar}
              onChangeText={handleAadhaarChange}
              placeholder="12 digits"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
            />
            {errors.aadhaar ? (
              <Text style={styles.errorText}>{errors.aadhaar}</Text>
            ) : null}
          </View>
        )}
      </View>

      {/* Date of Birth - Conditional */}
      <View style={styles.fieldWrapper}>
        <UniversalDatePicker
          label={`Date of Birth${reqs.requireDob ? " *" : ""}`}
          value={data.dob}
          onChange={(val) => onChangeField("dob", val)}
          required={Boolean(reqs.requireDob)}
          placeholder="DD-MM-YYYY"
          valueFormat="DD-MM-YYYY"
          allowManualEntry
          maximumDate={new Date()}
          error={errors.dob}
          helperText="Applicant must be 18 or older"
        />
      </View>
    </View>
  );
};

export default CustomerIdentitySection;
