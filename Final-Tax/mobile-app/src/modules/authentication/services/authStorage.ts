import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthSession, StoredUser } from "../types/auth.types";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

const KEY_USERS = "taxEdgeDevUsersMap";
const KEY_SESSION = "taxEdgeDevSession";
const memory: Record<string, string> = {};

// Eagerly pre-populate in-memory cache from AsyncStorage on app launch
AsyncStorage.getItem(KEY_SESSION).then((val) => {
  if (val) memory[KEY_SESSION] = val;
}).catch((err) => {
  logger.debug("[AuthStorage] Pre-populating session cache from storage failed", { error: getErrorMessage(err) });
});

AsyncStorage.getItem(KEY_USERS).then((val) => {
  if (val) memory[KEY_USERS] = val;
}).catch((err) => {
  logger.debug("[AuthStorage] Pre-populating users cache from storage failed", { error: getErrorMessage(err) });
});

const get = (k: string) => {
  if (memory[k]) return memory[k];
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(k);
    }
  } catch (err) {
    logger.debug("[AuthStorage] Window localStorage read failed, falling back", { key: k, error: getErrorMessage(err) });
  }
  return null;
};

const set = (k: string, v: string) => {
  memory[k] = v;
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(k, v);
    }
  } catch (err) {
    logger.debug("[AuthStorage] Window localStorage write failed", { key: k, error: getErrorMessage(err) });
  }
  AsyncStorage.setItem(k, v).catch((err) => {
    logger.warn("[AuthStorage] AsyncStorage write failed, preserved in memory fallback", { key: k, error: getErrorMessage(err) });
  });
};

const del = (k: string) => {
  delete memory[k];
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(k);
    }
  } catch (err) {
    logger.debug("[AuthStorage] Window localStorage remove failed", { key: k, error: getErrorMessage(err) });
  }
  AsyncStorage.removeItem(k).catch((err) => {
    logger.warn("[AuthStorage] AsyncStorage removeItem failed", { key: k, error: getErrorMessage(err) });
  });
};

export const authStorage = {
  initAsync: async (): Promise<void> => {
    try {
      const [session, users] = await Promise.all([
        AsyncStorage.getItem(KEY_SESSION),
        AsyncStorage.getItem(KEY_USERS),
      ]);
      if (session) memory[KEY_SESSION] = session;
      if (users) memory[KEY_USERS] = users;
    } catch (err) {
      logger.warn("[AuthStorage] AsyncStorage initAsync failed, using in-memory state", { error: getErrorMessage(err) });
    }
  },
  getUsersMap: (): Record<string, StoredUser> => {
    try {
      return JSON.parse(get(KEY_USERS) || "{}");
    } catch (err) {
      logger.warn("[AuthStorage] Failed to parse users map from storage, defaulting to empty", { error: getErrorMessage(err) });
      return {};
    }
  },
  getUserByMobile: (mobile: string): StoredUser | null => {
    if (!mobile) return null;
    const clean = mobile.replace(/\D/g, "").slice(-10);
    return authStorage.getUsersMap()[clean] || null;
  },
  getUser: (): StoredUser | null => {
    const s = authStorage.getSession();
    return s.activeMobile ? authStorage.getUserByMobile(s.activeMobile) : null;
  },
  saveUser: (user: StoredUser) => {
    const rawMob = user.mobileNumber || "";
    const cleanMobile = rawMob.replace(/\D/g, "").slice(-10);
    if (!cleanMobile) return;
    const map = authStorage.getUsersMap();
    const existing = map[cleanMobile] || {};
    const regCompleted =
      typeof user.registrationCompleted === "boolean"
        ? user.registrationCompleted
        : Boolean(existing.registrationCompleted);
    map[cleanMobile] = {
      ...existing,
      ...user,
      mobileNumber: cleanMobile,
      registrationCompleted: regCompleted,
    };
    set(KEY_USERS, JSON.stringify(map));
  },
  getSession: (): AuthSession => {
    try {
      return JSON.parse(get(KEY_SESSION) || '{"isLoggedIn":false,"activeMobile":null}');
    } catch (err) {
      logger.warn("[AuthStorage] Failed to parse session from storage, defaulting to unauthenticated", { error: getErrorMessage(err) });
      return { isLoggedIn: false, activeMobile: null, lastLoginAt: null };
    }
  },
  saveSession: (s: AuthSession) => set(KEY_SESSION, JSON.stringify(s)),
  clearSession: () =>
    set(KEY_SESSION, JSON.stringify({ isLoggedIn: false, activeMobile: null, lastLoginAt: null })),
  clearAllAuthData: () => {
    del(KEY_USERS);
    del(KEY_SESSION);
    del("taxEdgeDevUser");
  },
};

export default authStorage;

