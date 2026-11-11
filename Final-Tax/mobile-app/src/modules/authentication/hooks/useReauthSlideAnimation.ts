import { useCallback, useState } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";

// Duration for the biometric → passcode slide transition (ms)
const SLIDE_DURATION = 380;
const HIDDEN_OFFSET = 320;

/**
 * Biometric ↔ passcode slide used by the BIOMETRIC_REAUTH screen state.
 * Owns only the visual transition; authentication itself stays with the screen.
 */
export function useReauthSlideAnimation() {
  // Whether the passcode section is currently shown (after biometric dismissal)
  const [passcodeVisible, setPasscodeVisible] = useState(false);
  const [biometricDismissed, setBiometricDismissed] = useState(false);
  // Whether passcode auto-focus is allowed (only after the slide animation finishes)
  const [passcodeAutoFocus, setPasscodeAutoFocus] = useState(false);

  // Reanimated shared values for biometric ↔ passcode slide
  const biometricAreaY = useSharedValue(0); // starts at natural position
  const passcodeAreaY = useSharedValue(HIDDEN_OFFSET); // starts below the viewport

  const biometricAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: biometricAreaY.value }],
    opacity: withTiming(biometricAreaY.value === 0 ? 1 : 0, { duration: SLIDE_DURATION }),
  }));

  const passcodeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: passcodeAreaY.value }],
    opacity: withTiming(passcodeAreaY.value < 100 ? 1 : 0, { duration: SLIDE_DURATION }),
  }));

  /** Biometric area at top, passcode hidden — the state BIOMETRIC_REAUTH starts in. */
  const resetToBiometric = () => {
    setPasscodeVisible(false);
    setBiometricDismissed(false);
    setPasscodeAutoFocus(false);
    biometricAreaY.value = 0;
    passcodeAreaY.value = HIDDEN_OFFSET;
  };

  // ─── Slide transition: biometric → passcode ───────────────────────────────
  const slideToPasscode = useCallback(() => {
    // Animate biometric area sliding down
    biometricAreaY.value = withTiming(HIDDEN_OFFSET, {
      duration: SLIDE_DURATION,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });

    // Animate passcode area sliding up (with slight delay for staggered feel)
    passcodeAreaY.value = withDelay(
      80,
      withTiming(0, {
        duration: SLIDE_DURATION,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      }, (finished) => {
        if (finished) {
          // After animation: show passcode and enable auto-focus
          runOnJS(setBiometricDismissed)(true);
          runOnJS(setPasscodeVisible)(true);
          runOnJS(setPasscodeAutoFocus)(true);
        }
      })
    );

    // Mount the passcode section immediately so it animates in
    setPasscodeVisible(true);
  }, []);

  return {
    passcodeVisible,
    biometricDismissed,
    passcodeAutoFocus,
    setPasscodeAutoFocus,
    biometricAnimStyle,
    passcodeAnimStyle,
    resetToBiometric,
    slideToPasscode,
  };
}

export default useReauthSlideAnimation;
