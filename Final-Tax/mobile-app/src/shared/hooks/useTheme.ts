import { Colors, type ThemeColors, type ThemeName } from "@/shared/constants/theme";

export type UseThemeResult = ThemeColors & {
  colors: ThemeColors;
  /** Always false: the app has one light theme. */
  isDark: boolean;
  scheme: ThemeName;
};

const LIGHT: UseThemeResult = { ...Colors.light, colors: Colors.light, isDark: false, scheme: "light" };

/** The app's colours; there is a single light theme and no dark mode. */
export function useTheme(): UseThemeResult {
  return LIGHT;
}

export default useTheme;

