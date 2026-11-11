import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import type { AuthFlowState } from "../types/auth.types";

interface UseAuthFlowTransitionOptions {
  authFlowState: AuthFlowState;
  otpTimer: number;
  decrementTimer: () => void;
}

/**
 * Per-state side effects of the standard auth flow:
 * the OTP resend countdown and the fade/slide-in of each new form state.
 */
export function useAuthFlowTransition({
  authFlowState,
  otpTimer,
  decrementTimer,
}: UseAuthFlowTransitionOptions) {
  // ─── Standard Animated.Value for flow transitions ─────────────────────────
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // ─── Timer interval ───────────────────────────────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const isOtpActive =
      authFlowState === "OTP_VERIFICATION" || authFlowState === "FORGOT_PASSCODE_OTP";
    if (isOtpActive && otpTimer > 0) {
      interval = setInterval(() => {
        decrementTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authFlowState, otpTimer]);

  // ─── Animate on non-biometric state transitions ───────────────────────────
  useEffect(() => {
    if (authFlowState === "BIOMETRIC_REAUTH") return; // handled separately
    fadeAnim.setValue(0.3);
    slideAnim.setValue(10);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [authFlowState]);

  return { fadeAnim, slideAnim };
}

export default useAuthFlowTransition;
