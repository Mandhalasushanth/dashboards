import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "./AadhaarOtpModal.styles";

interface AadhaarOtpModalProps {
  visible: boolean;
  onVerifySuccess: () => void;
  onClose: () => void;
}

export const AadhaarOtpModal: React.FC<AadhaarOtpModalProps> = ({
  visible,
  onVerifySuccess,
  onClose,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onClose();
      onVerifySuccess();
    }, 1200);
  };

  const isComplete = otp.every((d) => d.length === 1);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconCircle}>
                  <Ionicons name="shield-checkmark" size={22} color="#059669" />
                </View>
                <View style={styles.headerTextGroup}>
                  <Text style={styles.title}>Aadhaar OTP Verification</Text>
                  <Text style={styles.subtitle}>
                    Enter the 6-digit OTP sent to Aadhaar-linked mobile (XXXX-XXXX-9421)
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={20} color="#0B1F3A" />
                </TouchableOpacity>
              </View>

              {/* 6 OTP Inputs */}
              <View style={styles.otpInputsRow}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={(ref) => { inputRefs.current[idx] = ref; }}
                    style={[
                      styles.otpBox,
                      digit ? styles.otpBoxFilled : null,
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val, idx)}
                    onKeyPress={(e) => handleKeyPress(e, idx)}
                  />
                ))}
              </View>

              {/* Resend Link */}
              <View style={styles.resendRow}>
                <Text style={styles.resendPrompt}>Didn't receive OTP? </Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.resendLink}>Resend OTP (30s)</Text>
                </TouchableOpacity>
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleVerify}
                disabled={!isComplete || isVerifying}
                style={[
                  styles.verifyButton,
                  (!isComplete || isVerifying) && styles.verifyButtonDisabled,
                ]}
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify & Complete Filing</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
