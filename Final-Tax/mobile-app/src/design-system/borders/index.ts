import { BorderRadius as SharedBorderRadius } from "@/shared/theme";

// Radius scale is owned by `@/shared/theme`, extended with design-system-only `none` and `xxl`.
export const BorderRadius = {
  none: 0,
  ...SharedBorderRadius,
  xxl: 32,
};

// Explicit design-system variant: these widths intentionally differ from `@/shared/theme` BorderWidth
// (hairline 1 / medium 2 / thick 3 vs 0.5 / 1.8 / 2) and are kept as-is to preserve visuals.
export const BorderWidth = {
  none: 0,
  hairline: 1,
  thin: 1,
  medium: 2,
  thick: 3,
};

export default {
  BorderRadius,
  BorderWidth,
};
