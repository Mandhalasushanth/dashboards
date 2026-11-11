import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  type TextInputInstance,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PrimaryButton } from "../../../../shared/components/Button/PrimaryButton";
import { styles, getThemedStyles } from "./ResetPasscodeSection.styles";

interface ResetPasscodeSectionProps {
  passcode: string;
  confirmPasscode: string;
  onChangePasscode: (p: string) => void;
  onChangeConfirmPasscode: (cp: string) => void;
  onSubmit: () => void;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  submitButtonTitle?: string;
  loading: boolean;
  error?: string | null;
  mobileNumber?: string;
}

export function ResetPasscodeSection({
  passcode,
  confirmPasscode,
  onChangePasscode,
  onChangeConfirmPasscode,
  onSubmit,
  loading,
  error,
}: ResetPasscodeSectionProps) {
  const themed = getThemedStyles(false);

  const newPasscodeRef = useRef<TextInputInstance>(null);
  const confirmPasscodeRef = useRef<TextInputInstance>(null);
  const [activeSection, setActiveSection] = useState<"new" | "confirm">("new");
  const [showPasscode, setShowPasscode] = useState(false);
  const [showConfirmPasscode, setShowConfirmPasscode] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      newPasscodeRef.current?.focus();
    }, 150);
    return () => clearTimeout(t);
  }, []);

  const handleNewPasscodeChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, "");
    onChangePasscode(clean);
    if (clean.length === 6) {
      setTimeout(() => {
        confirmPasscodeRef.current?.focus();
        setActiveSection("confirm");
      }, 50);
    }
  };

  const handleConfirmPasscodeChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, "");
    onChangeConfirmPasscode(clean);
    if (clean.length === 6 && passcode === clean) {
      Keyboard.dismiss();
    }
  };

  const isPasscodeComplete = passcode.length === 6;
  const isConfirmComplete = confirmPasscode.length === 6;
  const doPasscodesMatch = passcode === confirmPasscode;

  const isFormValid = isPasscodeComplete && isConfirmComplete && doPasscodesMatch;
  const showMismatchError = isConfirmComplete && !doPasscodesMatch;

  const renderBoxes = (
    inputRef: React.RefObject<TextInputInstance | null>,
    value: string,
    isActive: boolean,
    hasError: boolean,
    showCode: boolean,
    onChangeText: (text: string) => void,
    onFocus: () => void,
    accessibilityLabel: string
  ) => {
    return (
      <View style={styles.boxesWrapper}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          keyboardType="number-pad"
          maxLength={6}
          caretHidden={true}
          style={styles.overlayInput}
          accessibilityLabel={accessibilityLabel}
        />
        <View style={styles.otpGrid} pointerEvents="none">
          {Array.from({ length: 6 }).map((_, i) => {
            const isFilled = i < value.length;
            const isCurrent = isActive && i === value.length;
            const boxTheme = themed.getBoxStyle(isCurrent, isFilled, hasError);
            const digit = value[i];

            return (
              <View
                key={i}
                style={[
                  styles.otpBox,
                  boxTheme,
                ]}
              >
                {isFilled ? (
                  showCode ? (
                    <Text style={styles.digitText}>{digit}</Text>
                  ) : (
                    <View
                      style={[
                        styles.secureDot,
                        themed.secureDot,
                      ]}
                    />
                  )
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. New Passcode Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, themed.title]}>
            New Passcode
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setShowPasscode((prev) => !prev);
              newPasscodeRef.current?.focus();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.eyeToggleBtn}
            accessibilityLabel={showPasscode ? "Hide passcode" : "Show passcode"}
          >
            <Ionicons
              name={showPasscode ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
        {renderBoxes(
          newPasscodeRef,
          passcode,
          activeSection === "new",
          false,
          showPasscode,
          handleNewPasscodeChange,
          () => setActiveSection("new"),
          "New Passcode, 6 digits"
        )}
      </View>

      {/* 2. Confirm Passcode Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, themed.title]}>
            Confirm Passcode
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setShowConfirmPasscode((prev) => !prev);
              confirmPasscodeRef.current?.focus();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.eyeToggleBtn}
            accessibilityLabel={showConfirmPasscode ? "Hide confirm passcode" : "Show confirm passcode"}
          >
            <Ionicons
              name={showConfirmPasscode ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
        {renderBoxes(
          confirmPasscodeRef,
          confirmPasscode,
          activeSection === "confirm",
          showMismatchError,
          showConfirmPasscode,
          handleConfirmPasscodeChange,
          () => setActiveSection("confirm"),
          "Confirm Passcode, 6 digits"
        )}
      </View>

      {/* Inline Validation Error Message */}
      {showMismatchError ? (
        <Text style={styles.inlineErrorText}>Passcodes do not match.</Text>
      ) : null}
      {error && !showMismatchError ? (
        <Text style={styles.inlineErrorText}>{error}</Text>
      ) : null}

      {/* Reset Passcode Button */}
      <PrimaryButton
        title="Reset Passcode"
        onPress={onSubmit}
        loading={loading}
        disabled={!isFormValid || loading}
        colorType="orange"
        style={styles.submitBtn}
      />
    </View>
  );
}

export default ResetPasscodeSection;
