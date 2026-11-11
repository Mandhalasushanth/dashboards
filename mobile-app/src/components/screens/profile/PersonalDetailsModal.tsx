import React from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "@/styles/app/(main)/profile.styles";
import type { PersonalFormState } from "./useProfileManager";
import { isPlaceholderCustomerName } from "@/modules/authentication/store/authStore.helpers";
import { ProfileModalHeader, formatProfileCode, formatProfileDate } from "./ProfileModalHeader";

const isMockEmail = (email?: string | null): boolean => {
  if (!email || email.trim() === "") return true;
  return /^\d{10}@finsolz\.in$/i.test(email.trim()) || email.toLowerCase().endsWith("@finsolz.in");
};

interface PersonalDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  colors: any;
  fetchingPersonal: boolean;
  isEditingPersonal: boolean;
  setIsEditingPersonal: (val: boolean) => void;
  savingPersonal: boolean;
  personalDetails: any;
  customer: any;
  personalForm: PersonalFormState;
  personalErrors: Record<string, string>;
  updatePersonalField: (field: keyof PersonalFormState, value: string) => void;
  handleSavePersonal: () => void;
  onCancelEdit: () => void;
  isProfileComplete?: boolean;
  onCompleteProfile?: () => void;
}

const EDITABLE_FIELDS: {
  field: keyof PersonalFormState;
  label: string;
  keyboardType: "default" | "email-address";
  autoCapitalize: "none" | "words";
  multiline: boolean;
}[] = [
  {
    field: "name",
    label: "Full Name",
    keyboardType: "default",
    autoCapitalize: "words",
    multiline: false,
  },
  {
    field: "email",
    label: "Email",
    keyboardType: "email-address",
    autoCapitalize: "none",
    multiline: false,
  },
  {
    field: "dob",
    label: "Date of Birth",
    keyboardType: "default",
    autoCapitalize: "words",
    multiline: false,
  },
  {
    field: "address",
    label: "Address",
    keyboardType: "default",
    autoCapitalize: "words",
    multiline: true,
  },
];

export function PersonalDetailsModal({
  visible,
  onClose,
  colors,
  fetchingPersonal,
  isEditingPersonal,
  setIsEditingPersonal,
  savingPersonal,
  personalDetails,
  customer,
  personalForm,
  personalErrors,
  updatePersonalField,
  handleSavePersonal,
  onCancelEdit,
  isProfileComplete = true,
  onCompleteProfile,
}: PersonalDetailsModalProps) {
  const displayAddress =
    personalDetails?.address ||
    customer?.address ||
    [
      personalDetails?.addressLine1,
      personalDetails?.city,
      personalDetails?.state,
      personalDetails?.pincode,
    ]
      .filter(Boolean)
      .join(", ") ||
    "Not provided";

  const rawEmail = personalDetails?.email || customer?.email;
  const cleanEmail = isMockEmail(rawEmail) ? "Not provided" : rawEmail;
  const rawName = personalDetails?.name || customer?.name;
  const cleanName = isPlaceholderCustomerName(rawName) ? "Not provided" : rawName;

  const readOnlyItems: [string, string][] = [
    ["Full Name", cleanName],
    ["Mobile", personalDetails?.mobileNumber || customer?.mobile || "N/A"],
    ["Email", cleanEmail],
    ["Date of Birth", formatProfileDate(personalDetails?.dob || customer?.dob)],
    [
      "Customer Type",
      formatProfileCode(personalDetails?.customerType || customer?.customerType) || "Individual",
    ],
    ["Address", displayAddress],
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <ProfileModalHeader
            title={isEditingPersonal ? "Edit Personal Details" : "Personal Details"}
            icon="person-outline"
            iconColor={colors.orange}
            iconBg="#FEF0E6"
            onClose={onClose}
            colors={colors}
          />

          {fetchingPersonal ? (
            <View style={styles.fetchingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text
                style={[styles.fetchingText, { color: colors.textSecondary }]}
              >
                Fetching personal details...
              </Text>
            </View>
          ) : !isProfileComplete ? (
            <View style={styles.incompleteModalBox}>
              <View style={[styles.incompleteIconCircle, { backgroundColor: "#FEF0E6" }]}>
                <Ionicons name="person-circle-outline" size={30} color={colors.orange} />
              </View>
              <Text style={[styles.incompleteTitle, { color: colors.text }]}>
                Profile Setup Incomplete
              </Text>
              <Text style={[styles.incompleteSubtitle, { color: colors.textSecondary }]}>
                You haven't completed your profile setup yet. Complete your profile to set up your personal details, access loans, and file taxes.
              </Text>

              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: colors.text }]}>
                    Setup Progress • Step 1 of 2 Complete
                  </Text>
                  <Text style={[styles.progressPercent, { color: colors.orange }]}>
                    50%
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { backgroundColor: colors.orange, width: "50%" },
                    ]}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.incompleteCard,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.incompleteRow}>
                  <Text style={[styles.infoKey, { color: colors.textSecondary }]}>Mobile Number</Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>
                      {personalDetails?.mobileNumber || customer?.mobile || "Registered"} ✓
                    </Text>
                  </View>
                </View>
                <View style={styles.incompleteRow}>
                  <Text style={[styles.infoKey, { color: colors.textSecondary }]}>Full Name</Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>Pending Setup</Text>
                  </View>
                </View>
                <View style={styles.incompleteRow}>
                  <Text style={[styles.infoKey, { color: colors.textSecondary }]}>Email Address</Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>Pending Setup</Text>
                  </View>
                </View>
                <View style={styles.incompleteRow}>
                  <Text style={[styles.infoKey, { color: colors.textSecondary }]}>Profile Status</Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>Action Required</Text>
                  </View>
                </View>
              </View>

              <View style={styles.personalActions}>
                <TouchableOpacity
                  style={[
                    styles.completeActionBtn,
                    { backgroundColor: colors.orange },
                  ]}
                  onPress={onCompleteProfile}
                >
                  <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.completeActionBtnText}>Complete Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <KeyboardAwareScrollView
              style={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
            >
              {isEditingPersonal ? (
                <View style={styles.modalBody}>
                  <Text
                    style={[
                      styles.readOnlyNote,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Mobile number and customer type cannot be changed here.
                  </Text>
                  {EDITABLE_FIELDS.map(
                    ({
                      field,
                      label,
                      keyboardType,
                      autoCapitalize,
                      multiline,
                    }) => (
                      <View key={field} style={styles.editField}>
                        <Text
                          style={[
                            styles.editLabel,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {label}
                        </Text>
                        <TextInput
                          value={personalForm[field]}
                          onChangeText={(text) =>
                            updatePersonalField(field, text)
                          }
                          style={[
                            styles.editInput,
                            {
                              color: colors.text,
                              borderColor: personalErrors[field]
                                ? colors.error
                                : colors.border,
                            },
                          ]}
                          keyboardType={keyboardType}
                          autoCapitalize={autoCapitalize}
                          multiline={multiline}
                        />
                        {personalErrors[field] ? (
                          <Text style={styles.fieldError}>
                            {personalErrors[field]}
                          </Text>
                        ) : null}
                      </View>
                    )
                  )}
                  {personalErrors.form ? (
                    <Text style={styles.formError}>{personalErrors.form}</Text>
                  ) : null}
                  <View style={styles.personalActions}>
                    <TouchableOpacity
                      style={styles.cancelEditButton}
                      onPress={onCancelEdit}
                      disabled={savingPersonal}
                    >
                      <Text
                        style={[
                          styles.cancelEditText,
                          { color: colors.text },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.saveEditButton,
                        { backgroundColor: colors.orange },
                      ]}
                      onPress={handleSavePersonal}
                      disabled={savingPersonal}
                    >
                      {savingPersonal ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.saveEditText}>Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.modalBody}>
                  {readOnlyItems.map(([label, value], index) => (
                    <View
                      key={label}
                      style={[styles.infoRow, index === readOnlyItems.length - 1 && styles.infoRowLast]}
                    >
                      <Text
                        style={[
                          styles.infoKey,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {label}
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        {value}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </KeyboardAwareScrollView>
          )}

          {isProfileComplete && !isEditingPersonal ? (
            <View style={styles.personalActions}>
              <TouchableOpacity
                style={[
                  styles.completeActionBtn,
                  { backgroundColor: colors.orange },
                ]}
                onPress={() => setIsEditingPersonal(true)}
              >
                <Ionicons name="pencil" size={16} color="#FFFFFF" />
                <Text style={styles.completeActionBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
