import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useTheme } from "../../../../hooks/use-theme";
import { PrimaryButton } from "../../../../shared/components/Button/PrimaryButton";
import { styles, getThemedStyles } from "./MobileNumberSection.styles";
import { applyMobileInput } from "../../validation/mobileNumber";
import { validateLoginPhone } from "../../validation/authSchema";

interface MobileNumberSectionProps {
  mobile: string;
  onChangeMobile: (t: string) => void;
  onSubmit: () => void;
  isReadOnly: boolean;
  onChangeNumber?: () => void;
  loading: boolean;
  error?: string | null;
  showContinueButton?: boolean;
}

export function MobileNumberSection({
  mobile,
  onChangeMobile,
  onSubmit,
  isReadOnly,
  onChangeNumber,
  loading,
  error,
  showContinueButton = true,
}: MobileNumberSectionProps) {
  const colors = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);

  let entryError: string | undefined;
  if (!isReadOnly) {
    if (mobile.length > 0 && !/^[6-9]/.test(mobile)) {
      entryError = "Mobile number must start with 6, 7, 8, or 9";
    } else if (hasBlurred && mobile.length > 0 && mobile.length < 10) {
      entryError = "Mobile number must be exactly 10 digits";
    } else if (mobile.length >= 10) {
      entryError = validateLoginPhone(mobile).error;
    }
  }

  const shownError = error || entryError;
  const themed = getThemedStyles(colors, isFocused, isReadOnly, shownError);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, themed.label]}>Mobile Number</Text>
        {isReadOnly && onChangeNumber ? (
          <TouchableOpacity
            onPress={onChangeNumber}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.changeNumberBtn}
          >
            <Text style={styles.changeNumberText}>Change Number</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={[styles.phoneRow, isReadOnly && styles.disabledField]}>
        <View style={[styles.codeBox, themed.codeBox]}>
          <Text style={[styles.codeText, themed.codeText]}>
            +91
          </Text>
        </View>

        <TextInput
          value={mobile}
          editable={!isReadOnly && !loading}
          onChangeText={(t) => onChangeMobile(applyMobileInput(mobile, t))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setHasBlurred(true);
          }}
          placeholder="Enter 10-digit mobile number"
          placeholderTextColor={colors.textSecondary}
          keyboardType="phone-pad"
          maxLength={10}
          style={[styles.input, themed.input]}
        />
      </View>

      {shownError ? <Text style={[styles.error, themed.error]}>{shownError}</Text> : null}

      {showContinueButton ? (
        <PrimaryButton
          title="Continue"
          onPress={onSubmit}
          loading={loading}
          disabled={loading || !validateLoginPhone(mobile).valid}
          colorType="orange"
          style={styles.continueBtn}
        />
      ) : null}
    </View>
  );
}

export default MobileNumberSection;
