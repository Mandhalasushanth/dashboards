import { StyleSheet } from "react-native";
import { BrandColors, BorderRadius, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  orangeCta: {
    height: 52,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderRadius: BorderRadius.base,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    shadowColor: BrandColors.PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  orangeCtaText: {
    fontSize: Typography.fontSize.base,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  blueOutlineBtn: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.base,
    borderWidth: 1.5,
    borderColor: "#1E5EFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  blueOutlineBtnText: {
    fontSize: Typography.fontSize.base,
    fontWeight: "700",
    color: "#1E5EFF",
  },
  textOnlyBtn: {
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  textOnlyBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "600",
    color: "#64748B",
  },
  iconMarginRight8: {
    marginRight: 8,
  },
  iconMarginRight6: {
    marginRight: 6,
  },
});
