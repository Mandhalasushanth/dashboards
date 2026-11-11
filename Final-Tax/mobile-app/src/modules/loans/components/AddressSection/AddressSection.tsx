import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Dropdown } from "@/shared/components/Dropdown";
import { INDIAN_STATES_AND_UTS } from "@/components/screens/create-profile/types";
import type {
  LoanKycData,
  LoanKycAddress,
  LoanKycErrors,
} from "../../types/loanKyc.types";
import { styles } from "./AddressSection.styles";

const STATE_OPTIONS: string[] = [...INDIAN_STATES_AND_UTS];

interface AddressSectionProps {
  data: LoanKycData;
  errors: LoanKycErrors;
  onChangeCurrentAddress: (field: keyof LoanKycAddress, value: string) => void;
  onChangePermanentAddress: (field: keyof LoanKycAddress, value: string) => void;
  onTogglePermanentSame: (isSame: boolean) => void;
  isLocked?: boolean;
}

export const AddressSection: React.FC<AddressSectionProps> = ({
  data,
  errors,
  onChangeCurrentAddress,
  onChangePermanentAddress,
  onTogglePermanentSame,
  isLocked = false,
}) => {
  const current = data.currentAddress;
  const permanent = data.permanentAddress;

  const handlePincodeChange = (
    text: string,
    handler: (field: keyof LoanKycAddress, value: string) => void
  ) => {
    const value = text.trim();
    const clean = /^\d{3}[\s-]\d{3}$/.test(value)
      ? value.replace(/\D/g, "")
      : text;
    handler("pincode", clean);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, isLocked && { backgroundColor: "#EAF1FE" }]}>
            <Ionicons
              name={isLocked ? "lock-closed" : "location-outline"}
              size={18}
              color={isLocked ? "#083B75" : "#EA580C"}
            />
          </View>
          <Text style={styles.title}>
            {isLocked ? "Verified Address Details" : "Address Details"}
          </Text>
        </View>
      </View>

      {isLocked ? (
        <View style={styles.lockNoteRow}>
          <Ionicons name="information-circle-outline" size={14} color="#64748B" />
          <Text style={styles.lockNoteText}>
            Address details fetched from verified KYC records cannot be edited.
          </Text>
        </View>
      ) : (
        <Text style={styles.subtitle}>
          Provide your current communication and permanent address for lender verification.
        </Text>
      )}

      <Text style={styles.sectionSubHeader}>Current Address</Text>

      {/* House / Flat Number */}
      <View style={styles.fieldWrapper}>
        {isLocked ? (
          <>
            <View style={styles.lockedLabelRow}>
              <Text style={styles.fieldLabel}>House / Flat / Building</Text>
              <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
            </View>
            <View style={styles.lockedField}>
              <Text style={styles.lockedFieldValue}>{current.houseNumber || "—"}</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.fieldLabel}>
              House / Flat / Building <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors["currentAddress.houseNumber"] && styles.inputError,
              ]}
              value={current.houseNumber}
              onChangeText={(val) => onChangeCurrentAddress("houseNumber", val)}
              placeholder="e.g. Flat 402, Block B"
              placeholderTextColor="#94A3B8"
            />
            {errors["currentAddress.houseNumber"] ? (
              <Text style={styles.errorText}>
                {errors["currentAddress.houseNumber"]}
              </Text>
            ) : null}
          </>
        )}
      </View>

      {/* Street / Locality */}
      <View style={styles.fieldWrapper}>
        {isLocked ? (
          <>
            <View style={styles.lockedLabelRow}>
              <Text style={styles.fieldLabel}>Street / Locality / Landmark</Text>
              <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
            </View>
            <View style={styles.lockedField}>
              <Text style={styles.lockedFieldValue}>{current.street || "—"}</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.fieldLabel}>
              Street / Locality / Landmark <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors["currentAddress.street"] && styles.inputError,
              ]}
              value={current.street}
              onChangeText={(val) => onChangeCurrentAddress("street", val)}
              placeholder="e.g. MG Road, Near City Mall"
              placeholderTextColor="#94A3B8"
            />
            {errors["currentAddress.street"] ? (
              <Text style={styles.errorText}>{errors["currentAddress.street"]}</Text>
            ) : null}
          </>
        )}
      </View>

      {/* City & PIN Code */}
      <View style={styles.twoColRow}>
        <View style={[styles.col, styles.fieldWrapper]}>
          {isLocked ? (
            <>
              <View style={styles.lockedLabelRow}>
                <Text style={styles.fieldLabel}>City / District</Text>
                <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
              </View>
              <View style={styles.lockedField}>
                <Text style={styles.lockedFieldValue}>{current.city || "—"}</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.fieldLabel}>
                City / District <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors["currentAddress.city"] && styles.inputError,
                ]}
                value={current.city}
                onChangeText={(val) => onChangeCurrentAddress("city", val)}
                placeholder="e.g. Hyderabad"
                placeholderTextColor="#94A3B8"
              />
              {errors["currentAddress.city"] ? (
                <Text style={styles.errorText}>
                  {errors["currentAddress.city"]}
                </Text>
              ) : null}
            </>
          )}
        </View>

        <View style={[styles.col, styles.fieldWrapper]}>
          {isLocked ? (
            <>
              <View style={styles.lockedLabelRow}>
                <Text style={styles.fieldLabel}>PIN Code</Text>
                <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
              </View>
              <View style={styles.lockedField}>
                <Text style={styles.lockedFieldValue}>{current.pincode || "—"}</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.fieldLabel}>
                PIN Code <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors["currentAddress.pincode"] && styles.inputError,
                ]}
                value={current.pincode}
                onChangeText={(val) =>
                  handlePincodeChange(val, onChangeCurrentAddress)
                }
                placeholder="6 digits"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
              />
              {errors["currentAddress.pincode"] ? (
                <Text style={styles.errorText}>
                  {errors["currentAddress.pincode"]}
                </Text>
              ) : null}
            </>
          )}
        </View>
      </View>

      {/* State Dropdown */}
      <View style={styles.fieldWrapper}>
        {isLocked ? (
          <>
            <View style={styles.lockedLabelRow}>
              <Text style={styles.fieldLabel}>State</Text>
              <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
            </View>
            <Dropdown
              placeholder="Select State / UT"
              value={current.state}
              options={STATE_OPTIONS}
              onSelect={() => {}}
              disabled={true}
              error={errors["currentAddress.state"]}
            />
          </>
        ) : (
          <Dropdown
            label="State"
            required
            placeholder="Select State / UT"
            value={current.state}
            options={STATE_OPTIONS}
            onSelect={(val) => onChangeCurrentAddress("state", val)}
            error={errors["currentAddress.state"]}
          />
        )}
      </View>

      {/* Same as current toggle */}
      <View style={styles.toggleBox}>
        <View style={isLocked ? styles.lockedLabelRow : undefined}>
          <Text style={styles.toggleLabel}>
            Permanent Address same as Current Address?
          </Text>
          {isLocked && <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />}
        </View>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              data.isPermanentSameAsCurrent && styles.toggleBtnActive,
              isLocked && styles.toggleBtnDisabled,
            ]}
            activeOpacity={isLocked ? 1 : 0.8}
            disabled={isLocked}
            onPress={() => {
              if (!isLocked) onTogglePermanentSame(true);
            }}
          >
            <Text
              style={[
                styles.toggleBtnText,
                data.isPermanentSameAsCurrent && styles.toggleBtnTextActive,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              !data.isPermanentSameAsCurrent && styles.toggleBtnActive,
              isLocked && styles.toggleBtnDisabled,
            ]}
            activeOpacity={isLocked ? 1 : 0.8}
            disabled={isLocked}
            onPress={() => {
              if (!isLocked) onTogglePermanentSame(false);
            }}
          >
            <Text
              style={[
                styles.toggleBtnText,
                !data.isPermanentSameAsCurrent && styles.toggleBtnTextActive,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conditional Permanent Address Section */}
      {!data.isPermanentSameAsCurrent && (
        <View style={styles.permanentSection}>
          <Text style={styles.sectionSubHeader}>Permanent Address</Text>

          <View style={styles.fieldWrapper}>
            {isLocked ? (
              <>
                <View style={styles.lockedLabelRow}>
                  <Text style={styles.fieldLabel}>House / Flat / Building</Text>
                  <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
                </View>
                <View style={styles.lockedField}>
                  <Text style={styles.lockedFieldValue}>{permanent.houseNumber || "—"}</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.fieldLabel}>
                  House / Flat / Building <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    errors["permanentAddress.houseNumber"] && styles.inputError,
                  ]}
                  value={permanent.houseNumber}
                  onChangeText={(val) =>
                    onChangePermanentAddress("houseNumber", val)
                  }
                  placeholder="e.g. House No. 12"
                  placeholderTextColor="#94A3B8"
                />
                {errors["permanentAddress.houseNumber"] ? (
                  <Text style={styles.errorText}>
                    {errors["permanentAddress.houseNumber"]}
                  </Text>
                ) : null}
              </>
            )}
          </View>

          <View style={styles.fieldWrapper}>
            {isLocked ? (
              <>
                <View style={styles.lockedLabelRow}>
                  <Text style={styles.fieldLabel}>Street / Locality</Text>
                  <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
                </View>
                <View style={styles.lockedField}>
                  <Text style={styles.lockedFieldValue}>{permanent.street || "—"}</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.fieldLabel}>
                  Street / Locality <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    errors["permanentAddress.street"] && styles.inputError,
                  ]}
                  value={permanent.street}
                  onChangeText={(val) => onChangePermanentAddress("street", val)}
                  placeholder="e.g. Main Road"
                  placeholderTextColor="#94A3B8"
                />
                {errors["permanentAddress.street"] ? (
                  <Text style={styles.errorText}>
                    {errors["permanentAddress.street"]}
                  </Text>
                ) : null}
              </>
            )}
          </View>

          <View style={styles.twoColRow}>
            <View style={[styles.col, styles.fieldWrapper]}>
              {isLocked ? (
                <>
                  <View style={styles.lockedLabelRow}>
                    <Text style={styles.fieldLabel}>City / District</Text>
                    <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
                  </View>
                  <View style={styles.lockedField}>
                    <Text style={styles.lockedFieldValue}>{permanent.city || "—"}</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.fieldLabel}>
                    City / District <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors["permanentAddress.city"] && styles.inputError,
                    ]}
                    value={permanent.city}
                    onChangeText={(val) => onChangePermanentAddress("city", val)}
                    placeholder="City"
                    placeholderTextColor="#94A3B8"
                  />
                  {errors["permanentAddress.city"] ? (
                    <Text style={styles.errorText}>
                      {errors["permanentAddress.city"]}
                    </Text>
                  ) : null}
                </>
              )}
            </View>

            <View style={[styles.col, styles.fieldWrapper]}>
              {isLocked ? (
                <>
                  <View style={styles.lockedLabelRow}>
                    <Text style={styles.fieldLabel}>PIN Code</Text>
                    <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
                  </View>
                  <View style={styles.lockedField}>
                    <Text style={styles.lockedFieldValue}>{permanent.pincode || "—"}</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.fieldLabel}>
                    PIN Code <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors["permanentAddress.pincode"] && styles.inputError,
                    ]}
                    value={permanent.pincode}
                    onChangeText={(val) =>
                      handlePincodeChange(val, onChangePermanentAddress)
                    }
                    placeholder="6 digits"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                  />
                  {errors["permanentAddress.pincode"] ? (
                    <Text style={styles.errorText}>
                      {errors["permanentAddress.pincode"]}
                    </Text>
                  ) : null}
                </>
              )}
            </View>
          </View>

          <View style={styles.fieldWrapper}>
            {isLocked ? (
              <>
                <View style={styles.lockedLabelRow}>
                  <Text style={styles.fieldLabel}>State</Text>
                  <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
                </View>
                <Dropdown
                  placeholder="Select Permanent State / UT"
                  value={permanent.state}
                  options={STATE_OPTIONS}
                  onSelect={() => {}}
                  disabled={true}
                  error={errors["permanentAddress.state"]}
                />
              </>
            ) : (
              <Dropdown
                label="State"
                required
                placeholder="Select Permanent State / UT"
                value={permanent.state}
                options={STATE_OPTIONS}
                onSelect={(val) => onChangePermanentAddress("state", val)}
                error={errors["permanentAddress.state"]}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default AddressSection;
