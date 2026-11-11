import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";

const KEY_BIOMETRIC_ENABLED = "finsolz_biometric_enabled";
const KEY_BIOMETRIC_MOBILE = "finsolz_biometric_mobile";

// In-memory fallback for web or environments where SecureStore isn't available
const memoryStorage: Record<string, string> = {};

const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return memoryStorage[key] || null;
    }
    const securePromise = SecureStore.getItemAsync(key);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 800));
    const result = await Promise.race([securePromise, timeoutPromise]);
    return result ?? memoryStorage[key] ?? null;
  } catch (e) {
    logger.warn("[BiometricService] SecureStore.getItemAsync error, falling back to memory", { key, error: getErrorMessage(e) });
    return memoryStorage[key] || null;
  }
};

const setSecureItem = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      memoryStorage[key] = value;
      return;
    }
    await Promise.race([
      SecureStore.setItemAsync(key, value),
      new Promise<void>((resolve) => setTimeout(resolve, 800)),
    ]);
  } catch (e) {
    logger.warn("[BiometricService] SecureStore.setItemAsync error, falling back to memory", { key, error: getErrorMessage(e) });
    memoryStorage[key] = value;
  }
};

const deleteSecureItem = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      delete memoryStorage[key];
      return;
    }
    await Promise.race([
      SecureStore.deleteItemAsync(key),
      new Promise<void>((resolve) => setTimeout(resolve, 800)),
    ]);
  } catch (e) {
    logger.warn("[BiometricService] SecureStore.deleteItemAsync error", { key, error: getErrorMessage(e) });
    delete memoryStorage[key];
  }
};

export type BiometricType =
  | "FINGERPRINT"
  | "FACE_UNLOCK"
  | "BIOMETRIC"
  | "NONE";

export interface AuthenticateOptions {
  promptMessage?: string;
  cancelLabel?: string;
  fallbackLabel?: string;
  disableDeviceFallback?: boolean;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  cancelled?: boolean;
}

// Global authentication-in-progress guard to prevent concurrent duplicate prompts
let isAuthenticating = false;

export const biometricService = {
  /**
   * Check whether device hardware supports biometric authentication
   */
  async checkHardwareSupport(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) return false;
      if (Platform.OS === "ios") {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        return types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
      }
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check whether biometrics (fingerprint/face) are enrolled on the device
   */
  async checkEnrollment(): Promise<boolean> {
    try {
      return await LocalAuthentication.isEnrolledAsync();
    } catch {
      return false;
    }
  },

  /**
   * Check whether biometrics are available on current device
   */
  async isBiometricAvailable(): Promise<boolean> {
    const hasHardware = await this.checkHardwareSupport();
    if (!hasHardware) return false;
    return await this.checkEnrollment();
  },

  /**
   * Get the concrete biometric type of the device:
   * 'FINGERPRINT' | 'FACE_UNLOCK' | 'BIOMETRIC' | 'NONE'
   * Note: On iOS, only FACE_UNLOCK (Face ID) is supported. Touch ID is not allowed.
   */
  async getBiometricType(): Promise<BiometricType> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) return "NONE";

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const hasFace = types.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      );

      if (Platform.OS === "ios") {
        return hasFace ? "FACE_UNLOCK" : "NONE";
      }

      const hasFingerprint = types.includes(
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      );

      if (hasFingerprint) return "FINGERPRINT";
      if (hasFace) return "FACE_UNLOCK";
      return "BIOMETRIC";
    } catch {
      return "NONE";
    }
  },

  /**
   * Detect device biometric type and return a user-friendly label
   */
  async getBiometricTypeLabel(): Promise<string> {
    try {
      if (Platform.OS === "ios") {
        return "Face ID";
      }
      const type = await this.getBiometricType();
      switch (type) {
        case "FINGERPRINT":
          return "Fingerprint";
        case "FACE_UNLOCK":
          return "Face Unlock";
        default:
          return "Biometric";
      }
    } catch {
      return Platform.OS === "ios" ? "Face ID" : "Fingerprint";
    }
  },

  /**
   * Authenticate biometrics (Android Biometric Authentication)
   */
  async authenticate(
    promptOrOptions?: string | AuthenticateOptions,
  ): Promise<BiometricAuthResult> {
    if (isAuthenticating) {
      return { success: false, error: "Authentication is already in progress" };
    }

    try {
      isAuthenticating = true;

      const hasHardware = await this.checkHardwareSupport();
      if (!hasHardware) {
        return {
          success: false,
          error: "Biometric authentication isn't supported on this device.",
        };
      }

      const isEnrolled = await this.checkEnrollment();
      if (!isEnrolled) {
        return {
          success: false,
          error:
            "No fingerprint or biometric has been configured. Please add one in your device settings.",
        };
      }

      let customPrompt: string | undefined;
      let customOptions: AuthenticateOptions = {};

      if (typeof promptOrOptions === "string") {
        customPrompt = promptOrOptions;
      } else if (promptOrOptions) {
        customOptions = promptOrOptions;
        customPrompt = promptOrOptions.promptMessage;
      }

      const typeLabel = await this.getBiometricTypeLabel();
      const prompt = customPrompt || `Authenticate with ${typeLabel}`;

      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: prompt,
        fallbackLabel: "",
        cancelLabel: customOptions.cancelLabel ?? "Cancel",
        disableDeviceFallback: true,
      });

      if (res && res.success === true) {
        return { success: true };
      }

      if (
        res.error === "user_cancel" ||
        res.error === "app_cancel" ||
        res.error === "system_cancel"
      ) {
        return { success: false, cancelled: true, error: "Authentication cancelled" };
      }

      return {
        success: false,
        error: "Authentication failed. Please try again.",
      };
    } catch (err) {
      return {
        success: false,
        error: getErrorMessage(err) || "Authentication error occurred. Please try again.",
      };
    } finally {
      isAuthenticating = false;
    }
  },

  /**
   * Check whether biometric login is enabled for the current device/user
   */
  async isBiometricEnabled(mobile?: string): Promise<boolean> {
    const val = await getSecureItem(KEY_BIOMETRIC_ENABLED);
    if (val !== "true") return false;
    if (mobile) {
      const cleanMobile = mobile.replace(/\D/g, "");
      const registeredMobile = await this.getBiometricMobile();
      if (registeredMobile && cleanMobile && registeredMobile !== cleanMobile) {
        return false;
      }
    }
    return true;
  },

  /**
   * Enable biometric authentication after verifying biometrics
   */
  async enableBiometric(
    mobile?: string,
    customPrompt?: string,
  ): Promise<BiometricAuthResult> {
    const authRes = await this.authenticate(customPrompt);
    if (authRes.success) {
      await this.setBiometricEnabled(true, mobile);
      return { success: true };
    }
    return authRes;
  },

  /**
   * Disable biometric authentication and clear stored credentials
   */
  async disableBiometric(): Promise<void> {
    await this.setBiometricEnabled(false);
  },

  /**
   * Set biometric enabled in SecureStore
   */
  async setBiometricEnabled(enabled: boolean, mobile?: string): Promise<void> {
    if (enabled) {
      await setSecureItem(KEY_BIOMETRIC_ENABLED, "true");
      if (mobile) {
        await setSecureItem(KEY_BIOMETRIC_MOBILE, mobile.replace(/\D/g, ""));
      }
    } else {
      await setSecureItem(KEY_BIOMETRIC_ENABLED, "false");
      await deleteSecureItem(KEY_BIOMETRIC_MOBILE);
    }
  },

  /**
   * Get the registered mobile number tied to biometric login
   */
  async getBiometricMobile(): Promise<string | null> {
    return await getSecureItem(KEY_BIOMETRIC_MOBILE);
  },
};

export default biometricService;
