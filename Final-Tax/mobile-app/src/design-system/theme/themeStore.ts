import { create } from "zustand";
import { localStorage } from "@/core/storage/localStorage";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

/**
 * The app has a single light theme. There is no dark mode and no theme setting; the type keeps its old
 * shape so screens that still compare against "dark" compile, but the value is always "light".
 */
export type ThemeMode = "light" | "dark";

/** Where earlier versions saved the light/dark choice; cleared so a stored "dark" can never come back. */
export const THEME_STORAGE_KEY = "@finsolz_theme_mode";

export interface ThemeStoreState {
  theme: ThemeMode;
  isDark: boolean;
}

export const useThemeStore = create<ThemeStoreState>(() => ({
  theme: "light",
  isDark: false,
}));

localStorage.removeItem(THEME_STORAGE_KEY).catch((err: unknown) => {
  logger.debug("[ThemeStore] Could not clear the old theme preference", { error: getErrorMessage(err) });
});

export default useThemeStore;

