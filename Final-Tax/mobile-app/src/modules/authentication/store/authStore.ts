import { create } from "zustand";
import type { DevUser, AuthState } from "../types/auth.types";
import { authService } from "../services/authService";
import { passcodeService } from "../services/passcodeService";
import { authStorage } from "../services/authStorage";
import { biometricService } from "../services/biometricService";
import { validateLoginPhone, validateOtp } from "../validation/authSchema";
import { refreshNotificationsForActiveCustomer, toCustomer } from "./authStore.helpers";
import { createPasscodeRecoveryActions } from "./authPasscodeRecoveryActions";
import { createSessionActions } from "./authSessionActions";
import { loginPresentationResetPatch, otpRefusalPatch, passcodeFailurePatch } from "./authLockoutState";
import { registrationProgressService } from "../services/registrationProgressService";
import { tokenManager } from "@/core/authentication/tokenManager";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";

const initialUser = authService.getCurrentUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  // Session & User
  isLoggedIn: Boolean(authService.isAuthenticated() && initialUser),
  mobileNumber: initialUser?.mobileNumber || "",
  customer: initialUser ? toCustomer(initialUser) : null,
  authenticatedUser: initialUser,

  // Flow State
  authFlowState: "ENTER_MOBILE",
  isExistingUser: Boolean(initialUser && (initialUser.registrationCompleted || initialUser.passcode)),
  customerExists: Boolean(initialUser && (initialUser.registrationCompleted || initialUser.passcode)),
  profileCompleted: Boolean(
    initialUser &&
    (initialUser.registrationCompleted ||
     initialUser.profileCompleted ||
     Boolean(initialUser.customerId && initialUser.customerId.trim() !== "") ||
     (initialUser.passcode && initialUser.passcode.length === 6))
  ),
  hasPasscode: Boolean(initialUser && (initialUser.passcode || initialUser.hasPasscode)),
  isLoading: false,
  error: null,

  // OTP State
  otp: "",
  otpTimer: 30,
  canResendOTP: false,
  otpLockoutUntil: null,

  // Passcode State
  passcode: "",
  confirmPasscode: "",
  passcodeLockoutUntil: null,

  // Onboarding & Service Access
  pendingServiceRoute: null,
  isCompleteProfileModalOpen: false,

  // Biometric Authentication
  isBiometricEnabled: false,
  biometricTypeLabel: "Fingerprint",

  // Field updaters
  setMobileNumber: (m) => set({ mobileNumber: m.replace(/\D/g, ""), error: null }),
  setOtp: (otp) => set({ otp: otp.replace(/\D/g, ""), error: null }),
  setPasscode: (p) => set({ passcode: p.replace(/\D/g, ""), error: null }),
  setConfirmPasscode: (cp) => set({ confirmPasscode: cp.replace(/\D/g, ""), error: null }),
  setAuthFlowState: (authFlowState) => set({ authFlowState, error: null }),
  setError: (error) => set({ error }),
  setIsLoading: (isLoading) => set({ isLoading }),

  // Onboarding & Service Access actions
  setProfileCompleted: (completed: boolean) => set({ profileCompleted: completed }),
  setPendingServiceRoute: (route: string | null) => set({ pendingServiceRoute: route }),
  openCompleteProfileModal: (targetRoute?: string) =>
    set({
      isCompleteProfileModalOpen: true,
      pendingServiceRoute: targetRoute !== undefined ? targetRoute : get().pendingServiceRoute,
    }),
  closeCompleteProfileModal: () => set({ isCompleteProfileModalOpen: false }),

  // Biometric actions
  setBiometricEnabled: async (enabled: boolean) => {
    const mobile = get().mobileNumber || get().authenticatedUser?.mobileNumber;
    await biometricService.setBiometricEnabled(enabled, mobile);
    set({ isBiometricEnabled: enabled });
  },

  syncBiometricState: async () => {
    const isEnabled = await biometricService.isBiometricEnabled();
    const label = await biometricService.getBiometricTypeLabel();
    set({ isBiometricEnabled: isEnabled, biometricTypeLabel: label });
  },

  // Timer actions
  setOtpTimer: (t) => set({ otpTimer: t, canResendOTP: t <= 0 }),
  decrementTimer: () =>
    set((state) => {
      const next = state.otpTimer - 1;
      return {
        otpTimer: next > 0 ? next : 0,
        canResendOTP: next <= 0,
      };
    }),
  resetTimer: (initialSeconds = 30) => set({ otpTimer: initialSeconds, canResendOTP: false }),

  // Lockout actions
  resetLoginPresentation: () => set(loginPresentationResetPatch()),

  refreshPasscodeLockout: async () => {
    const { mobileNumber } = get();
    if (!mobileNumber) return;
    const lock = await passcodeService.checkLockout(mobileNumber);
    set({ passcodeLockoutUntil: lock.isLocked ? lock.lockedUntil : null });
  },

  // Identity, profile sync & session lifecycle
  ...createSessionActions(set, get),

  // Business Flow Operations
  sendOtp: async (overrideMobile?: string) => {
    const mobileToUse = overrideMobile || get().mobileNumber;
    const validation = validateLoginPhone(mobileToUse);
    if (!validation.valid) {
      set({ error: validation.error || "Please enter a valid 10-digit mobile number" });
      return false;
    }

    const cleanMobile = validation.value ?? mobileToUse.replace(/\D/g, "");
    set({ isLoading: true, error: null });
    try {
      // Clear dead tokens from any previous expired session before starting new login
      const hasValid = await tokenManager.hasValidToken().catch(() => false);
      if (!hasValid) {
        await tokenManager.clearTokens().catch(() => {});
      }

      // 1. Check database status for user state
      const checkRes = await authService.checkUser(cleanMobile);

      // 2. Send OTP
      const res = await authService.sendOtp(cleanMobile);
      if (!res.success) {
        set({
          isLoading: false,
          ...otpRefusalPatch(get().authFlowState, res, "Failed to send OTP. Could not reach server."),
        });
        return false;
      }

      set({
        isLoading: false,
        error: null,
        otpLockoutUntil: null,
        mobileNumber: cleanMobile,
        customerExists: checkRes.customerExists,
        isExistingUser: checkRes.customerExists,
        profileCompleted: checkRes.profileCompleted,
        hasPasscode: checkRes.hasPasscode,
        authFlowState: "OTP_VERIFICATION",
        otp: "",
        otpTimer: 30,
        canResendOTP: false,
      });
      return true;
    } catch (err) {
      set({ isLoading: false, error: getErrorMessage(err) || "Failed to send OTP. Please try again." });
      return false;
    }
  },

  verifyOtp: async (codeToVerify?: string) => {
    const code = codeToVerify !== undefined ? codeToVerify : get().otp;
    const v = validateOtp(code);
    if (!v.valid) {
      set({ error: v.error });
      return { success: false };
    }

    set({ isLoading: true, error: null });
    try {
      const { mobileNumber } = get();
      const res = await authService.verifyOtp(mobileNumber, code);
      set({ isLoading: false });

      if (!res.success) {
        set(otpRefusalPatch(get().authFlowState, res, "Invalid OTP. Please try again."));
        return { success: false };
      }
      set({ otpLockoutUntil: null });

      // Check customer database table status directly from backend
      const customerExists = res.customerExists === true || res.isExistingUser === true;
      const profileCompleted = customerExists;
      const hasPasscode = customerExists;

      logger.debug("[authStore] verifyOtp", { customerExists });

      set({
        customerExists,
        isExistingUser: customerExists,
        profileCompleted,
        hasPasscode,
      });

      // DECISION TREE
      // 1. Existing User in Customer table -> Ask to enter passcode -> After passcode verified, navigate to Dashboard
      if (customerExists) {
        set({
          authFlowState: "PASSCODE_LOGIN",
          passcode: "",
          isLoggedIn: false,
          error: null,
        });
        refreshNotificationsForActiveCustomer();
        return {
          success: true,
          isExistingUser: true,
          requiresPasscode: true,
          profileCompleted: true,
        };
      } else {
        // 2. New User not in Customer table -> Do NOT ask to enter passcode -> Navigate directly to Dashboard
        const cleanMobile = mobileNumber.replace(/\D/g, "");
        const placeholderUser: DevUser = {
          customerId: "",
          mobileNumber: cleanMobile,
          name: "",
          email: `${cleanMobile}@finsolz.in`,
          customerType: "Individual",
          registrationCompleted: false,
        };
        authStorage.saveUser(placeholderUser);
        authStorage.saveSession({
          isLoggedIn: true,
          activeMobile: cleanMobile,
          lastLoginAt: new Date().toISOString(),
        });
        // Keep the server's single-use proof so a restart can resume the registration form and
        // register. Without a proof the server will refuse registration, so there is nothing to resume.
        if (res.registrationProof) {
          await registrationProgressService.markOtpVerified(
            cleanMobile,
            res.registrationProof,
            res.registrationProofExpiresInSeconds,
          );
        }

        set({
          isExistingUser: false,
          customerExists: false,
          isLoggedIn: true,
          profileCompleted: false,
          authenticatedUser: placeholderUser,
          customer: toCustomer(placeholderUser),
          error: null,
        });
        refreshNotificationsForActiveCustomer();
        return {
          success: true,
          isExistingUser: false,
          requiresPasscode: false,
          profileCompleted: false,
        };
      }
    } catch (err) {
      set({ isLoading: false, error: getErrorMessage(err) || "Invalid OTP. Please try again." });
      return { success: false };
    }
  },

  loginWithPasscode: async (passcodeToUse?: string) => {
    const code = passcodeToUse !== undefined ? passcodeToUse : get().passcode;
    const clean = code.replace(/\D/g, "");
    if (!clean) {
      set({ error: "Passcode is required" });
      return { success: false, error: "Passcode is required" };
    }
    if (clean.length !== 6) {
      set({ error: "Passcode must be exactly 6 digits" });
      return { success: false, error: "Passcode must be exactly 6 digits" };
    }

    set({ isLoading: true, error: null });
    try {
      const { mobileNumber } = get();
      const res = await authService.loginWithPasscode(mobileNumber, code);
      if (res.success && res.user) {
        const enrichedUser: DevUser = {
          ...res.user,
          passcode: code,
          registrationCompleted: true,
        };
        authStorage.saveUser(enrichedUser);

        set({
          isLoading: false,
          isLoggedIn: true,
          passcodeLockoutUntil: null,
          customerExists: true,
          isExistingUser: true,
          profileCompleted: true,
          hasPasscode: true,
          authenticatedUser: enrichedUser,
          customer: toCustomer(enrichedUser),
          error: null,
          isCompleteProfileModalOpen: false,
        });
        refreshNotificationsForActiveCustomer();

        // Hydrate profile from storage
        try {
          await get().fetchAndSyncProfile(mobileNumber || res.user.mobileNumber);
        } catch (e) {
          logger.warn("[AuthStore] Profile sync warning after passcode login", { error: getErrorMessage(e) });
        }

        return { success: true };
      }
      set({ isLoading: false, ...passcodeFailurePatch(res, "Incorrect passcode. Please try again.") });
      return { success: false, error: res.error };
    } catch (err) {
      const msg = getErrorMessage(err) || "Incorrect passcode. Please try again.";
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  // Forgot-passcode flow
  ...createPasscodeRecoveryActions(set, get),

  resendOtp: async () => {
    const { mobileNumber, canResendOTP } = get();
    if (!canResendOTP) return false;

    set({ isLoading: true, error: null });
    try {
      const res = await authService.sendOtp(mobileNumber);
      if (!res.success) {
        set({ isLoading: false, ...otpRefusalPatch(get().authFlowState, res, "Failed to resend code") });
        return false;
      }
      set({
        isLoading: false,
        otp: "",
        otpTimer: 30,
        canResendOTP: false,
      });
      return true;
    } catch (err) {
      set({ isLoading: false, error: getErrorMessage(err) || "Failed to resend code" });
      return false;
    }
  },

  changeNumber: () => {
    tokenManager.clearTokens().catch(() => {});
    set({
      authFlowState: "ENTER_MOBILE",
      otp: "",
      passcode: "",
      confirmPasscode: "",
      otpLockoutUntil: null,
      passcodeLockoutUntil: null,
      error: null,
    });
  },

  resetFlow: () => {
    tokenManager.clearTokens().catch(() => {});
    set({
      authFlowState: "ENTER_MOBILE",
      mobileNumber: "",
      otp: "",
      passcode: "",
      confirmPasscode: "",
      isExistingUser: false,
      customerExists: false,
      profileCompleted: false,
      hasPasscode: false,
      otpLockoutUntil: null,
      passcodeLockoutUntil: null,
      error: null,
      isCompleteProfileModalOpen: false,
    });
  },

  // Registration & Session actions
  login: async (passcode = "") => get().loginWithPasscode(passcode),
}));

// Initialize biometric state asynchronously after bootstrap
setTimeout(() => {
  useAuthStore.getState().syncBiometricState().catch?.((err) => {
    logger.debug("[AuthStore] Background biometric sync skipped/failed", { error: getErrorMessage(err) });
  });
}, 300);

export default useAuthStore;
