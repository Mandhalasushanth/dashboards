import type { StoreApi } from "zustand";
import type { AuthState } from "../types/auth.types";
import { authService } from "../services/authService";
import { validateOtp, validatePasscodeMatch } from "../validation/authSchema";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { otpRefusalPatch } from "./authLockoutState";

export type AuthPasscodeRecoveryActions = Pick<
  AuthState,
  "startForgotPasscode" | "verifyForgotPasscodeOtp" | "resetPasscodeAndProceed" | "updatePassword"
>;

/** Forgot-passcode flow: reset OTP, new passcode, and password update. */
export const createPasscodeRecoveryActions = (
  set: StoreApi<AuthState>["setState"],
  get: StoreApi<AuthState>["getState"]
): AuthPasscodeRecoveryActions => ({
  startForgotPasscode: async () => {
    const { mobileNumber } = get();
    if (!mobileNumber) {
      set({ error: "Mobile number is required" });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await authService.forgotPasscode(mobileNumber);
      if (!res.success) {
        // A lockout stays on the current screen. A resend limit still opens the code form so a
        // code that was just sent can be used, with the resend timer set to the server's wait.
        const patch = otpRefusalPatch(get().authFlowState, res, "Failed to send reset code.");
        const rateLimited = res.code === "OTP_RESEND_LIMITED";
        set({
          isLoading: false,
          ...patch,
          ...(rateLimited ? { authFlowState: "FORGOT_PASSCODE_OTP" as const, otp: "" } : {}),
        });
        return rateLimited;
      }
      set({
        isLoading: false,
        authFlowState: "FORGOT_PASSCODE_OTP",
        otp: "",
        otpTimer: 30,
        canResendOTP: false,
      });
      return true;
    } catch (err) {
      set({ isLoading: false, error: getErrorMessage(err) || "Failed to send reset code." });
      return false;
    }
  },

  verifyForgotPasscodeOtp: async (codeToVerify?: string) => {
    const code = codeToVerify !== undefined ? codeToVerify : get().otp;
    const v = validateOtp(code);
    if (!v.valid) {
      set({ error: v.error });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const { mobileNumber } = get();
      const res = await authService.verifyOtp(mobileNumber, code);
      if (res.success) {
        set({
          isLoading: false,
          authFlowState: "RESET_PASSCODE",
          passcode: "",
          confirmPasscode: "",
          error: null,
        });
        return true;
      }
      set({ isLoading: false, ...otpRefusalPatch(get().authFlowState, res, "Invalid OTP code") });
      return false;
    } catch (err) {
      set({ isLoading: false, error: getErrorMessage(err) || "Invalid OTP code" });
      return false;
    }
  },

  resetPasscodeAndProceed: async () => {
    const { mobileNumber, passcode, confirmPasscode, otp } = get();
    const v = validatePasscodeMatch(passcode, confirmPasscode, mobileNumber);
    if (!v.valid) {
      set({ error: v.error });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await authService.resetPasscode(mobileNumber, passcode, otp);
      if (res.success) {
        set({
          isLoading: false,
          authFlowState: "PASSCODE_LOGIN",
          passcode: "",
          confirmPasscode: "",
          error: null,
        });
        return true;
      }
      set({ isLoading: false, error: res.error || "Failed to reset passcode" });
      return false;
    } catch (err) {
      set({ isLoading: false, error: getErrorMessage(err) || "Failed to reset passcode" });
      return false;
    }
  },

  updatePassword: async (mobileNumber: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.updatePassword(mobileNumber, newPassword);
      set({ isLoading: false, error: res.success ? null : res.error || "Failed to update password" });
      return { success: res.success, message: res.message || res.error };
    } catch (err) {
      const msg = getErrorMessage(err) || "Failed to update password";
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },
});
