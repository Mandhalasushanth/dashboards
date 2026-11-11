import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SERVER_IP = "192.168.88.30";
export const SERVER_PORT = 8086;
export const STORAGE_KEY_SERVER_URL = "@finsolz_server_url";

export function getDefaultBaseUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }

  if (Platform.OS === "web") {
    const host = typeof window !== "undefined" ? window.location?.hostname : "";
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:${SERVER_PORT}`;
    }
    return "";
  }

  try {
    // Legacy manifest fields are no longer in expo-constants' types; read them only if present.
    const manifest = ("manifest" in Constants ? Constants.manifest : undefined) as Record<string, unknown> | undefined;
    const manifest2 = ("manifest2" in Constants ? Constants.manifest2 : undefined) as Record<string, unknown> | undefined;
    const expoGo = manifest2?.extra && typeof manifest2.extra === "object" ? (manifest2.extra as Record<string, unknown>).expoGo as Record<string, unknown> | undefined : undefined;

    const hostUri =
      Constants.expoConfig?.hostUri ||
      (typeof manifest?.debuggerHost === "string" ? manifest.debuggerHost : "") ||
      (typeof expoGo?.debuggerHost === "string" ? expoGo.debuggerHost : "");
    const ip = hostUri?.split(":")[0];
    if (ip && /^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
      return `http://${ip}:${SERVER_PORT}`;
    }
  } catch (error) {
    if (__DEV__) {
      console.warn("Failed to resolve dynamic hostUri from Constants:", error);
    }
  }

  return `http://${SERVER_IP}:${SERVER_PORT}`;
}

export async function getActiveBaseUrl(): Promise<string> {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY_SERVER_URL);
    if (saved && saved.trim()) {
      let clean = saved.trim().replace(/\/$/, "");
      if (clean.includes(":8081")) {
        clean = clean.replace(":8081", `:${SERVER_PORT}`);
      }
      if (/192\.168\.88\.\d+/.test(clean) && !clean.includes(SERVER_IP)) {
        clean = clean.replace(/192\.168\.88\.\d+/, SERVER_IP);
      }
      return clean;
    }
  } catch (error) {
    if (__DEV__) {
      console.warn("Failed to read server URL from storage:", error);
    }
  }

  return getDefaultBaseUrl().replace(/\/$/, "");
}