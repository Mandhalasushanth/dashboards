import { Typography as SharedTypography } from "@/shared/theme";

// fontSize / fontWeight are owned by `@/shared/theme`; lineHeight is design-system-only.
export const Typography = {
  fontSize: SharedTypography.fontSize,
  fontWeight: SharedTypography.fontWeight,
  lineHeight: {
    xs: 14,
    sm: 16,
    base: 20,
    md: 22,
    lg: 24,
    xl: 26,
    xxl: 30,
    hero: 34,
  },
};

export default Typography;
