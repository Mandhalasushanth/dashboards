import React, { useRef, useEffect, useState } from "react";
import { View, Text, TextInput, type TextInputInstance, TouchableOpacity, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../../../hooks/use-theme";
import { PrimaryButton } from "../../../../shared/components/Button/PrimaryButton";
import { LockoutNotice } from "../LockoutNotice";
import { useCountdown } from "../../hooks/useCountdown";
import { styles, getThemedStyles } from "./PasscodeLoginSection.styles";

interface PasscodeLoginSectionProps {
  passcode: string;
  onChangePasscode: (code: string) => void;
  onLogin: () => void;
  onForgotPasscode: () => void;
  loading: boolean;
  error?: string | null;
  onBiometricLogin?: () => void;
  isBiometricEnabled?: boolean;
  biometricTypeLabel?: string;
  /** If false, suppresses the automatic keyboard focus on mount. Defaults to true. */
  autoFocus?: boolean;
  /** Epoch ms until which passcode login is locked by the server. */
  lockoutUntil?: number | null;
}

export function PasscodeLoginSection({
  passcode,
  onChangePasscode,
  onLogin,
  onForgotPasscode,
  loading,
  error,
  onBiometricLogin,
  isBiometricEnabled,
  biometricTypeLabel = "Biometrics",
  autoFocus = true,
  lockoutUntil,
}: PasscodeLoginSectionProps) {
  const colors = useTheme();
  const lockRemaining = useCountdown(lockoutUntil);
  const locked = lockRemaining > 0;
  const inputRef = useRef<TextInputInstance>(null);
  const themed = getThemedStyles(colors);
  const [showPasscode, setShowPasscode] = useState(false);

  useEffect(() => {
    if (!autoFocus) return;
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(t);
  }, [autoFocus]);

  const handleChangeText = (text: string) => {
    if (locked) return;
    const clean = text.replace(/[^0-9]/g, "");
    onChangePasscode(clean);
    if (clean.length === 6) {
      setTimeout(() => {
        onLogin();
      }, 50);
    }
  };

  const renderDots = () => {
    return Array.from({ length: 6 }).map((_, i) => {
      const isFilled = i < passcode.length;
      const isCurrent = i === passcode.length;
      const digit = passcode[i];
      return (
        <View
          key={i}
          style={[
            styles.dotBox,
            themed.getDotBoxStyle(isCurrent, error),
          ]}
        >
          {isFilled ? (
            showPasscode ? (
              <Text style={[styles.digitText, themed.digitText]}>{digit}</Text>
            ) : (
              <View style={styles.dot} />
            )
          ) : null}
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, themed.title]}>Enter 6-Digit Passcode</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setShowPasscode((prev) => !prev);
            inputRef.current?.focus();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.eyeBtn}
          accessibilityRole="button"
          accessibilityLabel={showPasscode ? "Hide Passcode" : "Show Passcode"}
        >
          <Ionicons
            name={showPasscode ? "eye-off-outline" : "eye-outline"}
            size={22}
            color={colors.textSecondary || "#64748B"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.touchable}>
        <TextInput
          ref={inputRef}
          value={passcode}
          onChangeText={handleChangeText}
          keyboardType="number-pad"
          maxLength={6}
          editable={!locked}
          caretHidden={true}
          style={styles.overlayInput}
          accessibilityLabel="6-digit Passcode"
        />
        <View style={styles.dotsRow} pointerEvents="none">{renderDots()}</View>
      </View>

      <View style={styles.forgotRow}>
        <TouchableOpacity onPress={onForgotPasscode} activeOpacity={0.7} style={styles.forgotBtn}>
          <Text style={styles.forgotText}>
            Forgot Passcode?
          </Text>
        </TouchableOpacity>
      </View>

      <LockoutNotice kind="passcode" remainingSeconds={lockRemaining} />

      {error ? <Text style={[styles.error, themed.error]}>{error}</Text> : null}

      <PrimaryButton
        title="Login"
        onPress={onLogin}
        loading={loading}
        disabled={loading || locked || passcode.length !== 6}
        colorType="orange"
        style={styles.loginBtn}
      />

      {isBiometricEnabled && onBiometricLogin && (
        <TouchableOpacity
          onPress={onBiometricLogin}
          activeOpacity={0.75}
          style={[styles.biometricBtn, themed.biometricBtn]}
        >
          <Ionicons
            name={
              (biometricTypeLabel || "").toLowerCase().includes("face")
                ? "scan-outline"
                : "finger-print-outline"
            }
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.biometricBtnText, themed.biometricBtnText]}>
            {`Login with ${biometricTypeLabel || "Biometrics"}`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default PasscodeLoginSection;

