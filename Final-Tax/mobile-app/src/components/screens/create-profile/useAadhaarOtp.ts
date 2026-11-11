import { useState, useEffect, useMemo, useRef } from "react";
import { Alert, Keyboard } from "react-native";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

export interface UseAadhaarOtpOptions {
  aadhaarNumber: string;
  onVerificationSuccess?: () => void;
  onClearAadhaarError?: () => void;
  onSetAadhaarError?: (error: string) => void;
}

export function useAadhaarOtp({
  aadhaarNumber,
  onVerificationSuccess,
  onClearAadhaarError,
  onSetAadhaarError,
}: UseAadhaarOtpOptions) {
  const [isAadhaarOtpSent, setIsAadhaarOtpSent] = useState(false);
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [aadhaarOtpTimer, setAadhaarOtpTimer] = useState(0);
  const [aadhaarOtpError, setAadhaarOtpError] = useState<string | null>(null);

  // Validate Indian Aadhaar: exactly 12 digits, cannot start with 0 or 1
  const isAadhaarValid = useMemo(() => {
    try {
      const clean = (aadhaarNumber || "").replace(/\D/g, "");
      return clean.length === 12 && /^[2-9]{1}[0-9]{11}$/.test(clean);
    } catch (err) {
      logger.error("Error validating Aadhaar format", { error: getErrorMessage(err) });
      return false;
    }
  }, [aadhaarNumber]);

  // Button next to Aadhaar field is enabled when the number is valid and not yet verified
  const isOtpButtonEnabled = useMemo(
    () => isAadhaarValid && !isAadhaarVerified,
    [isAadhaarValid, isAadhaarVerified]
  );

  // 2-minute countdown timer (120 seconds down to 0)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    try {
      if (isAadhaarOtpSent && aadhaarOtpTimer > 0 && !isAadhaarVerified) {
        interval = setInterval(() => {
          try {
            setAadhaarOtpTimer((current) => {
              if (current <= 1) {
                if (interval) clearInterval(interval);
                return 0;
              }
              return current - 1;
            });
          } catch (intervalErr) {
            logger.error("Aadhaar timer interval step failed", { error: getErrorMessage(intervalErr) });
          }
        }, 1000);
      }
    } catch (effectErr) {
      logger.error("Failed to setup Aadhaar countdown timer", { error: getErrorMessage(effectErr) });
    }

    return () => {
      try {
        if (interval) clearInterval(interval);
      } catch (cleanupErr) {
        logger.error("Failed to clear Aadhaar timer interval", { error: getErrorMessage(cleanupErr) });
      }
    };
  }, [isAadhaarOtpSent, aadhaarOtpTimer > 0, isAadhaarVerified]);

  const formatOtpTime = (seconds: number): string => {
    try {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    } catch (err) {
      logger.error("Error formatting OTP countdown", { error: getErrorMessage(err) });
      return "00:00";
    }
  };

  const handleSendAadhaarOtp = () => {
    try {
      const clean = (aadhaarNumber || "").replace(/\D/g, "");
      if (clean.length !== 12) {
        Alert.alert("Invalid Aadhaar", "Please enter a complete 12-digit Aadhaar number first.");
        onSetAadhaarError?.("Aadhaar must be 12 digits");
        return;
      }
      if (!/^[2-9]{1}[0-9]{11}$/.test(clean)) {
        Alert.alert("Invalid Aadhaar", "Aadhaar number cannot start with 0 or 1.");
        onSetAadhaarError?.("Invalid Aadhaar (must start with 2-9)");
        return;
      }

      onClearAadhaarError?.();
      setAadhaarOtpError(null);
      setAadhaarOtp("");
      setIsAadhaarOtpSent(true);
      setAadhaarOtpTimer(120);

      Alert.alert(
        "Aadhaar OTP Sent",
        "A 6-digit mock OTP has been sent for Aadhaar verification.\n\nEnter mock OTP: 123456\n(Valid for 2 minutes)"
      );
    } catch (err) {
      logger.error("Failed in handleSendAadhaarOtp", { error: getErrorMessage(err) });
      setAadhaarOtpError("Unable to send OTP. Please try again.");
    }
  };

  const handleResendAadhaarOtp = () => {
    try {
      setAadhaarOtp("");
      setAadhaarOtpError(null);
      setAadhaarOtpTimer(120);
      Alert.alert(
        "Aadhaar OTP Resent",
        "A new 6-digit mock OTP has been sent for Aadhaar verification.\n\nEnter mock OTP: 123456\n(Valid for 2 minutes)"
      );
    } catch (err) {
      logger.error("Failed in handleResendAadhaarOtp", { error: getErrorMessage(err) });
      setAadhaarOtpError("Unable to resend OTP. Please try again.");
    }
  };

  const handleVerifyAadhaarOtp = (explicitOtp?: string) => {
    try {
      const code = explicitOtp !== undefined ? explicitOtp : aadhaarOtp;
      if (!code || code.length !== 6) {
        setAadhaarOtpError("Please enter all 6 digits of the OTP.");
        return;
      }
      if (aadhaarOtpTimer <= 0) {
        setAadhaarOtpError("OTP has expired. Please tap 'Resend OTP' to receive a new code.");
        return;
      }
      if (code === "123456") {
        setIsAadhaarVerified(true);
        setAadhaarOtpError(null);
        onClearAadhaarError?.();
        Keyboard.dismiss();
        Alert.alert("Aadhaar Verified", "Your Aadhaar number has been verified successfully!");
        onVerificationSuccess?.();
      } else {
        setAadhaarOtpError("Invalid OTP. For testing, please enter 123456.");
      }
    } catch (err) {
      logger.error("Failed in handleVerifyAadhaarOtp", { error: getErrorMessage(err) });
      setAadhaarOtpError("Verification error occurred. Please try again.");
    }
  };

  const handleAadhaarOtpChange = (newVal: string) => {
    try {
      const clean = newVal.replace(/\D/g, "").slice(0, 6);
      setAadhaarOtp(clean);
      if (aadhaarOtpError) {
        setAadhaarOtpError(null);
      }
      if (clean.length === 6) {
        handleVerifyAadhaarOtp(clean);
      }
    } catch (err) {
      logger.error("Failed in handleAadhaarOtpChange", { error: getErrorMessage(err) });
    }
  };

  const resetAadhaarVerification = () => {
    try {
      setIsAadhaarVerified(false);
      setIsAadhaarOtpSent(false);
      setAadhaarOtp("");
      setAadhaarOtpError(null);
      setAadhaarOtpTimer(0);
    } catch (err) {
      logger.error("Failed in resetAadhaarVerification", { error: getErrorMessage(err) });
    }
  };

  return {
    isAadhaarValid,
    isOtpButtonEnabled,
    isAadhaarOtpSent,
    isAadhaarVerified,
    aadhaarOtp,
    aadhaarOtpTimer,
    aadhaarOtpError,
    handleSendAadhaarOtp,
    handleResendAadhaarOtp,
    handleVerifyAadhaarOtp,
    handleAadhaarOtpChange,
    resetAadhaarVerification,
    formatOtpTime,
  };
}
