import { Spacing as SharedSpacing } from "@/shared/theme";

// Shared scale from `@/shared/theme`, extended with the design-system-only `none` and `xxxl` steps.
export const Spacing = {
  none: 0,
  ...SharedSpacing,
  xxxl: 40,
};

export default Spacing;
