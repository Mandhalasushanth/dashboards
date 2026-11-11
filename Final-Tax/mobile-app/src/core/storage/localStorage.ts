import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

class LocalStorageService {
  private memoryFallback: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      const val = await AsyncStorage.getItem(key);
      if (val !== null) return val;
      return this.memoryFallback.get(key) ?? null;
    } catch (err) {
      logger.debug("[LocalStorage] Failed to read from storage, using memory fallback", { key, error: getErrorMessage(err) });
      return this.memoryFallback.get(key) ?? null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    this.memoryFallback.set(key, value);
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (err) {
      // Memory fallback is already updated; log warning without exposing value
      logger.warn("[LocalStorage] Failed to write to storage, preserved in memory fallback", { key, error: getErrorMessage(err) });
    }
  }

  async removeItem(key: string): Promise<void> {
    this.memoryFallback.delete(key);
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (err) {
      // Memory fallback is already updated
      logger.warn("[LocalStorage] Failed to remove key from storage", { key, error: getErrorMessage(err) });
    }
  }

  async clear(): Promise<void> {
    this.memoryFallback.clear();
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.clear();
      } else {
        await AsyncStorage.clear();
      }
    } catch (err) {
      // Memory fallback is already updated
      logger.warn("[LocalStorage] Failed to clear storage", { error: getErrorMessage(err) });
    }
  }
}

export const localStorage = new LocalStorageService();
export default localStorage;

