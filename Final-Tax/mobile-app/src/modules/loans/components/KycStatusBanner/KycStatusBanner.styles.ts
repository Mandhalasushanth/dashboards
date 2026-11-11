import { StyleSheet } from "react-native";
import { BrandColors, Spacing, Typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  verifiedContainer: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  pendingContainer: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },
  notConnectedContainer: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  verifiedIconBox: {
    backgroundColor: "#DCFCE7",
  },
  pendingIconBox: {
    backgroundColor: "#E0F2FE",
  },
  notConnectedIconBox: {
    backgroundColor: "#F1F5F9",
  },
  textBox: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: Typography.fontSize.sm,
    fontWeight: "700",
    color: BrandColors.TEXT_PRIMARY,
  },
  statusTag: {
    fontSize: Typography.fontSize.xs,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedTag: {
    backgroundColor: "#DCFCE7",
    color: "#15803D",
  },
  pendingTag: {
    backgroundColor: "#E0F2FE",
    color: "#0369A1",
  },
  notConnectedTag: {
    backgroundColor: "#F1F5F9",
    color: "#475569",
  },

  description: {
    fontSize: Typography.fontSize.xs,
    color: BrandColors.TEXT_SECONDARY,
    lineHeight: 18,
  },
});
