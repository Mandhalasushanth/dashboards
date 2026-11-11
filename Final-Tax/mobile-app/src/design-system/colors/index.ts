import { BrandColors as SharedBrandColors, Colors as SharedColors } from "@/shared/theme";

// Brand literals are owned by `@/shared/theme`. This design-system variant intentionally
// omits COLOR_WHITE from BrandColors and adds a lowercase `white` semantic key.
export const BrandColors = {
  PRIMARY_BLUE: SharedBrandColors.PRIMARY_BLUE,
  PRIMARY_BLUE_DARK: SharedBrandColors.PRIMARY_BLUE_DARK,
  PRIMARY_BLUE_ACCENT: SharedBrandColors.PRIMARY_BLUE_ACCENT,
  PRIMARY_LIGHT_BLUE: SharedBrandColors.PRIMARY_LIGHT_BLUE,
  PRIMARY_ORANGE: SharedBrandColors.PRIMARY_ORANGE,
  PRIMARY_ORANGE_DARK: SharedBrandColors.PRIMARY_ORANGE_DARK,
  PRIMARY_LIGHT_ORANGE: SharedBrandColors.PRIMARY_LIGHT_ORANGE,
  BACKGROUND: SharedBrandColors.BACKGROUND,
  CARD: SharedBrandColors.CARD,
  CARD_BORDER: SharedBrandColors.CARD_BORDER,
  TEXT_PRIMARY: SharedBrandColors.TEXT_PRIMARY,
  TEXT_SECONDARY: SharedBrandColors.TEXT_SECONDARY,
  TEXT_MUTED: SharedBrandColors.TEXT_MUTED,
  BORDER: SharedBrandColors.BORDER,
  CHEVRON_BLUE: SharedBrandColors.CHEVRON_BLUE,
  WHITE: SharedBrandColors.WHITE,
};

export const Colors = {
  primary: SharedColors.primary,
  primaryDark: SharedColors.primaryDark,
  primaryNavy: SharedColors.primaryNavy,
  primaryLight: SharedColors.primaryLight,
  accent: SharedColors.accent,
  accentLight: SharedColors.accentLight,
  orange: SharedColors.orange,
  orangeLight: SharedColors.orangeLight,
  success: SharedColors.success,
  successLight: SharedColors.successLight,
  warning: SharedColors.warning,
  warningLight: SharedColors.warningLight,
  error: SharedColors.error,
  errorLight: SharedColors.errorLight,
  info: SharedColors.info,
  infoLight: SharedColors.infoLight,
  background: SharedColors.background,
  card: SharedColors.card,
  cardBorder: SharedColors.cardBorder,
  text: SharedColors.text,
  textSecondary: SharedColors.textSecondary,
  textMuted: SharedColors.textMuted,
  border: SharedColors.border,
  iconBgLight: SharedColors.iconBgLight,
  white: SharedBrandColors.WHITE,
  ...BrandColors,
};

export default Colors;
