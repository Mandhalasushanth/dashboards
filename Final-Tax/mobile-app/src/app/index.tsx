import { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { LandingScreen } from "@/components/landing/LandingScreen";
import { biometricService } from "@/modules/authentication/services/biometricService";
import { passcodeService } from "@/modules/authentication/services/passcodeService";
import { authStorage } from "@/modules/authentication/services/authStorage";
import { recoverIncompleteRegistration } from "@/modules/authentication/services/launchRegistrationRecovery";
import { logger } from "@/core/logging/logger";
import { styles } from "@/styles/app/index.styles";

export default function Index() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);
  const hasTriggeredLaunch = useRef(false);
  const hasNavigated = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function handleAppLaunch() {
      if (hasTriggeredLaunch.current) return;
      hasTriggeredLaunch.current = true;

      try {
        // Wait for persisted auth data before deciding which launch flow to show.
        await authStorage.initAsync();

        const session = authStorage.getSession();
        const activeMobile = session?.activeMobile;
        const user = activeMobile ? authStorage.getUserByMobile(activeMobile) : null;
        const isAuthed = Boolean(session?.isLoggedIn && activeMobile && user);

        // A new number that verified its OTP but never finished registering must resume the
        // registration form (or log in, if the customer now exists) - never be treated as signed in.
        const recovery = await recoverIncompleteRegistration(isAuthed ? user : null, activeMobile);
        if (recovery && recovery.kind !== "RESTART") {
          const resuming = recovery.kind === "RESUME_PROFILE";
          useAuthStore.setState({
            isLoggedIn: false,
            mobileNumber: recovery.mobile,
            customerExists: !resuming,
            isExistingUser: !resuming,
            profileCompleted: !resuming,
            hasPasscode: !resuming,
            authFlowState: resuming ? "ENTER_MOBILE" : "PASSCODE_LOGIN",
          });
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            router.replace(resuming ? "/(auth)/createprofile" : "/(auth)/login");
          }
          return;
        }
        if (recovery) {
          // Nothing trustworthy to resume: start from the mobile-number step.
          return;
        }

        if (isAuthed && user) {
          // Sync profile in background if available
          useAuthStore.getState().fetchAndSyncProfile(user.mobileNumber).catch((err) => {
            logger.debug("[AppLaunch] Background profile fetch fallback", { error: err });
          });

          // Step 1: Returning users with enrolled biometrics start at Welcome Back.
          let isBioEnabled = false;
          try {
            isBioEnabled = await Promise.race([
              biometricService.isBiometricAvailable(),
              new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 800)),
            ]);
          } catch (err) {
            logger.debug("[AppLaunch] Biometric check fallback", { error: err });
            isBioEnabled = false;
          }

          if (isBioEnabled) {
            // Biometric enabled: navigate to auth screen in BIOMETRIC_REAUTH mode.
            // The auth screen will trigger the biometric prompt automatically after mounting.
            // We do NOT call biometricService.authenticate() here — the UI must be visible first.
            useAuthStore.setState({
              isLoggedIn: false,
              mobileNumber: user.mobileNumber,
              authFlowState: "BIOMETRIC_REAUTH",
            });
            if (!hasNavigated.current) {
              hasNavigated.current = true;
              router.replace("/(auth)/login");
            }
            return;
          }

          // Step 2: Biometric is disabled. Is App Passcode enabled?
          const hasPass = (await passcodeService.hasPasscode(user.mobileNumber)) || Boolean(user.hasPasscode);
          if (hasPass) {
            // Prompt App Passcode — numpad will appear in the auth screen
            useAuthStore.setState({
              isLoggedIn: false,
              mobileNumber: user.mobileNumber,
              authFlowState: "PASSCODE_LOGIN",
            });
            if (!hasNavigated.current) {
              hasNavigated.current = true;
              router.replace("/(auth)/login");
            }
            return;
          }

          // NO passcode, NO biometric -> Restore session -> Go to Home
          authStorage.saveSession({
            isLoggedIn: true,
            activeMobile: user.mobileNumber,
            lastLoginAt: new Date().toISOString(),
          });
          useAuthStore.getState().syncFromDevAuth();
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            router.replace("/(main)/home");
          }
          return;
        }
      } catch (e) {
        logger.warn("[AppLaunch] App launch initialization error:", { error: e });
      } finally {
        if (isMounted && !hasNavigated.current) {
          setIsInitializing(false);
        }
      }
    }

    handleAppLaunch();

    // Absolute failsafe: if after 2.0s the app is still initializing, dismiss loading screen
    const failsafe = setTimeout(() => {
      if (isMounted && !hasNavigated.current) {
        setIsInitializing(false);
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearTimeout(failsafe);
    };
  }, [router]);

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
      </View>
    );
  }

  return <LandingScreen />;
}
