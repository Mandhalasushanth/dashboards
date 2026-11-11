import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { addDraftToIndex, removeDraftFromIndex } from "@/shared/hooks/useServiceDraft";
import type { Application } from "@/types/domain";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

/**
 * Retrieves the cleaned mobile number of the currently authenticated customer.
 */
export function getActiveCustomerMobile(): string {
  try {
    const authState = useAuthStore.getState();
    const mobile =
      authState.customer?.mobile ||
      authState.authenticatedUser?.mobileNumber ||
      authState.mobileNumber;
    return mobile ? String(mobile).replace(/\D/g, "") : "";
  } catch (error) {
    logger.warn("Failed to get active customer mobile", { error: getErrorMessage(error) });
    return "";
  }
}

/**
 * Loads locally persisted applications for a specific customer.
 */
export async function getPersistedApplications(cleanMobile: string): Promise<Application[]> {
  if (!cleanMobile) return [];
  try {
    const raw = await AsyncStorage.getItem(`@finsolz_apps_${cleanMobile}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    logger.warn("Failed to parse persisted applications", { error: getErrorMessage(error) });
    return [];
  }
}

/**
 * Saves non-draft applications to AsyncStorage for offline capability.
 */
export async function savePersistedApplications(
  cleanMobile: string,
  apps: Application[]
): Promise<void> {
  if (!cleanMobile) return;
  try {
    const realApps = apps.filter(
      (a) => a.status !== "Draft" && !a.id.startsWith("DRAFT-")
    );
    await AsyncStorage.setItem(
      `@finsolz_apps_${cleanMobile}`,
      JSON.stringify(realApps)
    );
  } catch (err) {
    logger.warn("Failed to persist applications to AsyncStorage", { error: getErrorMessage(err) });
  }
}

/**
 * Generic helper to save a service draft to AsyncStorage and update the draft index.
 */
export async function persistDraftRecord(
  cleanMobile: string,
  serviceKey: string,
  payload: Record<string, unknown>
): Promise<void> {
  if (!cleanMobile) return;
  try {
    addDraftToIndex(cleanMobile, serviceKey);
    await AsyncStorage.setItem(
      `@finsolz_draft_${cleanMobile}_${serviceKey}`,
      JSON.stringify(payload)
    );
  } catch (error) {
    logger.warn("Failed to persist draft", { serviceKey, error: getErrorMessage(error) });
  }
}

/**
 * Generic helper to remove a service draft from AsyncStorage and the draft index.
 */
export async function removeDraftRecord(
  cleanMobile: string,
  serviceKey: string
): Promise<void> {
  if (!cleanMobile) return;
  try {
    removeDraftFromIndex(cleanMobile, serviceKey);
    await AsyncStorage.removeItem(
      `@finsolz_draft_${cleanMobile}_${serviceKey}`
    );
  } catch (error) {
    logger.warn("Failed to remove draft", { serviceKey, error: getErrorMessage(error) });
  }
}

