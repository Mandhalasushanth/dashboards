import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Keyboard,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Reanimated from "react-native-reanimated";
import { useTheme } from "../../../hooks/use-theme";
import { Spacing, BrandColors } from "../../../shared/theme";
import { useAuthStore } from "../store/authStore";
import { logger } from "@/core/logging/logger";
import {
  MobileNumberSection,
  PasscodeLoginSection,
  ErrorBanner,
  BiometricReauthCard,
  AuthFlowSections,
  AuthBrandHeader,
  ServerConfigHint,
} from "../components";
import { useReauthSlideAnimation } from "../hooks/useReauthSlideAnimation";
import { useAuthFlowTransition } from "../hooks/useAuthFlowTransition";
import { authStorage } from "../services/authStorage";
import { biometricService } from "../services/biometricService";
import { BiometricPromptModal } from "../../../shared/components/BiometricPromptModal";
import { ServerConfigModal } from "../../../shared/components/ServerConfigModal";
import {
  styles,
  reauthStyles,
  getThemedStyles,
  getDynamicScrollStyle,
} from "./AuthenticationScreen.styles";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

const HEADER_OFFSET = Spacing.md;
const FOOTER_OFFSET = Spacing.base;
const MIN_SCROLL_PADDING = Spacing.xl + Spacing.xs;

export function AuthenticationScreen() {
  const colors = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    isLoggedIn,
    authFlowState,
    mobileNumber,
    passcode,
    isLoading,
    error,
    otpTimer,
    passcodeLockoutUntil,
    refreshPasscodeLockout,
    resetLoginPresentation,
    setMobileNumber,
    setPasscode,
    setError,
    decrementTimer,
    sendOtp,
    verifyOtp,
    loginWithPasscode,
    startForgotPasscode,
    verifyForgotPasscodeOtp,
    resetPasscodeAndProceed,
    changeNumber,
    setAuthFlowState,
    isBiometricEnabled,
    syncFromDevAuth,
  } = useAuthStore();

  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricType, setBiometricType] = useState("Fingerprint");
  const [showServerModal, setShowServerModal] = useState(false);

  // BIOMETRIC REAUTH animation state
  const {
    passcodeVisible,
    biometricDismissed,
    passcodeAutoFocus,
    setPasscodeAutoFocus,
    biometricAnimStyle,
    passcodeAnimStyle,
    resetToBiometric,
    slideToPasscode: slideToBiometricDismissed,
  } = useReauthSlideAnimation();
  const reauthScrollRef = useRef<ScrollView>(null);

  // Guards: prevent duplicate biometric calls or navigations
  const hasBioTriggered = useRef(false);
  const hasNavigated = useRef(false);

  const navigateHomeOnce = () => {
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      router.replace("/(main)/home");
    }
  };

  const offerBiometricEnrollmentOrGoHome = async () => {
    try {
      const hasHardware = await biometricService.checkHardwareSupport();
      const isEnrolled = await biometricService.checkEnrollment();
      const isAlreadyEnabled = await biometricService.isBiometricEnabled();

      if (hasHardware && isEnrolled && !isAlreadyEnabled) {
        const typeLabel = await biometricService.getBiometricTypeLabel();
        setBiometricType(typeLabel);
        setShowBiometricModal(true);
        return;
      }
    } catch (err) {
      logger.debug("[AuthenticationScreen] Biometric enrollment check fallback:", { error: err });
    }
    navigateHomeOnce();
  };

  useEffect(() => {
    if (authFlowState === "BIOMETRIC_REAUTH") {
      hasBioTriggered.current = false;
      hasNavigated.current = false;
      resetToBiometric();
    }
  }, [authFlowState]);

  useEffect(() => {
    if (!passcodeVisible) return;
    const timer = setTimeout(() => {
      reauthScrollRef.current?.scrollToEnd({ animated: true });
    }, 500);
    return () => clearTimeout(timer);
  }, [passcodeVisible]);

  useFocusEffect(
    useCallback(() => {
      if (authFlowState !== "BIOMETRIC_REAUTH" || hasBioTriggered.current) {
        return undefined;
      }
      const timer = setTimeout(() => {
        if (hasBioTriggered.current) return;
        hasBioTriggered.current = true;
        handleBiometricReauth();
      }, 2900);
      return () => clearTimeout(timer);
    }, [authFlowState])
  );

  useEffect(() => {
    if ((authFlowState === "PASSCODE_LOGIN" || authFlowState === "BIOMETRIC_REAUTH") && mobileNumber) {
      refreshPasscodeLockout().catch((err) => {
        logger.debug("[AuthenticationScreen] Passcode lockout refresh failed", { error: getErrorMessage(err) });
      });
    }
  }, [authFlowState, mobileNumber, refreshPasscodeLockout]);

  useEffect(() => {
    if (
      isLoggedIn &&
      !showBiometricModal &&
      authFlowState !== "PASSCODE_LOGIN" &&
      authFlowState !== "BIOMETRIC_REAUTH" &&
      authFlowState !== "RESET_PASSCODE" &&
      authFlowState !== "FORGOT_PASSCODE_OTP"
    ) {
      navigateHomeOnce();
    }
  }, [isLoggedIn, showBiometricModal, authFlowState]);

  const { fadeAnim, slideAnim } = useAuthFlowTransition({
    authFlowState,
    otpTimer,
    decrementTimer,
  });

  const handleBiometricReauth = useCallback(async () => {
    try {
      const typeLabel = await biometricService.getBiometricTypeLabel().catch(() => "Biometrics");
      const authRes = await biometricService.authenticate({
        promptMessage: `Authenticate with ${typeLabel}`,
        disableDeviceFallback: true,
      });

      if (authRes.success) {
        resetLoginPresentation();
        const activeMobile = mobileNumber || authStorage.getSession().activeMobile;
        if (activeMobile) {
          authStorage.saveSession({
            isLoggedIn: true,
            activeMobile,
            lastLoginAt: new Date().toISOString(),
          });
          await useAuthStore.getState().fetchAndSyncProfile(activeMobile).catch(() => {});
          syncFromDevAuth();
        }
        navigateHomeOnce();
        return;
      }
      slideToBiometricDismissed();
    } catch {
      slideToBiometricDismissed();
    }
  }, [mobileNumber]);

  const handlePasscodeFromReauth = useCallback(async () => {
    const res = await loginWithPasscode();
    if (res.success) {
      setPasscodeAutoFocus(false);
      setPasscode("");
      Keyboard.dismiss();
      await offerBiometricEnrollmentOrGoHome();
    }
  }, [loginWithPasscode]);

  const handleMobileSubmit = async () => {
    await sendOtp();
  };

  const handleOtpVerify = async (code?: string) => {
    const res = await verifyOtp(code);
    if (res.success) {
      if (res.requiresPasscode) {
        setAuthFlowState("PASSCODE_LOGIN");
      } else {
        router.replace("/(main)/home");
      }
    }
  };

  const handleLoginSubmit = async () => {
    const res = await loginWithPasscode();
    if (res.success) {
      setPasscode("");
      Keyboard.dismiss();
      await offerBiometricEnrollmentOrGoHome();
    }
  };

  const handleEnableBiometric = async () => {
    setShowBiometricModal(false);
    try {
      const authRes = await biometricService.authenticate();
      if (authRes.success) {
        await useAuthStore.getState().setBiometricEnabled(true);
      }
    } catch (err) {
      logger.warn("[AuthenticationScreen] Biometric activation failed:", { error: err });
    }
    navigateHomeOnce();
  };

  const handleNotNowBiometric = () => {
    setShowBiometricModal(false);
    navigateHomeOnce();
  };

  const handleBiometricLogin = async () => {
    try {
      const typeLabel = await biometricService.getBiometricTypeLabel();
      const authRes = await biometricService.authenticate(`Authenticate with ${typeLabel}`);
      if (authRes.success) {
        resetLoginPresentation();
        const activeMobile = mobileNumber || authStorage.getSession().activeMobile;
        if (activeMobile) {
          authStorage.saveSession({
            isLoggedIn: true,
            activeMobile: activeMobile,
            lastLoginAt: new Date().toISOString(),
          });
          syncFromDevAuth();
          router.replace("/(main)/home");
        }
      } else if (!authRes?.cancelled && authRes?.error && authRes.error !== "Authentication cancelled") {
        setError(authRes.error);
      }
    } catch (e) {
      setError(getErrorMessage(e) || "Biometric authentication failed");
    }
  };

  const handleForgotPasscode = async () => {
    await startForgotPasscode();
  };

  const handleForgotPasscodeOtpVerify = async (code?: string) => {
    await verifyForgotPasscodeOtp(code);
  };

  const handleResetPasscodeSubmit = async () => {
    await resetPasscodeAndProceed();
  };

  const themed = getThemedStyles(
    colors,
    isDark,
    insets.top,
    HEADER_OFFSET,
    MIN_SCROLL_PADDING
  );
  const dynamicScroll = getDynamicScrollStyle(
    insets.top,
    insets.bottom,
    HEADER_OFFSET,
    FOOTER_OFFSET,
    MIN_SCROLL_PADDING
  );

  const screenModals = (
    <>
      <BiometricPromptModal
        visible={showBiometricModal}
        biometricType={biometricType}
        onEnable={handleEnableBiometric}
        onNotNow={handleNotNowBiometric}
      />
      <ServerConfigModal
        visible={showServerModal}
        onClose={() => setShowServerModal(false)}
      />
    </>
  );

  if (authFlowState === "BIOMETRIC_REAUTH") {
    return (
      <KeyboardAvoidingView
        style={[styles.container, themed.container]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <FocusAwareStatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <ScrollView
          ref={reauthScrollRef}
          contentContainerStyle={[styles.scroll, dynamicScroll]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.wrapper}>
            <AuthBrandHeader
              onLongPress={() => setShowServerModal(true)}
              titleStyle={themed.brandTitle}
              subtitleStyle={themed.brandSub}
            />
            <View style={reauthStyles.welcomeSection}>
              <Text style={[reauthStyles.welcomeTitle, themed.welcomeTitle]}>
                Welcome Back 👋
              </Text>
            </View>
            <ErrorBanner error={error} onDismiss={() => setError(null)} />
            {!biometricDismissed && (
              <Reanimated.View style={[reauthStyles.animatedSection, biometricAnimStyle]}>
                <BiometricReauthCard
                  biometricType={biometricType}
                  textColor={colors.text}
                  secondaryTextColor={colors.textSecondary}
                  onRetry={() => {
                    hasBioTriggered.current = false;
                    handleBiometricReauth();
                  }}
                  onUsePasscode={slideToBiometricDismissed}
                />
              </Reanimated.View>
            )}
            {passcodeVisible && (
              <Reanimated.View style={[reauthStyles.animatedSection, passcodeAnimStyle]}>
                <MobileNumberSection
                  mobile={mobileNumber}
                  onChangeMobile={setMobileNumber}
                  onSubmit={() => {}}
                  isReadOnly={true}
                  onChangeNumber={changeNumber}
                  loading={false}
                  showContinueButton={false}
                />
                <PasscodeLoginSection
                  passcode={passcode}
                  onChangePasscode={setPasscode}
                  onLogin={handlePasscodeFromReauth}
                  onForgotPasscode={handleForgotPasscode}
                  loading={isLoading}
                  onBiometricLogin={() => {
                    hasBioTriggered.current = false;
                    resetToBiometric();
                    handleBiometricReauth();
                  }}
                  isBiometricEnabled={isBiometricEnabled}
                  biometricTypeLabel={biometricType}
                  autoFocus={passcodeAutoFocus}
                  lockoutUntil={passcodeLockoutUntil}
                />
              </Reanimated.View>
            )}
          </View>
        </ScrollView>
        {screenModals}
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      style={[styles.container, themed.container]}
    >
      <FocusAwareStatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={[styles.scroll, dynamicScroll]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {authFlowState === "RESET_PASSCODE" && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setAuthFlowState("PASSCODE_LOGIN")}
            style={[styles.backBtnAbsolute, themed.backBtnAbsolute]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={isDark ? "#FFFFFF" : BrandColors.PRIMARY_BLUE_DARK}
            />
          </TouchableOpacity>
        )}
        <View style={styles.wrapper}>
          <AuthBrandHeader
            onLongPress={() => setShowServerModal(true)}
            titleStyle={themed.brandTitle}
            subtitleStyle={themed.brandSub}
          />
          {authFlowState === "ENTER_MOBILE" && (
            <View style={styles.welcome}>
              <Text style={[styles.welcomeTitle, themed.welcomeTitle]}>Welcome Back 👋</Text>
            </View>
          )}
          {authFlowState !== "RESET_PASSCODE" && (
            <>
              <ErrorBanner error={error} onDismiss={() => setError(null)} />
              <ServerConfigHint error={error} onPress={() => setShowServerModal(true)} />
            </>
          )}
          <Animated.View
            style={[
              styles.formBody,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <AuthFlowSections
              biometricTypeLabel={biometricType}
              onMobileSubmit={handleMobileSubmit}
              onOtpVerify={handleOtpVerify}
              onPasscodeLogin={handleLoginSubmit}
              onForgotPasscode={handleForgotPasscode}
              onBiometricLogin={handleBiometricLogin}
              onForgotPasscodeOtpVerify={handleForgotPasscodeOtpVerify}
              onResetPasscodeSubmit={handleResetPasscodeSubmit}
            />
          </Animated.View>
        </View>
      </ScrollView>
      {screenModals}
    </KeyboardAvoidingView>
  );
}

export default AuthenticationScreen;
