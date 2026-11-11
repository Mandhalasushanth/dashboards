import { StyleSheet } from "react-native";
import { BrandColors, Spacing, Typography } from "@/shared/theme";

export const getHeaderBarStyle = (topInset: number) => ({
  paddingTop: Math.max(topInset, 16),
});

export const getBottomBarStyle = (bottomInset: number) => ({
  paddingBottom: Math.max(bottomInset + 12, 20),
});

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingBottom: 12,
    backgroundColor: "#F8FAFC",
  },
  roundBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EAF1FE",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 14,
  },
  headerMainTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 2,
  },
  placeholderBox: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 40,
  },
  editContainer: {
    gap: 16,
    marginTop: 4,
  },
  currentRegisteredCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    padding: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  amendedDetailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    padding: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  cardIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitleWrap: {
    flex: 1,
  },
  currentRegisteredHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  currentRegisteredSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 1,
  },
  currentFieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 4,
  },
  currentFieldLabel: {
    fontSize: Typography.fontSize.sm,
    color: "#64748B",
    fontWeight: "500",
    flex: 1,
  },
  currentFieldValue: {
    fontSize: Typography.fontSize.sm + 0.5,
    color: "#0F172A",
    fontWeight: "700",
    flex: 1.5,
    textAlign: "right",
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
    marginBottom: -4,
  },
  bottomBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingHorizontal: Spacing.base,
    paddingTop: 12,
    gap: 8,
  },
  primaryBtn: {
    height: 50,
    backgroundColor: BrandColors.PRIMARY_ORANGE,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryDraftBtn: {
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryDraftBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
});
