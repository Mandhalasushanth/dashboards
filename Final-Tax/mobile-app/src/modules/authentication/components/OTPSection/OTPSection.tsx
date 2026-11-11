import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useTheme } from "../../../../hooks/use-theme";
import { PrimaryButton } from "../../../../shared/components/Button/PrimaryButton";
import { LockoutNotice } from "../LockoutNotice";
import { useCountdown } from "../../hooks/useCountdown";
import { useOtpDigits } from "../../hooks/useOtpDigits";
import { OTP_LENGTH } from "../../hooks/otpDigits";
import { formatCountdown } from "../../services/lockoutPolicy";
import { styles, getThemedStyles } from "./OTPSection.styles";

interface OTPSectionProps {
  otp: string;
  onChangeOtp: (text: string) => void;
  onVerify: (code?: string) => void;
  onResend: () => void;
  timer: number;
  canResend: boolean;
  loading: boolean;
  error?: string | null;
  verifyButtonTitle?: string;
  /** Epoch ms until which verification (and new codes) are locked by the server. */
  lockoutUntil?: number | null;
}

export function OTPSection({
  otp,
  onChangeOtp,
  onVerify,
  onResend,
  timer,
  canResend,
  loading,
  error,
  verifyButtonTitle = "Verify OTP",
  lockoutUntil,
}: OTPSectionProps) {
  const colors = useTheme();
  const lockRemaining = useCountdown(lockoutUntil);
  const locked = lockRemaining > 0;
  const themed = getThemedStyles(colors);
  const otpDigits = useOtpDigits({ otp, onChangeOtp, locked });

  // Each box is its own input, so any single digit can be tapped and replaced. A multi-digit
  // paste or SMS autofill into any box is spread over the boxes by the digit-editing rules.
  const renderOtpBoxes = () => {
    return otpDigits.digits.map((char, i) => (
      <TextInput
        key={i}
        ref={otpDigits.setBoxRef(i)}
        value={char}
        onChangeText={(text) => otpDigits.handleChangeText(i, text)}
        onKeyPress={(e) => otpDigits.handleKeyPress(i, e.nativeEvent.key)}
        onFocus={() => otpDigits.handleFocus(i)}
        onBlur={() => otpDigits.handleBlur(i)}
        keyboardType="number-pad"
        maxLength={1}
        selectTextOnFocus
        editable={!locked}
        textContentType={i === 0 ? "oneTimeCode" : "none"}
        autoComplete={i === 0 ? "one-time-code" : "off"}
        accessibilityLabel={`Digit ${i + 1} of ${OTP_LENGTH}`}
        style={[
          styles.otpBox,
          styles.otpBoxText,
          styles.otpBoxInput,
          themed.otpBoxText,
          themed.getOtpBoxStyle(i === otpDigits.currentIndex, error),
        ]}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.otpGrid} accessibilityLabel="One-time password, 6 digits">
        {renderOtpBoxes()}
      </View>

      <LockoutNotice kind="otp-verify" remainingSeconds={lockRemaining} />

      {error ? <Text style={[styles.error, themed.error]}>{error}</Text> : null}

      <PrimaryButton
        title={verifyButtonTitle}
        onPress={() => onVerify(otp)}
        loading={loading}
        disabled={loading || locked || otp.length !== 6}
        colorType="orange"
        style={styles.verifyBtn}
      />

      <View style={styles.resendContainer}>
        {locked ? null : timer > 0 ? (
          <Text style={[styles.resendText, themed.resendText]}>
            Resend code in{" "}
            <Text style={themed.timerText}>{formatCountdown(timer)}</Text>
          </Text>
        ) : (
          <TouchableOpacity onPress={onResend} disabled={!canResend} activeOpacity={0.7}>
            <Text style={styles.resendLink}>Resend OTP</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default OTPSection;
