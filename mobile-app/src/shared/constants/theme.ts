import { Platform } from "react-native";

/** The app has one light theme; there is no dark mode. */
export type ThemeName = "light";

/** Loose colour bag accepted by screen-level themed style helpers. */
export type ThemeTokens = Record<string, any>;

export interface ThemeColors {
  text: string;
  background: string;
  backgroundElement: string;
  backgroundSelected: string;
  textSecondary: string;
  primary: string;
  primaryDark: string;
  orange: string;
  orangeLight: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export const Colors: Record<ThemeName, ThemeColors> = {
  light: {
    text: "#172033",
    background: "#F7F9FC",
    backgroundElement: "#FFFFFF",
    backgroundSelected: "#E2E8F0",
    textSecondary: "#64748B",
    primary: "#083B75",
    primaryDark: "#052750",
    orange: "#F97316",
    orangeLight: "#FFF1E6",
    border: "#E2E8F0",
    success: "#16A34A",
    warning: "#F59E0B",
    error: "#DC2626",
  },
};

export interface FontFamilies {
  sans: string;
  serif: string;
  rounded: string;
  mono: string;
}

export const Fonts: FontFamilies = Platform.select<FontFamilies>({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export interface SpacingScale {
  half: number;
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
  six: number;
}

export const Spacing: SpacingScale = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
};

export const BottomTabInset: number =
  Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

