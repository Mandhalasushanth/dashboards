import React from "react";
import { View, Text, TextInput } from "react-native";
import { CustomerFormErrors } from "../../validation/tdsCustomerSchema";
import { BusinessDetails } from "../../types/customerIncome.types";
import { styles } from "./TdsRefundFormScreen.styles";
import { SectionHeader } from "./TdsRefundFormSections.types";
import { TdsDocumentCard } from "../../components/documents";
import { sanitizeNameInput, sanitizeNameOnBlur } from "@/shared/validators/nameValidator";

interface BusinessDetailsSectionProps {
  business: BusinessDetails;
  errors: CustomerFormErrors;
  updateBusiness: (field: string, value: string) => void;
  documents?: any[];
  onUploadSuccess?: (id: string, payload: any) => void;
  onUploadError?: (id: string, errorMessage: string) => void;
  onRemove?: (id: string) => void;
  onBlurField?: (key: string) => void;
}

export const BusinessDetailsSection: React.FC<BusinessDetailsSectionProps> = ({
  business,
  errors,
  updateBusiness,
  documents,
  onUploadSuccess,
  onUploadError,
  onRemove,
  onBlurField,
}) => (
  <View style={styles.sectionCard}>
    <SectionHeader number={1} title="Business Details" />

    {/* Legal Name */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        Legal Name of Business (as per PAN) <Text style={styles.requiredAsterisk}>*</Text>
      </Text>
      <TextInput
        style={[styles.textInput, errors["business.legalName"] ? styles.textInputError : null]}
        placeholder="Enter Legal Name"
        placeholderTextColor="#94A3B8"
        value={business.legalName}
        onChangeText={(t) => updateBusiness("legalName", sanitizeNameInput(t))}
        onBlur={() => {
          if (business.legalName) {
            updateBusiness("legalName", sanitizeNameOnBlur(business.legalName));
          }
          onBlurField?.("business.legalName");
        }}
        maxLength={100}
      />
      {errors["business.legalName"] && (
        <Text style={styles.errorText}>{errors["business.legalName"]}</Text>
      )}
    </View>

    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        Business PAN <Text style={styles.requiredAsterisk}>*</Text>
      </Text>
      <View style={[styles.textInput, { flexDirection: "row", alignItems: "center", paddingHorizontal: 6 }, errors["business.pan"] ? styles.textInputError : null]}>
        <TextInput
          style={{ flex: 1, minHeight: 34, paddingVertical: 0, fontSize: 14, color: "#0F172A", paddingLeft: 6 }}
          placeholder="Enter Business PAN"
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
          value={business.pan}
          onChangeText={(t) => updateBusiness("pan", t.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          onBlur={() => onBlurField?.("business.pan")}
          maxLength={10}
        />
        {documents && documents.length > 0 && onUploadSuccess && onUploadError && onRemove && (
          <View style={{ marginLeft: 8 }}>
            <TdsDocumentCard
              item={documents[0]}
              variant="inline"
              onUploadSuccess={onUploadSuccess}
              onUploadError={onUploadError}
              onRemove={onRemove}
            />
          </View>
        )}
      </View>
      {errors["business.pan"] && (
        <Text style={styles.errorText}>{errors["business.pan"]}</Text>
      )}
    </View>

    {/* Aadhaar */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        Aadhaar Card Number <Text style={styles.requiredAsterisk}>*</Text>
      </Text>
      <View style={[styles.textInput, { flexDirection: "row", alignItems: "center", paddingHorizontal: 6 }, errors["business.aadhaar"] ? styles.textInputError : null]}>
        <TextInput
          style={{ flex: 1, minHeight: 34, paddingVertical: 0, fontSize: 14, color: "#0F172A", paddingLeft: 6 }}
          placeholder="Enter 12-digit Aadhaar Number"
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
          value={business.aadhaar}
          onChangeText={(t) => updateBusiness("aadhaar", t.replace(/[^0-9]/g, ""))}
          onBlur={() => onBlurField?.("business.aadhaar")}
          maxLength={12}
        />
        {documents && documents.length > 1 && onUploadSuccess && onUploadError && onRemove && (
          <View style={{ marginLeft: 8 }}>
            <TdsDocumentCard
              item={documents[1]}
              variant="inline"
              onUploadSuccess={onUploadSuccess}
              onUploadError={onUploadError}
              onRemove={onRemove}
            />
          </View>
        )}
      </View>
      {errors["business.aadhaar"] && (
        <Text style={styles.errorText}>{errors["business.aadhaar"]}</Text>
      )}
    </View>

    {/* Mobile Number */}
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        Mobile Number <Text style={styles.requiredAsterisk}>*</Text>
      </Text>
      <TextInput
        style={[styles.textInput, errors["business.mobileNumber"] ? styles.textInputError : null]}
        placeholder="Enter 10-digit Mobile Number"
        placeholderTextColor="#94A3B8"
        keyboardType="number-pad"
        value={business.mobileNumber}
        onChangeText={(t) => updateBusiness("mobileNumber", t.replace(/[^0-9]/g, ""))}
        onBlur={() => onBlurField?.("business.mobileNumber")}
        maxLength={10}
      />
      {errors["business.mobileNumber"] && (
        <Text style={styles.errorText}>{errors["business.mobileNumber"]}</Text>
      )}
    </View>
  </View>
);
