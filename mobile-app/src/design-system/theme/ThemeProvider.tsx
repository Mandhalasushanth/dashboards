import React, { createContext, useContext } from "react";
import { Colors } from "@/design-system/colors";
import { Typography } from "@/design-system/typography";
import { Spacing } from "@/design-system/spacing";
import { Shadows } from "@/design-system/shadows";
import { BorderRadius, BorderWidth } from "@/design-system/borders";
import type { ThemeMode } from "./themeStore";

export interface Theme {
  colors: typeof Colors;
  typography: typeof Typography;
  spacing: typeof Spacing;
  shadows: typeof Shadows;
  borderRadius: typeof BorderRadius;
  borderWidth: typeof BorderWidth;
  /** Always false: the app has one light theme. */
  isDark: boolean;
  themeMode?: ThemeMode;
}

const defaultTheme: Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  shadows: Shadows,
  borderRadius: BorderRadius,
  borderWidth: BorderWidth,
  isDark: false,
  themeMode: "light",
};

const ThemeContext = createContext<Theme>(defaultTheme);

export interface ThemeProviderProps {
  children: React.ReactNode;
}

/** Provides the app's single light theme; there is no dark mode. */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => (
  <ThemeContext.Provider value={defaultTheme}>{children}</ThemeContext.Provider>
);

export const useTheme = (): Theme => {
  return useContext(ThemeContext);
};

export default ThemeProvider;

