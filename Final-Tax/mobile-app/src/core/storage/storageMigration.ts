import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

const OLD_ASYNC_PREFIX = "@taxedge_";
const NEW_ASYNC_PREFIX = "@finsolz_";

// SecureStore keys that were written with the old taxedge_secure_ prefix
const OLD_SECURE_PREFIX = "taxedge_secure_";
const NEW_SECURE_PREFIX = "finsolz_secure_";

// Well-known SecureStore sub-keys (suffix after the prefix)
const KNOWN_SECURE_SUBKEYS = [
  "auth_access_token",
  "auth_refresh_token",
];

// Well-known direct SecureStore keys (not under the shared service prefix)
const KNOWN_DIRECT_RENAMES: [string, string][] = [
  ["taxedge_biometric_enabled", "finsolz_biometric_enabled"],
  ["taxedge_biometric_mobile", "finsolz_biometric_mobile"],
];

const MIGRATION_DONE_KEY = "@finsolz_migration_v1_done";

async function secureGet(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") return null;
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function secureSet(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS !== "web") {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (err) {
    logger.warn("[StorageMigration] SecureStore write failed", { key, error: getErrorMessage(err) });
  }
}

async function secureDelete(key: string): Promise<void> {
  try {
    if (Platform.OS !== "web") {
      await SecureStore.deleteItemAsync(key);
    }
  } catch {
    // Ignore — key may not exist
  }
}

/**
 * One-time migration from Finsolz storage keys to Finsolz storage keys.
 * Safe to call on every boot — exits immediately after the first successful run.
 * Idempotent: migrates only when old data exists and new data does not.
 */
export async function runStorageMigration(): Promise<void> {
  try {
    const alreadyDone = await AsyncStorage.getItem(MIGRATION_DONE_KEY);
    if (alreadyDone === "1") return;

    logger.info("[StorageMigration] Starting Finsolz → Finsolz storage migration");

    // ── 1. AsyncStorage: migrate all @taxedge_* keys ────────────────────────
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const taxedgeKeys = allKeys.filter((k) => k.startsWith(OLD_ASYNC_PREFIX));

      if (taxedgeKeys.length > 0) {
        const pairs = await AsyncStorage.multiGet(taxedgeKeys);
        const writes: [string, string][] = [];
        const deletes: string[] = [];

        for (const [oldKey, value] of pairs) {
          if (value === null) continue;
          const newKey = NEW_ASYNC_PREFIX + oldKey.slice(OLD_ASYNC_PREFIX.length);
          const existing = await AsyncStorage.getItem(newKey);
          if (existing === null) {
            writes.push([newKey, value]);
          }
          deletes.push(oldKey);
        }

        if (writes.length > 0) {
          await AsyncStorage.multiSet(writes);
        }
        if (deletes.length > 0) {
          await AsyncStorage.multiRemove(deletes);
        }

        logger.info(`[StorageMigration] AsyncStorage: migrated ${writes.length} keys, removed ${deletes.length} old keys`);
      }
    } catch (err) {
      logger.warn("[StorageMigration] AsyncStorage migration partial failure", { error: getErrorMessage(err) });
    }

    // ── 2. SecureStore: migrate known sub-keys under shared prefix ───────────
    if (Platform.OS !== "web") {
      for (const subKey of KNOWN_SECURE_SUBKEYS) {
        const oldKey = `${OLD_SECURE_PREFIX}${subKey}`;
        const newKey = `${NEW_SECURE_PREFIX}${subKey}`;
        try {
          const oldValue = await secureGet(oldKey);
          if (oldValue !== null) {
            const newValue = await secureGet(newKey);
            if (newValue === null) {
              await secureSet(newKey, oldValue);
            }
            await secureDelete(oldKey);
            logger.info(`[StorageMigration] SecureStore migrated: ${subKey}`);
          }
        } catch (err) {
          logger.warn(`[StorageMigration] SecureStore key migration failed: ${subKey}`, { error: getErrorMessage(err) });
        }
      }

      // ── 3. Direct SecureStore key renames (biometric, etc.) ───────────────
      for (const [oldKey, newKey] of KNOWN_DIRECT_RENAMES) {
        try {
          const oldValue = await secureGet(oldKey);
          if (oldValue !== null) {
            const newValue = await secureGet(newKey);
            if (newValue === null) {
              await secureSet(newKey, oldValue);
            }
            await secureDelete(oldKey);
            logger.info(`[StorageMigration] SecureStore direct rename: ${oldKey} → ${newKey}`);
          }
        } catch (err) {
          logger.warn(`[StorageMigration] SecureStore direct rename failed: ${oldKey}`, { error: getErrorMessage(err) });
        }
      }
    }

    await AsyncStorage.setItem(MIGRATION_DONE_KEY, "1");
    logger.info("[StorageMigration] Migration complete");
  } catch (err) {
    logger.warn("[StorageMigration] Migration failed — will retry next boot", { error: getErrorMessage(err) });
  }
}
