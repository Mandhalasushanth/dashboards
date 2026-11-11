import { useEffect, useRef, useCallback, useMemo } from "react";
import { BackHandler } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { useUniversalDraftGuard } from "./useUniversalDraftGuard";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

export interface UseServiceDraftOptions<T> {
  /** Unique identifier for the service (e.g., 'gst-registration', 'itr-filing', 'tds-refund') */
  serviceKey: string;
  /** Current state of the form */
  formData: T;
  /** Baseline empty state to compare against */
  emptyState?: T;
  /** Custom dirty check (defaults to checking if at least one field has non-empty text/value) */
  isDirty?: (data: T) => boolean;
  /** Called when draft is saved */
  onSave?: (data: T) => void | Promise<void>;
  /** Called when draft is discarded */
  onDiscard?: () => void | Promise<void>;
  /** Called on mount if a saved draft is found in storage */
  onRestore?: (data: T) => void;
  /** Whether form is submitted so back navigation proceeds without prompt */
  isSubmitted?: boolean;
}

/**
 * Universal helper that checks if even ONE field has user-entered data
 */
export function hasEnteredAnyField(
  obj: Record<string, unknown> | null | undefined,
  emptyObj?: Record<string, unknown> | null
): boolean {
  if (!obj || typeof obj !== "object") return false;

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const emptyVal = emptyObj ? emptyObj[key] : undefined;

    if (val === null || val === undefined) continue;

    if (typeof val === "string") {
      const trimmed = val.trim();
      const emptyTrimmed = typeof emptyVal === "string" ? emptyVal.trim() : "";
      if (trimmed !== "" && trimmed !== emptyTrimmed) {
        return true;
      }
    } else if (typeof val === "number") {
      if (emptyVal !== undefined ? val !== emptyVal : val !== 0) {
        return true;
      }
    } else if (typeof val === "boolean") {
      if (emptyVal !== undefined && val !== emptyVal) {
        return true;
      }
    } else if (Array.isArray(val)) {
      const emptyArrLength = Array.isArray(emptyVal) ? emptyVal.length : 0;
      if (val.length > emptyArrLength) {
        const hasContent = val.some((item) => {
          if (!item) return false;
          if (typeof item === "string" && item.trim()) return true;
          if (typeof item === "object") {
            const doc = item as Record<string, unknown>;
            return Boolean(
              doc.fileUri ||
                doc.fileName ||
                String(doc.status || "").toLowerCase() === "uploaded"
            );
          }
          return false;
        });
        if (hasContent) return true;
      }
    } else if (typeof val === "object") {
      if (
        hasEnteredAnyField(
          val as Record<string, unknown>,
          emptyVal as Record<string, unknown> | undefined
        )
      ) {
        return true;
      }
    }
  }

  return false;
}

export async function addDraftToIndex(cleanMobile: string, serviceKey: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(`@finsolz_draft_index_${cleanMobile}`);
    const index: string[] = raw ? JSON.parse(raw) : [];
    if (!index.includes(serviceKey)) {
      index.push(serviceKey);
      await AsyncStorage.setItem(`@finsolz_draft_index_${cleanMobile}`, JSON.stringify(index));
    }
  } catch (error) {
    logger.warn("[useServiceDraft] Failed to add draft to index", { serviceKey, error: getErrorMessage(error) });
  }
}

export async function removeDraftFromIndex(cleanMobile: string, serviceKey: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(`@finsolz_draft_index_${cleanMobile}`);
    if (raw) {
      const index: string[] = JSON.parse(raw);
      const nextIndex = index.filter((k) => k !== serviceKey);
      await AsyncStorage.setItem(`@finsolz_draft_index_${cleanMobile}`, JSON.stringify(nextIndex));
    }
  } catch (error) {
    logger.warn("[useServiceDraft] Failed to remove draft from index", { serviceKey, error: getErrorMessage(error) });
  }
}

export async function getCustomerDrafts(cleanMobile: string): Promise<Record<string, unknown>[]> {
  try {
    const raw = await AsyncStorage.getItem(`@finsolz_draft_index_${cleanMobile}`);
    if (!raw) return [];
    const index: string[] = JSON.parse(raw);
    const drafts: Record<string, unknown>[] = [];
    for (const key of index) {
      try {
        const draftRaw = await AsyncStorage.getItem(`@finsolz_draft_${cleanMobile}_${key}`);
        if (draftRaw) {
          const parsed = JSON.parse(draftRaw);
          if (parsed && typeof parsed === "object") {
            drafts.push({ serviceKey: key, ...parsed });
          }
        }
      } catch (innerErr) {
        logger.warn(`[useServiceDraft] Failed to read draft key ${key}`, { error: getErrorMessage(innerErr) });
      }
    }
    return drafts;
  } catch (error) {
    logger.warn("[useServiceDraft] Failed to read customer drafts index", { error: getErrorMessage(error) });
    return [];
  }
}

export function useServiceDraft<T extends Record<string, unknown>>({
  serviceKey,
  formData,
  emptyState,
  isDirty: customIsDirty,
  onSave,
  onDiscard,
  onRestore,
  isSubmitted = false,
}: UseServiceDraftOptions<T>) {
  const currentMobile = useAuthStore(
    (s) => s.customer?.mobile || s.authenticatedUser?.mobileNumber || s.mobileNumber || "user"
  );
  const cleanMobile = String(currentMobile).replace(/\D/g, "") || "user";
  const storageKey = `@finsolz_draft_${cleanMobile}_${serviceKey}`;

  const formDataRef = useRef(formData);
  const onSaveRef = useRef(onSave);
  const onDiscardRef = useRef(onDiscard);
  const isSubmittedRef = useRef(isSubmitted);

  useEffect(() => {
    formDataRef.current = formData;
    onSaveRef.current = onSave;
    onDiscardRef.current = onDiscard;
    isSubmittedRef.current = isSubmitted;
  });

  // Restore saved draft on mount
  useEffect(() => {
    let isMounted = true;
    async function restoreDraft() {
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        if (saved && isMounted) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object" && onRestore) {
            onRestore(parsed as T);
          }
        }
      } catch (e) {
        logger.warn(`Failed to restore draft for ${serviceKey}`, { error: getErrorMessage(e) });
      }
    }
    restoreDraft();
    return () => {
      isMounted = false;
    };
  }, [storageKey, serviceKey, onRestore]);

  // Determine if form currently has user-entered data
  const isDirty = useMemo(() => {
    if (isSubmitted) return false;
    if (customIsDirty) return customIsDirty(formData);
    return hasEnteredAnyField(formData, emptyState);
  }, [isSubmitted, customIsDirty, formData, emptyState]);

  const checkIsDirty = useCallback(() => isDirty, [isDirty]);

  // Save to AsyncStorage and invoke callback
  const handleSaveDraft = useCallback(async () => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(formDataRef.current));
      await addDraftToIndex(cleanMobile, serviceKey);
      if (onSaveRef.current) {
        await onSaveRef.current(formDataRef.current);
      }
    } catch (e) {
      logger.warn(`Failed to save draft for ${serviceKey}`, { error: getErrorMessage(e) });
    }
  }, [storageKey, cleanMobile, serviceKey]);

  // Discard draft from AsyncStorage and invoke callback
  const handleDiscardDraft = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(storageKey);
      await removeDraftFromIndex(cleanMobile, serviceKey);
      if (onDiscardRef.current) {
        await onDiscardRef.current();
      }
    } catch (e) {
      logger.warn(`Failed to discard draft for ${serviceKey}`, { error: getErrorMessage(e) });
    }
  }, [storageKey, cleanMobile, serviceKey]);

  // Clear draft explicitly (e.g. after successful submission)
  const clearDraft = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(storageKey);
      await removeDraftFromIndex(cleanMobile, serviceKey);
    } catch (e) {
      logger.warn(`Failed to clear draft for ${serviceKey}`, { error: getErrorMessage(e) });
    }
  }, [storageKey, cleanMobile, serviceKey]);

  // Connect to navigation guard (beforeRemove)
  const guard = useUniversalDraftGuard({
    isDirty: checkIsDirty,
    onSaveDraft: handleSaveDraft,
    onDiscardDraft: handleDiscardDraft,
    isSubmitted: () => isSubmittedRef.current,
  });

  // Handle Android hardware back button
  useEffect(() => {
    const onBackPress = () => {
      if (isSubmittedRef.current) return false;
      if (checkIsDirty()) {
        guard.openDraftModal();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [checkIsDirty, guard]);

  return {
    ...guard,
    isDirty,
    clearDraft,
    saveDraftNow: handleSaveDraft,
  };
}

export default useServiceDraft;
