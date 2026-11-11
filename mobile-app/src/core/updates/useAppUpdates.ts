import { useEffect, useState, useCallback, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as Updates from "expo-updates";
import { usePathname } from "expo-router";
import { logger } from "@/core/logging/logger";
import { isRouteBusy } from "./updateHelpers";

export { isRouteBusy };

export function useAppUpdates() {
  const pathname = usePathname();
  const [isUpdateReady, setIsUpdateReady] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasCheckedRef = useRef(false);

  const checkAndDownloadUpdate = useCallback(async () => {
    // Updates only function in release builds with expo-updates enabled
    if (!Updates.isEnabled || __DEV__) {
      logger.debug("[OTA Updates] Updates disabled or running in __DEV__; skipping check.");
      return;
    }

    try {
      setIsChecking(true);
      setErrorMessage(null);
      logger.info("[OTA Updates] Checking for updates on channel:", {
        channel: Updates.channel,
        runtimeVersion: Updates.runtimeVersion,
      });

      const checkResult = await Updates.checkForUpdateAsync();

      if (checkResult.isAvailable) {
        logger.info("[OTA Updates] New update available. Fetching in background...");
        setIsDownloading(true);

        const fetchResult = await Updates.fetchUpdateAsync();
        if (fetchResult.isNew) {
          logger.info("[OTA Updates] Update successfully downloaded and cached.");
          setIsUpdateReady(true);
        }
      } else {
        logger.debug("[OTA Updates] App is up to date.");
      }
    } catch (err: unknown) {
      // Gracefully handle network drops, timeouts, or update-server downtime
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn("[OTA Updates] Check or download failed (safe fallback to cached version):", {
        error: msg,
      });
      setErrorMessage(msg);
    } finally {
      setIsChecking(false);
      setIsDownloading(false);
    }
  }, []);

  // Check on app launch
  useEffect(() => {
    if (!hasCheckedRef.current) {
      hasCheckedRef.current = true;
      // 3s delay so app startup and splash screen hide smoothly
      const timer = setTimeout(() => {
        checkAndDownloadUpdate().catch(() => {});
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [checkAndDownloadUpdate]);

  // Check again when app returns from background to foreground if no update is ready yet
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active" && !isUpdateReady) {
        checkAndDownloadUpdate().catch(() => {});
      }
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
  }, [checkAndDownloadUpdate, isUpdateReady]);

  const isBusy = isRouteBusy(pathname);

  // Should we display the notification banner?
  // Only if update is ready, not dismissed, and user is NOT on an active form / filing route
  const shouldShowBanner = isUpdateReady && !isDismissed && !isBusy;

  const reloadApp = useCallback(async () => {
    try {
      logger.info("[OTA Updates] Reloading app to apply new update...");
      await Updates.reloadAsync();
    } catch (err: unknown) {
      logger.error("[OTA Updates] Failed to reload app:", { error: err });
    }
  }, []);

  const dismissBanner = useCallback(() => {
    setIsDismissed(true);
  }, []);

  return {
    isUpdateReady,
    isChecking,
    isDownloading,
    isBusy,
    shouldShowBanner,
    reloadApp,
    dismissBanner,
    checkAndDownloadUpdate,
    errorMessage,
  };
}
