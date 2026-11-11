import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import { PersonalDetails } from "../../../../types/customerIncome.types";
import {
  cleanPan,
  cleanAadhaar,
  cleanMobile,
  cleanPinCode,
} from "../../../../utils/tdsValidation";
import { sanitizeNameInput, sanitizeNameOnBlur } from "@/shared/validators/nameValidator";
import { styles } from "../TdsRefundPersonalInfoCard.styles";

export interface TdsRefundPersonalInfoEditFormProps {
  editForm: PersonalDetails;
  editErrors: Record<string, string>;
  isSaving: boolean;
  updateEditField: (field: keyof PersonalDetails, val: string) => void;
  handleCancelEdit: () => void;
  handleSave: () => void;
  onBlurField?: (field: keyof PersonalDetails) => void;
}

export const TdsRefundPersonalInfoEditForm: React.FC<TdsRefundPersonalInfoEditFormProps> = ({
  editForm,
  editErrors,
  isSaving,
  updateEditField,
  handleCancelEdit,
  handleSave,
  onBlurField,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.headerBadge}>
            <Ionicons name="create-outline" size={16} color={BrandColors.PRIMARY_BLUE} />
          </View>
          <Text style={styles.cardTitle}>Edit Personal Information</Text>
        </View>
      </View>

      <View style={styles.editFormContainer}>
        {/* Full Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Full Name (as per PAN) <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={[styles.textInput, editErrors.fullName ? styles.textInputError : null]}
            placeholder="Enter full name"
            placeholderTextColor="#94A3B8"
            value={editForm.fullName}
            onChangeText={(t) => updateEditField("fullName", sanitizeNameInput(t))}
            onBlur={() => {
              if (editForm.fullName) {
                updateEditField("fullName", sanitizeNameOnBlur(editForm.fullName));
              }
              onBlurField?.("fullName");
            }}
            maxLength={50}
          />
          {editErrors.fullName && (
            <Text style={styles.fieldErrorText}>{editErrors.fullName}</Text>
          )}
        </View>

        {/* PAN & Aadhaar */}
        <View style={styles.fieldRow}>
          <View style={[styles.fieldGroup, styles.fieldRowItem]}>
            <Text style={styles.fieldLabel}>
              PAN Number <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, editErrors.pan ? styles.textInputError : null]}
              placeholder="Enter PAN"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              value={editForm.pan}
              onChangeText={(t) => updateEditField("pan", cleanPan(t))}
              onBlur={() => onBlurField?.("pan")}
            />
            {editErrors.pan && (
              <Text style={styles.fieldErrorText}>{editErrors.pan}</Text>
            )}
          </View>

          <View style={[styles.fieldGroup, styles.fieldRowItem]}>
            <Text style={styles.fieldLabel}>Aadhaar Number</Text>
            <TextInput
              style={[styles.textInput, editErrors.aadhaar ? styles.textInputError : null]}
              placeholder="Enter Aadhaar"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={editForm.aadhaar}
              onChangeText={(t) => updateEditField("aadhaar", cleanAadhaar(t))}
              onBlur={() => onBlurField?.("aadhaar")}
            />
            {editErrors.aadhaar && (
              <Text style={styles.fieldErrorText}>{editErrors.aadhaar}</Text>
            )}
          </View>
        </View>

        {/* Date of Birth */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Date of Birth <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={[styles.textInput, editErrors.dob ? styles.textInputError : null]}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#94A3B8"
            value={editForm.dob}
            onChangeText={(t) => updateEditField("dob", t)}
            onBlur={() => onBlurField?.("dob")}
          />
          {editErrors.dob && (
            <Text style={styles.fieldErrorText}>{editErrors.dob}</Text>
          )}
        </View>

        {/* Mobile & Email */}
        <View style={styles.fieldRow}>
          <View style={[styles.fieldGroup, styles.fieldRowItem]}>
            <Text style={styles.fieldLabel}>
              Mobile Number <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, editErrors.mobileNumber ? styles.textInputError : null]}
              placeholder="Enter mobile"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={editForm.mobileNumber}
              onChangeText={(t) => updateEditField("mobileNumber", cleanMobile(t))}
              onBlur={() => onBlurField?.("mobileNumber")}
              maxLength={10}
            />
            {editErrors.mobileNumber && (
              <Text style={styles.fieldErrorText}>{editErrors.mobileNumber}</Text>
            )}
          </View>

          <View style={[styles.fieldGroup, styles.fieldRowItem]}>
            <Text style={styles.fieldLabel}>
              Email Address <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, editErrors.email ? styles.textInputError : null]}
              placeholder="Enter email"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={editForm.email}
              onChangeText={(t) => updateEditField("email", t)}
              onBlur={() => onBlurField?.("email")}
            />
            {editErrors.email && (
              <Text style={styles.fieldErrorText}>{editErrors.email}</Text>
            )}
          </View>
        </View>

        {/* Residential Address */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Residential Address <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={[styles.textInput, editErrors.residentialAddress ? styles.textInputError : null]}
            placeholder="Enter address"
            placeholderTextColor="#94A3B8"
            value={editForm.residentialAddress}
            onChangeText={(t) => updateEditField("residentialAddress", t)}
            onBlur={() => onBlurField?.("residentialAddress")}
          />
          {editErrors.residentialAddress && (
            <Text style={styles.fieldErrorText}>{editErrors.residentialAddress}</Text>
          )}
        </View>

        {/* City, State & PIN */}
        <View style={styles.fieldRow}>
          <View style={[styles.fieldGroup, styles.fieldRowItem]}>
            <Text style={styles.fieldLabel}>
              City <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, editErrors.city ? styles.textInputError : null]}
              placeholder="Enter city"
              placeholderTextColor="#94A3B8"
              value={editForm.city}
              onChangeText={(t) => updateEditField("city", t)}
              onBlur={() => onBlurField?.("city")}
            />
            {editErrors.city && (
              <Text style={styles.fieldErrorText}>{editErrors.city}</Text>
            )}
          </View>

          <View style={[styles.fieldGroup, styles.fieldRowItem]}>
            <Text style={styles.fieldLabel}>
              State <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, editErrors.state ? styles.textInputError : null]}
              placeholder="Enter state"
              placeholderTextColor="#94A3B8"
              value={editForm.state}
              onChangeText={(t) => updateEditField("state", t)}
              onBlur={() => onBlurField?.("state")}
            />
            {editErrors.state && (
              <Text style={styles.fieldErrorText}>{editErrors.state}</Text>
            )}
          </View>

          <View style={[styles.fieldGroup, styles.fieldRowItem]}>
            <Text style={styles.fieldLabel}>
              PIN <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, editErrors.pinCode ? styles.textInputError : null]}
              placeholder="Enter PIN"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={editForm.pinCode}
              onChangeText={(t) => updateEditField("pinCode", cleanPinCode(t))}
              onBlur={() => onBlurField?.("pinCode")}
              maxLength={6}
            />
            {editErrors.pinCode && (
              <Text style={styles.fieldErrorText}>{editErrors.pinCode}</Text>
            )}
          </View>
        </View>

        {/* Cancel and Save Actions */}
        <View style={styles.editActionsRow}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleCancelEdit}
            disabled={isSaving}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={isSaving}
            style={[styles.saveButton, isSaving ? styles.saveButtonDisabled : null]}
          >
            {isSaving && <ActivityIndicator size="small" color="#FFFFFF" />}
            <Text style={styles.saveButtonText}>{isSaving ? "Saving..." : "Save"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

