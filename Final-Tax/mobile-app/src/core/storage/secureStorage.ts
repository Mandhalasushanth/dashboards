import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

class SecureStorageService {
  private prefix = "finsolz_secure_";
  private memoryFallback: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    const fullKey = `${this.prefix}${key}`;
    try {
      if (Platform.OS === "web") {
        return this.memoryFallback.get(fullKey) ?? null;
      }
      return await SecureStore.getItemAsync(fullKey);
    } catch (err) {
      logger.debug("[SecureStorage] SecureStore read failed, falling back to memory", { key, error: getErrorMessage(err) });
      return this.memoryFallback.get(fullKey) ?? null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    const fullKey = `${this.prefix}${key}`;
    this.memoryFallback.set(fullKey, value);
    try {
      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync(fullKey, value);
      }
    } catch (err) {
      // Memory fallback is already updated; log warning without exposing value
      logger.warn("[SecureStorage] SecureStore write failed, preserved in memory fallback", { key, error: getErrorMessage(err) });
    }
  }

  async removeItem(key: string): Promise<void> {
    const fullKey = `${this.prefix}${key}`;
    this.memoryFallback.delete(fullKey);
    try {
      if (Platform.OS !== "web") {
        await SecureStore.deleteItemAsync(fullKey);
      }
    } catch (err) {
      // Memory fallback is already updated
      logger.warn("[SecureStorage] SecureStore delete failed", { key, error: getErrorMessage(err) });
    }
  }
}

export const secureStorage = new SecureStorageService();
export default secureStorage;

