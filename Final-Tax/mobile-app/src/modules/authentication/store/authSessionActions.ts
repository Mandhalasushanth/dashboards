import type { StoreApi } from "zustand";
import type { CustomerProfile } from "../../../shared/types/domain";
import type { DevUser, AuthState } from "../types/auth.types";
import { authService } from "../services/authService";
import { authStorage } from "../services/authStorage";
import { authApi, type CustomerApiRecord } from "../services/authApi";
import { registrationProgressService } from "../services/registrationProgressService";
import { loginPresentationResetPatch } from "./authLockoutState";
import {
  isPlaceholderCustomerName,
  refreshNotificationsForActiveCustomer,
  toCustomer,
} from "./authStore.helpers";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

export type AuthSessionActions = Pick<
  AuthState,
  "checkUser" | "fetchAndSyncProfile" | "register" | "setAvatar" | "logout" | "syncFromDevAuth"
>;

/** Customer identity and session lifecycle: profile sync, registration, logout, restore. */
export const createSessionActions = (
  set: StoreApi<AuthState>["setState"],
  get: StoreApi<AuthState>["getState"]
): AuthSessionActions => ({
  // Check user existence in DB
  checkUser: async (overrideMobile?: string) => {
    const mobileToUse = overrideMobile || get().mobileNumber;
    const cleanMobile = mobileToUse.replace(/\D/g, "");
    if (cleanMobile.length !== 10) return { exists: false, customerExists: false, profileCompleted: false, hasPasscode: false };
    const res = await authService.checkUser(cleanMobile);
    set({
      customerExists: res.customerExists,
      profileCompleted: res.profileCompleted,
      hasPasscode: res.hasPasscode,
      isExistingUser: res.customerExists,
    });
    return res;
  },

  // Sync customer profile into auth state from local storage and backend API
  fetchAndSyncProfile: async (identifier?: string) => {
    try {
      const activeMobile =
        identifier ||
        get().mobileNumber ||
        get().authenticatedUser?.mobileNumber ||
        get().authenticatedUser?.mobile ||
        get().customer?.mobile ||
        authStorage.getUser()?.mobileNumber ||
        authStorage.getSession().activeMobile;

      if (!activeMobile) {
        logger.warn("[AuthSession] fetchAndSyncProfile called with no mobile number or user");
        return { success: false, isComplete: false, customer: null };
      }
      const cleanMobile = String(activeMobile).replace(/\D/g, "");

      // 1. Fetch fresh customer profile details from backend database if available
      let backendCustomer: CustomerApiRecord | null = null;
      try {
        const backendRes = await authApi.getCustomerDetails(cleanMobile);
        if (backendRes?.success && backendRes?.data) {
          backendCustomer = backendRes.data;
        }
      } catch (err) {
        logger.warn("[AuthSession] Backend getCustomerDetails failed in fetchAndSyncProfile", { error: getErrorMessage(err) });
      }

      const d: CustomerApiRecord | null = backendCustomer || (cleanMobile ? authStorage.getUserByMobile(cleanMobile) : null) || authStorage.getUser();
      if (d && typeof d === "object") {
        const currentU = get().authenticatedUser || authStorage.getUser();
        const custId = d.customerId || d.custId || currentU?.customerId || "";
        const name = d.name || d.fullName || currentU?.name || "";
        const isPlaceholderName = isPlaceholderCustomerName(name);

        const hasRealIdentity = Boolean(name && name.trim() !== "" && !isPlaceholderName);
        const isComplete = Boolean(
          hasRealIdentity &&
          (Boolean(custId) || d.profileCompleted === true || d.registrationCompleted === true || Boolean(d.pan || d.aadhaar || d.adhar))
        );

        const mergedUser: DevUser = {
          customerId: custId || currentU?.customerId || "",
          name: name || currentU?.name || "",
          mobileNumber: d.mobileNumber || d.mobile || cleanMobile,
          email: d.email || currentU?.email || `${cleanMobile}@finsolz.in`,
          customerType: d.customerType || currentU?.customerType || "Individual",
          dob: d.dob || currentU?.dob || "",
          gender: d.gender || currentU?.gender || "",
          fatherSpouseName: d.fatherSpouseName || currentU?.fatherSpouseName || "",
          pan: d.pan || currentU?.pan || "",
          aadhaar: d.aadhaar || d.adhar || currentU?.aadhaar || "",
          address: d.address || currentU?.address || "",
          addressLine1: d.addressLine1 || currentU?.addressLine1 || "",
          addressLine2: d.addressLine2 || currentU?.addressLine2 || "",
          city: d.city || currentU?.city || "",
          pincode: d.pincode || d.pinCode || currentU?.pincode || "",
          state: d.state || currentU?.state || "",
          registrationCompleted: isComplete,
          passcode: currentU?.passcode || get().passcode,
          avatarUri: d.avatarUri || currentU?.avatarUri,
        };

        authStorage.saveUser(mergedUser);
        const custObj = toCustomer(mergedUser);

        set({
          customerExists: Boolean(custId || hasRealIdentity),
          isExistingUser: Boolean(custId || hasRealIdentity),
          profileCompleted: isComplete,
          hasPasscode: Boolean(mergedUser.passcode || custId),
          authenticatedUser: mergedUser,
          customer: custObj,
        });

        logger.debug("[authStore] fetchAndSyncProfile synced customer", {
          customerId: custId,
          isComplete,
        });
        return { success: true, isComplete, customer: custObj };
      }
      return { success: false, isComplete: false, customer: null };
    } catch (err) {
      logger.warn("[authStore] fetchAndSyncProfile warning", { error: getErrorMessage(err) });
      return { success: false, isComplete: false, customer: null };
    }
  },

  register: async (profile: CustomerProfile, passcode = "123456", autoLogin = true) => {
    const mobile = (profile as any).mobileNumber || get().mobileNumber || "9876543210";
    const res = await authService.registerUser(
      {
        ...profile,
        mobileNumber: mobile,
        passcode,
      },
      autoLogin
    );
    if (res.success && res.user) {
      authStorage.saveUser(res.user);
      await registrationProgressService.clear();
      if (autoLogin) {
        set({
          isLoggedIn: true,
          customerExists: true,
          profileCompleted: true,
          hasPasscode: true,
          mobileNumber: res.user.mobileNumber,
          customer: toCustomer(res.user),
          authenticatedUser: res.user,
          isCompleteProfileModalOpen: false,
        });
        get().fetchAndSyncProfile(res.user.mobileNumber).catch((err) => {
          logger.debug("[AuthSession] Background profile sync failed", { error: getErrorMessage(err) });
        });
      } else {
        set({
          customerExists: true,
          profileCompleted: true,
          hasPasscode: true,
          isCompleteProfileModalOpen: false,
        });
      }
      return { success: true };
    }
    if (res.requiresReverification) {
      // The OTP verification behind this registration is gone (expired, spent or never issued):
      // drop the stale record and make the user verify the number again.
      await registrationProgressService.clear();
      set({ authFlowState: "ENTER_MOBILE", otp: "", error: null });
      return {
        success: false,
        error: "Your mobile number verification has expired. Please verify your number again.",
        requiresReverification: true,
      };
    }
    return { success: false, error: res.error || "Registration failed" };
  },

  setAvatar: (avatarUri) => {
    authService.setAvatar(avatarUri);
    set((s) => (s.customer ? { customer: { ...s.customer, avatarUri } } : {}));
  },

  logout: () => {
    // 1. Synchronously reset state immediately to prevent routing race conditions/glitches
    set({
      isLoggedIn: false,
      customerExists: false,
      isExistingUser: false,
      profileCompleted: false,
      hasPasscode: false,
      customer: null,
      authenticatedUser: null,
      mobileNumber: "",
      otp: "",
      passcode: "",
      confirmPasscode: "",
      authFlowState: "ENTER_MOBILE",
      pendingServiceRoute: null,
      isCompleteProfileModalOpen: false,
      // Don't carry the last user's error banner or lockout countdown onto the next login screen.
      ...loginPresentationResetPatch(),
    });
    registrationProgressService.clear().catch((err) => {
      logger.debug("[AuthSession] Clearing registration progress failed", { error: getErrorMessage(err) });
    });
    // 2. Perform server token revocation and secure storage cleanup in background
    authService.logout().catch((err) => {
      logger.warn("[AuthSession] Background logout error", { error: getErrorMessage(err) });
    });
    try {
      const { useApplicationStore } = require("../../../store/applicationStore");
      useApplicationStore.getState().resetStore?.();
    } catch (err) {
      logger.debug("[AuthSession] Resetting application store failed", { error: getErrorMessage(err) });
    }
    refreshNotificationsForActiveCustomer();
  },

  syncFromDevAuth: () => {
    const u = authService.getCurrentUser();
    const isAuth = Boolean(authService.isAuthenticated() && u);
    const isPlaceholder = isPlaceholderCustomerName(u?.name);
    const hasRealIdentity = Boolean(u && u.customerId && !isPlaceholder);
    const hasPanOrAadhaar = Boolean(u && (u.pan || u.aadhaar || u.adhar));
    const isComplete = Boolean(
      u &&
      (u.registrationCompleted ||
       u.profileCompleted ||
       hasRealIdentity ||
       (hasPanOrAadhaar && Boolean(u.dob)) ||
       (u.passcode && u.passcode.length === 6))
    );

    set({
      isLoggedIn: isAuth,
      customerExists: Boolean(u && (u.registrationCompleted || u.passcode || hasRealIdentity)),
      isExistingUser: Boolean(u && (u.registrationCompleted || u.passcode || hasRealIdentity)),
      profileCompleted: isComplete,
      hasPasscode: Boolean(u && (u.passcode || u.hasPasscode || hasRealIdentity)),
      mobileNumber: u?.mobileNumber || "",
      customer: u ? toCustomer(u) : null,
      authenticatedUser: u,
    });
  },
});
